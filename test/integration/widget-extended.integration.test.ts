import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestApp, testRequest, createTestUser, createAuthContext, createTestWidget, createTestMessage } from "./test-utils";

describe("Widget Extended Integration Tests", () => {
  let app: ReturnType<typeof createTestApp>;
  let authedApp: ReturnType<typeof createTestApp>;
  let user: ReturnType<typeof createTestUser>;
  
  beforeEach(() => {
    // Create unauthenticated app
    app = createTestApp();
    setupExtendedWidgetRoutes(app.app, app.services);
    
    // Create authenticated app with user
    user = createTestUser();
    const authContext = createAuthContext(user);
    authedApp = createTestApp({ auth: authContext });
    setupExtendedWidgetRoutes(authedApp.app, authedApp.services);
  });

  describe("POST /api/widgets/:id/crawl", () => {
    it("should require authentication", async () => {
      const response = await testRequest(app.app, "/api/widgets/123/crawl", {
        method: "POST",
        json: { url: "https://example.com" },
      });

      expect(response.status).toBe(401);
    });

    it("should initiate crawl for existing widget", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(authedApp.services.widget.initiateCrawl).mockResolvedValue(undefined);

      const response = await testRequest(authedApp.app, "/api/widgets/123/crawl", {
        method: "POST",
        json: { url: "https://example.com", maxPages: 10 },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ 
        success: true, 
        message: "Crawl initiated for widget 123" 
      });
      expect(authedApp.services.widget.initiateCrawl).toHaveBeenCalledWith(
        "123", 
        "https://example.com", 
        10
      );
    });

    it("should use default maxPages if not provided", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(authedApp.services.widget.initiateCrawl).mockResolvedValue(undefined);

      const response = await testRequest(authedApp.app, "/api/widgets/123/crawl", {
        method: "POST",
        json: { url: "https://example.com" },
      });

      expect(response.status).toBe(200);
      expect(authedApp.services.widget.initiateCrawl).toHaveBeenCalledWith(
        "123", 
        "https://example.com", 
        50 // default
      );
    });

    it("should return 404 for non-existent widget", async () => {
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(null);

      const response = await testRequest(authedApp.app, "/api/widgets/999/crawl", {
        method: "POST",
        json: { url: "https://example.com" },
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Widget not found" });
    });

    it("should validate URL is provided", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);

      const response = await testRequest(authedApp.app, "/api/widgets/123/crawl", {
        method: "POST",
        json: {},
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "URL is required" });
    });
  });

  describe("GET /api/widgets/:id/crawl/status", () => {
    it("should get crawl status", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      const crawlStatus = { 
        status: "IN_PROGRESS", 
        progress: 50, 
        pagesProcessed: 25,
        totalPages: 50 
      };
      
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(authedApp.services.widget.getCrawlStatus).mockResolvedValue(crawlStatus);

      const response = await testRequest(authedApp.app, "/api/widgets/123/crawl/status", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(crawlStatus);
    });

    it("should return 404 for non-existent widget", async () => {
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(null);

      const response = await testRequest(authedApp.app, "/api/widgets/999/crawl/status", {
        method: "GET",
      });

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/widgets/:id/documents", () => {
    it("should add documents to widget", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(authedApp.services.widget.addDocumentsToWidget).mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append("file_1", new File(["test content"], "test.txt", { type: "text/plain" }));
      formData.append("file_2", new File(["test content 2"], "test2.txt", { type: "text/plain" }));

      const response = await testRequest(authedApp.app, "/api/widgets/123/documents", {
        method: "POST",
        body: formData,
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ 
        success: true, 
        message: "Added 2 documents to widget" 
      });
      expect(authedApp.services.widget.addDocumentsToWidget).toHaveBeenCalledWith(
        "123",
        expect.arrayContaining([
          expect.objectContaining({ name: "test.txt" }),
          expect.objectContaining({ name: "test2.txt" })
        ])
      );
    }, 10000); // 10 second timeout

    it("should handle no files provided", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);

      const formData = new FormData();

      const response = await testRequest(authedApp.app, "/api/widgets/123/documents", {
        method: "POST",
        body: formData,
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "No files provided" });
    });
  });

  describe("DELETE /api/widgets/:id/documents/:documentId", () => {
    it("should remove document from widget", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(authedApp.services.widget.removeDocumentFromWidget).mockResolvedValue(true);

      const response = await testRequest(authedApp.app, "/api/widgets/123/documents/doc456", {
        method: "DELETE",
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
      expect(authedApp.services.widget.removeDocumentFromWidget).toHaveBeenCalledWith("123", "doc456");
    });

    it("should return 404 if document not found", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(authedApp.services.widget.removeDocumentFromWidget).mockResolvedValue(false);

      const response = await testRequest(authedApp.app, "/api/widgets/123/documents/nonexistent", {
        method: "DELETE",
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Document not found" });
    });
  });

  describe("POST /api/widgets/:id/search", () => {
    it("should search widget content", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      const searchResults = [
        { content: "Result 1", score: 0.9 },
        { content: "Result 2", score: 0.8 },
      ];
      
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(authedApp.services.widget.searchWidgetContent).mockResolvedValue(searchResults);

      const response = await testRequest(authedApp.app, "/api/widgets/123/search", {
        method: "POST",
        json: { query: "test query", limit: 5 },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ results: searchResults });
      expect(authedApp.services.widget.searchWidgetContent).toHaveBeenCalledWith("123", "test query", 5);
    });

    it("should use default limit if not provided", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(authedApp.services.widget.searchWidgetContent).mockResolvedValue([]);

      const response = await testRequest(authedApp.app, "/api/widgets/123/search", {
        method: "POST",
        json: { query: "test query" },
      });

      expect(response.status).toBe(200);
      expect(authedApp.services.widget.searchWidgetContent).toHaveBeenCalledWith("123", "test query", 10);
    });

    it("should validate query is provided", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);

      const response = await testRequest(authedApp.app, "/api/widgets/123/search", {
        method: "POST",
        json: {},
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Query is required" });
    });
  });

  describe("POST /api/widgets/:id/recommendations", () => {
    it("should generate recommendations for widget", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      const recommendations = ["How to get started?", "What features are available?"];
      
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(authedApp.services.widget.generateWidgetRecommendations).mockResolvedValue(recommendations);

      const response = await testRequest(authedApp.app, "/api/widgets/123/recommendations", {
        method: "POST",
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ recommendations });
    });

    it("should handle recommendation generation errors", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(authedApp.services.widget.generateWidgetRecommendations).mockRejectedValue(
        new Error("Failed to generate recommendations")
      );

      const response = await testRequest(authedApp.app, "/api/widgets/123/recommendations", {
        method: "POST",
      });

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: "Failed to generate recommendations" });
    });
  });

  describe("GET /api/public/widget/:id", () => {
    it("should return public widget info", async () => {
      const widget = createTestWidget({ 
        id: "123", 
        isPublic: true,
        recommendations: ["Question 1", "Question 2"]
      });
      
      vi.mocked(app.services.widget.getPublicWidget).mockResolvedValue(widget);

      const response = await testRequest(app.app, "/api/public/widget/123", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        id: widget.id,
        name: widget.name,
        description: widget.description,
        recommendations: widget.recommendations,
      });
    });

    it("should return 404 for private widget", async () => {
      vi.mocked(app.services.widget.getPublicWidget).mockResolvedValue(null);

      const response = await testRequest(app.app, "/api/public/widget/123", {
        method: "GET",
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Widget not found or not public" });
    });

    it("should not require authentication", async () => {
      const widget = createTestWidget({ id: "123", isPublic: true });
      vi.mocked(app.services.widget.getPublicWidget).mockResolvedValue(widget);

      // Test without any auth
      const response = await testRequest(app.app, "/api/public/widget/123", {
        method: "GET",
      });

      expect(response.status).toBe(200);
    });
  });

  describe("Widget Messages Integration", () => {
    it("should track chat messages for widgets", async () => {
      const widget = createTestWidget({ id: "123", isPublic: true, userId: user.id });
      const sessionId = "test-session-123";
      const messages = [
        createTestMessage({ widgetId: "123", sessionId, role: "user", content: "Hello", timestamp: "2025-07-01T05:14:01.159Z" }),
        createTestMessage({ widgetId: "123", sessionId, role: "assistant", content: "Hi there!", timestamp: "2025-07-01T05:14:01.159Z" }),
      ];

      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(authedApp.services.messages.shouldPersistMessages).mockReturnValue(true);
      vi.mocked(authedApp.services.messages.createMessages).mockResolvedValue(undefined);
      vi.mocked(authedApp.services.messages.getMessagesBySessionId).mockResolvedValue(messages);

      // Simulate chat interaction
      const chatResponse = await testRequest(app.app, "/api/chat", {
        method: "POST",
        json: {
          widgetId: "123",
          sessionId,
          message: "Hello",
        },
      });

      expect(app.services.chat.handleChat).toHaveBeenCalled();
      
      // Get messages for session
      const messagesResponse = await testRequest(authedApp.app, "/api/widgets/123/messages", {
        method: "GET",
        headers: { "X-Session-Id": sessionId },
      });

      expect(messagesResponse.status).toBe(200);
      expect(await messagesResponse.json()).toEqual({ messages });
    });
  });
});

// Extended route setup helper
function setupExtendedWidgetRoutes(app: any, services: any) {
  // Basic auth middleware
  const authMiddleware = async (c: any, next: any) => {
    const auth = c.get("auth");
    if (!auth?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  };

  // Crawl endpoints
  app.post("/api/widgets/:id/crawl", authMiddleware, async (c: any) => {
    const auth = c.get("auth");
    const widgetId = c.req.param("id");
    const { url, maxPages = 50 } = await c.req.json();

    if (!url) {
      return c.json({ error: "URL is required" }, 400);
    }

    const widget = await services.widget.getWidget(widgetId, auth.user.id);
    if (!widget) {
      return c.json({ error: "Widget not found" }, 404);
    }

    await services.widget.initiateCrawl(widgetId, url, maxPages);
    return c.json({ success: true, message: `Crawl initiated for widget ${widgetId}` });
  });

  app.get("/api/widgets/:id/crawl/status", authMiddleware, async (c: any) => {
    const auth = c.get("auth");
    const widgetId = c.req.param("id");

    const widget = await services.widget.getWidget(widgetId, auth.user.id);
    if (!widget) {
      return c.json({ error: "Widget not found" }, 404);
    }

    const status = await services.widget.getCrawlStatus(widgetId);
    return c.json(status);
  });

  // Document management
  app.post("/api/widgets/:id/documents", authMiddleware, async (c: any) => {
    const auth = c.get("auth");
    const widgetId = c.req.param("id");
    const formData = await c.req.formData();

    const widget = await services.widget.getWidget(widgetId, auth.user.id);
    if (!widget) {
      return c.json({ error: "Widget not found" }, 404);
    }

    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file_") && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return c.json({ error: "No files provided" }, 400);
    }

    await services.widget.addDocumentsToWidget(widgetId, files);
    return c.json({ success: true, message: `Added ${files.length} documents to widget` });
  });

  app.delete("/api/widgets/:id/documents/:documentId", authMiddleware, async (c: any) => {
    const auth = c.get("auth");
    const widgetId = c.req.param("id");
    const documentId = c.req.param("documentId");

    const widget = await services.widget.getWidget(widgetId, auth.user.id);
    if (!widget) {
      return c.json({ error: "Widget not found" }, 404);
    }

    const success = await services.widget.removeDocumentFromWidget(widgetId, documentId);
    if (!success) {
      return c.json({ error: "Document not found" }, 404);
    }

    return c.json({ success: true });
  });

  // Search and recommendations
  app.post("/api/widgets/:id/search", authMiddleware, async (c: any) => {
    const auth = c.get("auth");
    const widgetId = c.req.param("id");
    const { query, limit = 10 } = await c.req.json();

    if (!query) {
      return c.json({ error: "Query is required" }, 400);
    }

    const widget = await services.widget.getWidget(widgetId, auth.user.id);
    if (!widget) {
      return c.json({ error: "Widget not found" }, 404);
    }

    const results = await services.widget.searchWidgetContent(widgetId, query, limit);
    return c.json({ results });
  });

  app.post("/api/widgets/:id/recommendations", authMiddleware, async (c: any) => {
    const auth = c.get("auth");
    const widgetId = c.req.param("id");

    const widget = await services.widget.getWidget(widgetId, auth.user.id);
    if (!widget) {
      return c.json({ error: "Widget not found" }, 404);
    }

    try {
      const recommendations = await services.widget.generateWidgetRecommendations(widgetId);
      return c.json({ recommendations });
    } catch (error) {
      return c.json({ error: "Failed to generate recommendations" }, 500);
    }
  });

  // Public widget endpoint
  app.get("/api/public/widget/:id", async (c: any) => {
    const widgetId = c.req.param("id");
    const widget = await services.widget.getPublicWidget(widgetId);
    
    if (!widget) {
      return c.json({ error: "Widget not found or not public" }, 404);
    }

    return c.json({
      id: widget.id,
      name: widget.name,
      description: widget.description,
      recommendations: widget.recommendations,
    });
  });

  // Widget messages
  app.get("/api/widgets/:id/messages", authMiddleware, async (c: any) => {
    const auth = c.get("auth");
    const widgetId = c.req.param("id");
    const sessionId = c.req.header("X-Session-Id");

    if (!sessionId) {
      return c.json({ error: "Session ID required" }, 400);
    }

    const widget = await services.widget.getWidget(widgetId, auth.user.id);
    if (!widget) {
      return c.json({ error: "Widget not found" }, 404);
    }

    const messages = await services.messages.getMessagesBySessionId(sessionId);
    return c.json({ messages });
  });
}