import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SummariesResponse, RecommendationsResponse } from '../types';

// Mock dependencies
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  desc: vi.fn((field) => ({ field, desc: true })),
  isNull: vi.fn((field) => ({ field, isNull: true })),
  ilike: vi.fn((field, pattern) => ({ field, pattern })),
  and: vi.fn((...conditions) => ({ conditions }))
}));

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => ({}))
}));

// Create mock database instance function
const createMockDb = () => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([]),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  onConflictDoNothing: vi.fn().mockReturnThis(),
  execute: vi.fn().mockResolvedValue({ rows: [] })
});

// Mock drizzle
vi.mock('drizzle-orm/neon-http', () => {
  let mockDb: any;
  return {
    drizzle: vi.fn(() => {
      if (!mockDb) {
        mockDb = createMockDb();
      }
      return mockDb;
    })
  };
});

// Import after mocks are set up
import { DatabaseService, type UICacheData } from './database';
import { drizzle } from 'drizzle-orm/neon-http';

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let mockDb: any;

  const mockWidget = {
    id: 'widget-123',
    userId: null,
    name: 'Widget - https://example.com',
    url: 'https://example.com',
    summaries: { short: 'Short summary', medium: 'Medium summary' },
    recommendations: [
      { title: 'Question 1', description: 'Description 1' },
      { title: 'Question 2', description: 'Description 2' }
    ],
    cacheEnabled: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create new mock db instance
    mockDb = createMockDb();
    vi.mocked(drizzle).mockReturnValue(mockDb);
    
    databaseService = new DatabaseService('postgresql://test');
  });

  describe('constructor', () => {
    it('should initialize database connection', () => {
      expect(databaseService.getDatabase()).toBe(mockDb);
    });
  });

  describe('get', () => {
    it('should retrieve cache data for URL', async () => {
      mockDb.limit.mockResolvedValue([mockWidget]);

      const result = await databaseService.get('https://example.com');

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(1);

      expect(result).toEqual({
        summaries: { short: 'Short summary', medium: 'Medium summary' },
        recommendations: {
          recommendations: mockWidget.recommendations,
          placeholder: "Ask me about this content"
        },
        timestamp: expect.any(Number)
      });
    });

    it('should return null if no cache found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await databaseService.get('https://example.com');

      expect(result).toBeNull();
    });

    it('should handle partial data (no recommendations)', async () => {
      const widgetNoRecs = { ...mockWidget, recommendations: null };
      mockDb.limit.mockResolvedValue([widgetNoRecs]);

      const result = await databaseService.get('https://example.com');

      expect(result).toEqual({
        summaries: { short: 'Short summary', medium: 'Medium summary' },
        recommendations: undefined,
        timestamp: expect.any(Number)
      });
    });

    it('should handle database errors gracefully', async () => {
      mockDb.limit.mockRejectedValue(new Error('Database error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await databaseService.get('https://example.com');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('DatabaseService get error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('setSummaries', () => {
    it('should update existing widget with summaries', async () => {
      mockDb.limit.mockResolvedValue([{ id: 'widget-123' }]);
      const summaries: SummariesResponse = {
        short: 'New short summary',
        medium: 'New medium summary'
      };

      await databaseService.setSummaries('https://example.com', summaries);

      expect(mockDb.select).toHaveBeenCalledWith({ id: expect.anything() });
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({
        summaries,
        updatedAt: expect.any(Date)
      });
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should create new widget if none exists', async () => {
      mockDb.limit.mockResolvedValue([]);
      const summaries: SummariesResponse = {
        short: 'Short summary',
        medium: 'Medium summary'
      };

      await databaseService.setSummaries('https://example.com', summaries);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith({
        userId: null,
        name: 'Widget - https://example.com',
        url: 'https://example.com',
        summaries,
        cacheEnabled: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it('should handle database errors gracefully', async () => {
      mockDb.limit.mockRejectedValue(new Error('Database error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await databaseService.setSummaries('https://example.com', { short: 'Test', medium: 'Test' });

      expect(consoleSpy).toHaveBeenCalledWith('DatabaseService setSummaries error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('setRecommendations', () => {
    it('should update existing widget with recommendations', async () => {
      mockDb.limit.mockResolvedValue([{ id: 'widget-123' }]);
      const recommendations: RecommendationsResponse = {
        recommendations: [
          { title: 'New Q1', description: 'New D1' },
          { title: 'New Q2', description: 'New D2' }
        ],
        placeholder: 'Ask me'
      };

      await databaseService.setRecommendations('https://example.com', recommendations);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({
        recommendations: recommendations.recommendations,
        updatedAt: expect.any(Date)
      });
    });

    it('should create new widget if none exists', async () => {
      mockDb.limit.mockResolvedValue([]);
      const recommendations: RecommendationsResponse = {
        recommendations: [{ title: 'Q1', description: 'D1' }],
        placeholder: 'Ask me'
      };

      await databaseService.setRecommendations('https://example.com', recommendations);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith({
        userId: null,
        name: 'Widget - https://example.com',
        url: 'https://example.com',
        recommendations: recommendations.recommendations,
        cacheEnabled: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('getSummaries', () => {
    it('should retrieve summaries for URL', async () => {
      const summaries = { short: 'Short', medium: 'Medium' };
      mockDb.limit.mockResolvedValue([{ summaries }]);

      const result = await databaseService.getSummaries('https://example.com');

      expect(mockDb.select).toHaveBeenCalledWith({ summaries: expect.anything() });
      expect(result).toEqual(summaries);
    });

    it('should return null if no summaries found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await databaseService.getSummaries('https://example.com');

      expect(result).toBeNull();
    });

    it('should return null if summaries are null', async () => {
      mockDb.limit.mockResolvedValue([{ summaries: null }]);

      const result = await databaseService.getSummaries('https://example.com');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockDb.limit.mockRejectedValue(new Error('Database error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await databaseService.getSummaries('https://example.com');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getRecommendations', () => {
    it('should retrieve recommendations for URL', async () => {
      const recommendations = [
        { title: 'Q1', description: 'D1' },
        { title: 'Q2', description: 'D2' }
      ];
      mockDb.limit.mockResolvedValue([{ recommendations }]);

      const result = await databaseService.getRecommendations('https://example.com');

      expect(result).toEqual({
        recommendations,
        placeholder: "Ask me about this content"
      });
    });

    it('should return null if no recommendations found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await databaseService.getRecommendations('https://example.com');

      expect(result).toBeNull();
    });

    it('should return null if recommendations are null', async () => {
      mockDb.limit.mockResolvedValue([{ recommendations: null }]);

      const result = await databaseService.getRecommendations('https://example.com');

      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should delete widget for URL', async () => {
      await databaseService.clear('https://example.com');

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockDb.where.mockRejectedValue(new Error('Delete error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await databaseService.clear('https://example.com');

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getCacheEnabled', () => {
    it('should return true if cache is enabled', async () => {
      mockDb.limit.mockResolvedValue([{ cacheEnabled: true }]);

      const result = await databaseService.getCacheEnabled('https://example.com');

      expect(result).toBe(true);
    });

    it('should return false if cache is disabled', async () => {
      mockDb.limit.mockResolvedValue([{ cacheEnabled: false }]);

      const result = await databaseService.getCacheEnabled('https://example.com');

      expect(result).toBe(false);
    });

    it('should return false if widget not found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await databaseService.getCacheEnabled('https://example.com');

      expect(result).toBe(false);
    });

    it('should handle errors and return false', async () => {
      mockDb.limit.mockRejectedValue(new Error('Database error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await databaseService.getCacheEnabled('https://example.com');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('setCacheEnabled', () => {
    it('should update cache setting for existing widget', async () => {
      mockDb.limit.mockResolvedValue([{ id: 'widget-123' }]);

      await databaseService.setCacheEnabled('https://example.com', true);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({
        cacheEnabled: true,
        updatedAt: expect.any(Date)
      });
    });

    it('should create new widget with cache setting', async () => {
      mockDb.limit.mockResolvedValue([]);

      await databaseService.setCacheEnabled('https://example.com', false);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith({
        userId: null,
        name: 'Widget - https://example.com',
        url: 'https://example.com',
        cacheEnabled: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('ensureUrlTracked', () => {
    it('should do nothing if URL already tracked', async () => {
      mockDb.limit.mockResolvedValue([{ url: 'https://example.com' }]);

      await databaseService.ensureUrlTracked('https://example.com');

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should create widget if URL not tracked', async () => {
      mockDb.limit.mockResolvedValue([]);

      await databaseService.ensureUrlTracked('https://example.com');

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith({
        userId: null,
        name: 'Widget - https://example.com',
        url: 'https://example.com',
        cacheEnabled: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
      expect(mockDb.onConflictDoNothing).toHaveBeenCalled();
    });
  });

  describe('listCachedUrls', () => {
    it('should return list of cached URLs', async () => {
      mockDb.orderBy.mockResolvedValue([
        { url: 'https://example1.com' },
        { url: 'https://example2.com' },
        { url: null },
        { url: 'https://example3.com' }
      ]);

      const result = await databaseService.listCachedUrls();

      expect(mockDb.select).toHaveBeenCalledWith({ url: expect.anything() });
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(result).toEqual([
        'https://example1.com',
        'https://example2.com',
        'https://example3.com'
      ]);
    });

    it('should return empty array on error', async () => {
      mockDb.orderBy.mockRejectedValue(new Error('Database error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await databaseService.listCachedUrls();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      mockDb.orderBy.mockResolvedValue([
        { url: 'https://example1.com', cacheEnabled: true },
        { url: 'https://example2.com', cacheEnabled: false },
        { url: 'https://example3.com', cacheEnabled: true },
        { url: null, cacheEnabled: true }
      ]);

      const result = await databaseService.getCacheStats();

      expect(result).toEqual({
        totalCached: 4,
        enabledUrls: ['https://example1.com', 'https://example3.com'],
        disabledUrls: ['https://example2.com']
      });
    });

    it('should handle empty results', async () => {
      mockDb.orderBy.mockResolvedValue([]);

      const result = await databaseService.getCacheStats();

      expect(result).toEqual({
        totalCached: 0,
        enabledUrls: [],
        disabledUrls: []
      });
    });

    it('should return default stats on error', async () => {
      mockDb.orderBy.mockRejectedValue(new Error('Database error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await databaseService.getCacheStats();

      expect(result).toEqual({
        totalCached: 0,
        enabledUrls: [],
        disabledUrls: []
      });
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('clearAll', () => {
    it('should delete all widgets without userId', async () => {
      await databaseService.clearAll();

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockDb.where.mockRejectedValue(new Error('Delete error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await databaseService.clearAll();

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('searchEmbeddings', () => {
    it('should search embeddings by widget ID and query', async () => {
      const mockEmbeddings = [
        { id: 'emb-1', widgetId: 'widget-123', contentChunk: 'Test content 1' },
        { id: 'emb-2', widgetId: 'widget-123', contentChunk: 'Test content 2' }
      ];
      mockDb.limit.mockResolvedValue(mockEmbeddings);

      const result = await databaseService.searchEmbeddings('widget-123', 'test', 5);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockEmbeddings);
    });

    it('should use default limit of 10', async () => {
      mockDb.limit.mockResolvedValue([]);

      await databaseService.searchEmbeddings('widget-123', 'query');

      expect(mockDb.limit).toHaveBeenCalledWith(10);
    });

    it('should return empty array on error', async () => {
      mockDb.limit.mockRejectedValue(new Error('Search error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await databaseService.searchEmbeddings('widget-123', 'query');

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('searchEmbeddingsByUrl', () => {
    it('should search embeddings by URL', async () => {
      // First mock getting widget ID
      mockDb.limit
        .mockResolvedValueOnce([{ id: 'widget-123' }])
        .mockResolvedValueOnce([
          { id: 'emb-1', contentChunk: 'Test content' }
        ]);

      const result = await databaseService.searchEmbeddingsByUrl('https://example.com', 'test', 5);

      expect(mockDb.select).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
    });

    it('should return empty array if widget not found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await databaseService.searchEmbeddingsByUrl('https://example.com', 'test');

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      mockDb.limit.mockRejectedValue(new Error('Database error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await databaseService.searchEmbeddingsByUrl('https://example.com', 'test');

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('database connection', () => {
    it('should handle database connection failures', async () => {
      // Reset mock to return a valid db that fails on operations
      mockDb = createMockDb();
      mockDb.select.mockImplementation(() => {
        throw new Error('Failed to connect to database: ECONNREFUSED');
      });
      vi.mocked(drizzle).mockReturnValue(mockDb);
      
      const service = new DatabaseService('postgresql://invalid');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await service.get('https://example.com');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('DatabaseService get error:', expect.objectContaining({
        message: 'Failed to connect to database: ECONNREFUSED'
      }));
      
      consoleSpy.mockRestore();
    });


    it('should handle connection pool exhaustion', async () => {
      // Reset mock to return a valid db
      mockDb = createMockDb();
      vi.mocked(drizzle).mockReturnValue(mockDb);
      
      const service = new DatabaseService('postgresql://test');
      
      // Mock a connection pool exhaustion error
      mockDb.limit.mockRejectedValue(new Error('Connection pool exhausted'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await service.get('https://example.com');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('DatabaseService get error:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle transaction rollbacks', async () => {
      // Reset mock to return a valid db  
      mockDb = createMockDb();
      vi.mocked(drizzle).mockReturnValue(mockDb);
      
      const service = new DatabaseService('postgresql://test');
      
      // Mock a transaction that fails partway through
      mockDb.limit.mockResolvedValueOnce([{ id: 'widget-123' }]);
      mockDb.set.mockRejectedValue(new Error('Constraint violation'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await service.setSummaries('https://example.com', { short: 'Test', medium: 'Test' });
      
      expect(consoleSpy).toHaveBeenCalledWith('DatabaseService setSummaries error:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle database timeout errors', async () => {
      // Reset mock to return a valid db
      mockDb = createMockDb();
      vi.mocked(drizzle).mockReturnValue(mockDb);
      
      const service = new DatabaseService('postgresql://test');
      
      // Mock a timeout error
      mockDb.limit.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout after 30000ms')), 10)
        )
      );
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await service.get('https://example.com');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('DatabaseService get error:', expect.objectContaining({
        message: 'Query timeout after 30000ms'
      }));
      
      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle very long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2000);
      mockDb.limit.mockResolvedValue([mockWidget]);
      
      const result = await databaseService.get(longUrl);
      
      expect(mockDb.where).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle special characters in URLs', async () => {
      const specialUrl = 'https://example.com/path?param=value&special=<script>alert("xss")</script>';
      mockDb.limit.mockResolvedValue([mockWidget]);
      
      const result = await databaseService.get(specialUrl);
      
      expect(mockDb.where).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle concurrent operations', async () => {
      mockDb.limit.mockResolvedValue([mockWidget]);
      
      const urls = Array(10).fill(null).map((_, i) => `https://example${i}.com`);
      const promises = urls.map(url => databaseService.get(url));
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      expect(mockDb.select).toHaveBeenCalledTimes(10);
    });

    it('should handle very large summaries', async () => {
      const largeSummaries = {
        short: 'x'.repeat(10000),
        medium: 'y'.repeat(50000)
      };
      
      mockDb.limit.mockResolvedValue([]);
      
      await databaseService.setSummaries('https://example.com', largeSummaries);
      
      expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
        summaries: largeSummaries
      }));
    });

    it('should handle null/undefined values in data', async () => {
      const widgetWithNulls = {
        ...mockWidget,
        summaries: { short: null, medium: undefined },
        recommendations: [
          { title: null, description: 'Test' },
          { title: 'Test', description: undefined }
        ]
      };
      
      mockDb.limit.mockResolvedValue([widgetWithNulls]);
      
      const result = await databaseService.get('https://example.com');
      
      expect(result).toBeDefined();
      expect(result.summaries).toBeDefined();
    });
  });
});