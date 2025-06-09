import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContentExtractor } from './content-extractor';
import { contentCache } from './content-cache';

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

describe('ContentExtractor', () => {
  const mockContentTarget = 'article, main, .content';
  const mockPageContent = {
    url: 'https://example.com/article',
    title: 'Test Article Title',
    content: 'This is test article content with more than fifty characters and more than ten words to pass validation.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset location and document
    mockLocation.href = 'https://example.com/article';
    mockDocument.title = 'Test Article Title';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractPageContent', () => {
    it('should return cached content when available', async () => {
      // Mock cache hit
      vi.mocked(contentCache.get).mockReturnValue(mockPageContent);

      const result = await ContentExtractor.extractPageContent(mockContentTarget);

      expect(contentCache.get).toHaveBeenCalledWith(
        'https://example.com/article',
        mockContentTarget
      );
      expect(result).toEqual(mockPageContent);
      expect(mockDocument.querySelector).not.toHaveBeenCalled();
    });

    it('should extract fresh content when cache miss', async () => {
      // Mock cache miss
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      // Mock DOM element
      const mockElement = {
        cloneNode: vi.fn(() => ({
          querySelectorAll: vi.fn(() => []),
          textContent: 'This is test article content with more than fifty characters and more than ten words to pass validation.',
        })),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      const result = await ContentExtractor.extractPageContent(mockContentTarget);

      expect(contentCache.get).toHaveBeenCalledWith(
        'https://example.com/article',
        mockContentTarget
      );
      expect(mockDocument.querySelector).toHaveBeenCalledWith(mockContentTarget);
      expect(contentCache.set).toHaveBeenCalledWith(
        'https://example.com/article',
        mockContentTarget,
        expect.objectContaining({
          url: 'https://example.com/article',
          title: 'Test Article Title',
          content: expect.stringContaining('test article content'),
        })
      );
      expect(result).toMatchObject({
        url: 'https://example.com/article',
        title: 'Test Article Title',
        content: expect.stringContaining('test article content'),
      });
    });

    it('should work without cache when useCache is false', async () => {
      // Mock DOM element
      const mockElement = {
        cloneNode: vi.fn(() => ({
          querySelectorAll: vi.fn(() => []),
          textContent: 'This is test article content with more than fifty characters and more than ten words to pass validation.',
        })),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      const result = await ContentExtractor.extractPageContent(mockContentTarget, false);

      expect(contentCache.get).not.toHaveBeenCalled();
      expect(contentCache.set).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        url: 'https://example.com/article',
        title: 'Test Article Title',
        content: expect.stringContaining('test article content'),
      });
    });

    it('should throw error in cache-only mode when no cache hit', async () => {
      // Mock cache miss
      vi.mocked(contentCache.get).mockReturnValue(null);

      await expect(
        ContentExtractor.extractPageContent(mockContentTarget, true, true)
      ).rejects.toThrow('No cached content available for selector');

      expect(contentCache.get).toHaveBeenCalled();
      expect(mockDocument.querySelector).not.toHaveBeenCalled();
    });

    it('should use empty title when document.title is empty', async () => {
      mockDocument.title = '';
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      const mockElement = {
        cloneNode: vi.fn(() => ({
          querySelectorAll: vi.fn(() => []),
          textContent: 'This is test article content with more than fifty characters and more than ten words to pass validation.',
        })),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      const result = await ContentExtractor.extractPageContent(mockContentTarget);

      expect(result.title).toBe('');
    });
  });

  describe('extractMainContentWithRetry', () => {
    it('should succeed on first attempt when element exists', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      const mockElement = {
        cloneNode: vi.fn(() => ({
          querySelectorAll: vi.fn(() => []),
          textContent: 'This is test article content with more than fifty characters and more than ten words to pass validation.',
        })),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      const result = await ContentExtractor.extractPageContent(mockContentTarget);

      expect(result.content).toContain('test article content');
      expect(mockDocument.querySelector).toHaveBeenCalledTimes(1);
    });

    it('should retry and succeed on second attempt', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      // Mock first call fails, second succeeds
      const mockElement = {
        cloneNode: vi.fn(() => ({
          querySelectorAll: vi.fn(() => []),
          textContent: 'This is test article content with more than fifty characters and more than ten words to pass validation.',
        })),
      };
      
      mockDocument.querySelector
        .mockReturnValueOnce(null) // First attempt fails
        .mockReturnValueOnce(mockElement); // Second attempt succeeds

      // Mock setTimeout to resolve immediately
      vi.spyOn(global, 'setTimeout').mockImplementation((callback: Function) => {
        callback();
        return 1 as any;
      });

      const result = await ContentExtractor.extractPageContent(mockContentTarget);

      expect(result.content).toContain('test article content');
      expect(mockDocument.querySelector).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries when element not found', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      mockDocument.querySelector.mockReturnValue(null);

      // Mock setTimeout to resolve immediately
      vi.spyOn(global, 'setTimeout').mockImplementation((callback: Function) => {
        callback();
        return 1 as any;
      });

      await expect(
        ContentExtractor.extractPageContent(mockContentTarget)
      ).rejects.toThrow('Content target selector');

      expect(mockDocument.querySelector).toHaveBeenCalledTimes(3); // Max retries
    });

    it('should fail when content is insufficient', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      const mockElement = {
        cloneNode: vi.fn(() => ({
          querySelectorAll: vi.fn(() => []),
          textContent: 'Short', // Too short content
        })),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      await expect(
        ContentExtractor.extractPageContent(mockContentTarget)
      ).rejects.toThrow('contains insufficient content');
    });
  });

  describe('content processing', () => {
    it('should remove script and style tags', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      const mockScript = { remove: vi.fn() };
      const mockStyle = { remove: vi.fn() };
      const mockClonedElement = {
        querySelectorAll: vi.fn((selector: string) => {
          if (selector === 'script') return [mockScript];
          if (selector === 'style') return [mockStyle];
          return [];
        }),
        textContent: 'This is test article content with more than fifty characters and more than ten words to pass validation.',
      };
      
      const mockElement = {
        cloneNode: vi.fn(() => mockClonedElement),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      await ContentExtractor.extractPageContent(mockContentTarget);

      expect(mockScript.remove).toHaveBeenCalled();
      expect(mockStyle.remove).toHaveBeenCalled();
    });

    it('should clean and normalize text content', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      const mockElement = {
        cloneNode: vi.fn(() => ({
          querySelectorAll: vi.fn(() => []),
          textContent: '   This  is   test\n\n\r article   content with more than fifty characters and more than ten words to pass validation.   ',
        })),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      const result = await ContentExtractor.extractPageContent(mockContentTarget);

      expect(result.content).toBe('This is test article content with more than fifty characters and more than ten words to pass validation.');
    });

    it('should truncate content to 10000 characters', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      // Create content that is long but also has sufficient words for validation
      const wordList = 'word '.repeat(50); // 50 words, 200 characters
      const longContent = wordList + 'A'.repeat(15000); // Total > 15000 chars with enough words
      const mockElement = {
        cloneNode: vi.fn(() => ({
          querySelectorAll: vi.fn(() => []),
          textContent: longContent,
        })),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      const result = await ContentExtractor.extractPageContent(mockContentTarget);

      expect(result.content.length).toBe(10000);
    });
  });

  describe('isValidContent', () => {
    it('should return true for valid content', () => {
      const validContent = 'This is test article content with more than fifty characters and more than ten words to pass validation.';
      expect(ContentExtractor.isValidContent(validContent)).toBe(true);
    });

    it('should return false for content too short', () => {
      const shortContent = 'Short';
      expect(ContentExtractor.isValidContent(shortContent)).toBe(false);
    });

    it('should return false for content with too few words', () => {
      const fewWordsContent = 'This content has exactly nine words'; // 6 words, not enough
      expect(ContentExtractor.isValidContent(fewWordsContent)).toBe(false);
    });

    it('should return false for empty content', () => {
      expect(ContentExtractor.isValidContent('')).toBe(false);
    });
  });

  describe('cache utility methods', () => {
    it('should warm cache successfully', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      const mockElement = {
        cloneNode: vi.fn(() => ({
          querySelectorAll: vi.fn(() => []),
          textContent: 'This is test article content with more than fifty characters and more than ten words to pass validation.',
        })),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      await ContentExtractor.warmCache(mockContentTarget);

      expect(contentCache.set).toHaveBeenCalled();
    });

    it('should handle cache warming errors gracefully', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      mockDocument.querySelector.mockReturnValue(null); // Will cause error

      // Mock setTimeout to resolve immediately
      vi.spyOn(global, 'setTimeout').mockImplementation((callback: Function) => {
        callback();
        return 1 as any;
      });

      // Should not throw
      await expect(ContentExtractor.warmCache(mockContentTarget)).resolves.toBeUndefined();
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
      const mockStats = { hits: 5, misses: 3, size: 2, hitRate: 62.5 };
      vi.mocked(contentCache.getStats).mockReturnValue(mockStats);

      const stats = ContentExtractor.getCacheStats();

      expect(stats).toEqual(mockStats);
      expect(contentCache.getStats).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle DOM errors gracefully', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      mockDocument.querySelector.mockImplementation(() => {
        throw new Error('DOM error');
      });

      // Mock setTimeout to resolve immediately
      vi.spyOn(global, 'setTimeout').mockImplementation((callback: Function) => {
        callback();
        return 1 as any;
      });

      await expect(
        ContentExtractor.extractPageContent(mockContentTarget)
      ).rejects.toThrow('DOM error');
    });

    it('should handle cloneNode errors', async () => {
      vi.mocked(contentCache.get).mockReturnValue(null);
      
      const mockElement = {
        cloneNode: vi.fn(() => {
          throw new Error('Clone error');
        }),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      await expect(
        ContentExtractor.extractPageContent(mockContentTarget)
      ).rejects.toThrow('Clone error');
    });
  });
});