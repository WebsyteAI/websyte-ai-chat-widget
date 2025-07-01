import type { Hono } from 'hono';
import type { AppType } from './types';
import { authRoutes } from './auth.routes';
import { chatRoutes } from './chat.routes';
import { servicesRoutes } from './services.routes';
import { widgetRoutes } from './widget.routes';
import { widgetCrawlRoutes } from './widget-crawl.routes';
import { widgetDocsRoutes } from './widget-docs.routes';
import { automationRoutes } from './automation.routes';
import { publicRoutes } from './public.routes';
import { adminRoutes } from './admin.routes';

export function registerAllRoutes(app: Hono<AppType>) {
  // Mount sub-applications
  app.route('/api/auth', authRoutes);
  app.route('/api/chat', chatRoutes);
  app.route('/api', servicesRoutes);
  app.route('/api/widgets', widgetRoutes);
  app.route('/api/widgets', widgetCrawlRoutes);
  app.route('/api/widgets', widgetDocsRoutes);
  app.route('/api/automation', automationRoutes);
  app.route('/api/public', publicRoutes);
  app.route('/api/admin', adminRoutes);
  
  // Health check endpoint (keep in main app)
  app.get('/api/health', (c) => {
    return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });
}