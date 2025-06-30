import pino from 'pino';

// Create base logger configuration
const baseOptions: pino.LoggerOptions = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

// Create the base logger
export const logger = pino(baseOptions);

// Factory function to create child loggers with context
export function createLogger(name: string, context?: Record<string, any>) {
  return logger.child({ service: name, ...context });
}

// Generate a simple request ID
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to add request context
export function withRequestId(requestId: string): Record<string, any> {
  return { requestId };
}