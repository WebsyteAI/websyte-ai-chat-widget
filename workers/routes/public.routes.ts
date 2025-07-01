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

    // Return widget info at root level for ChatWidget compatibility
    // Also include wrapped version for share page
    return c.json({
      // Root level for ChatWidget
      id: widget.id,
      name: widget.name,
      description: widget.description,
      logoUrl: widget.logoUrl,
      recommendations: widget.recommendations,
      // Wrapped version for share page
      widget: {
        id: widget.id,
        name: widget.name,
        description: widget.description,
        logoUrl: widget.logoUrl,
        isPublic: widget.isPublic,
        createdAt: widget.createdAt,
        fileCount: widget.files?.length || 0,
        embeddingsCount: widget.embeddingsCount || 0,
        recommendations: widget.recommendations,
      }
    });
  } catch (error) {
    console.error('Error getting public widget:', error);
    return c.json({ error: 'Failed to get widget' }, 500);
  }
});