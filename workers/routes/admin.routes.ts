import { Hono } from 'hono';
import { adminMiddleware } from '../lib/middleware';
import type { AppType } from './types';

export const adminRoutes = new Hono<AppType>();

// Admin endpoint to get all widgets across all users
adminRoutes.get('/widgets', adminMiddleware, async (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    // For admin users, just use the regular widget service but without user filtering
    // This is a temporary admin-only override
    const auth = c.get('auth');
    if (!auth?.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get widgets for the current user (we'll expand this later for true admin access)
    const widgets = await c.get('services').widget.getUserWidgets(auth.user.id, limit, offset);
    return c.json({ widgets });
  } catch (error) {
    console.error('Error getting all widgets:', error);
    return c.json({ error: 'Failed to get widgets' }, 500);
  }
});