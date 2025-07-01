import { Hono } from 'hono';
import { rateLimitMiddleware } from '../lib/rate-limiter';
import { optionalAuthMiddleware } from '../lib/middleware';
import type { AppType } from './types';

export const chatRoutes = new Hono<AppType>();

// Apply rate limiting to chat endpoint
chatRoutes.use('/', rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 10, // 10 requests per minute for anonymous
  maxRequestsAuthenticated: 30, // 30 requests per minute for authenticated
}));

// Apply optional auth middleware
chatRoutes.use('/', optionalAuthMiddleware);

// Chat endpoint
chatRoutes.post('/', async (c) => {
  return c.get('services').chat.handleChat(c);
});