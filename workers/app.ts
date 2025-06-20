import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { createRequestHandler } from "react-router";
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
import { optionalAuthMiddleware, authMiddleware, type AuthContext } from './lib/middleware';
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
    };
    auth?: AuthContext;
  };
};

const app = new Hono<AppType>();

// Apply CORS middleware
app.use('*', cors());

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
} | null = null;

const getServices = (env: Env) => {
  if (!servicesCache) {
    const openai = new OpenAIService(env.OPENAI_API_KEY);
    const database = new DatabaseService(env.DATABASE_URL);
    const vectorSearch = new VectorSearchService(env.OPENAI_API_KEY, database);
    const fileStorage = new FileStorageService(env.WIDGET_FILES, database);
    servicesCache = {
      chat: new ChatService(openai, database),
      summaries: new SummariesService(openai, database),
      recommendations: new RecommendationsService(openai, database),
      selectorAnalysis: new SelectorAnalysisService(openai, database),
      auth: new AuthService(env),
      vectorSearch,
      fileStorage,
      widget: new WidgetService(database, vectorSearch, fileStorage),
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

// Widget API Routes
// Get all user widgets
app.get('/api/widgets', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    const widgets = await c.get('services').widget.getUserWidgets(auth.user.id, limit, offset);
    return c.json({ widgets });
  } catch (error) {
    console.error('Error getting widgets:', error);
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

  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) {
    return c.json({ error: 'Invalid widget ID' }, 400);
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

  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) {
    return c.json({ error: 'Invalid widget ID' }, 400);
  }

  try {
    const body = await c.req.json();
    const widget = await c.get('services').widget.updateWidget(id, auth.user.id, body);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }
    return c.json({ widget });
  } catch (error) {
    console.error('Error updating widget:', error);
    return c.json({ error: 'Failed to update widget' }, 500);
  }
});

// Delete widget
app.delete('/api/widgets/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) {
    return c.json({ error: 'Invalid widget ID' }, 400);
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

  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) {
    return c.json({ error: 'Invalid widget ID' }, 400);
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

  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) {
    return c.json({ error: 'Invalid widget ID' }, 400);
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

  const id = parseInt(c.req.param('id'));
  const fileId = parseInt(c.req.param('fileId'));
  
  if (isNaN(id) || isNaN(fileId)) {
    return c.json({ error: 'Invalid IDs' }, 400);
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

  const id = parseInt(c.req.param('id'));
  const fileId = parseInt(c.req.param('fileId'));
  
  if (isNaN(id) || isNaN(fileId)) {
    return c.json({ error: 'Invalid IDs' }, 400);
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

export default app;
