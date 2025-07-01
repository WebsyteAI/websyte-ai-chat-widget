import { Hono } from 'hono';
import type { AppType } from './types';

export const authRoutes = new Hono<AppType>();

// Handle all Better Auth endpoints
authRoutes.all('/*', async (c) => {
  console.log('Auth route hit:', c.req.method, c.req.path);
  try {
    const result = await c.get('services').auth.handleAuth(c as any);
    console.log('Auth route result status:', result.status);
    return result;
  } catch (error) {
    console.error('Auth route error:', error);
    return c.json({ error: 'Auth endpoint error' }, 500);
  }
});