import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SelectorAnalysisService } from './selector-analysis';
import { OpenAIService } from './openai';
import { DatabaseService } from './database';
import type { Context } from 'hono';
import type { SelectorAnalysisRequest, Env } from '../types';

// Mock dependencies
vi.mock('./openai');
vi.mock('./database');
vi.mock('./common', () => ({
  ServiceValidation: {
    validatePostMethod: vi.fn(),
    parseRequestBody: vi.fn()
  },
  ErrorHandler: {
    handleAbortError: vi.fn().mockReturnValue({ json: vi.fn() }),
    handleGeneralError: vi.fn().mockReturnValue({ json: vi.fn() })
  }
}));

import { ServiceValidation, ErrorHandler } from './common';

describe('SelectorAnalysisService', () => {
  let selectorAnalysisService: SelectorAnalysisService;
  let mockOpenAIService: OpenAIService;
  let mockDatabase: DatabaseService;
  let mockContext: any;

  const mockAnalysisResult = {
    contentSelector: 'main.content-area',
    reasoning: 'The main content area is clearly identified by the main tag with content-area class'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock OpenAI service
    mockOpenAIService = {
      analyzeHtmlStructure: vi.fn().mockResolvedValue(mockAnalysisResult)
    } as any;

    // Mock database service
    mockDatabase = {
      ensureUrlTracked: vi.fn().mockResolvedValue(undefined)
    } as any;

    // Mock Hono context
    mockContext = {
      json: vi.fn().mockReturnValue({ json: 'response' }),
      req: {
        raw: {
          signal: new AbortController().signal
        }
      }
    };

    selectorAnalysisService = new SelectorAnalysisService(mockOpenAIService, mockDatabase);
  });

  describe('handle', () => {
    it('should analyze HTML structure successfully', async () => {
      const request: SelectorAnalysisRequest = {
        html: '<main class="content-area"><h1>Title</h1><p>Content</p></main>',
        title: 'Test Page',
        url: 'https://example.com'
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      const response = await selectorAnalysisService.handle(mockContext);

      expect(ServiceValidation.validatePostMethod).toHaveBeenCalledWith(mockContext);
      expect(ServiceValidation.parseRequestBody).toHaveBeenCalledWith(mockContext);
      
      expect(mockOpenAIService.analyzeHtmlStructure).toHaveBeenCalledWith(
        request.html,
        request.title,
        request.url,
        mockContext.req.raw.signal
      );

      expect(mockDatabase.ensureUrlTracked).toHaveBeenCalledWith(request.url);

      expect(mockContext.json).toHaveBeenCalledWith({
        contentSelector: mockAnalysisResult.contentSelector,
        reasoning: mockAnalysisResult.reasoning
      });

      expect(response).toEqual({ json: 'response' });
    });

    it('should handle missing HTML content', async () => {
      const request = {
        title: 'Test Page',
        url: 'https://example.com'
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      const response = await selectorAnalysisService.handle(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'HTML content is required' },
        400
      );
      expect(mockOpenAIService.analyzeHtmlStructure).not.toHaveBeenCalled();
    });

    it('should handle non-string HTML content', async () => {
      const request = {
        html: { invalid: 'html' },
        title: 'Test Page'
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      const response = await selectorAnalysisService.handle(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'HTML content is required' },
        400
      );
    });

    it('should trim large HTML content', async () => {
      const largeHtml = 'a'.repeat(15000); // 15KB of content
      const request: SelectorAnalysisRequest = {
        html: largeHtml,
        title: 'Test Page',
        url: 'https://example.com'
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      await selectorAnalysisService.handle(mockContext);

      expect(mockOpenAIService.analyzeHtmlStructure).toHaveBeenCalledWith(
        largeHtml.slice(0, 10000), // Should be trimmed to 10KB
        request.title,
        request.url,
        mockContext.req.raw.signal
      );
    });

    it('should handle missing optional fields', async () => {
      const request: SelectorAnalysisRequest = {
        html: '<div>Content</div>'
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      await selectorAnalysisService.handle(mockContext);

      expect(mockOpenAIService.analyzeHtmlStructure).toHaveBeenCalledWith(
        request.html,
        '', // Default empty title
        '', // Default empty URL
        mockContext.req.raw.signal
      );

      expect(mockDatabase.ensureUrlTracked).not.toHaveBeenCalled(); // No URL provided
    });

    it('should work without database service', async () => {
      const serviceWithoutDb = new SelectorAnalysisService(mockOpenAIService);
      const request: SelectorAnalysisRequest = {
        html: '<main>Content</main>',
        url: 'https://example.com'
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      await serviceWithoutDb.handle(mockContext);

      expect(mockDatabase.ensureUrlTracked).not.toHaveBeenCalled();
    });

    it('should handle abort errors', async () => {
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      
      vi.mocked(ServiceValidation.parseRequestBody).mockRejectedValue(abortError);

      await selectorAnalysisService.handle(mockContext);

      expect(ErrorHandler.handleAbortError).toHaveBeenCalledWith(mockContext);
    });

    it('should handle general errors', async () => {
      const error = new Error('Analysis failed');
      
      vi.mocked(ServiceValidation.parseRequestBody).mockRejectedValue(error);

      await selectorAnalysisService.handle(mockContext);

      expect(ErrorHandler.handleGeneralError).toHaveBeenCalledWith(
        mockContext,
        error,
        'Selector analysis service error:',
        {
          error: 'Failed to analyze HTML structure',
          contentSelector: 'main',
          reasoning: 'Unable to analyze content structure'
        }
      );
    });

    it('should handle OpenAI service errors', async () => {
      const request: SelectorAnalysisRequest = {
        html: '<main>Content</main>'
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);
      mockOpenAIService.analyzeHtmlStructure = vi.fn().mockRejectedValue(new Error('OpenAI error'));

      await selectorAnalysisService.handle(mockContext);

      expect(ErrorHandler.handleGeneralError).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const request: SelectorAnalysisRequest = {
        html: '<main>Content</main>',
        url: 'https://example.com'
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);
      mockDatabase.ensureUrlTracked = vi.fn().mockRejectedValue(new Error('DB error'));

      await selectorAnalysisService.handle(mockContext);

      // Database errors are caught by the outer catch and handled as general errors
      expect(ErrorHandler.handleGeneralError).toHaveBeenCalledWith(
        mockContext,
        expect.any(Error),
        'Selector analysis service error:',
        {
          error: 'Failed to analyze HTML structure',
          contentSelector: 'main',
          reasoning: 'Unable to analyze content structure'
        }
      );
    });

    it('should log selector generation', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const request: SelectorAnalysisRequest = {
        html: '<main>Content</main>'
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      await selectorAnalysisService.handle(mockContext);

      expect(consoleSpy).toHaveBeenCalledWith('Analyzing HTML structure for selector generation');
      expect(consoleSpy).toHaveBeenCalledWith(`Generated selector: ${mockAnalysisResult.contentSelector}`);

      consoleSpy.mockRestore();
    });

    it('should log errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      
      vi.mocked(ServiceValidation.parseRequestBody).mockRejectedValue(error);

      await selectorAnalysisService.handle(mockContext);

      expect(consoleSpy).toHaveBeenCalledWith('Selector analysis service error:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle empty HTML', async () => {
      const request: SelectorAnalysisRequest = {
        html: ''
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      await selectorAnalysisService.handle(mockContext);

      // Empty string is falsy, so it should fail the validation
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'HTML content is required' },
        400
      );
      expect(mockOpenAIService.analyzeHtmlStructure).not.toHaveBeenCalled();
    });

    it('should handle HTML with only whitespace', async () => {
      const request: SelectorAnalysisRequest = {
        html: '   \n\t   '
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      await selectorAnalysisService.handle(mockContext);

      expect(mockOpenAIService.analyzeHtmlStructure).toHaveBeenCalledWith(
        '   \n\t   ',
        '',
        '',
        expect.any(Object)
      );
    });

    it('should handle very complex selectors', async () => {
      const complexResult = {
        contentSelector: 'body > div.wrapper > main#content > article.post:not(.sidebar) > div.content-wrapper',
        reasoning: 'Complex page structure requires specific selector path'
      };

      mockOpenAIService.analyzeHtmlStructure = vi.fn().mockResolvedValue(complexResult);

      const request: SelectorAnalysisRequest = {
        html: '<div class="wrapper"><main id="content">...</main></div>'
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      await selectorAnalysisService.handle(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        contentSelector: complexResult.contentSelector,
        reasoning: complexResult.reasoning
      });
    });

    it('should handle malformed HTML gracefully', async () => {
      const malformedHTML = '<div><p>Unclosed tags<div>More content<span>Nested without closing';
      const request: SelectorAnalysisRequest = {
        html: malformedHTML,
        title: 'Malformed Page'
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      await selectorAnalysisService.handle(mockContext);

      expect(mockOpenAIService.analyzeHtmlStructure).toHaveBeenCalledWith(
        malformedHTML,
        'Malformed Page',
        '',
        expect.any(Object)
      );
      
      expect(mockContext.json).toHaveBeenCalledWith({
        contentSelector: mockAnalysisResult.contentSelector,
        reasoning: mockAnalysisResult.reasoning
      });
    });

    it('should handle deeply nested HTML structures', async () => {
      const deepHTML = Array(20).fill('<div>').join('') + 'Deep Content' + Array(20).fill('</div>').join('');
      const request: SelectorAnalysisRequest = {
        html: deepHTML,
        url: 'https://example.com/deep'
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      await selectorAnalysisService.handle(mockContext);

      expect(mockOpenAIService.analyzeHtmlStructure).toHaveBeenCalled();
      expect(mockDatabase.ensureUrlTracked).toHaveBeenCalledWith('https://example.com/deep');
    });

    it('should handle HTML with special characters and entities', async () => {
      const specialHTML = '<div data-content="&lt;script&gt;alert(&apos;test&apos;)&lt;/script&gt;">Special &amp; Entities</div>';
      const request: SelectorAnalysisRequest = {
        html: specialHTML
      };

      vi.mocked(ServiceValidation.parseRequestBody).mockResolvedValue(request);

      await selectorAnalysisService.handle(mockContext);

      expect(mockOpenAIService.analyzeHtmlStructure).toHaveBeenCalledWith(
        specialHTML,
        '',
        '',
        expect.any(Object)
      );
    });
  });
});