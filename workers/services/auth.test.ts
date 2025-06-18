import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth';
import type { Context } from 'hono';
import type { Env } from '../types';

// Mock the SimpleAuth module
vi.mock('../lib/auth', () => ({
  createAuth: vi.fn(() => ({
    extractSessionToken: vi.fn(),
    getSession: vi.fn(),
    createUser: vi.fn(),
    authenticate: vi.fn(),
    createSession: vi.fn(),
    deleteSession: vi.fn(),
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
    };

    authService = new AuthService(mockEnv);

    mockContext = {
      req: {
        raw: new Request('http://localhost/test'),
        path: '/api/auth/test',
        method: 'GET',
        json: vi.fn(),
        header: vi.fn(),
      },
      json: vi.fn().mockReturnValue(new Response()),
    } as any;
  });

  describe('handleAuth', () => {
    it('should return 404 for unknown routes', async () => {
      (mockContext.req as any).path = '/api/auth/unknown';
      (mockContext.req as any).method = 'GET';

      await authService.handleAuth(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({ error: 'Not found' }, 404);
    });

    it('should handle sign-up route', async () => {
      (mockContext.req as any).path = '/api/auth/sign-up';
      (mockContext.req as any).method = 'POST';
      mockContext.req.json = vi.fn().mockResolvedValue({
        email: 'test@example.com',
        password: 'password',
        name: 'Test User'
      });

      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      const mockSession = { id: 'session-1', token: 'token-1' };
      
      (authService as any).auth.createUser = vi.fn().mockResolvedValue(mockUser);
      (authService as any).auth.createSession = vi.fn().mockResolvedValue(mockSession);

      await authService.handleAuth(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({ user: mockUser, session: mockSession });
    });
  });

  describe('getSession', () => {
    it('should return null when no token', async () => {
      (authService as any).auth.extractSessionToken = vi.fn().mockReturnValue(null);

      const result = await authService.getSession(mockContext);

      expect(result).toBeNull();
    });

    it('should return session when valid token', async () => {
      const mockSession = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', token: 'token-1' },
      };
      
      (authService as any).auth.extractSessionToken = vi.fn().mockReturnValue('token-1');
      (authService as any).auth.getSession = vi.fn().mockResolvedValue(mockSession);

      const result = await authService.getSession(mockContext);

      expect(result).toEqual(mockSession);
    });
  });

  describe('requireAuth', () => {
    it('should return 401 when no session', async () => {
      const mockGetSession = vi.fn().mockResolvedValue(null);
      authService.getSession = mockGetSession;

      await authService.requireAuth(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({ error: 'Unauthorized' }, 401);
    });

    it('should return session when authenticated', async () => {
      const mockSession = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-1', token: 'token-1' },
      };
      
      const mockGetSession = vi.fn().mockResolvedValue(mockSession);
      authService.getSession = mockGetSession;

      const result = await authService.requireAuth(mockContext);

      expect(result).toEqual(mockSession);
    });
  });

  describe('auth methods', () => {
    it('should create account successfully', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      (authService as any).auth.createUser = vi.fn().mockResolvedValue(mockUser);

      const result = await authService.createAccount('test@example.com', 'password', 'Test User');

      expect(result).toEqual(mockUser);
    });

    it('should sign in successfully', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      (authService as any).auth.authenticate = vi.fn().mockResolvedValue(mockUser);

      const result = await authService.signIn('test@example.com', 'password');

      expect(result).toEqual(mockUser);
    });

    it('should sign out successfully', async () => {
      (authService as any).auth.deleteSession = vi.fn().mockResolvedValue(undefined);

      const result = await authService.signOut('token');

      expect(result).toBe(true);
    });
  });
});