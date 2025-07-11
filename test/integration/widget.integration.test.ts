import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestApp, testRequest, createTestUser, createAuthContext, createTestWidget } from "./test-utils";

describe("Widget Endpoints Integration Tests", () => {
  let app: ReturnType<typeof createTestApp>;
  let authedApp: ReturnType<typeof createTestApp>;
  let user: ReturnType<typeof createTestUser>;
  
  beforeEach(() => {
    // Create unauthenticated app
    app = createTestApp();
    setupWidgetRoutes(app.app, app.services);
    
    // Create authenticated app with user
    user = createTestUser();
    const authContext = createAuthContext(user);
    authedApp = createTestApp({ auth: authContext });
    
    // Update authedApp to include widget routes
    setupWidgetRoutes(authedApp.app, authedApp.services);
  });

  describe("GET /api/widgets", () => {
    it("should require authentication", async () => {
      const response = await testRequest(app.app, "/api/widgets", {
        method: "GET",
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
    });

    it("should return user widgets when authenticated", async () => {
      const testWidgets = [createTestWidget({ userId: user.id })];
      vi.mocked(authedApp.services.widget.getUserWidgets).mockResolvedValue(testWidgets);
      vi.mocked(authedApp.services.widget.getUserWidgetsCount).mockResolvedValue(1);

      const response = await testRequest(authedApp.app, "/api/widgets", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ widgets: testWidgets, total: 1 });
      expect(authedApp.services.widget.getUserWidgets).toHaveBeenCalledWith(user.id, 50, 0);
    });

    it("should handle pagination parameters", async () => {
      vi.mocked(authedApp.services.widget.getUserWidgets).mockResolvedValue([]);
      vi.mocked(authedApp.services.widget.getUserWidgetsCount).mockResolvedValue(0);

      const response = await testRequest(authedApp.app, "/api/widgets?limit=10&offset=20", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      expect(authedApp.services.widget.getUserWidgets).toHaveBeenCalledWith(user.id, 10, 20);
    });

    it("should enforce maximum limit", async () => {
      vi.mocked(authedApp.services.widget.getUserWidgets).mockResolvedValue([]);
      vi.mocked(authedApp.services.widget.getUserWidgetsCount).mockResolvedValue(0);

      const response = await testRequest(authedApp.app, "/api/widgets?limit=2000", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      expect(authedApp.services.widget.getUserWidgets).toHaveBeenCalledWith(user.id, 1000, 0);
    });
  });

  describe("POST /api/widgets", () => {
    it("should require authentication", async () => {
      const response = await testRequest(app.app, "/api/widgets", {
        method: "POST",
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
    });

    it("should create widget with form data", async () => {
      const newWidget = createTestWidget({ userId: user.id });
      vi.mocked(authedApp.services.widget.createWidget).mockResolvedValue(newWidget);

      const formData = new FormData();
      formData.append("name", "Test Widget");
      formData.append("description", "Test description");
      formData.append("url", "https://example.com");

      const response = await testRequest(authedApp.app, "/api/widgets", {
        method: "POST",
        body: formData,
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ widget: newWidget });
      expect(authedApp.services.widget.createWidget).toHaveBeenCalledWith(
        user.id,
        expect.objectContaining({
          name: "Test Widget",
          description: "Test description",
          url: "https://example.com",
        })
      );
    });

    it("should require name field", async () => {
      const formData = new FormData();
      formData.append("description", "Test description");

      const response = await testRequest(authedApp.app, "/api/widgets", {
        method: "POST",
        body: formData,
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Name is required" });
    });

    it("should handle file uploads", async () => {
      const newWidget = createTestWidget({ userId: user.id });
      vi.mocked(authedApp.services.widget.createWidget).mockResolvedValue(newWidget);

      const formData = new FormData();
      formData.append("name", "Test Widget");
      const file = new File(["test content"], "test.txt", { type: "text/plain" });
      formData.append("file_0", file);

      const response = await testRequest(authedApp.app, "/api/widgets", {
        method: "POST",
        body: formData,
      });

      expect(response.status).toBe(200);
      expect(authedApp.services.widget.createWidget).toHaveBeenCalledWith(
        user.id,
        expect.objectContaining({
          name: "Test Widget",
          files: [expect.any(File)],
        })
      );
    }, 10000); // 10 second timeout
  });

  describe("GET /api/widgets/:id", () => {
    it("should require authentication", async () => {
      const response = await testRequest(app.app, "/api/widgets/123", {
        method: "GET",
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
    });

    it("should return widget when found", async () => {
      const widget = createTestWidget({ id: "123", userId: user.id });
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(widget);

      const response = await testRequest(authedApp.app, "/api/widgets/123", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ widget });
      expect(authedApp.services.widget.getWidget).toHaveBeenCalledWith("123", user.id);
    });

    it("should return 404 when widget not found", async () => {
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(null);

      const response = await testRequest(authedApp.app, "/api/widgets/999", {
        method: "GET",
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Widget not found" });
    });
  });

  describe("PUT /api/widgets/:id", () => {
    it("should require authentication", async () => {
      const response = await testRequest(app.app, "/api/widgets/123", {
        method: "PUT",
        json: { name: "Updated" },
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
    });

    it("should update widget", async () => {
      const currentWidget = createTestWidget({ id: "123", userId: user.id });
      const updatedWidget = { ...currentWidget, name: "Updated Widget" };
      
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(currentWidget);
      vi.mocked(authedApp.services.widget.updateWidget).mockResolvedValue(updatedWidget);

      const response = await testRequest(authedApp.app, "/api/widgets/123", {
        method: "PUT",
        json: { name: "Updated Widget" },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ widget: updatedWidget });
      expect(authedApp.services.widget.updateWidget).toHaveBeenCalledWith(
        "123",
        user.id,
        { name: "Updated Widget" }
      );
    });

    it("should return 404 when widget not found", async () => {
      vi.mocked(authedApp.services.widget.getWidget).mockResolvedValue(null);

      const response = await testRequest(authedApp.app, "/api/widgets/999", {
        method: "PUT",
        json: { name: "Updated" },
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Widget not found" });
    });
  });

  describe("DELETE /api/widgets/:id", () => {
    it("should require authentication", async () => {
      const response = await testRequest(app.app, "/api/widgets/123", {
        method: "DELETE",
      });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
    });

    it("should delete widget", async () => {
      vi.mocked(authedApp.services.widget.deleteWidget).mockResolvedValue(true);

      const response = await testRequest(authedApp.app, "/api/widgets/123", {
        method: "DELETE",
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
      expect(authedApp.services.widget.deleteWidget).toHaveBeenCalledWith("123", user.id);
    });

    it("should return 404 when widget not found", async () => {
      vi.mocked(authedApp.services.widget.deleteWidget).mockResolvedValue(false);

      const response = await testRequest(authedApp.app, "/api/widgets/999", {
        method: "DELETE",
      });

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Widget not found" });
    });
  });
});

// Helper function to set up widget routes for the test app
function setupWidgetRoutes(app: any, services: any) {
  // Add auth middleware stub
  const authMiddleware = async (c: any, next: any) => {
    const auth = c.get("auth");
    if (!auth?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  };

  // Widget routes
  app.get("/api/widgets", authMiddleware, async (c: any) => {
    const auth = c.get("auth");
    const limit = Math.min(parseInt(c.req.query("limit") || "50"), 1000);
    const offset = parseInt(c.req.query("offset") || "0");

    try {
      const [widgets, total] = await Promise.all([
        services.widget.getUserWidgets(auth.user.id, limit, offset),
        services.widget.getUserWidgetsCount(auth.user.id),
      ]);
      return c.json({ widgets, total });
    } catch (error) {
      return c.json({ error: "Failed to get widgets" }, 500);
    }
  });

  app.post("/api/widgets", authMiddleware, async (c: any) => {
    const auth = c.get("auth");
    try {
      const formData = await c.req.formData();
      const name = formData.get("name") as string;
      const description = formData.get("description") as string || undefined;
      const url = formData.get("url") as string || undefined;
      
      const files: File[] = [];
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("file_") && value instanceof File) {
          files.push(value);
        }
      }

      if (!name) {
        return c.json({ error: "Name is required" }, 400);
      }

      const widget = await services.widget.createWidget(auth.user.id, {
        name,
        description,
        url,
        files: files.length > 0 ? files : undefined,
      });

      return c.json({ widget });
    } catch (error) {
      return c.json({ error: "Failed to create widget" }, 500);
    }
  });

  app.get("/api/widgets/:id", authMiddleware, async (c: any) => {
    const auth = c.get("auth");
    const id = c.req.param("id");

    try {
      const widget = await services.widget.getWidget(id, auth.user.id);
      if (!widget) {
        return c.json({ error: "Widget not found" }, 404);
      }
      return c.json({ widget });
    } catch (error) {
      return c.json({ error: "Failed to get widget" }, 500);
    }
  });

  app.put("/api/widgets/:id", authMiddleware, async (c: any) => {
    const auth = c.get("auth");
    const id = c.req.param("id");

    try {
      const body = await c.req.json();
      
      const currentWidget = await services.widget.getWidget(id, auth.user.id);
      if (!currentWidget) {
        return c.json({ error: "Widget not found" }, 404);
      }
      
      const widget = await services.widget.updateWidget(id, auth.user.id, body);
      if (!widget) {
        return c.json({ error: "Widget not found" }, 404);
      }
      
      return c.json({ widget });
    } catch (error) {
      return c.json({ error: "Failed to update widget" }, 500);
    }
  });

  app.delete("/api/widgets/:id", authMiddleware, async (c: any) => {
    const auth = c.get("auth");
    const id = c.req.param("id");

    try {
      const success = await services.widget.deleteWidget(id, auth.user.id);
      if (!success) {
        return c.json({ error: "Widget not found" }, 404);
      }
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: "Failed to delete widget" }, 500);
    }
  });
}