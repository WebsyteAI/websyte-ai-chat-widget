import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { createRequestHandler } from "react-router";
import { OpenAIService } from './services/openai';
import { ChatService } from './services/chat';
import { SummarizeService } from './services/summarize';
import { SummariesService } from './services/summaries';
import { RecommendationsService } from './services/recommendations';
import { SelectorAnalysisService } from './services/selector-analysis';
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
      summarize: SummarizeService;
      summaries: SummariesService;
      recommendations: RecommendationsService;
      selectorAnalysis: SelectorAnalysisService;
    };
  };
};

const app = new Hono<AppType>();

// Apply CORS middleware with more permissive settings for development
app.use('*', cors({
  origin: (origin) => {
    // Allow all origins in development
    return origin || '*';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 86400,
  credentials: false,
}));

// Explicit OPTIONS handler for preflight requests
app.options('*', (c) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
});

// Services cache to avoid recreation
let servicesCache: {
  chat: ChatService;
  summarize: SummarizeService;
  summaries: SummariesService;
  recommendations: RecommendationsService;
  selectorAnalysis: SelectorAnalysisService;
} | null = null;

const getServices = (env: Env) => {
  if (!servicesCache) {
    const openai = new OpenAIService(env.OPENAI_API_KEY);
    servicesCache = {
      chat: new ChatService(openai),
      summarize: new SummarizeService(openai),
      summaries: new SummariesService(openai),
      recommendations: new RecommendationsService(openai),
      selectorAnalysis: new SelectorAnalysisService(openai),
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

app.post('/api/summarize', async (c) => {
  return c.get('services').summarize.handleSummarize(c);
});

app.post('/api/recommendations', async (c) => {
  return c.get('services').recommendations.handleRecommendations(c);
});

app.post('/api/summaries', async (c) => {
  return c.get('services').summaries.handleSummaries(c);
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
