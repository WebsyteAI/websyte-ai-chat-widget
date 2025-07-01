import { Hono } from 'hono';
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
import { MessageService } from './services/messages';
import { RAGAgent } from './services/rag-agent';
import { ApifyCrawlerService } from './services/apify-crawler';
import { iframeMiddleware } from './lib/iframe-middleware';
import { requestLoggerMiddleware } from './lib/request-logger';
import { registerAllRoutes } from './routes';
import type { AppType } from './routes/types';
import type { Env } from './types';

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

export type { AppType };

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

// Apply request logging middleware
app.use('*', requestLoggerMiddleware);

// Services cache to avoid recreation
let servicesCache: AppType['Variables']['services'] | null = null;

const getServices = (env: Env): AppType['Variables']['services'] => {
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

// Register all routes
registerAllRoutes(app);

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