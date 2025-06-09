interface PageContent {
  url: string;
  title: string;
  content: string;
}

interface CacheEntry {
  content: PageContent;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  ttlMs: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  enableLogging: boolean; // Enable debug logging
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class ContentCache {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats = { hits: 0, misses: 0 };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttlMs: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100, // 100 entries default
      enableLogging: false, // Disabled by default
      ...config,
    };
  }

  /**
   * Generate cache key from URL and content target
   */
  private generateKey(url: string, contentTarget: string): string {
    return `${url}:${contentTarget}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (this.config.enableLogging && cleanedCount > 0) {
      console.log(`ContentCache: Cleaned up ${cleanedCount} expired entries`);
    }
  }

  /**
   * Enforce cache size limit using LRU eviction
   */
  private enforceSizeLimit(): void {
    if (this.cache.size <= this.config.maxSize) {
      return;
    }

    // Convert to array and sort by timestamp (oldest first)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    // Remove oldest entries until we're under the limit
    const toRemove = this.cache.size - this.config.maxSize;
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
    }

    if (this.config.enableLogging) {
      console.log(`ContentCache: Evicted ${toRemove} entries to enforce size limit`);
    }
  }

  /**
   * Get cached content if available and valid
   */
  get(url: string, contentTarget: string): PageContent | null {
    const key = this.generateKey(url, contentTarget);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      if (this.config.enableLogging) {
        console.log(`ContentCache MISS: ${key}`);
      }
      return null;
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      if (this.config.enableLogging) {
        console.log(`ContentCache EXPIRED: ${key}`);
      }
      return null;
    }

    this.stats.hits++;
    if (this.config.enableLogging) {
      console.log(`ContentCache HIT: ${key}`);
    }
    return entry.content;
  }

  /**
   * Store content in cache
   */
  set(url: string, contentTarget: string, content: PageContent): void {
    const key = this.generateKey(url, contentTarget);
    const entry: CacheEntry = {
      content,
      timestamp: Date.now(),
      ttl: this.config.ttlMs,
    };

    this.cache.set(key, entry);
    
    // Cleanup and enforce limits
    this.cleanup();
    this.enforceSizeLimit();

    if (this.config.enableLogging) {
      console.log(`ContentCache SET: ${key} (${this.cache.size}/${this.config.maxSize})`);
    }
  }

  /**
   * Check if content exists in cache and is valid
   */
  has(url: string, contentTarget: string): boolean {
    const key = this.generateKey(url, contentTarget);
    const entry = this.cache.get(key);
    return entry ? this.isValid(entry) : false;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const previousSize = this.cache.size;
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
    
    if (this.config.enableLogging) {
      console.log(`ContentCache: Cleared ${previousSize} entries`);
    }
  }

  /**
   * Clear entries for specific URL
   */
  clearUrl(url: string): void {
    let clearedCount = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${url}:`)) {
        this.cache.delete(key);
        clearedCount++;
      }
    }

    if (this.config.enableLogging && clearedCount > 0) {
      console.log(`ContentCache: Cleared ${clearedCount} entries for URL: ${url}`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
    };
  }

  /**
   * Update cache configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    
    // If size limit decreased, enforce it immediately
    if (config.maxSize !== undefined) {
      this.enforceSizeLimit();
    }
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Global cache instance with debug logging enabled in development
export const contentCache = new ContentCache({
  enableLogging: process.env.NODE_ENV === 'development'
});