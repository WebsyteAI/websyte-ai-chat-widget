import log from 'loglevel';

// Set default log level based on environment
if (import.meta.env.DEV) {
  log.setDefaultLevel('debug');
} else {
  log.setDefaultLevel('warn');
}

// Factory function to create loggers with prefixes
export function createLogger(name: string): log.Logger {
  const logger = log.getLogger(name);
  
  // Set level based on environment if not already set
  if (import.meta.env.DEV) {
    logger.setLevel('debug');
  } else {
    logger.setLevel('warn');
  }
  
  return logger;
}

// Re-export the main logger for convenience
export const logger = log;

// Global error handler setup
export function setupGlobalErrorHandling(logger: log.Logger): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logger.error('Unhandled error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection:', event.reason);
    });
  }
}

// Performance observer for tracking metrics
export function setupPerformanceLogging(logger: log.Logger): void {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    try {
      // Log navigation timing
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation' && 'domContentLoadedEventEnd' in entry) {
            const navEntry = entry as PerformanceNavigationTiming;
            logger.info('Page load performance:', {
              domContentLoaded: Math.round(navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart),
              loadComplete: Math.round(navEntry.loadEventEnd - navEntry.loadEventStart),
              totalTime: Math.round(navEntry.loadEventEnd - navEntry.fetchStart),
            });
          }
        }
      });
      observer.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      // Ignore if PerformanceObserver is not supported
    }
  }
}