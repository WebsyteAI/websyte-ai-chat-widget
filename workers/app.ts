import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createRequestHandler } from "react-router";
import { eq } from 'drizzle-orm';
import { widget } from './db/schema';
import { OpenAIService } from './services/openai';
import { ChatService } from './services/chat';
import { SummariesService } from './services/summaries';
import { RecommendationsService } from './services/recommendations';
import { SelectorAnalysisService } from './services/selector-analysis';
import { DatabaseService } from './services/database';
import { AuthService } from './services/auth';
import { VectorSearchService } from './services/vector-search';
import { FileStorageService } from './services/file-storage';
import { WidgetService } from './services/widget';
import { MessageService } from './services/messages';
import { RAGAgent } from './services/rag-agent';
import { ApifyCrawlerService } from './services/apify-crawler';
import { optionalAuthMiddleware, authMiddleware, adminMiddleware, bearerTokenMiddleware, type AuthContext } from './lib/middleware';
import { rateLimitMiddleware } from './lib/rate-limiter';
import { iframeMiddleware } from './lib/iframe-middleware';
import type { Env } from './types';

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

type AppType = {
  Bindings: Env;
  Variables: {
    services: {
      chat: ChatService;
      summaries: SummariesService;
      recommendations: RecommendationsService;
      selectorAnalysis: SelectorAnalysisService;
      auth: AuthService;
      widget: WidgetService;
      vectorSearch: VectorSearchService;
      fileStorage: FileStorageService;
      messages: MessageService;
    };
    auth?: AuthContext;
  };
};

const app = new Hono<AppType>();

// Apply CORS middleware with permissive settings for widget embedding
app.use('*', cors({
  origin: '*', // Allow all origins for widget embedding
  allowHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Request-ID'],
  maxAge: 86400, // 24 hours
  credentials: true, // Allow cookies for authenticated requests
}));

// Apply iframe security middleware
app.use('*', iframeMiddleware);

// Services cache to avoid recreation
let servicesCache: {
  chat: ChatService;
  summaries: SummariesService;
  recommendations: RecommendationsService;
  selectorAnalysis: SelectorAnalysisService;
  auth: AuthService;
  widget: WidgetService;
  vectorSearch: VectorSearchService;
  fileStorage: FileStorageService;
  messages: MessageService;
} | null = null;

const getServices = (env: Env) => {
  if (!servicesCache) {
    const openai = new OpenAIService(env.OPENAI_API_KEY);
    const database = new DatabaseService(env.DATABASE_URL);
    const vectorSearch = new VectorSearchService(env.OPENAI_API_KEY, database);
    const fileStorage = new FileStorageService(
      env.WIDGET_FILES, 
      database, 
      env.MISTRAL_AI_API_KEY, 
      vectorSearch
    );
    const apifyCrawler = new ApifyCrawlerService(env.APIFY_API_TOKEN);
    const widget = new WidgetService(database, vectorSearch, fileStorage, apifyCrawler, env.OPENAI_API_KEY);
    const messages = new MessageService(database);
    const ragAgent = new RAGAgent(env.OPENAI_API_KEY, widget);
    
    servicesCache = {
      chat: new ChatService(openai, database, ragAgent, widget, messages),
      summaries: new SummariesService(openai, database),
      recommendations: new RecommendationsService(openai, database),
      selectorAnalysis: new SelectorAnalysisService(openai, database),
      auth: new AuthService(env),
      vectorSearch,
      fileStorage,
      widget,
      messages,
    };
  }
  return servicesCache;
};

// Services middleware
app.use('/api/*', async (c, next) => {
  c.set('services', getServices(c.env));
  await next();
});

// Optional auth middleware for API routes (except auth routes)
app.use('/api/chat', optionalAuthMiddleware);
app.use('/api/recommendations', optionalAuthMiddleware);
app.use('/api/summaries', optionalAuthMiddleware);
app.use('/api/analyze-selector', optionalAuthMiddleware);

// Required auth middleware for widget routes
app.use('/api/widgets/*', authMiddleware);

// Test auth route
app.get('/api/auth/test', async (c) => {
  return c.json({ message: 'Auth route is working!' });
});

// Auth Routes - Handle all Better Auth endpoints
app.all('/api/auth/*', async (c) => {
  console.log('Auth route hit:', c.req.method, c.req.path);
  try {
    const result = await c.get('services').auth.handleAuth(c as any);
    console.log('Auth route result status:', result.status);
    return result;
  } catch (error) {
    console.error('Auth route error:', error);
    return c.json({ error: 'Auth endpoint error' }, 500);
  }
});

// API Routes
// Apply rate limiting to chat endpoint
app.use('/api/chat', rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 10, // 10 requests per minute for anonymous
  maxRequestsAuthenticated: 30, // 30 requests per minute for authenticated
}));

app.post('/api/chat', async (c) => {
  return c.get('services').chat.handleChat(c);
});

app.post('/api/recommendations', async (c) => {
  return c.get('services').recommendations.handleRecommendations(c as any);
});

app.post('/api/summaries', async (c) => {
  return c.get('services').summaries.handleSummaries(c as any);
});

app.post('/api/analyze-selector', async (c) => {
  return c.get('services').selectorAnalysis.handle(c);
});

// Public endpoint to get widget info
app.get('/api/public/widget/:id', async (c) => {
  const widgetId = c.req.param('id');
  if (!widgetId) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getPublicWidget(widgetId);
    if (!widget) {
      return c.json({ error: 'Widget not found or not public' }, 404);
    }

    // Return only necessary info for the chat UI
    return c.json({
      id: widget.id,
      name: widget.name,
      description: widget.description,
      recommendations: widget.recommendations,
    });
  } catch (error) {
    console.error('Error getting public widget:', error);
    return c.json({ error: 'Failed to get widget' }, 500);
  }
});

// Widget API Routes
// Get all user widgets
app.get('/api/widgets', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const MAX_LIMIT = 1000;
  const requestedLimit = parseInt(c.req.query('limit') || '50');
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    const widgets = await c.get('services').widget.getUserWidgets(auth.user.id, limit, offset);
    return c.json({ widgets });
  } catch (error) {
    console.error('Error getting widgets:', error);
    return c.json({ error: 'Failed to get widgets' }, 500);
  }
});

// Admin endpoint to get all widgets across all users
app.get('/api/admin/widgets', adminMiddleware, async (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    // For admin users, just use the regular widget service but without user filtering
    // This is a temporary admin-only override
    const auth = c.get('auth');
    if (!auth?.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get widgets for the current user (we'll expand this later for true admin access)
    const widgets = await c.get('services').widget.getUserWidgets(auth.user.id, limit, offset);
    return c.json({ widgets });
  } catch (error) {
    console.error('Error getting all widgets:', error);
    return c.json({ error: 'Failed to get widgets' }, 500);
  }
});

// Create new widget
app.post('/api/widgets', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const formData = await c.req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string || undefined;
    const url = formData.get('url') as string || undefined;
    const content = formData.get('content') as string || undefined;
    
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        files.push(value);
      }
    }

    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }

    const widget = await c.get('services').widget.createWidget(auth.user.id, {
      name,
      description,
      url,
      content,
      files: files.length > 0 ? files : undefined
    });

    return c.json({ widget });
  } catch (error) {
    console.error('Error creating widget:', error);
    return c.json({ error: 'Failed to create widget' }, 500);
  }
});

// Get specific widget
app.get('/api/widgets/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }
    return c.json({ widget });
  } catch (error) {
    console.error('Error getting widget:', error);
    return c.json({ error: 'Failed to get widget' }, 500);
  }
});

// Update widget
app.put('/api/widgets/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const body = await c.req.json();
    console.log('[API] Updating widget', id, 'with body:', body);
    
    // Get current widget to check if crawlUrl is changing
    const currentWidget = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!currentWidget) {
      return c.json({ error: 'Widget not found' }, 404);
    }
    
    // Update the widget
    const widget = await c.get('services').widget.updateWidget(id, auth.user.id, body);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }
    
    // Check if crawlUrl changed and we should start crawling
    if (body.crawlUrl !== undefined && body.crawlUrl !== currentWidget.crawlUrl && body.crawlUrl) {
      console.log('[API] Crawl URL changed, starting workflow');
      
      // Check if already crawling
      if (currentWidget.crawlStatus === 'crawling') {
        console.log('[API] Already crawling, skipping workflow creation');
      } else {
        try {
          // Trigger the workflow
          const workflow = await c.env.WIDGET_CONTENT_WORKFLOW.create({
            params: {
              widgetId: id,
              crawlUrl: body.crawlUrl,
              maxPages: 25,
              isRecrawl: !!currentWidget.crawlRunId
            }
          });
          
          console.log('[API] Started workflow:', workflow.id);
          
          // Update widget with workflowId
          const database = new DatabaseService(c.env.DATABASE_URL);
          await database.getDatabase()
            .update(widget)
            .set({
              crawlStatus: 'crawling',
              workflowId: workflow.id,
              lastCrawlAt: new Date()
            })
            .where(eq(widget.id, id));
          
          // Return updated widget with workflow info
          widget.crawlStatus = 'crawling';
          widget.workflowId = workflow.id;
          widget.lastCrawlAt = new Date();
        } catch (workflowError) {
          console.error('[API] Failed to start crawl workflow:', workflowError);
          // Don't fail the update, just log the error
        }
      }
    }
    
    return c.json({ widget });
  } catch (error) {
    console.error('Error updating widget:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update widget';
    return c.json({ error: errorMessage }, 500);
  }
});

// Delete widget
app.delete('/api/widgets/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const deleted = await c.get('services').widget.deleteWidget(id, auth.user.id);
    if (!deleted) {
      return c.json({ error: 'Widget not found' }, 404);
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting widget:', error);
    return c.json({ error: 'Failed to delete widget' }, 500);
  }
});

// Search within specific widget
app.post('/api/widgets/:id/search', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const { query, limit = 10 } = await c.req.json();
    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    const results = await c.get('services').widget.searchWidgetContent(id, auth.user.id, query, limit);
    return c.json({ results });
  } catch (error) {
    console.error('Error searching widget:', error);
    return c.json({ error: 'Failed to search widget' }, 500);
  }
});

// Get chat messages for a widget
app.get('/api/widgets/:id/messages', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const widgetId = c.req.param('id');
  if (!widgetId) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    // Verify user owns the widget
    const widget = await c.get('services').widget.getWidget(widgetId, auth.user.id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    // Get query parameters with validation
    const sessionId = c.req.query('sessionId');
    const MAX_LIMIT = 1000;
    const requestedLimit = parseInt(c.req.query('limit') || '50');
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const offset = parseInt(c.req.query('offset') || '0');
    const startDate = c.req.query('startDate') ? new Date(c.req.query('startDate')!) : undefined;
    const endDate = c.req.query('endDate') ? new Date(c.req.query('endDate')!) : undefined;

    const messages = await c.get('services').messages.getMessages({
      widgetId,
      sessionId,
      limit,
      offset,
      startDate,
      endDate,
    });

    return c.json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    return c.json({ error: 'Failed to get messages' }, 500);
  }
});

// Get chat sessions for a widget
app.get('/api/widgets/:id/sessions', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const widgetId = c.req.param('id');
  if (!widgetId) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    // Verify user owns the widget
    const widget = await c.get('services').widget.getWidget(widgetId, auth.user.id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    const sessions = await c.get('services').messages.getSessions(widgetId);
    return c.json({ sessions });
  } catch (error) {
    console.error('Error getting sessions:', error);
    return c.json({ error: 'Failed to get sessions' }, 500);
  }
});

// Delete a chat message
app.delete('/api/widgets/:widgetId/messages/:messageId', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const widgetId = c.req.param('widgetId');
  const messageId = c.req.param('messageId');
  
  if (!widgetId || !messageId) {
    return c.json({ error: 'Widget ID and Message ID are required' }, 400);
  }

  try {
    // Verify user owns the widget
    const widget = await c.get('services').widget.getWidget(widgetId, auth.user.id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    // Verify message belongs to this widget
    const messages = await c.get('services').messages.getMessages({
      widgetId,
      limit: 1,
      offset: 0
    });
    
    const message = messages.find(m => m.id === messageId);
    if (!message) {
      return c.json({ error: 'Message not found in this widget' }, 404);
    }

    await c.get('services').messages.deleteMessage(messageId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return c.json({ error: 'Failed to delete message' }, 500);
  }
});

// Search across all user widgets
app.post('/api/widgets/search', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { query, limit = 20 } = await c.req.json();
    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    const results = await c.get('services').widget.searchAllUserWidgets(auth.user.id, query, limit);
    return c.json({ results });
  } catch (error) {
    console.error('Error searching widgets:', error);
    return c.json({ error: 'Failed to search widgets' }, 500);
  }
});

// Add file to widget
app.post('/api/widgets/:id/files', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'File is required' }, 400);
    }

    const addedFile = await c.get('services').widget.addFileToWidget(id, auth.user.id, file);
    return c.json({ file: addedFile });
  } catch (error) {
    console.error('Error adding file to widget:', error);
    return c.json({ error: 'Failed to add file' }, 500);
  }
});

// Download file
app.get('/api/widgets/:id/files/:fileId/download', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  const fileId = c.req.param('fileId');
  
  if (!id || !fileId) {
    return c.json({ error: 'Widget ID and File ID are required' }, 400);
  }

  try {
    const r2Object = await c.get('services').fileStorage.downloadFile(fileId, id);
    if (!r2Object) {
      return c.json({ error: 'File not found' }, 404);
    }

    return new Response(r2Object.body, {
      headers: {
        'Content-Type': r2Object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Disposition': r2Object.httpMetadata?.contentDisposition || 'attachment'
      }
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return c.json({ error: 'Failed to download file' }, 500);
  }
});

// Delete file from widget
app.delete('/api/widgets/:id/files/:fileId', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  const fileId = c.req.param('fileId');
  
  if (!id || !fileId) {
    return c.json({ error: 'Widget ID and File ID are required' }, 400);
  }

  try {
    const deleted = await c.get('services').widget.removeFileFromWidget(id, fileId, auth.user.id);
    if (!deleted) {
      return c.json({ error: 'File not found' }, 404);
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

// Public widget access (no auth required)
app.get('/api/widgets/:id/public', async (c) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getPublicWidget(id);
    if (!widget) {
      return c.json({ error: 'Widget not found or not public' }, 404);
    }
    return c.json({ 
      widget: {
        ...widget,
        recommendations: widget.recommendations
      } 
    });
  } catch (error) {
    console.error('Error getting public widget:', error);
    return c.json({ error: 'Failed to get widget' }, 500);
  }
});

// Start website crawl
app.post('/api/widgets/:id/crawl', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const { crawlUrl } = await c.req.json();
    console.log('[API] Crawl endpoint called for widget', id, 'with URL:', crawlUrl);
    
    if (!crawlUrl) {
      return c.json({ error: 'Crawl URL is required' }, 400);
    }

    // Validate widget ownership
    const widgetRecord = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!widgetRecord) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    // Check if already crawling
    if (widgetRecord.crawlStatus === 'crawling') {
      return c.json({ error: 'Crawl already in progress' }, 400);
    }

    // Trigger the workflow
    const workflow = await c.env.WIDGET_CONTENT_WORKFLOW.create({
      params: {
        widgetId: id,
        crawlUrl: crawlUrl,
        maxPages: 25,
        isRecrawl: !!widgetRecord.crawlRunId
      }
    });

    console.log('[API] Started workflow:', workflow.id);

    // Update widget status to indicate workflow started and save workflowId
    const database = new DatabaseService(c.env.DATABASE_URL);
    await database.getDatabase()
      .update(widget)
      .set({
        crawlStatus: 'crawling',
        workflowId: workflow.id,
        lastCrawlAt: new Date()
      })
      .where(eq(widget.id, id));

    return c.json({ 
      workflowId: workflow.id,
      status: 'crawling',
      message: 'Crawl workflow started successfully'
    });
  } catch (error) {
    console.error('Error starting crawl workflow:', error);
    return c.json({ error: 'Failed to start crawl workflow' }, 500);
  }
});

// Check crawl status
app.get('/api/widgets/:id/crawl/status', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widgetRecord = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!widgetRecord) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    // Check if there's an active workflow and if it's still running
    // Use workflowId from query parameter or fall back to stored workflowId
    const workflowId = c.req.query('workflowId') || widgetRecord.workflowId;
    if (workflowId && widgetRecord.crawlStatus === 'crawling') {
      try {
        const instance = await c.env.WIDGET_CONTENT_WORKFLOW.get(workflowId);
        const workflowStatus = await instance.status();
        
        // If workflow completed but widget status wasn't updated, update it now
        if (workflowStatus.status === 'complete') {
          const database = new DatabaseService(c.env.DATABASE_URL);
          await database.getDatabase()
            .update(widget)
            .set({
              crawlStatus: 'completed',
              crawlPageCount: (workflowStatus.output as any)?.pagesCrawled || 0,
              workflowId: null // Clear workflowId when completed
            })
            .where(eq(widget.id, id));
          
          return c.json({ 
            status: 'completed',
            crawlPageCount: (workflowStatus.output as any)?.pagesCrawled || 0,
            lastCrawlAt: widgetRecord.lastCrawlAt,
            crawlUrl: widgetRecord.crawlUrl,
            workflowStatus: workflowStatus.status
          });
        } else if (workflowStatus.status === 'errored' || workflowStatus.status === 'terminated') {
          // Update widget status to failed
          const database = new DatabaseService(c.env.DATABASE_URL);
          await database.getDatabase()
            .update(widget)
            .set({
              crawlStatus: 'failed',
              workflowId: null // Clear workflowId when failed
            })
            .where(eq(widget.id, id));
          
          return c.json({ 
            status: 'failed',
            crawlPageCount: widgetRecord.crawlPageCount || 0,
            lastCrawlAt: widgetRecord.lastCrawlAt,
            crawlUrl: widgetRecord.crawlUrl,
            workflowStatus: workflowStatus.status,
            error: workflowStatus.error || 'Workflow failed'
          });
        }
      } catch (workflowError) {
        console.error('Error checking workflow status:', workflowError);
        // If we can't get workflow status, check if crawl has been running too long
        const crawlStartTime = widgetRecord.lastCrawlAt?.getTime() || 0;
        const currentTime = Date.now();
        const elapsedTime = currentTime - crawlStartTime;
        
        // If crawl has been running for more than 15 minutes, consider it failed
        if (elapsedTime > 15 * 60 * 1000) {
          const database = new DatabaseService(c.env.DATABASE_URL);
          await database.getDatabase()
            .update(widget)
            .set({
              crawlStatus: 'failed',
              workflowId: null // Clear workflowId on timeout
            })
            .where(eq(widget.id, id));
          
          return c.json({ 
            status: 'failed',
            crawlPageCount: widgetRecord.crawlPageCount || 0,
            lastCrawlAt: widgetRecord.lastCrawlAt,
            crawlUrl: widgetRecord.crawlUrl,
            error: 'Crawl timed out'
          });
        }
      }
    }

    // Return current widget status
    return c.json({ 
      status: widgetRecord.crawlStatus || 'idle',
      crawlPageCount: widgetRecord.crawlPageCount || 0,
      lastCrawlAt: widgetRecord.lastCrawlAt,
      crawlUrl: widgetRecord.crawlUrl
    });
  } catch (error) {
    console.error('Error getting crawl status:', error);
    return c.json({ error: 'Failed to get crawl status' }, 500);
  }
});

// Check workflow status
app.get('/api/widgets/:id/workflow/status', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const workflowId = c.req.query('workflowId');
  if (!workflowId) {
    return c.json({ error: 'Workflow ID is required' }, 400);
  }

  try {
    const instance = await c.env.WIDGET_CONTENT_WORKFLOW.get(workflowId);
    const status = await instance.status();
    
    return c.json({
      workflowId,
      status: status.status,
      output: status.output,
      error: status.error
    });
  } catch (error) {
    console.error('Error getting workflow status:', error);
    return c.json({ error: 'Failed to get workflow status' }, 500);
  }
});

// Check and process crawl status (original implementation)
app.get('/api/widgets/:id/crawl/status-check', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widgetRecord = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!widgetRecord) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    if (!widgetRecord.crawlRunId) {
      return c.json({ status: 'idle', crawlStatus: widgetRecord.crawlStatus });
    }

    // Check and process crawl status
    await c.get('services').widget.checkCrawlStatus(id, widgetRecord.crawlRunId, auth.user.id);
    
    // Get updated widget
    const updatedWidget = await c.get('services').widget.getWidget(id, auth.user.id);
    
    return c.json({ 
      status: updatedWidget?.crawlStatus || 'unknown',
      runId: updatedWidget?.crawlRunId,
      pageCount: updatedWidget?.crawlPageCount,
      lastCrawlAt: updatedWidget?.lastCrawlAt
    });
  } catch (error) {
    console.error('Error checking crawl status:', error);
    return c.json({ error: 'Failed to check crawl status' }, 500);
  }
});

// Reset stuck crawl
app.post('/api/widgets/:id/crawl/reset', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const reset = await c.get('services').widget.resetStuckCrawl(id, auth.user.id);
    if (!reset) {
      return c.json({ error: 'Widget not found or not stuck' }, 404);
    }
    
    return c.json({ success: true, message: 'Crawl status reset' });
  } catch (error) {
    console.error('Error resetting crawl:', error);
    return c.json({ error: 'Failed to reset crawl' }, 500);
  }
});

// Generate recommendations for a widget
app.post('/api/widgets/:id/recommendations', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    // Generate recommendations
    await c.get('services').widget.generateWidgetRecommendations(id);
    
    // Get updated widget with recommendations
    const updatedWidget = await c.get('services').widget.getWidget(id, auth.user.id);
    
    return c.json({ 
      success: true,
      recommendations: updatedWidget?.recommendations || []
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return c.json({ error: 'Failed to generate recommendations' }, 500);
  }
});

// Refresh embeddings for a widget
app.post('/api/widgets/:id/embeddings/refresh', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    // Refresh embeddings from existing files
    const result = await c.get('services').widget.refreshEmbeddings(id, auth.user.id);
    
    return c.json({ 
      success: true,
      embeddingsCreated: result.embeddingsCreated,
      filesProcessed: result.filesProcessed
    });
  } catch (error) {
    console.error('Error refreshing embeddings:', error);
    return c.json({ error: 'Failed to refresh embeddings' }, 500);
  }
});

// API Automation Routes with Bearer Token Authentication
// These routes allow programmatic access for automation tools like Claude Code

// List all widgets (automation API)
app.get('/api/automation/widgets', bearerTokenMiddleware, async (c) => {
  try {
    const widgets = await c.get('services').widget.getAllWidgets();
    return c.json({ widgets });
  } catch (error) {
    console.error('Error listing widgets:', error);
    return c.json({ error: 'Failed to list widgets' }, 500);
  }
});

// Create a new widget (automation API)
app.post('/api/automation/widgets', bearerTokenMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, url, crawlUrl, isPublic } = body;

    if (!name) {
      return c.json({ error: 'Widget name is required' }, 400);
    }

    // Create widget with a system user ID (you might want to configure this)
    const systemUserId = 'system-automation';
    const widget = await c.get('services').widget.createWidget({
      name,
      description: description || '',
      url: url || null,
      crawlUrl: crawlUrl || null,
      isPublic: isPublic ?? false,
      userId: systemUserId,
    });

    return c.json({ widget });
  } catch (error) {
    console.error('Error creating widget:', error);
    return c.json({ error: 'Failed to create widget' }, 500);
  }
});

// Start crawling for a widget (automation API)
app.post('/api/automation/widgets/:id/crawl', bearerTokenMiddleware, async (c) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getPublicWidget(id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    if (!widget.crawlUrl) {
      return c.json({ error: 'Widget has no crawl URL configured' }, 400);
    }

    // Check if already crawling
    if (widget.crawlStatus === 'crawling') {
      return c.json({ error: 'Crawl already in progress' }, 400);
    }

    // Trigger the workflow
    const workflow = await c.env.WIDGET_CONTENT_WORKFLOW.create({
      params: {
        widgetId: id,
        crawlUrl: widget.crawlUrl,
        maxPages: 25,
        isRecrawl: !!widget.crawlRunId
      }
    });

    console.log('[AUTOMATION API] Started workflow:', workflow.id);

    // Update widget status to indicate workflow started and save workflowId
    const database = new DatabaseService(c.env.DATABASE_URL);
    await database.getDatabase()
      .update(widget)
      .set({
        crawlStatus: 'crawling',
        workflowId: workflow.id,
        lastCrawlAt: new Date()
      })
      .where(eq(widget.id, id));

    return c.json({ 
      success: true, 
      workflowId: workflow.id,
      message: 'Crawl workflow started successfully'
    });
  } catch (error) {
    console.error('Error starting crawl:', error);
    return c.json({ error: 'Failed to start crawl' }, 500);
  }
});

// Generate recommendations for a widget (automation API)
app.post('/api/automation/widgets/:id/recommendations', bearerTokenMiddleware, async (c) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    await c.get('services').widget.generateWidgetRecommendations(id);
    const widget = await c.get('services').widget.getPublicWidget(id);
    
    return c.json({ 
      success: true,
      recommendations: widget?.recommendations || []
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return c.json({ error: 'Failed to generate recommendations' }, 500);
  }
});

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// React Router handler for all other routes
const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

app.all('*', async (c) => {
  return requestHandler(c.req.raw, {
    cloudflare: { 
      env: c.env, 
      ctx: c.executionCtx as ExecutionContext
    },
  });
});

// Export default app
export default app;

// Export scheduled handler
export { cleanupOldMessages as scheduled } from './cron/cleanup-messages';

// Export workflow
export { WidgetContentPipeline } from './workflows/widget-content-pipeline';
