import { Hono } from 'hono';
import { bearerTokenMiddleware } from '../lib/middleware';
import { eq } from 'drizzle-orm';
import { widget as widgetTable } from '../db/schema';
import { DatabaseService } from '../services/database';
import type { AppType } from './types';

export const automationRoutes = new Hono<AppType>();

// List all widgets (automation API)
automationRoutes.get('/widgets', bearerTokenMiddleware, async (c) => {
  try {
    const MAX_LIMIT = 1000;
    const requestedLimit = parseInt(c.req.query('limit') || '50');
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const offset = parseInt(c.req.query('offset') || '0');

    const [widgets, total] = await Promise.all([
      c.get('services').widget.getAllWidgets(limit, offset),
      c.get('services').widget.getAllWidgetsCount()
    ]);
    return c.json({ widgets, total });
  } catch (error) {
    console.error('Error listing widgets:', error);
    return c.json({ error: 'Failed to list widgets' }, 500);
  }
});

// Create a new widget (automation API)
automationRoutes.post('/widgets', bearerTokenMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, url, crawlUrl, isPublic } = body;

    if (!name) {
      return c.json({ error: 'Widget name is required' }, 400);
    }

    // Create widget with a system user ID
    const systemUserId = 'system-automation';
    const widget = await c.get('services').widget.createWidget(systemUserId, {
      name,
      description: description || '',
      url: url || null,
      logoUrl: null,
      content: null
    });

    // Update widget with additional fields if provided
    if (crawlUrl !== undefined || isPublic !== undefined) {
      const updatedWidget = await c.get('services').widget.updateWidget(widget.id, systemUserId, {
        crawlUrl: crawlUrl || undefined,
        isPublic: isPublic ?? undefined
      });
      return c.json({ widget: updatedWidget });
    }

    return c.json({ widget });
  } catch (error) {
    console.error('Error creating widget:', error);
    return c.json({ error: 'Failed to create widget' }, 500);
  }
});

// Start crawling for a widget (automation API)
automationRoutes.post('/widgets/:id/crawl', bearerTokenMiddleware, async (c) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getPublicWidget(id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    if (!widget.crawlUrl) {
      return c.json({ error: 'Widget has no crawl URL configured' }, 400);
    }

    // Check if already crawling
    if (widget.crawlStatus === 'crawling') {
      return c.json({ error: 'Crawl already in progress' }, 400);
    }

    // Trigger the workflow
    const workflow = await c.env.WIDGET_CONTENT_WORKFLOW.create({
      params: {
        widgetId: id,
        crawlUrl: widget.crawlUrl,
        maxPages: 25,
        isRecrawl: !!widget.crawlRunId
      }
    });

    console.log('[AUTOMATION API] Started workflow:', workflow.id);

    // Update widget status to indicate workflow started and save workflowId
    const database = new DatabaseService(c.env.DATABASE_URL);
    await database.getDatabase()
      .update(widgetTable)
      .set({
        crawlStatus: 'crawling',
        workflowId: workflow.id,
        lastCrawlAt: new Date()
      })
      .where(eq(widgetTable.id, id));

    return c.json({ 
      success: true, 
      workflowId: workflow.id,
      message: 'Crawl workflow started successfully'
    });
  } catch (error) {
    console.error('Error starting crawl:', error);
    return c.json({ error: 'Failed to start crawl' }, 500);
  }
});

// Generate recommendations for a widget (automation API)
automationRoutes.post('/widgets/:id/recommendations', bearerTokenMiddleware, async (c) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getPublicWidget(id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    await c.get('services').widget.generateWidgetRecommendations(id);
    
    // Get updated widget with recommendations
    const updatedWidget = await c.get('services').widget.getPublicWidget(id);
    
    return c.json({ 
      success: true,
      recommendations: updatedWidget?.recommendations || []
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return c.json({ error: 'Failed to generate recommendations' }, 500);
  }
});