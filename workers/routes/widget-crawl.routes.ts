import { Hono } from 'hono';
import { authMiddleware } from '../lib/middleware';
import type { AppType } from './types';

export const widgetCrawlRoutes = new Hono<AppType>();

// Start crawling
widgetCrawlRoutes.post('/:id/crawl', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    console.log('Crawl endpoint: parsing request body');
    const body = await c.req.json();
    console.log('Crawl endpoint: body received:', body);
    const { url, maxPages = 25 } = body;

    if (!url) {
      console.log('Crawl endpoint: URL is missing from body');
      return c.json({ error: 'URL is required' }, 400);
    }

    // Verify widget ownership
    const widget = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    // Check if already crawling
    console.log('Crawl endpoint: widget status:', widget.crawlStatus);
    if (widget.crawlStatus === 'crawling') {
      console.log('Crawl endpoint: widget already crawling');
      return c.json({ error: 'Crawl already in progress' }, 400);
    }

    // Trigger the workflow
    const workflow = await c.env.WIDGET_CONTENT_WORKFLOW.create({
      params: {
        widgetId: id,
        crawlUrl: url,
        maxPages,
        isRecrawl: !!widget.crawlRunId
      }
    });

    console.log('Started crawl workflow:', workflow.id);

    // Update widget status
    const { DatabaseService } = await import('../services/database');
    const { widget: widgetTable } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');
    
    const database = new DatabaseService(c.env.DATABASE_URL);
    await database.getDatabase()
      .update(widgetTable)
      .set({
        crawlUrl: url,
        crawlStatus: 'crawling',
        workflowId: workflow.id,
        lastCrawlAt: new Date()
      })
      .where(eq(widgetTable.id, id));

    return c.json({ 
      success: true,
      workflowId: workflow.id,
      message: 'Crawl started successfully' 
    });
  } catch (error) {
    console.error('Error starting crawl:', error);
    return c.json({ error: 'Failed to start crawl' }, 500);
  }
});

// Get crawl status
widgetCrawlRoutes.get('/:id/crawl/status', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getCrawlStatus(id, auth.user.id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    return c.json({
      status: widget.crawlStatus || 'idle',
      runId: widget.crawlRunId || null,
      pageCount: widget.crawlPageCount || 0,
      lastCrawlAt: widget.lastCrawlAt || null
    });
  } catch (error) {
    console.error('Error getting crawl status:', error);
    return c.json({ error: 'Failed to get crawl status' }, 500);
  }
});

// Check crawl status and update if needed
widgetCrawlRoutes.get('/:id/crawl/status-check', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widgetRecord = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!widgetRecord) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    if (!widgetRecord.crawlRunId) {
      return c.json({ 
        status: widgetRecord.crawlStatus || 'idle',
        runId: null,
        pageCount: widgetRecord.crawlPageCount || 0,
        lastCrawlAt: widgetRecord.lastCrawlAt || null
      });
    }

    // Check and process crawl status
    await c.get('services').widget.checkCrawlStatus(id, widgetRecord.crawlRunId, auth.user.id);
    
    // Get updated widget
    const updatedWidget = await c.get('services').widget.getWidget(id, auth.user.id);
    
    return c.json({ 
      status: updatedWidget?.crawlStatus || 'unknown',
      runId: updatedWidget?.crawlRunId,
      pageCount: updatedWidget?.crawlPageCount,
      lastCrawlAt: updatedWidget?.lastCrawlAt
    });
  } catch (error) {
    console.error('Error checking crawl status:', error);
    return c.json({ error: 'Failed to check crawl status' }, 500);
  }
});

// Reset stuck crawl
widgetCrawlRoutes.post('/:id/crawl/reset', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const reset = await c.get('services').widget.resetStuckCrawl(id, auth.user.id);
    if (!reset) {
      return c.json({ error: 'Widget not found or not stuck' }, 404);
    }
    
    return c.json({ success: true, message: 'Crawl status reset' });
  } catch (error) {
    console.error('Error resetting crawl:', error);
    return c.json({ error: 'Failed to reset crawl' }, 500);
  }
});