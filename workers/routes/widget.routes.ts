import { Hono } from 'hono';
import { authMiddleware } from '../lib/middleware';
import type { AppType } from './types';

export const widgetRoutes = new Hono<AppType>();

// Get all user widgets
widgetRoutes.get('/', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const MAX_LIMIT = 1000;
  const requestedLimit = parseInt(c.req.query('limit') || '50');
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    const [widgets, total] = await Promise.all([
      c.get('services').widget.getUserWidgets(auth.user.id, limit, offset),
      c.get('services').widget.getUserWidgetsCount(auth.user.id)
    ]);
    return c.json({ widgets, total });
  } catch (error) {
    console.error('Error getting widgets:', error);
    return c.json({ error: 'Failed to get widgets' }, 500);
  }
});

// Create new widget
widgetRoutes.post('/', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const formData = await c.req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string || undefined;
    const url = formData.get('url') as string || undefined;
    const logoUrl = formData.get('logoUrl') as string || undefined;
    const content = formData.get('content') as string || undefined;
    
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        files.push(value);
      }
    }

    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }

    const widget = await c.get('services').widget.createWidget(auth.user.id, {
      name,
      description,
      url,
      logoUrl,
      content,
      files: files.length > 0 ? files : undefined
    });

    return c.json({ widget });
  } catch (error) {
    console.error('Error creating widget:', error);
    return c.json({ error: 'Failed to create widget' }, 500);
  }
});

// Get specific widget
widgetRoutes.get('/:id', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }
    return c.json({ widget });
  } catch (error) {
    console.error('Error getting widget:', error);
    return c.json({ error: 'Failed to get widget' }, 500);
  }
});

// Update widget
widgetRoutes.put('/:id', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const body = await c.req.json();
    console.log('[API] Updating widget', id, 'with body:', body);
    
    // Get current widget to check if crawlUrl is changing
    const currentWidget = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!currentWidget) {
      return c.json({ error: 'Widget not found' }, 404);
    }
    
    // Update the widget
    const widget = await c.get('services').widget.updateWidget(id, auth.user.id, body);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }
    
    // Check if crawlUrl changed and we should start crawling
    if (body.crawlUrl !== undefined && body.crawlUrl !== currentWidget.crawlUrl && body.crawlUrl) {
      console.log('[API] Crawl URL changed, starting workflow');
      
      // Check if already crawling
      if (currentWidget.crawlStatus === 'crawling') {
        console.log('[API] Already crawling, skipping workflow creation');
      } else {
        try {
          // Trigger the workflow
          const workflow = await c.env.WIDGET_CONTENT_WORKFLOW.create({
            params: {
              widgetId: id,
              crawlUrl: body.crawlUrl,
              maxPages: 25,
              isRecrawl: !!currentWidget.crawlRunId
            }
          });
          
          console.log('[API] Started workflow:', workflow.id);
          
          // Update widget with workflowId
          const { DatabaseService } = await import('../services/database');
          const { widget: widgetTable } = await import('../db/schema');
          const { eq } = await import('drizzle-orm');
          
          const database = new DatabaseService(c.env.DATABASE_URL);
          await database.getDatabase()
            .update(widgetTable)
            .set({
              crawlStatus: 'crawling',
              workflowId: workflow.id,
              lastCrawlAt: new Date()
            })
            .where(eq(widgetTable.id, id));
          
          // Return updated widget with workflow info
          widget.crawlStatus = 'crawling';
          widget.workflowId = workflow.id;
          widget.lastCrawlAt = new Date();
        } catch (workflowError) {
          console.error('[API] Failed to start crawl workflow:', workflowError);
          // Don't fail the update, just log the error
        }
      }
    }
    
    return c.json({ widget });
  } catch (error) {
    console.error('Error updating widget:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update widget';
    return c.json({ error: errorMessage }, 500);
  }
});

// Delete widget
widgetRoutes.delete('/:id', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const success = await c.get('services').widget.deleteWidget(id, auth.user.id);
    if (!success) {
      return c.json({ error: 'Widget not found' }, 404);
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting widget:', error);
    return c.json({ error: 'Failed to delete widget' }, 500);
  }
});

// Get public widget info
widgetRoutes.get('/:id/public', async (c) => {
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
      logoUrl: widget.logoUrl || null,
      instructions: widget.instructions || null,
      isPublic: widget.isPublic,
      cacheEnabled: widget.cacheEnabled,
      recommendations: widget.recommendations || [],
      files: widget.files || [],
      embeddings: widget.embeddings || []
    });
  } catch (error) {
    console.error('Error getting public widget:', error);
    return c.json({ error: 'Failed to get widget' }, 500);
  }
});