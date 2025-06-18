import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SummariesService } from './summaries';
import { OpenAIService } from './openai';
import type { Context } from 'hono';
import type { Env } from '../types';

describe('SummariesService', () => {
  let summariesService: SummariesService;
  let mockOpenAI: OpenAIService;
  let mockContext: Context<{ Bindings: Env }>;

  beforeEach(() => {
    mockOpenAI = {
      generateBatchSummaries: vi.fn(),
    } as any;

    summariesService = new SummariesService(mockOpenAI);

    mockContext = {
      req: {
        method: 'POST',
        json: vi.fn(),
        raw: { signal: new AbortController().signal },
      },
      json: vi.fn(),
    } as any;
  });

  describe('handleSummaries', () => {
    it('should generate both short and medium summaries successfully', async () => {
      const mockSummaries = {
        short: 'This is a short summary.',
        medium: 'This is a medium summary with more details about the content.'
      };

      mockContext.req.json = vi.fn().mockResolvedValue({
        content: 'Sample content to summarize',
        url: 'https://example.com',
        title: 'Sample Article'
      });

      (mockOpenAI.generateBatchSummaries as any).mockResolvedValue(mockSummaries);

      await summariesService.handleSummaries(mockContext);

      expect(mockContext.req.json).toHaveBeenCalled();
      expect(mockOpenAI.generateBatchSummaries).toHaveBeenCalledWith(
        'Sample content to summarize',
        'Sample Article',
        'https://example.com',
        mockContext.req.raw.signal
      );
      expect(mockContext.json).toHaveBeenCalledWith({
        short: 'This is a short summary.',
        medium: 'This is a medium summary with more details about the content.'
      });
    });

    it('should return 400 error for invalid content', async () => {
      mockContext.req.json = vi.fn().mockResolvedValue({
        content: '',
        url: 'https://example.com',
        title: 'Sample Article'
      });

      await summariesService.handleSummaries(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Invalid content" },
        400
      );
    });

    it('should return 400 error for missing content', async () => {
      mockContext.req.json = vi.fn().mockResolvedValue({
        url: 'https://example.com',
        title: 'Sample Article'
      });

      await summariesService.handleSummaries(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Invalid content" },
        400
      );
    });

    it('should handle OpenAI service errors gracefully', async () => {
      mockContext.req.json = vi.fn().mockResolvedValue({
        content: 'Sample content to summarize',
        url: 'https://example.com',
        title: 'Sample Article'
      });

      (mockOpenAI.generateBatchSummaries as any).mockRejectedValue(
        new Error('OpenAI API error')
      );

      await summariesService.handleSummaries(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        error: "Internal server error",
        short: "Unable to generate short summary.",
        medium: "Unable to generate medium summary."
      }, 500);
    });

    it('should handle network timeout errors', async () => {
      mockContext.req.json = vi.fn().mockResolvedValue({
        content: 'Sample content to summarize',
        url: 'https://example.com',
        title: 'Sample Article'
      });

      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'AbortError';
      (mockOpenAI.generateBatchSummaries as any).mockRejectedValue(timeoutError);

      await summariesService.handleSummaries(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        error: "Internal server error",
        short: "Unable to generate short summary.",
        medium: "Unable to generate medium summary."
      }, 500);
    });

    it('should work with optional url and title parameters', async () => {
      const mockSummaries = {
        short: 'Short summary without metadata.',
        medium: 'Medium summary without metadata.'
      };

      mockContext.req.json = vi.fn().mockResolvedValue({
        content: 'Sample content to summarize'
      });

      (mockOpenAI.generateBatchSummaries as any).mockResolvedValue(mockSummaries);

      await summariesService.handleSummaries(mockContext);

      expect(mockOpenAI.generateBatchSummaries).toHaveBeenCalledWith(
        'Sample content to summarize',
        '',
        '',
        mockContext.req.raw.signal
      );
      expect(mockContext.json).toHaveBeenCalledWith(mockSummaries);
    });
  });

  describe('error handling', () => {
    it('should handle non-POST methods', async () => {
      (mockContext.req as any).method = 'GET';

      await summariesService.handleSummaries(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Method not allowed" },
        405
      );
    });

    it('should handle malformed JSON requests', async () => {
      mockContext.req.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));

      await summariesService.handleSummaries(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        error: "Internal server error",
        short: "Unable to generate short summary.",
        medium: "Unable to generate medium summary."
      }, 500);
    });
  });
});