import { Hono } from 'hono';
import type { AppType } from './types';

export const publicRoutes = new Hono<AppType>();

// Public endpoint to get widget info
publicRoutes.get('/widget/:id', async (c) => {
  const widgetId = c.req.param('id');
  if (!widgetId) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getPublicWidget(widgetId);
    if (!widget) {
      return c.json({ error: 'Widget not found or not public' }, 404);
    }

    // Return only necessary info for the chat UI
    return c.json({
      id: widget.id,
      name: widget.name,
      description: widget.description,
      recommendations: widget.recommendations,
    });
  } catch (error) {
    console.error('Error getting public widget:', error);
    return c.json({ error: 'Failed to get widget' }, 500);
  }
});