import { Hono } from "hono";
import { vi } from "vitest";
import type { Env } from "../../workers/types";
import { DatabaseService } from "../../workers/services/database";
import { VectorSearchService } from "../../workers/services/vector-search";
import { WidgetService } from "../../workers/services/widget";
import { FileStorageService } from "../../workers/services/file-storage";
import { OpenAIService } from "../../workers/services/openai";
import { ChatService } from "../../workers/services/chat";
import { MessageService } from "../../workers/services/messages";
import { RecommendationsService } from "../../workers/services/recommendations";
import { ApifyCrawlerService } from "../../workers/services/apify-crawler";
import { AuthService } from "../../workers/services/auth";
import { SummariesService } from "../../workers/services/summaries";
import { SelectorAnalysisService } from "../../workers/services/selector-analysis";
import { RAGAgent } from "../../workers/services/rag-agent";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../workers/db/schema";

// Create real app instance for integration testing
export async function createRealTestApp(options?: {
  env?: Partial<Env>;
  mockOpenAI?: boolean;
  mockApify?: boolean;
}) {
  // Load test environment variables
  const testEnv: Env = {
    DATABASE_URL: process.env.DATABASE_URL || "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    MISTRAL_AI_API_KEY: process.env.MISTRAL_AI_API_KEY || "",
    APIFY_API_TOKEN: process.env.APIFY_API_TOKEN || "",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    API_BEARER_TOKEN: process.env.API_BEARER_TOKEN || "",
    STORE_IP_ADDRESSES: process.env.STORE_IP_ADDRESSES || "false",
    MESSAGE_RETENTION_DAYS: process.env.MESSAGE_RETENTION_DAYS || "90",
    METRICS_ENDPOINT: process.env.METRICS_ENDPOINT || "",
    ...options?.env,
  } as Env;

  // Import the actual app
  const { app } = await import("../../workers/app");

  // If mocking is requested, intercept service creation
  if (options?.mockOpenAI || options?.mockApify) {
    const originalUse = app.use.bind(app);
    
    // Intercept the services middleware
    app.use = function(path: string, ...handlers: any[]) {
      if (path === '/api/*' && handlers.length === 1) {
        const originalHandler = handlers[0];
        const newHandler = async (c: any, next: any) => {
          // Call original handler first
          await originalHandler(c, next);
          
          // Then modify services if needed
          const services = c.get('services');
          if (services) {
            if (options.mockOpenAI && services.openai) {
              // Mock OpenAI methods
              services.openai.createEmbedding = vi.fn().mockResolvedValue({
                data: [{ embedding: new Array(1536).fill(0.1) }]
              });
              services.openai.createChatCompletion = vi.fn().mockResolvedValue({
                choices: [{ message: { content: "Mocked response" } }]
              });
            }
            
            if (options.mockApify && services.apifyCrawler) {
              // Mock Apify methods
              services.apifyCrawler.startCrawl = vi.fn().mockResolvedValue({
                actorRunId: "mock-run-id"
              });
              services.apifyCrawler.checkCrawlStatus = vi.fn().mockResolvedValue({
                status: "SUCCEEDED"
              });
              services.apifyCrawler.getCrawlResults = vi.fn().mockResolvedValue([
                { url: "https://example.com", title: "Example", text: "Example content" }
              ]);
            }
          }
        };
        return originalUse(path, newHandler);
      }
      return originalUse(path, ...handlers);
    };
  }

  return { app, env: testEnv };
}

// Database cleanup helpers
export async function cleanupTestData(env: Env, options?: {
  widgets?: boolean;
  messages?: boolean;
  files?: boolean;
  all?: boolean;
}) {
  if (!env?.DATABASE_URL) {
    console.warn("No DATABASE_URL found in env, skipping cleanup");
    return;
  }
  
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  try {
    if (options?.all || options?.messages) {
      await db.delete(schema.chatMessage).execute();
    }

    if (options?.all || options?.files) {
      await db.delete(schema.widgetFile).execute();
      await db.delete(schema.fileStorage).execute();
    }

    if (options?.all || options?.widgets) {
      await db.delete(schema.widget).execute();
    }
  } catch (error) {
    console.error("Error cleaning up test data:", error);
  }
}

// Test data factories
export function createTestWidgetData(overrides?: Partial<typeof schema.widget.$inferInsert>) {
  return {
    name: "Test Widget",
    description: "Test widget description",
    instructions: "Test instructions",
    isPublic: false,
    crawlUrl: null,
    ...overrides,
  };
}

export function createTestFileData(overrides?: Partial<typeof schema.fileStorage.$inferInsert>) {
  return {
    fileName: "test.txt",
    fileType: "text/plain",
    fileSize: 100,
    storageKey: "test-key",
    ...overrides,
  };
}

// Session helper for authenticated requests
export async function createAuthSession(app: Hono, email: string = "test@example.com") {
  // This would normally involve calling the auth endpoints
  // For now, we'll use a mock approach
  const sessionCookie = "test-session-cookie";
  return {
    cookie: `better-auth.session_token=${sessionCookie}`,
    userId: "test-user-id",
  };
}