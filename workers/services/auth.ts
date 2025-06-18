import type { Context } from 'hono';
import type { Env } from '../types';
import { createAuth, type Auth } from '../lib/auth';

export class AuthService {
  private auth: Auth;

  constructor(env: Env) {
    this.auth = createAuth(env);
  }

  // Handle auth routes
  async handleAuth(c: Context<{ Bindings: Env }>) {
    const path = c.req.path;
    const method = c.req.method;

    try {
      if (path.includes('/sign-up') && method === 'POST') {
        return this.handleSignUp(c);
      }
      
      if (path.includes('/sign-in') && method === 'POST') {
        return this.handleSignIn(c);
      }
      
      if (path.includes('/sign-out') && method === 'POST') {
        return this.handleSignOut(c);
      }
      
      if (path.includes('/session') && method === 'GET') {
        return this.handleGetSession(c);
      }

      return c.json({ error: 'Not found' }, 404);
    } catch (error) {
      console.error('Auth handler error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  private async handleSignUp(c: Context<{ Bindings: Env }>) {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    try {
      const user = await this.auth.createUser(email, password, name);
      const session = await this.auth.createSession(
        user.id,
        c.req.header('user-agent'),
        c.req.header('cf-connecting-ip')
      );

      const response = c.json({ user, session });
      this.setSessionCookie(response, session.token);
      return response;
    } catch (error) {
      return c.json({ error: 'User creation failed' }, 400);
    }
  }

  private async handleSignIn(c: Context<{ Bindings: Env }>) {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    try {
      const user = await this.auth.authenticate(email, password);
      const session = await this.auth.createSession(
        user.id,
        c.req.header('user-agent'),
        c.req.header('cf-connecting-ip')
      );

      const response = c.json({ user, session });
      this.setSessionCookie(response, session.token);
      return response;
    } catch (error) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
  }

  private async handleSignOut(c: Context<{ Bindings: Env }>) {
    const token = this.auth.extractSessionToken(c.req.raw);
    
    if (token) {
      await this.auth.deleteSession(token);
    }

    const response = c.json({ success: true });
    this.clearSessionCookie(response);
    return response;
  }

  private async handleGetSession(c: Context<{ Bindings: Env }>) {
    const token = this.auth.extractSessionToken(c.req.raw);
    
    if (!token) {
      return c.json({ session: null, user: null });
    }

    const result = await this.auth.getSession(token);
    
    if (!result) {
      return c.json({ session: null, user: null });
    }

    return c.json(result);
  }

  private setSessionCookie(response: Response, token: string) {
    response.headers.set(
      'Set-Cookie',
      `session-token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );
  }

  private clearSessionCookie(response: Response) {
    response.headers.set(
      'Set-Cookie',
      'session-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    );
  }

  async getSession(c: Context<{ Bindings: Env }>) {
    const token = this.auth.extractSessionToken(c.req.raw);
    
    if (!token) {
      return null;
    }

    return await this.auth.getSession(token);
  }

  async requireAuth(c: Context<{ Bindings: Env }>) {
    const session = await this.getSession(c);
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    return session;
  }

  async createAccount(email: string, password: string, name: string) {
    return await this.auth.createUser(email, password, name);
  }

  async signIn(email: string, password: string) {
    return await this.auth.authenticate(email, password);
  }

  async signOut(sessionToken: string) {
    await this.auth.deleteSession(sessionToken);
    return true;
  }
}