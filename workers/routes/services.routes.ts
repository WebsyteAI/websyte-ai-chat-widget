import { Hono } from 'hono';
import { optionalAuthMiddleware } from '../lib/middleware';
import type { AppType } from './types';

export const servicesRoutes = new Hono<AppType>();

// Apply optional auth middleware to all service routes
servicesRoutes.use('/*', optionalAuthMiddleware);

// Recommendations endpoint
servicesRoutes.post('/recommendations', async (c) => {
  return c.get('services').recommendations.handleRecommendations(c as any);
});

// Summaries endpoint
servicesRoutes.post('/summaries', async (c) => {
  return c.get('services').summaries.handleSummaries(c as any);
});

// Analyze selector endpoint
servicesRoutes.post('/analyze-selector', async (c) => {
  return c.get('services').selectorAnalysis.handle(c);
});