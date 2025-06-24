import type { Context } from 'hono';
import type { Env } from '../types';
import { createAuth } from '../lib/better-auth';

export class AuthService {
  private auth: ReturnType<typeof createAuth>;

  constructor(env: Env) {
    this.auth = createAuth(env);
  }

  // Handle all auth routes through Better Auth
  async handleAuth(c: Context<{ Bindings: Env }>) {
    try {
      const result = await this.auth.handler(c.req.raw);
      return result;
    } catch (error) {
      console.error('Auth handler error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  // Get current session (helper method for other services)
  async getSession(c: Context<{ Bindings: Env }>) {
    try {
      // Only pass headers, don't consume the request body
      const sessionData = await this.auth.api.getSession({
        headers: c.req.raw.headers,
      });
      
      return sessionData;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Require authentication middleware
  async requireAuth(c: Context<{ Bindings: Env }>) {
    const session = await this.getSession(c);
    if (!session?.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    return session;
  }

  // Check if user is admin by checking their role
  async isAdmin(_userId: string, c: Context<{ Bindings: Env }>) {
    try {
      // Get the session to check the user's role
      const session = await this.getSession(c);
      if (!session?.user) {
        return false;
      }
      
      // Check if the user has the admin role
      return session.user.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}