import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { createRequestHandler } from "react-router";
import { OpenAIService } from './services/openai';
import { ChatService } from './services/chat';
import { SummariesService } from './services/summaries';
import { RecommendationsService } from './services/recommendations';
import { SelectorAnalysisService } from './services/selector-analysis';
import { DatabaseService } from './services/database';
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
    };
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
} | null = null;

const getServices = (env: Env) => {
  if (!servicesCache) {
    const openai = new OpenAIService(env.OPENAI_API_KEY);
    const database = new DatabaseService(env.DATABASE_URL);
    servicesCache = {
      chat: new ChatService(openai, database),
      summaries: new SummariesService(openai, database),
      recommendations: new RecommendationsService(openai, database),
      selectorAnalysis: new SelectorAnalysisService(openai, database),
    };
  }
  return servicesCache;
};

// Services middleware
app.use('/api/*', async (c, next) => {
  c.set('services', getServices(c.env));
  await next();
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
