import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth';
import type { Context } from 'hono';
import type { Env } from '../types';

// Mock the Better Auth module
vi.mock('../lib/better-auth', () => ({
  createAuth: vi.fn(() => ({
    handler: vi.fn(),
    api: {
      getSession: vi.fn(),
    },
  })),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockEnv: Env;
  let mockContext: Context<{ Bindings: Env }>;

  beforeEach(() => {
    mockEnv = {
      OPENAI_API_KEY: 'test-key',
      DATABASE_URL: 'test-db-url',
      BETTER_AUTH_URL: 'http://localhost:3000',
      BETTER_AUTH_SECRET: 'test-secret',
      GOOGLE_CLIENT_ID: 'test-google-client-id',
      GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      WIDGET_FILES: {} as R2Bucket,
    };

    authService = new AuthService(mockEnv);

    mockContext = {
      req: {
        raw: new Request('http://localhost/test'),
        path: '/test',
        method: 'GET',
      },
      env: mockEnv,
      json: vi.fn(),
    } as any;
  });

  describe('handleAuth', () => {
    it('should handle auth requests through Better Auth handler', async () => {
      const mockResponse = new Response('{"success": true}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
      (authService as any).auth.handler = vi.fn().mockResolvedValue(mockResponse);

      const result = await authService.handleAuth(mockContext);

      expect((authService as any).auth.handler).toHaveBeenCalledWith(mockContext.req.raw);
      expect(result).toBe(mockResponse);
    });

    it('should handle auth errors gracefully', async () => {
      (authService as any).auth.handler = vi.fn().mockRejectedValue(new Error('Auth error'));
      mockContext.json = vi.fn().mockReturnValue(new Response('{"error": "Internal server error"}', { status: 500 }));

      const result = await authService.handleAuth(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({ error: 'Internal server error' }, 500);
    });
  });

  describe('getSession', () => {
    it('should get session successfully', async () => {
      const mockSession = { user: { id: '1', email: 'test@example.com' } };
      (authService as any).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      const result = await authService.getSession(mockContext);

      expect(result).toEqual(mockSession);
    });

    it('should handle session errors gracefully', async () => {
      (authService as any).auth.api.getSession = vi.fn().mockRejectedValue(new Error('Session error'));

      const result = await authService.getSession(mockContext);

      expect(result).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession = { user: { id: '1', email: 'test@example.com' } };
      authService.getSession = vi.fn().mockResolvedValue(mockSession);

      const result = await authService.requireAuth(mockContext);

      expect(result).toEqual(mockSession);
    });

    it('should return 401 when user is not authenticated', async () => {
      authService.getSession = vi.fn().mockResolvedValue(null);
      mockContext.json = vi.fn().mockReturnValue(new Response('{"error": "Unauthorized"}', { status: 401 }));

      const result = await authService.requireAuth(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({ error: 'Unauthorized' }, 401);
    });

    it('should return 401 when no user in session', async () => {
      authService.getSession = vi.fn().mockResolvedValue({ session: {} });
      mockContext.json = vi.fn().mockReturnValue(new Response('{"error": "Unauthorized"}', { status: 401 }));

      const result = await authService.requireAuth(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({ error: 'Unauthorized' }, 401);
    });
  });
});