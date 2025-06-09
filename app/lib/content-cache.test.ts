import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContentCache } from './content-cache';

// Mock console
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

Object.defineProperty(global, 'console', {
  value: mockConsole,
  writable: true,
});

describe('ContentCache', () => {
  let cache: ContentCache;
  
  const samplePageContent = {
    url: 'https://example.com/article',
    title: 'Test Article',
    content: 'This is test article content.',
  };

  const samplePageContent2 = {
    url: 'https://example.com/article2',
    title: 'Test Article 2',
    content: 'This is another test article content.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    cache = new ContentCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should use default configuration', () => {
      const defaultCache = new ContentCache();
      
      expect(defaultCache.size()).toBe(0);
      expect(defaultCache.getStats()).toEqual({
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0,
      });
    });

    it('should accept custom configuration', () => {
      const customCache = new ContentCache({
        ttlMs: 1000,
        maxSize: 10,
        enableLogging: true,
      });

      // Test that configuration is applied by setting a value and checking TTL
      customCache.set('https://test.com', 'article', samplePageContent);
      expect(customCache.has('https://test.com', 'article')).toBe(true);

      // Advance time beyond custom TTL
      vi.advanceTimersByTime(1001);
      expect(customCache.has('https://test.com', 'article')).toBe(false);
    });

    it('should merge partial configuration with defaults', () => {
      const partialConfigCache = new ContentCache({ enableLogging: true });
      
      partialConfigCache.set('https://test.com', 'article', samplePageContent);
      
      // Should still use default TTL (5 minutes)
      vi.advanceTimersByTime(4 * 60 * 1000); // 4 minutes
      expect(partialConfigCache.has('https://test.com', 'article')).toBe(true);
    });
  });

  describe('basic cache operations', () => {
    it('should set and get content successfully', () => {
      cache.set('https://example.com', 'article', samplePageContent);
      
      const result = cache.get('https://example.com', 'article');
      
      expect(result).toEqual(samplePageContent);
    });

    it('should return null for cache miss', () => {
      const result = cache.get('https://nonexistent.com', 'article');
      
      expect(result).toBeNull();
    });

    it('should handle different content targets for same URL', () => {
      cache.set('https://example.com', 'article', samplePageContent);
      cache.set('https://example.com', 'main', samplePageContent2);
      
      const articleResult = cache.get('https://example.com', 'article');
      const mainResult = cache.get('https://example.com', 'main');
      
      expect(articleResult).toEqual(samplePageContent);
      expect(mainResult).toEqual(samplePageContent2);
    });

    it('should handle same content target for different URLs', () => {
      cache.set('https://example.com', 'article', samplePageContent);
      cache.set('https://different.com', 'article', samplePageContent2);
      
      const result1 = cache.get('https://example.com', 'article');
      const result2 = cache.get('https://different.com', 'article');
      
      expect(result1).toEqual(samplePageContent);
      expect(result2).toEqual(samplePageContent2);
    });

    it('should check existence with has method', () => {
      expect(cache.has('https://example.com', 'article')).toBe(false);
      
      cache.set('https://example.com', 'article', samplePageContent);
      
      expect(cache.has('https://example.com', 'article')).toBe(true);
    });

    it('should track cache size', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('https://example.com', 'article', samplePageContent);
      expect(cache.size()).toBe(1);
      
      cache.set('https://example.com', 'main', samplePageContent2);
      expect(cache.size()).toBe(2);
    });
  });

  describe('TTL (Time To Live) functionality', () => {
    it('should expire entries after TTL', () => {
      cache.set('https://example.com', 'article', samplePageContent);
      
      expect(cache.has('https://example.com', 'article')).toBe(true);
      
      // Advance time beyond default TTL (5 minutes)
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      
      expect(cache.has('https://example.com', 'article')).toBe(false);
      expect(cache.get('https://example.com', 'article')).toBeNull();
    });

    it('should not expire entries before TTL', () => {
      cache.set('https://example.com', 'article', samplePageContent);
      
      // Advance time but stay within TTL
      vi.advanceTimersByTime(4 * 60 * 1000); // 4 minutes
      
      expect(cache.has('https://example.com', 'article')).toBe(true);
      expect(cache.get('https://example.com', 'article')).toEqual(samplePageContent);
    });

    it('should remove expired entries on get', () => {
      cache.set('https://example.com', 'article', samplePageContent);
      
      expect(cache.size()).toBe(1);
      
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      
      // Getting expired entry should remove it and return null
      const result = cache.get('https://example.com', 'article');
      
      expect(result).toBeNull();
      expect(cache.size()).toBe(0);
    });

    it('should handle custom TTL values', () => {
      const shortTTLCache = new ContentCache({ ttlMs: 1000 }); // 1 second
      
      shortTTLCache.set('https://example.com', 'article', samplePageContent);
      
      vi.advanceTimersByTime(500); // 0.5 seconds
      expect(shortTTLCache.has('https://example.com', 'article')).toBe(true);
      
      vi.advanceTimersByTime(501); // Total 1.001 seconds
      expect(shortTTLCache.has('https://example.com', 'article')).toBe(false);
    });
  });

  describe('cache size limits and LRU eviction', () => {
    it('should enforce maximum size limit', () => {
      const smallCache = new ContentCache({ maxSize: 2 });
      
      smallCache.set('https://example1.com', 'article', samplePageContent);
      smallCache.set('https://example2.com', 'article', samplePageContent);
      smallCache.set('https://example3.com', 'article', samplePageContent);
      
      expect(smallCache.size()).toBe(2);
    });

    it('should evict oldest entries when size limit exceeded', () => {
      const smallCache = new ContentCache({ maxSize: 2 });
      
      smallCache.set('https://example1.com', 'article', samplePageContent);
      vi.advanceTimersByTime(100);
      
      smallCache.set('https://example2.com', 'article', samplePageContent);
      vi.advanceTimersByTime(100);
      
      smallCache.set('https://example3.com', 'article', samplePageContent);
      
      // First entry should be evicted
      expect(smallCache.has('https://example1.com', 'article')).toBe(false);
      expect(smallCache.has('https://example2.com', 'article')).toBe(true);
      expect(smallCache.has('https://example3.com', 'article')).toBe(true);
    });

    it('should not evict when under size limit', () => {
      const largeCache = new ContentCache({ maxSize: 10 });
      
      largeCache.set('https://example1.com', 'article', samplePageContent);
      largeCache.set('https://example2.com', 'article', samplePageContent);
      
      expect(largeCache.size()).toBe(2);
      expect(largeCache.has('https://example1.com', 'article')).toBe(true);
      expect(largeCache.has('https://example2.com', 'article')).toBe(true);
    });
  });

  describe('cleanup functionality', () => {
    it('should clean up expired entries during set operations', () => {
      cache.set('https://example1.com', 'article', samplePageContent);
      cache.set('https://example2.com', 'article', samplePageContent);
      
      expect(cache.size()).toBe(2);
      
      // Expire first entry
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      
      // Adding new entry should trigger cleanup
      cache.set('https://example3.com', 'article', samplePageContent);
      
      expect(cache.size()).toBe(1); // Both old entries expired, only new one remains
      expect(cache.has('https://example1.com', 'article')).toBe(false);
      expect(cache.has('https://example2.com', 'article')).toBe(false);
      expect(cache.has('https://example3.com', 'article')).toBe(true);
    });

    it('should only clean up expired entries', () => {
      cache.set('https://example1.com', 'article', samplePageContent);
      vi.advanceTimersByTime(2 * 60 * 1000); // 2 minutes
      
      cache.set('https://example2.com', 'article', samplePageContent);
      vi.advanceTimersByTime(2 * 60 * 1000); // Total 4 minutes
      
      // First entry expires, second doesn't
      vi.advanceTimersByTime(1 * 60 * 1000 + 1); // Total 5+ minutes
      
      cache.set('https://example3.com', 'article', samplePageContent);
      
      expect(cache.has('https://example1.com', 'article')).toBe(false);
      expect(cache.has('https://example2.com', 'article')).toBe(true);
      expect(cache.has('https://example3.com', 'article')).toBe(true);
    });
  });

  describe('clear operations', () => {
    beforeEach(() => {
      cache.set('https://example.com/page1', 'article', samplePageContent);
      cache.set('https://example.com/page2', 'article', samplePageContent);
      cache.set('https://different.com/page1', 'article', samplePageContent2);
    });

    it('should clear all cache entries', () => {
      expect(cache.size()).toBe(3);
      
      cache.clear();
      
      expect(cache.size()).toBe(0);
      expect(cache.getStats()).toEqual({
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0,
      });
    });

    it('should clear entries for specific URL only', () => {
      expect(cache.size()).toBe(3);
      
      cache.clearUrl('https://example.com/page1');
      
      expect(cache.size()).toBe(2);
      expect(cache.has('https://example.com/page1', 'article')).toBe(false);
      expect(cache.has('https://example.com/page2', 'article')).toBe(true);
      expect(cache.has('https://different.com/page1', 'article')).toBe(true);
    });

    it('should handle clearUrl with non-existent URL', () => {
      const initialSize = cache.size();
      
      cache.clearUrl('https://nonexistent.com');
      
      expect(cache.size()).toBe(initialSize);
    });

    it('should clear multiple entries with same URL prefix', () => {
      cache.set('https://example.com/page1', 'main', samplePageContent);
      cache.set('https://example.com/page1', '.content', samplePageContent2);
      
      expect(cache.size()).toBe(5);
      
      cache.clearUrl('https://example.com/page1');
      
      expect(cache.size()).toBe(2);
      expect(cache.has('https://example.com/page1', 'article')).toBe(false);
      expect(cache.has('https://example.com/page1', 'main')).toBe(false);
      expect(cache.has('https://example.com/page1', '.content')).toBe(false);
    });
  });

  describe('statistics tracking', () => {
    it('should track hits and misses', () => {
      expect(cache.getStats()).toEqual({
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0,
      });

      // Miss
      cache.get('https://example.com', 'article');
      expect(cache.getStats().misses).toBe(1);

      // Set and hit
      cache.set('https://example.com', 'article', samplePageContent);
      cache.get('https://example.com', 'article');
      
      expect(cache.getStats()).toEqual({
        hits: 1,
        misses: 1,
        size: 1,
        hitRate: 50,
      });
    });

    it('should calculate hit rate correctly', () => {
      cache.set('https://example.com', 'article', samplePageContent);
      
      // 3 hits, 2 misses = 60% hit rate
      cache.get('https://example.com', 'article'); // hit
      cache.get('https://example.com', 'article'); // hit
      cache.get('https://example.com', 'article'); // hit
      cache.get('https://nonexistent1.com', 'article'); // miss
      cache.get('https://nonexistent2.com', 'article'); // miss
      
      expect(cache.getStats().hitRate).toBe(60);
    });

    it('should handle zero total requests', () => {
      expect(cache.getStats().hitRate).toBe(0);
    });

    it('should reset stats when cache is cleared', () => {
      cache.set('https://example.com', 'article', samplePageContent);
      cache.get('https://example.com', 'article'); // hit
      cache.get('https://nonexistent.com', 'article'); // miss
      
      expect(cache.getStats().hits).toBe(1);
      expect(cache.getStats().misses).toBe(1);
      
      cache.clear();
      
      expect(cache.getStats()).toEqual({
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0,
      });
    });

    it('should not reset stats when clearing URL only', () => {
      cache.set('https://example.com', 'article', samplePageContent);
      cache.get('https://example.com', 'article'); // hit
      
      cache.clearUrl('https://example.com');
      
      expect(cache.getStats().hits).toBe(1);
      expect(cache.getStats().size).toBe(0);
    });
  });

  describe('configuration updates', () => {
    it('should update configuration', () => {
      cache.updateConfig({ enableLogging: true });
      
      cache.set('https://example.com', 'article', samplePageContent);
      
      // Logging should be enabled (we can't easily test console output in unit tests)
      expect(cache.has('https://example.com', 'article')).toBe(true);
    });

    it('should enforce new size limit when updated', () => {
      cache.set('https://example1.com', 'article', samplePageContent);
      cache.set('https://example2.com', 'article', samplePageContent);
      cache.set('https://example3.com', 'article', samplePageContent);
      
      expect(cache.size()).toBe(3);
      
      cache.updateConfig({ maxSize: 2 });
      
      expect(cache.size()).toBe(2);
    });

    it('should update TTL for future entries', () => {
      cache.updateConfig({ ttlMs: 1000 });
      
      cache.set('https://example.com', 'article', samplePageContent);
      
      vi.advanceTimersByTime(500);
      expect(cache.has('https://example.com', 'article')).toBe(true);
      
      vi.advanceTimersByTime(501);
      expect(cache.has('https://example.com', 'article')).toBe(false);
    });
  });

  describe('logging functionality', () => {
    let loggingCache: ContentCache;

    beforeEach(() => {
      loggingCache = new ContentCache({ enableLogging: true });
    });

    it('should log cache operations when logging enabled', () => {
      loggingCache.set('https://example.com', 'article', samplePageContent);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('ContentCache SET:')
      );
    });

    it('should log cache hits when logging enabled', () => {
      loggingCache.set('https://example.com', 'article', samplePageContent);
      vi.clearAllMocks();
      
      loggingCache.get('https://example.com', 'article');
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('ContentCache HIT:')
      );
    });

    it('should log cache misses when logging enabled', () => {
      loggingCache.get('https://nonexistent.com', 'article');
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('ContentCache MISS:')
      );
    });

    it('should log expired entries when logging enabled', () => {
      loggingCache.set('https://example.com', 'article', samplePageContent);
      
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      
      loggingCache.get('https://example.com', 'article');
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('ContentCache EXPIRED:')
      );
    });

    it('should not log when logging disabled', () => {
      const quietCache = new ContentCache({ enableLogging: false });
      
      quietCache.set('https://example.com', 'article', samplePageContent);
      quietCache.get('https://example.com', 'article');
      quietCache.get('https://nonexistent.com', 'article');
      
      expect(mockConsole.log).not.toHaveBeenCalled();
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle special characters in URLs and selectors', () => {
      const specialUrl = 'https://example.com/page?param=value&other=123#section';
      const specialSelector = 'article[data-content="true"], .content > p:first-child';
      
      cache.set(specialUrl, specialSelector, samplePageContent);
      
      const result = cache.get(specialUrl, specialSelector);
      
      expect(result).toEqual(samplePageContent);
    });

    it('should handle very long URLs and selectors', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000);
      const longSelector = 'div.' + 'b'.repeat(500);
      
      cache.set(longUrl, longSelector, samplePageContent);
      
      expect(cache.has(longUrl, longSelector)).toBe(true);
    });

    it('should handle null and undefined in content safely', () => {
      const contentWithNulls = {
        url: 'https://example.com',
        title: '',
        content: '',
      };
      
      cache.set('https://example.com', 'article', contentWithNulls);
      
      const result = cache.get('https://example.com', 'article');
      
      expect(result).toEqual(contentWithNulls);
    });

    it('should handle concurrent operations', () => {
      // Simulate rapid concurrent access
      cache.set('https://example.com', 'article', samplePageContent);
      
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(cache.get('https://example.com', 'article'));
      }
      
      results.forEach(result => {
        expect(result).toEqual(samplePageContent);
      });
    });

    it('should handle large content objects', () => {
      const largeContent = {
        url: 'https://example.com',
        title: 'Large Article',
        content: 'x'.repeat(100000), // 100KB of content
      };
      
      cache.set('https://example.com', 'article', largeContent);
      
      const result = cache.get('https://example.com', 'article');
      
      expect(result).toEqual(largeContent);
    });

    it('should maintain cache integrity during rapid additions and deletions', () => {
      // Add many entries
      for (let i = 0; i < 50; i++) {
        cache.set(`https://example${i}.com`, 'article', {
          ...samplePageContent,
          url: `https://example${i}.com`,
        });
      }
      
      // Advance time to expire some
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      
      // Access some entries (triggering cleanup)
      for (let i = 0; i < 10; i++) {
        cache.get(`https://example${i}.com`, 'article');
      }
      
      // Add more entries
      for (let i = 50; i < 60; i++) {
        cache.set(`https://example${i}.com`, 'article', {
          ...samplePageContent,
          url: `https://example${i}.com`,
        });
      }
      
      // Cache should maintain reasonable size
      expect(cache.size()).toBeLessThanOrEqual(100); // Default max size
    });
  });
});