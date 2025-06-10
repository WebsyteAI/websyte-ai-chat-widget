import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContentExtractor } from './content-extractor';
import { contentCache } from './content-cache';

// Mock turndown
vi.mock('turndown', () => {
  const mockTurndown = vi.fn().mockReturnValue('# Test Article\n\nThis is test article content with more than fifty characters and more than ten words to pass validation.');
  return {
    default: vi.fn().mockImplementation(() => ({
      turndown: mockTurndown,
    })),
  };
});

// Mock the content cache
vi.mock('./content-cache', () => ({
  contentCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
    clearUrl: vi.fn(),
    getStats: vi.fn(() => ({ hits: 0, misses: 0, size: 0, hitRate: 0 })),
  },
}));

// Mock DOM globals
const mockLocation = {
  href: 'https://example.com/article',
};

const mockDocument = {
  title: 'Test Article Title',
  querySelector: vi.fn(),
  documentElement: {
    cloneNode: vi.fn(),
    innerHTML: '<body><h1>Test Article</h1><p>This is test article content with more than fifty characters and more than ten words to pass validation.</p></body>',
  },
  body: {
    cloneNode: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    textContent: 'Main content',
  },
  createTreeWalker: vi.fn(() => ({
    nextNode: vi.fn().mockReturnValue(null),
  })),
};

// Setup global mocks
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

Object.defineProperty(global, 'console', {
  value: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'NodeFilter', {
  value: {
    SHOW_ELEMENT: 1,
    FILTER_ACCEPT: 1,
    FILTER_REJECT: 2,
    FILTER_SKIP: 3,
  },
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: {
    location: mockLocation,
    getComputedStyle: vi.fn(() => ({
      display: 'block',
      visibility: 'visible',
    })),
  },
  writable: true,
});

describe('ContentExtractor', () => {
  const mockPageContent = {
    url: 'https://example.com/article',
    title: 'Test Article Title',
    content: '# Test Article\n\nThis is test article content with more than fifty characters and more than ten words to pass validation.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset location and document
    mockLocation.href = 'https://example.com/article';
    mockDocument.title = 'Test Article Title';
    
    // Setup default document element mock
    mockDocument.documentElement.cloneNode = vi.fn(() => ({
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      innerHTML: '<body><h1>Test Article</h1><p>This is test article content with more than fifty characters and more than ten words to pass validation.</p></body>',
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractPageContent', () => {
    it('should return cached content when available', async () => {
      // Mock cache hit
      vi.mocked(contentCache.get).mockReturnValue(mockPageContent);

      const result = await ContentExtractor.extractPageContent();

      expect(contentCache.get).toHaveBeenCalledWith(
        'https://example.com/article',
        'full-page'
      );
      expect(result).toEqual(mockPageContent);
    });

    it('should extract fresh content when cache miss', async () => {
      // Mock cache miss
      vi.mocked(contentCache.get).mockReturnValue(null);

      const result = await ContentExtractor.extractPageContent();

      expect(contentCache.get).toHaveBeenCalledWith(
        'https://example.com/article',
        'full-page'
      );
      expect(contentCache.set).toHaveBeenCalledWith(
        'https://example.com/article',
        'full-page',
        expect.objectContaining({
          url: 'https://example.com/article',
          title: 'Test Article Title',
          content: expect.stringContaining('Test Article'),
        })
      );
      expect(result).toMatchObject({
        url: 'https://example.com/article',
        title: 'Test Article Title',
        content: expect.stringContaining('Test Article'),
      });
    });

    it('should work without cache when useCache is false', async () => {
      const result = await ContentExtractor.extractPageContent(false);

      expect(contentCache.get).not.toHaveBeenCalled();
      expect(contentCache.set).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        url: 'https://example.com/article',
        title: 'Test Article Title',
        content: expect.stringContaining('Test Article'),
      });
    });

    it('should throw error in cache-only mode when no cache hit', async () => {
      // Mock cache miss
      vi.mocked(contentCache.get).mockReturnValue(null);

      await expect(
        ContentExtractor.extractPageContent(true, true)
      ).rejects.toThrow('No cached content available for full page');
    });

    it('should use empty title when document.title is empty', async () => {
      mockDocument.title = '';
      vi.mocked(contentCache.get).mockReturnValue(null);

      const result = await ContentExtractor.extractPageContent();

      expect(result.title).toBe('');
      expect(result.content).toContain('Test Article');
    });
  });

  describe('extractMainContentWithRetry', () => {
    it('should succeed on first attempt when element exists', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);

      const result = await ContentExtractor.extractPageContent();

      expect(result.content).toContain('Test Article');
    });

    it('should retry and succeed on second attempt', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      // First call fails, second succeeds
      let callCount = 0;
      mockDocument.documentElement.cloneNode = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('DOM not ready');
        }
        return {
          querySelector: vi.fn(),
          querySelectorAll: vi.fn(() => []),
          innerHTML: '<body><h1>Test Article</h1><p>This is test article content with more than fifty characters and more than ten words to pass validation.</p></body>',
        };
      });

      const result = await ContentExtractor.extractPageContent();
      expect(result.content).toContain('Test Article');
    });

    it('should fail after max retries when content is insufficient', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      // Mock TurndownService to return insufficient content
      const TurndownService = await import('turndown');
      const mockTurndown = vi.mocked(TurndownService.default);
      mockTurndown.mockImplementation(() => ({
        turndown: vi.fn().mockReturnValue('Short'), // Too short to pass validation
      }) as any);

      await expect(
        ContentExtractor.extractPageContent()
      ).rejects.toThrow('Full page content contains insufficient content');
    });
  });

  describe('content processing', () => {
    it('should filter out head, script, and style elements', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      // Mock document element with head, script, and style tags
      mockDocument.documentElement.cloneNode = vi.fn(() => {
        const mockCloned = {
          querySelector: vi.fn((selector) => {
            if (selector === 'head') return { remove: vi.fn() };
            return null;
          }),
          querySelectorAll: vi.fn((selector) => {
            if (selector === 'script') return [{ remove: vi.fn() }];
            if (selector === 'style') return [{ remove: vi.fn() }];
            if (selector.includes('nav') || selector.includes('.nav')) return [{ remove: vi.fn() }];
            return [];
          }),
          innerHTML: '<body><h1>Test Article</h1><p>Clean content</p></body>',
        };
        return mockCloned;
      });

      const result = await ContentExtractor.extractPageContent();
      expect(result.content).toBeTruthy();
    });

    it('should convert HTML to markdown format', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);

      const result = await ContentExtractor.extractPageContent();

      // Should return markdown format (mocked to return markdown)
      expect(result.content).toContain('# Test Article');
      expect(result.content).toContain('\n\n');
    });

    it('should truncate content to 15000 characters', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      // Mock TurndownService to return long content
      const TurndownService = await import('turndown');
      const mockTurndown = vi.mocked(TurndownService.default);
      const longContent = 'a'.repeat(20000); // 20k characters
      mockTurndown.mockImplementation(() => ({
        turndown: vi.fn().mockReturnValue(longContent),
      }) as any);

      const result = await ContentExtractor.extractPageContent();
      expect(result.content.length).toBeLessThanOrEqual(15000);
    });
  });

  describe('isValidContent', () => {
    it('should return true for valid content', () => {
      const validContent = 'This is a valid article with more than fifty characters and more than ten words for validation.';
      expect(ContentExtractor.isValidContent(validContent)).toBe(true);
    });

    it('should return false for content too short', () => {
      const shortContent = 'Too short';
      expect(ContentExtractor.isValidContent(shortContent)).toBe(false);
    });

    it('should return false for content with too few words', () => {
      const fewWordsContent = 'This content has exactly nine words but is long enough';
      expect(ContentExtractor.isValidContent(fewWordsContent)).toBe(false);
    });

    it('should return false for empty content', () => {
      expect(ContentExtractor.isValidContent('')).toBe(false);
    });
  });

  describe('cache utility methods', () => {
    it('should warm cache successfully', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      const consoleSpy = vi.spyOn(console, 'log');

      await ContentExtractor.warmCache();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Cache warmed for full page'));
    });

    it('should handle cache warming errors gracefully', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      mockDocument.documentElement.cloneNode = vi.fn(() => {
        throw new Error('DOM error');
      });
      
      const consoleSpy = vi.spyOn(console, 'warn');

      await ContentExtractor.warmCache();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to warm cache'), expect.any(Error));
    });

    it('should clear cache for current URL only', () => {
      ContentExtractor.clearCache(true);
      expect(contentCache.clearUrl).toHaveBeenCalledWith('https://example.com/article');
    });

    it('should clear all cache', () => {
      ContentExtractor.clearCache(false);
      expect(contentCache.clear).toHaveBeenCalled();
    });

    it('should return cache stats', () => {
      const stats = ContentExtractor.getCacheStats();
      expect(stats).toEqual({ hits: 0, misses: 0, size: 0, hitRate: 0 });
    });
  });

  describe('findMainContentElement', () => {
    it('should return main content element from body', () => {
      mockDocument.body = {
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
        textContent: 'Main content',
      };

      const result = ContentExtractor.findMainContentElement();
      expect(result).toBe(mockDocument.body);
    });
  });

  describe('error handling', () => {
    it('should handle DOM errors gracefully', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      mockDocument.documentElement.cloneNode = vi.fn(() => {
        throw new Error('DOM error');
      });

      await expect(
        ContentExtractor.extractPageContent()
      ).rejects.toThrow('DOM error');
    });
  });
});