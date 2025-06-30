import type { Context, Next } from 'hono';
import type { Env } from '../types';
import { createLogger, generateRequestId } from './logger';
import type { Logger } from 'pino';

type AppContextType = {
  Bindings: Env;
  Variables: {
    services: any;
    auth?: any;
    requestId: string;
    logger: Logger;
  };
};

export const requestLoggerMiddleware = async (c: Context<AppContextType>, next: Next) => {
  const requestId = generateRequestId();
  const logger = createLogger('REQUEST', { requestId });
  
  // Store in context for other middleware/handlers
  c.set('requestId', requestId);
  c.set('logger', logger);
  
  // Add request ID to response headers
  c.header('X-Request-ID', requestId);
  
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  
  logger.info({
    msg: `${method} ${path} started`,
    userAgent: c.req.header('user-agent'),
    ip: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for'),
  });
  
  try {
    await next();
    
    const duration = Date.now() - start;
    const status = c.res.status;
    
    // Log level based on status code
    if (status >= 500) {
      logger.error({ status, duration_ms: duration }, `${method} ${path} failed`);
    } else if (status >= 400) {
      logger.warn({ status, duration_ms: duration }, `${method} ${path} client error`);
    } else {
      logger.info({ status, duration_ms: duration }, `${method} ${path} completed`);
    }
  } catch (error) {
    const duration = Date.now() - start;
    logger.error({ err: error, duration_ms: duration }, `${method} ${path} exception`);
    throw error;
  }
};