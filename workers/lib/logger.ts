// Simple logger for Cloudflare Workers environment
export interface Logger {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

// Factory function to create loggers with context
export function createLogger(name: string, context?: Record<string, any>): Logger {
  const prefix = `[${name}]`;
  
  return {
    info: (message: string, ...args: any[]) => {
      console.log(prefix, message, ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(prefix, message, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(prefix, message, ...args);
    },
    debug: (message: string, ...args: any[]) => {
      // Only log debug in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(prefix, '[DEBUG]', message, ...args);
      }
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