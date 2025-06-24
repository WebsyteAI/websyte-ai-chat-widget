import type { Context, Next } from 'hono';
import type { Env } from '../types';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
}

type AppContextType = {
  Bindings: Env;
  Variables: {
    services: any;
    auth?: AuthContext;
  };
};

export const authMiddleware = async (c: Context<AppContextType>, next: Next) => {
  const authService = c.get('services').auth;
  
  try {
    const session = await authService.getSession(c);
    
    if (!session || !session.session || !session.user) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    // Add user and session info to context
    c.set('auth', {
      user: session.user,
      session: session.session,
    } as AuthContext);

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

export const optionalAuthMiddleware = async (c: Context<AppContextType>, next: Next) => {
  const authService = c.get('services').auth;
  
  try {
    const session = await authService.getSession(c);
    
    if (session && session.session && session.user) {
      // Add user and session info to context if available
      c.set('auth', {
        user: session.user,
        session: session.session,
      } as AuthContext);
    }

    await next();
  } catch (error) {
    // Continue without auth for optional middleware
    console.warn('Optional auth middleware warning:', error);
    await next();
  }
};

export const adminMiddleware = async (c: Context<AppContextType>, next: Next) => {
  const authService = c.get('services').auth;
  
  try {
    const session = await authService.getSession(c);
    
    if (!session || !session.session || !session.user) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    // Check if user is admin using Better Auth admin plugin
    const isAdmin = await authService.isAdmin(session.user.id, c);
    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // Add user and session info to context
    c.set('auth', {
      user: session.user,
      session: session.session,
    } as AuthContext);

    await next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};