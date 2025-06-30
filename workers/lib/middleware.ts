import type { Context, Next } from 'hono';
import type { Env } from '../types';
import { createLogger } from './logger';

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
    requestId?: string;
    logger?: any;
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
    const logger = c.get('logger') || createLogger('AUTH');
    logger.error({ err: error }, 'Auth middleware error');
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
    const logger = c.get('logger') || createLogger('AUTH');
    logger.warn({ err: error }, 'Optional auth middleware warning');
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
    const logger = c.get('logger') || createLogger('AUTH');
    logger.error({ err: error }, 'Admin middleware error');
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

export const bearerTokenMiddleware = async (c: Context<AppContextType>, next: Next) => {
  const token = c.env.API_BEARER_TOKEN;
  
  // Skip if no token is configured
  if (!token) {
    const logger = createLogger('AUTH');
    logger.warn('API_BEARER_TOKEN not configured, skipping bearer token authentication');
    await next();
    return;
  }

  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const providedToken = authHeader.substring(7); // Remove "Bearer " prefix
  
  if (providedToken !== token) {
    return c.json({ error: 'Invalid bearer token' }, 401);
  }

  // Token is valid, proceed to next middleware
  await next();
};