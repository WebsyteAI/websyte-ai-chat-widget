import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestApp, testRequest, createTestUser, createAuthContext } from "./test-utils";

describe("Auth Endpoints Integration Tests", () => {
  let app: ReturnType<typeof createTestApp>;
  
  beforeEach(() => {
    app = createTestApp();
  });

  describe("Authentication Flow", () => {
    it("should handle complete signup -> signin -> session -> signout flow", async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = "TestPassword123!";
      
      // Mock signup response
      vi.mocked(app.services.auth.handleAuth).mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          user: { id: "test-id", email: testEmail, name: "Test User" },
          session: { token: "test-session-token" }
        }), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Set-Cookie": "better-auth.session_token=test-session-token; Path=/; HttpOnly"
          },
        })
      );

      // 1. Signup
      const signupResponse = await testRequest(app.app, "/api/auth/signup", {
        method: "POST",
        json: { email: testEmail, password: testPassword, name: "Test User" },
      });
      
      expect(signupResponse.status).toBe(200);
      const signupData = await signupResponse.json();
      expect(signupData.user.email).toBe(testEmail);
      
      // Mock signin response
      vi.mocked(app.services.auth.handleAuth).mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          user: { id: "test-id", email: testEmail, name: "Test User" },
          session: { token: "test-session-token" }
        }), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Set-Cookie": "better-auth.session_token=test-session-token; Path=/; HttpOnly"
          },
        })
      );

      // 2. Signin
      const signinResponse = await testRequest(app.app, "/api/auth/signin", {
        method: "POST",
        json: { email: testEmail, password: testPassword },
      });
      
      expect(signinResponse.status).toBe(200);
      
      // Mock session check
      vi.mocked(app.services.auth.handleAuth).mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          user: { id: "test-id", email: testEmail, name: "Test User" },
          session: { token: "test-session-token" }
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      // 3. Check session
      const sessionResponse = await testRequest(app.app, "/api/auth/session", {
        method: "GET",
        headers: { Cookie: "better-auth.session_token=test-session-token" },
      });
      
      expect(sessionResponse.status).toBe(200);
      const sessionData = await sessionResponse.json();
      expect(sessionData.user.email).toBe(testEmail);
      
      // Mock signout
      vi.mocked(app.services.auth.handleAuth).mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Set-Cookie": "better-auth.session_token=; Path=/; HttpOnly; Max-Age=0"
          },
        })
      );

      // 4. Signout
      const signoutResponse = await testRequest(app.app, "/api/auth/signout", {
        method: "POST",
        headers: { Cookie: "better-auth.session_token=test-session-token" },
      });
      
      expect(signoutResponse.status).toBe(200);
      const setCookie = signoutResponse.headers.get("set-cookie");
      expect(setCookie).toContain("Max-Age=0");
    });
  });

  describe("POST /api/auth/*", () => {
    it("should handle auth route requests", async () => {
      // Mock the auth service to return a successful response
      vi.mocked(app.services.auth.handleAuth).mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const response = await testRequest(app.app, "/api/auth/login", {
        method: "POST",
        json: {
          email: "test@example.com",
          password: "password123",
        },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
      expect(app.services.auth.handleAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          req: expect.objectContaining({
            method: "POST",
            path: "/api/auth/login",
          }),
        })
      );
    });

    it("should handle auth service errors", async () => {
      // Mock the auth service to throw an error
      vi.mocked(app.services.auth.handleAuth).mockRejectedValue(
        new Error("Auth service error")
      );

      const response = await testRequest(app.app, "/api/auth/login", {
        method: "POST",
        json: {
          email: "test@example.com",
          password: "password123",
        },
      });

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: "Auth endpoint error" });
    });

    it("should handle GET requests to auth endpoints", async () => {
      // Mock the auth service to return a successful response
      vi.mocked(app.services.auth.handleAuth).mockResolvedValue(
        new Response(JSON.stringify({ user: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const response = await testRequest(app.app, "/api/auth/session", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      expect(app.services.auth.handleAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          req: expect.objectContaining({
            method: "GET",
            path: "/api/auth/session",
          }),
        })
      );
    });
  });

  describe("Auth Error Handling", () => {
    it("should handle invalid credentials", async () => {
      vi.mocked(app.services.auth.handleAuth).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      );

      const response = await testRequest(app.app, "/api/auth/signin", {
        method: "POST",
        json: { email: "wrong@example.com", password: "wrong" },
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid credentials");
    });

    it("should handle duplicate email on signup", async () => {
      vi.mocked(app.services.auth.handleAuth).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Email already exists" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      );

      const response = await testRequest(app.app, "/api/auth/signup", {
        method: "POST",
        json: { email: "existing@example.com", password: "password123", name: "Test" },
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Email already exists");
    });

    it("should handle weak password", async () => {
      vi.mocked(app.services.auth.handleAuth).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Password too weak" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      );

      const response = await testRequest(app.app, "/api/auth/signup", {
        method: "POST",
        json: { email: "test@example.com", password: "123", name: "Test" },
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Password too weak");
    });
  });

  describe("OAuth Integration", () => {
    it("should initiate Google OAuth flow", async () => {
      const redirectUrl = "https://accounts.google.com/oauth/authorize?client_id=test";
      vi.mocked(app.services.auth.handleAuth).mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { 
            "Location": redirectUrl,
            "Content-Type": "text/plain" 
          },
        })
      );

      const response = await testRequest(app.app, "/api/auth/signin/google", {
        method: "GET",
      });

      expect(response.status).toBe(302);
      expect(response.headers.get("location")).toBe(redirectUrl);
    });

    it("should handle OAuth callback", async () => {
      vi.mocked(app.services.auth.handleAuth).mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          user: { id: "oauth-user", email: "oauth@example.com" },
          session: { token: "oauth-session-token" }
        }), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Set-Cookie": "better-auth.session_token=oauth-session-token; Path=/; HttpOnly"
          },
        })
      );

      const response = await testRequest(app.app, "/api/auth/callback/google?code=test-code&state=test-state", {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user.email).toBe("oauth@example.com");
    });
  });

  describe("Auth Middleware Integration", () => {
    it("should allow access to public endpoints without auth", async () => {
      const response = await testRequest(app.app, "/api/chat", {
        method: "POST",
        json: { message: "Hello" },
      });

      // The chat service should be called even without auth
      expect(app.services.chat.handleChat).toHaveBeenCalled();
    });

    it("should pass auth context when available", async () => {
      // Create authenticated app
      const user = createTestUser();
      const authContext = createAuthContext(user);
      const authApp = createTestApp({ auth: authContext });

      await testRequest(authApp.app, "/api/chat", {
        method: "POST",
        json: { message: "Hello" },
      });

      // Verify the auth context was passed
      expect(authApp.services.chat.handleChat).toHaveBeenCalledWith(
        expect.objectContaining({
          get: expect.any(Function),
        })
      );
    });
  });

  describe("Auth Service Routes Coverage", () => {
    const authRoutes = [
      { path: "/api/auth/login", method: "POST" },
      { path: "/api/auth/logout", method: "POST" },
      { path: "/api/auth/session", method: "GET" },
      { path: "/api/auth/google", method: "GET" },
      { path: "/api/auth/callback/google", method: "GET" },
    ];

    authRoutes.forEach(({ path, method }) => {
      it(`should handle ${method} ${path}`, async () => {
        vi.mocked(app.services.auth.handleAuth).mockResolvedValue(
          new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );

        const response = await testRequest(app.app, path, { method });
        
        expect(response.status).toBe(200);
        expect(app.services.auth.handleAuth).toHaveBeenCalled();
      });
    });
  });
});