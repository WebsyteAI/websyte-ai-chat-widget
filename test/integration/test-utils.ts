import { Hono } from "hono";
import type { Context } from "hono";
import { vi } from "vitest";
import type { User } from "better-auth";
import type { DatabaseService, VectorSearchService, WidgetService, FileStorageService, OpenAIService, ChatService, MessageService, RecommendationsService, ApifyCrawlerService, AuthService } from "../../workers/services";

// Test user factory
export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: true,
    ...overrides,
  };
}

// Test auth context
export function createAuthContext(user?: User | null) {
  return {
    isAuthenticated: !!user,
    user: user || null,
    session: user ? { 
      id: "test-session-id",
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
    } : null,
  };
}

// Mock services factory
export function createMockServices() {
  return {
    database: {
      getWidget: vi.fn(),
      createWidget: vi.fn(),
      updateWidget: vi.fn(),
      deleteWidget: vi.fn(),
      getUserWidgets: vi.fn(),
      getAllWidgets: vi.fn(),
      getWidgetsByIds: vi.fn(),
      getDatabase: vi.fn(),
      getCachedSummaries: vi.fn(),
      setCachedSummaries: vi.fn(),
      getCachedRecommendations: vi.fn(),
      setCachedRecommendations: vi.fn(),
      getSummaries: vi.fn(),
      setSummaries: vi.fn(),
      getRecommendations: vi.fn(),
      setRecommendations: vi.fn(),
      getCrawledUrls: vi.fn(),
      setCrawledUrls: vi.fn(),
      addCrawledUrl: vi.fn(),
      isWidgetNameAvailable: vi.fn(),
      getUrlsToDelete: vi.fn(),
      clearUrlsToDelete: vi.fn(),
    } as unknown as DatabaseService,
    
    vectorSearch: {
      createEmbedding: vi.fn(),
      searchSimilar: vi.fn(),
      deleteEmbeddingsForWidget: vi.fn(),
      refreshEmbeddings: vi.fn(),
      getEmbeddingCountForWidget: vi.fn(),
    } as unknown as VectorSearchService,
    
    widget: {
      getWidget: vi.fn(),
      getUserWidgets: vi.fn(),
      getUserWidgetsCount: vi.fn(),
      getAllWidgets: vi.fn(),
      getAllWidgetsCount: vi.fn(),
      createWidget: vi.fn(),
      updateWidget: vi.fn(),
      deleteWidget: vi.fn(),
      addDocumentsToWidget: vi.fn(),
      removeDocumentFromWidget: vi.fn(),
      getWidgetDocuments: vi.fn(),
      searchWidgetContent: vi.fn(),
      processCrawlResults: vi.fn(),
      getPublicWidget: vi.fn(),
      getWidgetsByIds: vi.fn(),
      refreshEmbeddings: vi.fn(),
      generateRecommendations: vi.fn(),
      generateWidgetRecommendations: vi.fn(),
      getCrawlStatus: vi.fn(),
      cleanupOldPageFiles: vi.fn(),
      initiateCrawl: vi.fn(),
      checkCrawlStatus: vi.fn(),
      resetStuckCrawl: vi.fn(),
    } as unknown as WidgetService,
    
    fileStorage: {
      uploadFile: vi.fn(),
      getFile: vi.fn(),
      deleteFile: vi.fn(),
      getSignedUrl: vi.fn(),
      uploadPageFile: vi.fn(),
      getPageFile: vi.fn(),
      deletePageFile: vi.fn(),
      getFileRecord: vi.fn(),
      createFileRecord: vi.fn(),
      getFilesByIds: vi.fn(),
      getPageFilesByWidgetId: vi.fn(),
      deletePageFilesByWidgetId: vi.fn(),
    } as unknown as FileStorageService,
    
    openai: {
      createEmbedding: vi.fn(),
      createCompletion: vi.fn(),
      createChatCompletion: vi.fn(),
      createStreamingChatCompletion: vi.fn(),
    } as unknown as OpenAIService,
    
    chat: {
      handleChat: vi.fn().mockResolvedValue(new Response(JSON.stringify({ response: "test" }), { status: 200 })),
    } as unknown as ChatService,
    
    messages: {
      createMessage: vi.fn(),
      createMessages: vi.fn(),
      getMessagesBySessionId: vi.fn(),
      deleteOldMessages: vi.fn(),
      getMessageStats: vi.fn(),
      shouldPersistMessages: vi.fn(),
    } as unknown as MessageService,
    
    recommendations: {
      generateRecommendations: vi.fn(),
    } as unknown as RecommendationsService,
    
    apifyCrawler: {
      startCrawl: vi.fn(),
      checkCrawlStatus: vi.fn(),
      getCrawlResults: vi.fn(),
    } as unknown as ApifyCrawlerService,
    
    auth: {
      handleAuth: vi.fn(),
    } as unknown as any,
  };
}

// Create test app with mocked services
export function createTestApp(options?: {
  auth?: ReturnType<typeof createAuthContext>;
  services?: ReturnType<typeof createMockServices>;
  includeRoutes?: boolean;
}) {
  const app = new Hono();
  const mockServices = options?.services || createMockServices();
  const mockAuth = options?.auth || createAuthContext(null);
  
  // Set up middleware that adds services and auth to context
  app.use("*", async (c, next) => {
    c.set("services", mockServices);
    c.set("auth", mockAuth);
    await next();
  });
  
  // Add routes if requested (mimicking the actual app structure)
  if (options?.includeRoutes !== false) {
    // Auth routes
    app.all('/api/auth/*', async (c) => {
      try {
        const result = await c.get('services').auth.handleAuth(c as any);
        return result;
      } catch (error) {
        return c.json({ error: 'Auth endpoint error' }, 500);
      }
    });
    
    // Chat route
    app.post('/api/chat', async (c) => {
      return c.get('services').chat.handleChat(c);
    });
  }
  
  return { app, services: mockServices, auth: mockAuth };
}

// Test request helper
export async function testRequest(
  app: Hono,
  path: string,
  options?: RequestInit & { 
    json?: any;
    headers?: Record<string, string>;
  }
) {
  const headers = new Headers(options?.headers || {});
  
  if (options?.json) {
    headers.set("Content-Type", "application/json");
  }
  
  const request = new Request(`http://localhost${path}`, {
    ...options,
    headers,
    body: options?.json ? JSON.stringify(options.json) : options?.body,
  });
  
  return await app.fetch(request);
}

// Bearer token helper
export function bearerToken(token: string = "test-bearer-token-for-integration-tests") {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Widget test data factory
export function createTestWidget(overrides?: Partial<any>) {
  const now = new Date();
  return {
    id: "test-widget-id",
    userId: "test-user-id",
    name: "Test Widget",
    description: "Test widget description",
    instructions: "Test instructions",
    isPublic: false,
    crawlUrl: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...overrides,
  };
}

// Chat message test data factory
export function createTestMessage(overrides?: Partial<any>) {
  return {
    id: "test-message-id",
    widgetId: "test-widget-id",
    sessionId: "test-session-id",
    role: "user",
    content: "Test message",
    timestamp: new Date(),
    ...overrides,
  };
}

// Route setup helpers for integration tests
export function setupWidgetRoutes(app: Hono, services: ReturnType<typeof createMockServices>) {
  // Apply auth middleware
  const authCheck = async (c: any, next: any) => {
    const auth = c.get("auth");
    if (!auth?.isAuthenticated) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  };

  // Widget routes
  app.get("/api/widgets", authCheck, async (c) => {
    const auth = c.get("auth");
    const limit = Math.min(parseInt(c.req.query("limit") || "50"), 1000);
    const offset = parseInt(c.req.query("offset") || "0");
    
    const [widgets, total] = await Promise.all([
      services.widget.getUserWidgets(auth.user.id, limit, offset),
      services.widget.getUserWidgetsCount(auth.user.id),
    ]);
    
    return c.json({ widgets, total });
  });

  app.post("/api/widgets", authCheck, async (c) => {
    const auth = c.get("auth");
    const formData = await c.req.formData();
    
    const widget = await services.widget.createWidget(
      auth.user.id,
      {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        instructions: formData.get("instructions") as string,
        url: formData.get("url") as string,
      },
      [] // files
    );
    
    return c.json({ widget });
  });

  app.get("/api/widgets/:id", authCheck, async (c) => {
    const widgetId = c.req.param("id");
    const widget = await services.widget.getWidget(widgetId);
    
    if (!widget) {
      return c.json({ error: "Widget not found" }, 404);
    }
    
    return c.json({ widget });
  });

  app.delete("/api/widgets/:id", authCheck, async (c) => {
    const widgetId = c.req.param("id");
    await services.widget.deleteWidget(widgetId);
    return c.json({ success: true });
  });

  // Public widget route
  app.get("/api/public/widget/:id", async (c) => {
    const widgetId = c.req.param("id");
    const widget = await services.widget.getPublicWidget(widgetId);
    
    if (!widget) {
      return c.json({ error: "Widget not found or not public" }, 404);
    }
    
    return c.json(widget);
  });
}

export function setupAutomationRoutes(app: Hono, services: ReturnType<typeof createMockServices>, env: any) {
  // Bearer token middleware
  const bearerAuth = async (c: any, next: any) => {
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized: Bearer token required" }, 401);
    }
    
    const token = authHeader.substring(7);
    if (token !== process.env.API_BEARER_TOKEN) {
      return c.json({ error: "Unauthorized: Invalid bearer token" }, 401);
    }
    
    await next();
  };

  // Automation routes
  app.get("/api/automation/widgets", bearerAuth, async (c) => {
    const limit = Math.min(parseInt(c.req.query("limit") || "50"), 1000);
    const offset = parseInt(c.req.query("offset") || "0");
    
    const [widgets, total] = await Promise.all([
      services.widget.getAllWidgets(limit, offset),
      services.widget.getAllWidgetsCount(),
    ]);
    
    return c.json({ widgets, total });
  });

  app.post("/api/automation/widgets", bearerAuth, async (c) => {
    const data = await c.req.json();
    const widget = await services.widget.createWidget(
      "automation-user",
      data,
      []
    );
    
    return c.json({ widget });
  });

  app.post("/api/automation/widgets/:id/crawl", bearerAuth, async (c) => {
    const widgetId = c.req.param("id");
    const { url, maxPages = 50 } = await c.req.json();
    
    await services.widget.initiateCrawl(widgetId, url, maxPages);
    
    if (env.WIDGET_CONTENT_WORKFLOW) {
      await env.WIDGET_CONTENT_WORKFLOW.create({
        params: { widgetId, crawlUrl: url },
      });
    }
    
    return c.json({ success: true, message: "Crawl initiated" });
  });
}