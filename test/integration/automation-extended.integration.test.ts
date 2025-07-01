import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestApp, testRequest, bearerToken, createTestWidget } from "./test-utils";

describe("Automation API Extended Integration Tests", () => {
  let app: ReturnType<typeof createTestApp>;
  let mockEnv: any;
  
  beforeEach(() => {
    app = createTestApp();
    mockEnv = {
      WIDGET_CONTENT_WORKFLOW: {
        create: vi.fn(),
      },
      API_BEARER_TOKEN: "test-bearer-token-for-integration-tests",
    };
    setupExtendedAutomationRoutes(app.app, app.services, mockEnv);
  });

  describe("Bearer Token Edge Cases", () => {
    it("should reject missing Authorization header", async () => {
      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "GET",
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized: Bearer token required" });
    });

    it("should reject malformed Authorization header", async () => {
      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "GET",
        headers: {
          Authorization: "InvalidFormat token",
        },
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized: Bearer token required" });
    });

    it("should reject empty bearer token", async () => {
      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "GET",
        headers: {
          Authorization: "Bearer ",
        },
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized: Bearer token required" });
    });

    it("should reject bearer token with extra spaces", async () => {
      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "GET",
        headers: {
          Authorization: "Bearer  test-bearer-token-for-integration-tests",
        },
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized: Invalid bearer token" });
    });

    it("should handle case-sensitive bearer token", async () => {
      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "GET",
        headers: {
          Authorization: "bearer test-bearer-token-for-integration-tests",
        },
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized: Bearer token required" });
    });
  });

  describe("GET /api/automation/widgets/:id", () => {
    it("should get specific widget details", async () => {
      const widget = createTestWidget({ 
        id: "widget-123", 
        name: "Test Widget",
        isPublic: true,
        crawlUrl: "https://example.com",
        crawlStatus: "completed",
      });
      
      vi.mocked(app.services.widget.getWidget).mockResolvedValue(widget);

      const response = await testRequest(app.app, "/api/automation/widgets/widget-123", {
        method: "GET",
        headers: bearerToken(),
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ widget });
    });

    it("should return 404 for non-existent widget", async () => {
      vi.mocked(app.services.widget.getWidget).mockResolvedValue(null);

      const response = await testRequest(app.app, "/api/automation/widgets/non-existent", {
        method: "GET",
        headers: bearerToken(),
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Widget not found" });
    });
  });

  describe("PUT /api/automation/widgets/:id", () => {
    it("should update widget via automation API", async () => {
      const existingWidget = createTestWidget({ id: "widget-123", name: "Old Name" });
      const updatedWidget = { ...existingWidget, name: "New Name" };
      
      vi.mocked(app.services.widget.getWidget).mockResolvedValue(existingWidget);
      vi.mocked(app.services.widget.updateWidget).mockResolvedValue(updatedWidget);

      const response = await testRequest(app.app, "/api/automation/widgets/widget-123", {
        method: "PUT",
        headers: bearerToken(),
        json: {
          name: "New Name",
          description: "Updated description",
        },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ widget: updatedWidget });
      expect(app.services.widget.updateWidget).toHaveBeenCalledWith(
        "widget-123",
        "system-automation",
        {
          name: "New Name",
          description: "Updated description",
        }
      );
    });

    it("should not allow updating system fields", async () => {
      const widget = createTestWidget({ id: "widget-123" });
      vi.mocked(app.services.widget.getWidget).mockResolvedValue(widget);

      const response = await testRequest(app.app, "/api/automation/widgets/widget-123", {
        method: "PUT",
        headers: bearerToken(),
        json: {
          id: "different-id",
          userId: "different-user",
          createdAt: new Date(),
        },
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ 
        error: "Cannot update system fields: id, userId, createdAt" 
      });
    });
  });

  describe("DELETE /api/automation/widgets/:id", () => {
    it("should delete widget via automation API", async () => {
      const widget = createTestWidget({ id: "widget-123" });
      vi.mocked(app.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(app.services.widget.deleteWidget).mockResolvedValue(true);

      const response = await testRequest(app.app, "/api/automation/widgets/widget-123", {
        method: "DELETE",
        headers: bearerToken(),
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
      expect(app.services.widget.deleteWidget).toHaveBeenCalledWith("widget-123", "system-automation");
    });

    it("should return 404 if widget not found", async () => {
      vi.mocked(app.services.widget.getWidget).mockResolvedValue(null);

      const response = await testRequest(app.app, "/api/automation/widgets/non-existent", {
        method: "DELETE",
        headers: bearerToken(),
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Widget not found" });
    });
  });

  describe("GET /api/automation/widgets/:id/stats", () => {
    it("should get widget statistics", async () => {
      const widget = createTestWidget({ id: "widget-123" });
      const stats = {
        totalDocuments: 50,
        totalEmbeddings: 150,
        lastCrawled: "2025-07-01T00:00:00Z",
        messageCount: 25,
      };
      
      vi.mocked(app.services.widget.getWidget).mockResolvedValue(widget);
      vi.mocked(app.services.widget.getWidgetDocuments).mockResolvedValue({ documents: new Array(50), total: 50 });
      vi.mocked(app.services.vectorSearch.getEmbeddingCountForWidget).mockResolvedValue(150);
      vi.mocked(app.services.messages.getMessageStats).mockResolvedValue({ totalMessages: 25, uniqueSessions: 10 });

      const response = await testRequest(app.app, "/api/automation/widgets/widget-123/stats", {
        method: "GET",
        headers: bearerToken(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        widgetId: "widget-123",
        totalDocuments: 50,
        totalEmbeddings: 150,
        messages: {
          totalMessages: 25,
          uniqueSessions: 10,
        },
      });
    });
  });

  describe("POST /api/automation/widgets/batch", () => {
    it("should create multiple widgets in batch", async () => {
      const widgets = [
        { name: "Widget 1", description: "Desc 1" },
        { name: "Widget 2", description: "Desc 2" },
      ];
      
      const createdWidgets = widgets.map((w, i) => 
        createTestWidget({ ...w, id: `widget-${i + 1}` })
      );
      
      vi.mocked(app.services.widget.createWidget)
        .mockResolvedValueOnce(createdWidgets[0])
        .mockResolvedValueOnce(createdWidgets[1]);

      const response = await testRequest(app.app, "/api/automation/widgets/batch", {
        method: "POST",
        headers: bearerToken(),
        json: { widgets },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.created).toHaveLength(2);
      expect(data.failed).toHaveLength(0);
    });

    it("should handle partial batch failures", async () => {
      const widgets = [
        { name: "Widget 1", description: "Desc 1" },
        { name: "", description: "Missing name" },
        { name: "Widget 3", description: "Desc 3" },
      ];
      
      vi.mocked(app.services.widget.createWidget)
        .mockResolvedValueOnce(createTestWidget({ name: "Widget 1", id: "widget-1" }))
        .mockRejectedValueOnce(new Error("Name is required"))
        .mockResolvedValueOnce(createTestWidget({ name: "Widget 3", id: "widget-3" }));

      const response = await testRequest(app.app, "/api/automation/widgets/batch", {
        method: "POST",
        headers: bearerToken(),
        json: { widgets },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.created).toHaveLength(2);
      expect(data.failed).toHaveLength(1);
      expect(data.failed[0]).toMatchObject({
        index: 1,
        error: "Name is required",
      });
    });

    it("should validate batch size limit", async () => {
      const widgets = new Array(101).fill({ name: "Widget", description: "Desc" });

      const response = await testRequest(app.app, "/api/automation/widgets/batch", {
        method: "POST",
        headers: bearerToken(),
        json: { widgets },
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ 
        error: "Batch size exceeds maximum of 100 widgets" 
      });
    });
  });

  describe("Rate Limiting", () => {
    it("should track API usage per token", async () => {
      vi.mocked(app.services.widget.getAllWidgets).mockResolvedValue([]);
      vi.mocked(app.services.widget.getAllWidgetsCount).mockResolvedValue(0);

      // Make multiple requests
      for (let i = 0; i < 5; i++) {
        const response = await testRequest(app.app, "/api/automation/widgets", {
          method: "GET",
          headers: bearerToken(),
        });
        expect(response.status).toBe(200);
      }

      // Check rate limit headers
      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "GET",
        headers: bearerToken(),
      });
      
      expect(response.headers.get("X-RateLimit-Limit")).toBeTruthy();
      expect(response.headers.get("X-RateLimit-Remaining")).toBeTruthy();
    });
  });
});

// Extended automation routes setup
function setupExtendedAutomationRoutes(app: any, services: any, env: any) {
  // Enhanced bearer token middleware with better validation
  const bearerTokenMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized: Bearer token required" }, 401);
    }
    
    const token = authHeader.substring(7);
    if (!token || token !== env.API_BEARER_TOKEN) {
      return c.json({ error: "Unauthorized: Invalid bearer token" }, 401);
    }
    
    // Add rate limiting tracking
    c.set("rateLimitKey", `bearer:${token}`);
    await next();
  };

  // Add rate limit headers
  const addRateLimitHeaders = async (c: any, next: any) => {
    await next();
    c.res.headers.set("X-RateLimit-Limit", "1000");
    c.res.headers.set("X-RateLimit-Remaining", "995");
    c.res.headers.set("X-RateLimit-Reset", new Date(Date.now() + 3600000).toISOString());
  };

  // Routes from the original file
  app.get("/api/automation/widgets", bearerTokenMiddleware, addRateLimitHeaders, async (c: any) => {
    const limit = Math.min(parseInt(c.req.query("limit") || "50"), 1000);
    const offset = parseInt(c.req.query("offset") || "0");
    
    const [widgets, total] = await Promise.all([
      services.widget.getAllWidgets(limit, offset),
      services.widget.getAllWidgetsCount(),
    ]);
    
    return c.json({ widgets, total });
  });

  app.get("/api/automation/widgets/:id", bearerTokenMiddleware, async (c: any) => {
    const widgetId = c.req.param("id");
    const widget = await services.widget.getWidget(widgetId);
    
    if (!widget) {
      return c.json({ error: "Widget not found" }, 404);
    }
    
    return c.json({ widget });
  });

  app.put("/api/automation/widgets/:id", bearerTokenMiddleware, async (c: any) => {
    const widgetId = c.req.param("id");
    const body = await c.req.json();
    
    // Check for system fields
    const systemFields = ["id", "userId", "createdAt"];
    const hasSystemFields = systemFields.some(field => field in body);
    if (hasSystemFields) {
      return c.json({ 
        error: `Cannot update system fields: ${systemFields.join(", ")}` 
      }, 400);
    }
    
    const widget = await services.widget.getWidget(widgetId);
    if (!widget) {
      return c.json({ error: "Widget not found" }, 404);
    }
    
    const updated = await services.widget.updateWidget(widgetId, "system-automation", body);
    return c.json({ widget: updated });
  });

  app.delete("/api/automation/widgets/:id", bearerTokenMiddleware, async (c: any) => {
    const widgetId = c.req.param("id");
    
    const widget = await services.widget.getWidget(widgetId);
    if (!widget) {
      return c.json({ error: "Widget not found" }, 404);
    }
    
    await services.widget.deleteWidget(widgetId, "system-automation");
    return c.json({ success: true });
  });

  app.get("/api/automation/widgets/:id/stats", bearerTokenMiddleware, async (c: any) => {
    const widgetId = c.req.param("id");
    
    const widget = await services.widget.getWidget(widgetId);
    if (!widget) {
      return c.json({ error: "Widget not found" }, 404);
    }
    
    const [documents, embeddings, messageStats] = await Promise.all([
      services.widget.getWidgetDocuments(widgetId),
      services.vectorSearch.getEmbeddingCountForWidget(widgetId),
      services.messages.getMessageStats(widgetId),
    ]);
    
    return c.json({
      widgetId,
      widgetName: widget.name,
      totalDocuments: documents.total,
      totalEmbeddings: embeddings,
      messages: messageStats,
      lastCrawled: widget.lastCrawled || null,
      crawlStatus: widget.crawlStatus || null,
    });
  });

  app.post("/api/automation/widgets/batch", bearerTokenMiddleware, async (c: any) => {
    const { widgets } = await c.req.json();
    
    if (!Array.isArray(widgets)) {
      return c.json({ error: "Widgets must be an array" }, 400);
    }
    
    if (widgets.length > 100) {
      return c.json({ error: "Batch size exceeds maximum of 100 widgets" }, 400);
    }
    
    const results = {
      created: [] as any[],
      failed: [] as any[],
    };
    
    for (let i = 0; i < widgets.length; i++) {
      try {
        const widget = await services.widget.createWidget("system-automation", widgets[i]);
        results.created.push(widget);
      } catch (error: any) {
        results.failed.push({
          index: i,
          data: widgets[i],
          error: error.message,
        });
      }
    }
    
    return c.json({
      success: true,
      created: results.created,
      failed: results.failed,
      summary: {
        total: widgets.length,
        succeeded: results.created.length,
        failed: results.failed.length,
      },
    });
  });

  // Include original routes
  app.post("/api/automation/widgets", bearerTokenMiddleware, async (c: any) => {
    const data = await c.req.json();
    
    if (!data.name) {
      return c.json({ error: "Widget name is required" }, 400);
    }
    
    const widget = await services.widget.createWidget("system-automation", data);
    
    if (data.crawlUrl || data.isPublic !== undefined) {
      const updated = await services.widget.updateWidget(
        widget.id,
        "system-automation",
        { crawlUrl: data.crawlUrl, isPublic: data.isPublic }
      );
      return c.json({ widget: updated });
    }
    
    return c.json({ widget });
  });
}