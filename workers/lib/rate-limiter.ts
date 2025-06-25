interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  maxRequestsAuthenticated?: number;  // Higher limit for authenticated users
  keyGenerator?: (context: any) => string;  // Function to generate rate limit key
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval?: number;
  
  constructor(private config: RateLimitConfig) {}
  
  private startCleanup() {
    if (!this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => this.cleanup(), this.config.windowMs) as unknown as number;
    }
  }

  async isAllowed(context: any, isAuthenticated: boolean = false): Promise<{ allowed: boolean; retryAfter?: number }> {
    // Start cleanup on first use
    this.startCleanup();
    
    const key = this.getKey(context);
    const now = Date.now();
    const limit = isAuthenticated && this.config.maxRequestsAuthenticated 
      ? this.config.maxRequestsAuthenticated 
      : this.config.maxRequests;

    // Get or create rate limit entry
    let entry = this.store[key];
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs
      };
      this.store[key] = entry;
    }

    // Check if limit exceeded
    if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Increment counter
    entry.count++;
    return { allowed: true };
  }

  private getKey(context: any): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(context);
    }
    
    // Default key generation based on IP or session
    const ip = context.req?.header('x-forwarded-for') || 
               context.req?.header('x-real-ip') || 
               'unknown';
    const sessionId = context.sessionId || '';
    return `${ip}:${sessionId}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    }
  }

  reset(key: string): void {
    delete this.store[key];
  }
}

// Middleware factory for Hono
export function rateLimitMiddleware(config: RateLimitConfig) {
  let limiter: RateLimiter | null = null;
  
  return async (c: any, next: any) => {
    // Lazy initialization to avoid global scope issues
    if (!limiter) {
      limiter = new RateLimiter(config);
    }
    
    const auth = c.get('auth');
    const isAuthenticated = !!auth?.user;
    
    const { allowed, retryAfter } = await limiter.isAllowed(c, isAuthenticated);
    
    if (!allowed) {
      return c.json(
        { 
          error: 'Too many requests', 
          retryAfter 
        }, 
        429
      );
    }
    
    await next();
  };
}