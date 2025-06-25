import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VectorSearchService, type EmbeddingChunk, type SearchResult } from './vector-search';
import { DatabaseService } from './database';
import type { NewWidgetEmbedding } from '../db/schema';

// Mock OpenAI
const mockEmbeddingsCreate = vi.fn();
vi.mock('openai', () => {
  return {
    OpenAI: class MockOpenAI {
      embeddings = {
        create: mockEmbeddingsCreate
      };
      constructor(config: any) {
        // Constructor takes config with apiKey
      }
    }
  };
});

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  desc: vi.fn((field) => ({ field, desc: true })),
  sql: vi.fn((strings, ...values) => ({
    strings,
    values,
    as: vi.fn(() => ({ strings, values }))
  }))
}));

// Mock DatabaseService
vi.mock('./database');

describe('VectorSearchService', () => {
  let vectorSearchService: VectorSearchService;
  let mockDatabase: DatabaseService;
  let mockDb: any;

  const mockEmbedding = Array(1536).fill(0.1); // text-embedding-3-small returns 1536 dimensions

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock response for embeddings.create
    mockEmbeddingsCreate.mockResolvedValue({
      data: [{ embedding: mockEmbedding }]
    });

    // Create mock database query builder
    mockDb = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue(undefined),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([])
    };

    // Mock database service
    mockDatabase = {
      getDatabase: vi.fn().mockReturnValue(mockDb)
    } as any;

    // Create service instance
    vectorSearchService = new VectorSearchService('test-api-key', mockDatabase);
  });

  describe('chunkText', () => {
    it('should return empty array for empty text', async () => {
      const result = await vectorSearchService.chunkText('');
      expect(result).toEqual([]);
    });

    it('should return empty array for null/undefined text', async () => {
      const result = await vectorSearchService.chunkText(null as any);
      expect(result).toEqual([]);
    });

    it('should return single chunk for small text', async () => {
      const text = 'This is a small piece of text that fits in one chunk.';
      const result = await vectorSearchService.chunkText(text, 100);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        text: text,
        metadata: {
          chunkIndex: 0,
          source: 'text'
        }
      });
    });

    it('should create multiple overlapping chunks for large text', async () => {
      const words = Array(300).fill('word');
      const text = words.join(' ');
      
      const result = await vectorSearchService.chunkText(text, 100, 20);

      expect(result.length).toBeGreaterThan(1);
      expect(result[0].metadata.chunkIndex).toBe(0);
      expect(result[1].metadata.chunkIndex).toBe(1);
      
      // Check overlap exists
      const firstChunkWords = result[0].text.split(' ');
      const secondChunkWords = result[1].text.split(' ');
      expect(firstChunkWords.length).toBe(100);
      expect(secondChunkWords.length).toBeLessThanOrEqual(100);
    });

    it('should handle very large chunks by reducing size', async () => {
      // Create text that would exceed token limit (more than 7500 tokens in a single chunk)
      // We need enough words to fill the maxWords parameter
      const largeWord = 'a'.repeat(600); // Each word ~171 tokens
      const words = Array(60).fill(largeWord); // We'll chunk 50 words at a time
      const text = words.join(' ');
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // With maxWords=50, the first chunk will have 50 words * 171 tokens = ~8550 tokens
      const result = await vectorSearchService.chunkText(text, 50, 10);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('tokens, splitting further'));
      expect(result.length).toBeGreaterThan(0);
      
      consoleSpy.mockRestore();
    });
  });

  describe('generateEmbedding', () => {
    it('should generate embedding for text', async () => {
      const text = 'Test text for embedding';
      const result = await vectorSearchService.generateEmbedding(text);

      expect(mockEmbeddingsCreate).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
      });
      expect(result).toEqual(mockEmbedding);
    });

    it('should clean text before embedding', async () => {
      const text = 'Text\nwith\nnewlines\n';
      await vectorSearchService.generateEmbedding(text);

      expect(mockEmbeddingsCreate).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'Text with newlines',
        encoding_format: 'float'
      });
    });

    it('should truncate very large text', async () => {
      const largeText = 'a'.repeat(30000); // Very large text
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await vectorSearchService.generateEmbedding(largeText);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('tokens, truncating...'));
      const callArgs = mockEmbeddingsCreate.mock.calls[0][0];
      expect(callArgs.input.length).toBeLessThan(largeText.length);
      
      consoleSpy.mockRestore();
    });

    it('should handle OpenAI API errors', async () => {
      const openaiInstance = (vectorSearchService as any).openai;
      openaiInstance.embeddings.create.mockRejectedValue(new Error('API Error'));

      await expect(
        vectorSearchService.generateEmbedding('test')
      ).rejects.toThrow('Failed to generate embedding');
    });

    it('should handle OpenAI rate limit errors', async () => {
      const openaiInstance = (vectorSearchService as any).openai;
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).response = { status: 429 };
      openaiInstance.embeddings.create.mockRejectedValue(rateLimitError);
      
      await expect(
        vectorSearchService.generateEmbedding('test')
      ).rejects.toThrow('Failed to generate embedding');
    });

    it('should handle network timeouts', async () => {
      const openaiInstance = (vectorSearchService as any).openai;
      openaiInstance.embeddings.create.mockImplementation(() => 
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10))
      );
      
      await expect(
        vectorSearchService.generateEmbedding('test')
      ).rejects.toThrow('Failed to generate embedding');
    });
  });

  describe('createEmbeddingsForWidget', () => {
    it('should create embeddings for widget content', async () => {
      const widgetId = 'widget-123';
      const content = 'This is test content for the widget';
      
      await vectorSearchService.createEmbeddingsForWidget(widgetId, content, 'manual');

      expect(mockEmbeddingsCreate).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith([
        {
          widgetId,
          fileId: undefined,
          contentChunk: content,
          embedding: mockEmbedding,
          metadata: {
            chunkIndex: 0,
            source: 'manual'
          }
        }
      ]);
    });

    it('should create multiple embeddings for large content', async () => {
      const widgetId = 'widget-123';
      // Create content that exceeds the default chunk size of 2000 words
      const words = Array(5000).fill('word');
      const content = words.join(' ');
      
      await vectorSearchService.createEmbeddingsForWidget(widgetId, content);

      const embeddings = mockDb.values.mock.calls[0][0];
      expect(embeddings.length).toBeGreaterThan(1);
      expect(embeddings[0].widgetId).toBe(widgetId);
      expect(embeddings[0].metadata.chunkIndex).toBe(0);
      expect(embeddings[1].metadata.chunkIndex).toBe(1);
    });

    it('should include fileId when provided', async () => {
      const widgetId = 'widget-123';
      const fileId = 'file-456';
      const content = 'File content';
      
      await vectorSearchService.createEmbeddingsForWidget(widgetId, content, 'file', fileId);

      expect(mockDb.values).toHaveBeenCalledWith([
        expect.objectContaining({
          widgetId,
          fileId,
          contentChunk: content
        })
      ]);
    });
  });

  describe('searchSimilarContent', () => {
    it('should search for similar content', async () => {
      const query = 'search query';
      const mockResults = [
        {
          id: 'emb-1',
          widgetId: 'widget-123',
          contentChunk: 'Similar content 1',
          metadata: { chunkIndex: 0, source: 'text' },
          similarity: 0.9
        },
        {
          id: 'emb-2',
          widgetId: 'widget-123',
          contentChunk: 'Similar content 2',
          metadata: { chunkIndex: 1, source: 'text' },
          similarity: 0.8
        }
      ];
      
      mockDb.limit.mockResolvedValue(mockResults);

      const results = await vectorSearchService.searchSimilarContent(query);

      expect(mockEmbeddingsCreate).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float'
      });
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(10);

      expect(results).toEqual([
        {
          chunk: 'Similar content 1',
          similarity: 0.9,
          metadata: { chunkIndex: 0, source: 'text' },
          widgetId: 'widget-123'
        },
        {
          chunk: 'Similar content 2',
          similarity: 0.8,
          metadata: { chunkIndex: 1, source: 'text' },
          widgetId: 'widget-123'
        }
      ]);
    });

    it('should filter by widgetId when provided', async () => {
      const query = 'search query';
      const widgetId = 'widget-123';
      mockDb.limit.mockResolvedValue([]);

      await vectorSearchService.searchSimilarContent(query, widgetId, 5);

      expect(mockDb.where).toHaveBeenCalledTimes(2); // Once for threshold, once for widgetId
      expect(mockDb.limit).toHaveBeenCalledWith(5);
    });

    it('should use custom limit and threshold', async () => {
      const query = 'search query';
      mockDb.limit.mockResolvedValue([]);

      await vectorSearchService.searchSimilarContent(query, undefined, 20, 0.5);

      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(20);
    });

    it('should handle empty results', async () => {
      mockDb.limit.mockResolvedValue([]);

      const results = await vectorSearchService.searchSimilarContent('query');

      expect(results).toEqual([]);
    });
  });

  describe('deleteEmbeddingsForWidget', () => {
    it('should delete all embeddings for a widget', async () => {
      const widgetId = 'widget-123';

      await vectorSearchService.deleteEmbeddingsForWidget(widgetId);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('deleteEmbeddingsForFile', () => {
    it('should delete embeddings for specific file', async () => {
      const widgetId = 'widget-123';
      const fileId = 'file-456';

      await vectorSearchService.deleteEmbeddingsForFile(widgetId, fileId);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      const widgetId = 'widget-123';
      const fileId = 'file-456';
      mockDb.where.mockRejectedValue(new Error('Delete failed'));

      await expect(
        vectorSearchService.deleteEmbeddingsForFile(widgetId, fileId)
      ).rejects.toThrow('Failed to delete embeddings for file');
    });
  });

  describe('getEmbeddingsCount', () => {
    it('should return embeddings count for widget', async () => {
      mockDb.where.mockResolvedValue([{ count: 42 }]);

      const count = await vectorSearchService.getEmbeddingsCount('widget-123');

      expect(mockDb.select).toHaveBeenCalledWith({ count: expect.anything() });
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(count).toBe(42);
    });

    it('should return 0 if no embeddings found', async () => {
      mockDb.where.mockResolvedValue([]);

      const count = await vectorSearchService.getEmbeddingsCount('widget-123');

      expect(count).toBe(0);
    });

    it('should return 0 if count is null', async () => {
      mockDb.where.mockResolvedValue([{ count: null }]);

      const count = await vectorSearchService.getEmbeddingsCount('widget-123');

      expect(count).toBe(0);
    });
  });

  describe('createEmbeddingsFromOCRPages', () => {
    it('should create embeddings for OCR pages', async () => {
      const widgetId = 'widget-123';
      const fileId = 'file-456';
      const pages = [
        { pageNumber: 1, markdown: 'Page 1 content' },
        { pageNumber: 2, markdown: 'Page 2 content' }
      ];

      await vectorSearchService.createEmbeddingsFromOCRPages(widgetId, fileId, pages);

      expect(mockEmbeddingsCreate).toHaveBeenCalledTimes(2);
      const embeddings = mockDb.values.mock.calls[0][0];
      expect(embeddings).toHaveLength(2);
      expect(embeddings[0]).toMatchObject({
        widgetId,
        fileId,
        contentChunk: 'Page 1 content',
        metadata: {
          chunkIndex: 0,
          source: 'page_1',
          pageNumber: 1
        }
      });
      expect(embeddings[1]).toMatchObject({
        widgetId,
        fileId,
        contentChunk: 'Page 2 content',
        metadata: {
          chunkIndex: 0,
          source: 'page_2',
          pageNumber: 2
        }
      });
    });

    it('should skip empty pages', async () => {
      const pages = [
        { pageNumber: 1, markdown: 'Page 1 content' },
        { pageNumber: 2, markdown: '' },
        { pageNumber: 3, markdown: '   ' },
        { pageNumber: 4, markdown: 'Page 4 content' }
      ];

      await vectorSearchService.createEmbeddingsFromOCRPages('widget-123', 'file-456', pages);

      expect(mockEmbeddingsCreate).toHaveBeenCalledTimes(2); // Only pages 1 and 4
      const embeddings = mockDb.values.mock.calls[0][0];
      expect(embeddings).toHaveLength(2);
    });

    it('should handle pages with multiple chunks', async () => {
      // Create content that exceeds the default chunk size of 2000 words
      const words = Array(5000).fill('word');
      const longContent = words.join(' ');
      const pages = [
        { pageNumber: 1, markdown: longContent }
      ];

      await vectorSearchService.createEmbeddingsFromOCRPages('widget-123', 'file-456', pages);

      const embeddings = mockDb.values.mock.calls[0][0];
      expect(embeddings.length).toBeGreaterThan(1);
      expect(embeddings[0].metadata.pageNumber).toBe(1);
      expect(embeddings[1].metadata.pageNumber).toBe(1);
      expect(embeddings[0].metadata.source).toBe('page_1');
      expect(embeddings[1].metadata.source).toBe('page_1');
    });

    it('should not insert if no valid pages', async () => {
      const pages = [
        { pageNumber: 1, markdown: '' },
        { pageNumber: 2, markdown: '   ' }
      ];

      await vectorSearchService.createEmbeddingsFromOCRPages('widget-123', 'file-456', pages);

      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('estimateTokenCount', () => {
    it('should estimate token count based on character length', () => {
      const service = vectorSearchService as any;
      
      expect(service.estimateTokenCount('Hello')).toBe(2); // 5 chars / 3.5 ≈ 2
      expect(service.estimateTokenCount('Hello world')).toBe(4); // 11 chars / 3.5 ≈ 4
      expect(service.estimateTokenCount('')).toBe(0);
    });
  });
});