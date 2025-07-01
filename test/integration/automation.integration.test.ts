import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestApp, testRequest, bearerToken, createTestWidget } from "./test-utils";

describe("Automation API Integration Tests", () => {
  let app: ReturnType<typeof createTestApp>;
  let mockEnv: any;
  
  beforeEach(() => {
    app = createTestApp();
    mockEnv = {
      WIDGET_CONTENT_WORKFLOW: {
        create: vi.fn(),
      },
    };
    setupAutomationRoutes(app.app, app.services, mockEnv);
  });

  describe("Bearer Token Authentication", () => {
    it("should reject requests without bearer token", async () => {
      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "GET",
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized: Bearer token required" });
    });

    it("should reject requests with invalid bearer token", async () => {
      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "GET",
        headers: bearerToken("invalid-token"),
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized: Invalid bearer token" });
    });

    it("should accept requests with valid bearer token", async () => {
      vi.mocked(app.services.widget.getAllWidgets).mockResolvedValue([]);
      vi.mocked(app.services.widget.getAllWidgetsCount).mockResolvedValue(0);

      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "GET",
        headers: bearerToken(), // Uses default test token
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ widgets: [], total: 0 });
    });
  });

  describe("GET /api/automation/widgets", () => {
    it("should return all widgets", async () => {
      const testWidgets = [
        createTestWidget({ id: "1", name: "Widget 1" }),
        createTestWidget({ id: "2", name: "Widget 2" }),
      ];
      vi.mocked(app.services.widget.getAllWidgets).mockResolvedValue(testWidgets);
      vi.mocked(app.services.widget.getAllWidgetsCount).mockResolvedValue(2);

      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "GET",
        headers: bearerToken(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ widgets: testWidgets, total: 2 });
      expect(app.services.widget.getAllWidgets).toHaveBeenCalledWith(50, 0);
    });

    it("should handle pagination", async () => {
      vi.mocked(app.services.widget.getAllWidgets).mockResolvedValue([]);
      vi.mocked(app.services.widget.getAllWidgetsCount).mockResolvedValue(100);

      const response = await testRequest(app.app, "/api/automation/widgets?limit=20&offset=40", {
        method: "GET",
        headers: bearerToken(),
      });

      expect(response.status).toBe(200);
      expect(app.services.widget.getAllWidgets).toHaveBeenCalledWith(20, 40);
    });

    it("should enforce maximum limit", async () => {
      vi.mocked(app.services.widget.getAllWidgets).mockResolvedValue([]);
      vi.mocked(app.services.widget.getAllWidgetsCount).mockResolvedValue(0);

      const response = await testRequest(app.app, "/api/automation/widgets?limit=2000", {
        method: "GET",
        headers: bearerToken(),
      });

      expect(response.status).toBe(200);
      expect(app.services.widget.getAllWidgets).toHaveBeenCalledWith(1000, 0);
    });
  });

  describe("POST /api/automation/widgets", () => {
    it("should create a new widget", async () => {
      const newWidget = createTestWidget({ id: "new-1", name: "New Widget" });
      vi.mocked(app.services.widget.createWidget).mockResolvedValue(newWidget);

      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "POST",
        headers: bearerToken(),
        json: {
          name: "New Widget",
          description: "Test description",
          url: "https://example.com",
        },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ widget: newWidget });
      expect(app.services.widget.createWidget).toHaveBeenCalledWith(
        "system-automation",
        expect.objectContaining({
          name: "New Widget",
          description: "Test description",
          url: "https://example.com",
        })
      );
    });

    it("should require widget name", async () => {
      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "POST",
        headers: bearerToken(),
        json: {
          description: "Test description",
        },
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Widget name is required" });
    });

    it("should handle crawlUrl and isPublic fields", async () => {
      const newWidget = createTestWidget({ id: "new-1" });
      const updatedWidget = { ...newWidget, crawlUrl: "https://example.com", isPublic: true };
      
      vi.mocked(app.services.widget.createWidget).mockResolvedValue(newWidget);
      vi.mocked(app.services.widget.updateWidget).mockResolvedValue(updatedWidget);

      const response = await testRequest(app.app, "/api/automation/widgets", {
        method: "POST",
        headers: bearerToken(),
        json: {
          name: "New Widget",
          crawlUrl: "https://example.com",
          isPublic: true,
        },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ widget: updatedWidget });
      expect(app.services.widget.updateWidget).toHaveBeenCalledWith(
        "new-1",
        "system-automation",
        {
          crawlUrl: "https://example.com",
          isPublic: true,
        }
      );
    });
  });

  describe("POST /api/automation/widgets/:id/crawl", () => {
    it("should start crawling for a widget", async () => {
      const widget = createTestWidget({ 
        id: "widget-1", 
        crawlUrl: "https://example.com",
        isPublic: true 
      });
      vi.mocked(app.services.widget.getPublicWidget).mockResolvedValue(widget);

      // Mock the workflow creation
      const mockWorkflow = { id: "workflow-123" };
      mockEnv.WIDGET_CONTENT_WORKFLOW.create.mockResolvedValue(mockWorkflow);

      const response = await testRequest(app.app, "/api/automation/widgets/widget-1/crawl", {
        method: "POST",
        headers: bearerToken(),
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ 
        success: true, 
        workflowId: "workflow-123",
        message: "Crawl started successfully"
      });
    });

    it("should return 404 for non-existent widget", async () => {
      vi.mocked(app.services.widget.getPublicWidget).mockResolvedValue(null);

      const response = await testRequest(app.app, "/api/automation/widgets/non-existent/crawl", {
        method: "POST",
        headers: bearerToken(),
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Widget not found" });
    });

    it("should require crawlUrl to be configured", async () => {
      const widget = createTestWidget({ id: "widget-1", crawlUrl: null });
      vi.mocked(app.services.widget.getPublicWidget).mockResolvedValue(widget);

      const response = await testRequest(app.app, "/api/automation/widgets/widget-1/crawl", {
        method: "POST",
        headers: bearerToken(),
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Widget has no crawl URL configured" });
    });

    it("should prevent concurrent crawls", async () => {
      const widget = createTestWidget({ 
        id: "widget-1", 
        crawlUrl: "https://example.com",
        crawlStatus: "crawling" 
      });
      vi.mocked(app.services.widget.getPublicWidget).mockResolvedValue(widget);

      const response = await testRequest(app.app, "/api/automation/widgets/widget-1/crawl", {
        method: "POST",
        headers: bearerToken(),
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Crawl already in progress" });
    });
  });

  describe("POST /api/automation/widgets/:id/recommendations", () => {
    it("should generate recommendations for a widget", async () => {
      const widget = createTestWidget({ id: "widget-1", isPublic: true });
      const updatedWidget = { ...widget, recommendations: ["Rec 1", "Rec 2"] };
      
      vi.mocked(app.services.widget.getPublicWidget).mockResolvedValue(widget);
      vi.mocked(app.services.widget.generateRecommendations).mockResolvedValue(["Rec 1", "Rec 2"]);
      vi.mocked(app.services.widget.getPublicWidget).mockResolvedValueOnce(widget).mockResolvedValueOnce(updatedWidget);

      const response = await testRequest(app.app, "/api/automation/widgets/widget-1/recommendations", {
        method: "POST",
        headers: bearerToken(),
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ 
        success: true,
        recommendations: ["Rec 1", "Rec 2"]
      });
    });

    it("should return 404 for non-existent widget", async () => {
      vi.mocked(app.services.widget.getPublicWidget).mockResolvedValue(null);

      const response = await testRequest(app.app, "/api/automation/widgets/non-existent/recommendations", {
        method: "POST",
        headers: bearerToken(),
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Widget not found" });
    });
  });
});

// Helper function to set up automation routes for the test app
function setupAutomationRoutes(app: any, services: any, env: any) {
  // Bearer token middleware
  const bearerTokenMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized: Bearer token required" }, 401);
    }
    
    const token = authHeader.substring(7);
    if (token !== "test-bearer-token-for-integration-tests") {
      return c.json({ error: "Unauthorized: Invalid bearer token" }, 401);
    }
    
    await next();
  };

  // Automation routes
  app.get("/api/automation/widgets", bearerTokenMiddleware, async (c: any) => {
    try {
      const limit = Math.min(parseInt(c.req.query("limit") || "50"), 1000);
      const offset = parseInt(c.req.query("offset") || "0");

      const [widgets, total] = await Promise.all([
        services.widget.getAllWidgets(limit, offset),
        services.widget.getAllWidgetsCount(),
      ]);
      return c.json({ widgets, total });
    } catch (error) {
      return c.json({ error: "Failed to list widgets" }, 500);
    }
  });

  app.post("/api/automation/widgets", bearerTokenMiddleware, async (c: any) => {
    try {
      const body = await c.req.json();
      const { name, description, url, crawlUrl, isPublic } = body;

      if (!name) {
        return c.json({ error: "Widget name is required" }, 400);
      }

      const systemUserId = "system-automation";
      const widget = await services.widget.createWidget(systemUserId, {
        name,
        description: description || "",
        url: url || null,
        logoUrl: null,
        content: null,
      });

      if (crawlUrl !== undefined || isPublic !== undefined) {
        const updatedWidget = await services.widget.updateWidget(widget.id, systemUserId, {
          crawlUrl: crawlUrl || undefined,
          isPublic: isPublic ?? undefined,
        });
        return c.json({ widget: updatedWidget });
      }

      return c.json({ widget });
    } catch (error) {
      return c.json({ error: "Failed to create widget" }, 500);
    }
  });

  app.post("/api/automation/widgets/:id/crawl", bearerTokenMiddleware, async (c: any) => {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "Widget ID is required" }, 400);
    }

    try {
      const widget = await services.widget.getPublicWidget(id);
      if (!widget) {
        return c.json({ error: "Widget not found" }, 404);
      }

      if (!widget.crawlUrl) {
        return c.json({ error: "Widget has no crawl URL configured" }, 400);
      }

      if (widget.crawlStatus === "crawling") {
        return c.json({ error: "Crawl already in progress" }, 400);
      }

      const workflow = await env.WIDGET_CONTENT_WORKFLOW.create({
        params: {
          widgetId: id,
          crawlUrl: widget.crawlUrl,
          maxPages: 25,
          isRecrawl: !!widget.crawlRunId,
        },
      });

      return c.json({ 
        success: true,
        workflowId: workflow.id,
        message: "Crawl started successfully"
      });
    } catch (error) {
      return c.json({ error: "Failed to start crawl" }, 500);
    }
  });

  app.post("/api/automation/widgets/:id/recommendations", bearerTokenMiddleware, async (c: any) => {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "Widget ID is required" }, 400);
    }

    try {
      const widget = await services.widget.getPublicWidget(id);
      if (!widget) {
        return c.json({ error: "Widget not found" }, 404);
      }

      await services.widget.generateRecommendations(id);
      
      const updatedWidget = await services.widget.getPublicWidget(id);
      
      return c.json({ 
        success: true,
        recommendations: updatedWidget?.recommendations || []
      });
    } catch (error) {
      return c.json({ error: "Failed to generate recommendations" }, 500);
    }
  });
}