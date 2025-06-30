// Simple logger for Cloudflare Workers environment
export interface Logger {
  info: (message: string | Record<string, any>, ...args: any[]) => void;
  error: (message: string | Record<string, any>, ...args: any[]) => void;
  warn: (message: string | Record<string, any>, ...args: any[]) => void;
  debug: (message: string | Record<string, any>, ...args: any[]) => void;
  child: (context: Record<string, any>) => Logger;
}

// Factory function to create loggers with context
export function createLogger(name: string, context?: Record<string, any>): Logger {
  const prefix = `[${name}]`;
  const fullContext = context || {};
  
  const formatMessage = (message: string | Record<string, any>) => {
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    if (Object.keys(fullContext).length > 0) {
      return `${messageStr} ${JSON.stringify(fullContext)}`;
    }
    return messageStr;
  };
  
  return {
    info: (message: string | Record<string, any>, ...args: any[]) => {
      console.log(prefix, formatMessage(message), ...args);
    },
    error: (message: string | Record<string, any>, ...args: any[]) => {
      console.error(prefix, formatMessage(message), ...args);
    },
    warn: (message: string | Record<string, any>, ...args: any[]) => {
      console.warn(prefix, formatMessage(message), ...args);
    },
    debug: (message: string | Record<string, any>, ...args: any[]) => {
      // Only log debug in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(prefix, '[DEBUG]', formatMessage(message), ...args);
      }
    },
    child: (childContext: Record<string, any>) => {
      return createLogger(name, { ...fullContext, ...childContext });
    },
  };
}

// Generate a simple request ID
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to add request context
export function withRequestId(requestId: string): Record<string, any> {
  return { requestId };
}

// Default logger instance
export const logger = createLogger('App');