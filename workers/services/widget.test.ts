import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WidgetService, type CreateWidgetRequest, type UpdateWidgetRequest } from './widget';
import { DatabaseService } from './database';
import { VectorSearchService } from './vector-search';
import { FileStorageService } from './file-storage';
import type { Widget, NewWidget } from '../db/schema';

// Mock dependencies
vi.mock('./database');
vi.mock('./vector-search');
vi.mock('./file-storage');
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  and: vi.fn((...conditions) => ({ conditions })),
  desc: vi.fn((field) => ({ field, desc: true })),
  sql: vi.fn((strings, ...values) => ({
    strings,
    values,
    as: vi.fn(() => ({ strings, values }))
  }))
}));

describe('WidgetService', () => {
  let widgetService: WidgetService;
  let mockDatabase: DatabaseService;
  let mockVectorSearch: VectorSearchService;
  let mockFileStorage: FileStorageService;
  let mockDb: any;

  const mockWidget: Widget = {
    id: 'widget-123',
    userId: 'user-123',
    name: 'Test Widget',
    description: 'Test description',
    url: 'https://example.com',
    isPublic: false,
    cacheEnabled: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock database query builder
    mockDb = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([mockWidget]),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue({ rows: [] })
    };

    // Mock database service
    mockDatabase = {
      getDatabase: vi.fn().mockReturnValue(mockDb)
    } as any;

    // Mock vector search service
    mockVectorSearch = {
      createEmbeddingsForWidget: vi.fn().mockResolvedValue(undefined),
      getEmbeddingsCount: vi.fn().mockResolvedValue(5),
      searchSimilarContent: vi.fn().mockResolvedValue([]),
      deleteEmbeddingsForWidget: vi.fn().mockResolvedValue(undefined),
      deleteEmbeddingsForFile: vi.fn().mockResolvedValue(undefined)
    } as any;

    // Mock file storage service
    mockFileStorage = {
      uploadFile: vi.fn().mockResolvedValue({
        id: 'file-123',
        filename: 'test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        createdAt: new Date()
      }),
      getWidgetFiles: vi.fn().mockResolvedValue([]),
      deleteAllWidgetFiles: vi.fn().mockResolvedValue(undefined),
      deleteFile: vi.fn().mockResolvedValue(true)
    } as any;

    // Create widget service instance
    widgetService = new WidgetService(mockDatabase, mockVectorSearch, mockFileStorage);
  });

  describe('createWidget', () => {
    it('should create a widget with content successfully', async () => {
      const request: CreateWidgetRequest = {
        name: 'New Widget',
        description: 'New widget description',
        url: 'https://example.com',
        content: 'This is the widget content'
      };

      const result = await widgetService.createWidget('user-123', request);

      // Verify database operations
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith({
        userId: 'user-123',
        name: 'New Widget',
        description: 'New widget description',
        url: 'https://example.com',
        cacheEnabled: true
      });
      expect(mockDb.returning).toHaveBeenCalled();

      // Verify embeddings creation
      expect(mockVectorSearch.createEmbeddingsForWidget).toHaveBeenCalledWith(
        'widget-123',
        'This is the widget content',
        'text_content'
      );

      // Verify result
      expect(result).toEqual({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });
    });

    it('should create a widget with files', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const request: CreateWidgetRequest = {
        name: 'Widget with Files',
        files: [mockFile]
      };

      const result = await widgetService.createWidget('user-123', request);

      // Verify file upload
      expect(mockFileStorage.uploadFile).toHaveBeenCalledWith({
        file: mockFile,
        widgetId: 'widget-123'
      });

      // Verify result includes uploaded file
      expect(result.files).toHaveLength(1);
      expect(result.files[0]).toMatchObject({
        id: 'file-123',
        filename: 'test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024
      });
    });

    it('should create a widget without content or files', async () => {
      const request: CreateWidgetRequest = {
        name: 'Minimal Widget'
      };

      const result = await widgetService.createWidget('user-123', request);

      // Verify no embeddings or file operations
      expect(mockVectorSearch.createEmbeddingsForWidget).not.toHaveBeenCalled();
      expect(mockFileStorage.uploadFile).not.toHaveBeenCalled();

      expect(result).toEqual({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });
    });

    it('should handle multiple file uploads', async () => {
      const mockFiles = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.txt', { type: 'text/plain' })
      ];

      mockFileStorage.uploadFile
        .mockResolvedValueOnce({
          id: 'file-1',
          filename: 'file1.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
          createdAt: new Date()
        })
        .mockResolvedValueOnce({
          id: 'file-2',
          filename: 'file2.txt',
          fileType: 'text/plain',
          fileSize: 512,
          createdAt: new Date()
        });

      const request: CreateWidgetRequest = {
        name: 'Multi-file Widget',
        files: mockFiles
      };

      const result = await widgetService.createWidget('user-123', request);

      expect(mockFileStorage.uploadFile).toHaveBeenCalledTimes(2);
      expect(result.files).toHaveLength(2);
    });
  });

  describe('getWidget', () => {
    it('should retrieve a widget with files and embeddings count', async () => {
      mockDb.limit.mockResolvedValue([mockWidget]);
      mockFileStorage.getWidgetFiles.mockResolvedValue([
        {
          id: 'file-123',
          filename: 'test.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
          createdAt: new Date()
        }
      ]);

      const result = await widgetService.getWidget('widget-123', 'user-123');

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(mockFileStorage.getWidgetFiles).toHaveBeenCalledWith('widget-123', true);
      expect(mockVectorSearch.getEmbeddingsCount).toHaveBeenCalledWith('widget-123');

      expect(result).toEqual({
        ...mockWidget,
        files: [{
          id: 'file-123',
          filename: 'test.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
          createdAt: expect.any(Date)
        }],
        embeddingsCount: 5
      });
    });

    it('should return null for non-existent widget', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await widgetService.getWidget('non-existent', 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('getPublicWidget', () => {
    it('should retrieve a public widget', async () => {
      const publicWidget = { ...mockWidget, isPublic: true };
      mockDb.limit.mockResolvedValue([publicWidget]);

      const result = await widgetService.getPublicWidget('widget-123');

      expect(mockDb.where).toHaveBeenCalled();
      expect(result).toMatchObject({
        ...publicWidget,
        files: [],
        embeddingsCount: 5
      });
    });

    it('should return null for private widget', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await widgetService.getPublicWidget('widget-123');

      expect(result).toBeNull();
    });
  });

  describe('getUserWidgets', () => {
    it('should retrieve all user widgets with pagination', async () => {
      const widgets = [mockWidget, { ...mockWidget, id: 'widget-456' }];
      mockDb.offset.mockResolvedValue(widgets);

      const result = await widgetService.getUserWidgets('user-123', 10, 0);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(10);
      expect(mockDb.offset).toHaveBeenCalledWith(0);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });
    });

    it('should use default pagination values', async () => {
      mockDb.offset.mockResolvedValue([]);

      await widgetService.getUserWidgets('user-123');

      expect(mockDb.limit).toHaveBeenCalledWith(50);
      expect(mockDb.offset).toHaveBeenCalledWith(0);
    });
  });

  describe('updateWidget', () => {
    it('should update widget properties', async () => {
      const request: UpdateWidgetRequest = {
        name: 'Updated Widget',
        description: 'Updated description',
        isPublic: true
      };

      // Mock getWidget to return existing widget
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });

      const updatedWidget = { ...mockWidget, ...request };
      mockDb.returning.mockResolvedValue([updatedWidget]);
      // Mock the final select query after update
      mockDb.limit.mockResolvedValue([updatedWidget]);

      const result = await widgetService.updateWidget('widget-123', 'user-123', request);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({
        name: 'Updated Widget',
        description: 'Updated description',
        isPublic: true,
        updatedAt: expect.any(Date)
      });
      expect(mockDb.where).toHaveBeenCalled();

      expect(result).toMatchObject({
        ...updatedWidget,
        files: [],
        embeddingsCount: 5
      });
    });

    it('should update widget content and recreate embeddings', async () => {
      const request: UpdateWidgetRequest = {
        content: 'New content for the widget'
      };

      // Mock getWidget to return existing widget
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });

      mockDb.returning.mockResolvedValue([mockWidget]);
      // Mock the final select query after update
      mockDb.limit.mockResolvedValue([mockWidget]);

      const result = await widgetService.updateWidget('widget-123', 'user-123', request);

      // Verify old embeddings deleted
      expect(mockDb.execute).toHaveBeenCalled();

      // Verify new embeddings created
      expect(mockVectorSearch.createEmbeddingsForWidget).toHaveBeenCalledWith(
        'widget-123',
        'New content for the widget',
        'text_content'
      );

      expect(result).toBeTruthy();
    });

    it('should clear content when empty string provided', async () => {
      const request: UpdateWidgetRequest = {
        content: ''
      };

      // Mock getWidget to return existing widget
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });

      mockDb.returning.mockResolvedValue([mockWidget]);
      // Mock the final select query after update
      mockDb.limit.mockResolvedValue([mockWidget]);

      await widgetService.updateWidget('widget-123', 'user-123', request);

      // Verify embeddings deleted
      expect(mockDb.execute).toHaveBeenCalled();

      // Verify no new embeddings created
      expect(mockVectorSearch.createEmbeddingsForWidget).not.toHaveBeenCalled();
    });

    it('should return null if widget not found', async () => {
      // Mock getWidget to return null (widget not found)
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue(null);
      
      mockDb.returning.mockResolvedValue([]);

      const result = await widgetService.updateWidget('non-existent', 'user-123', {
        name: 'Updated'
      });

      expect(result).toBeNull();
    });

    it('should only update provided fields', async () => {
      const request: UpdateWidgetRequest = {
        name: 'Only Name Updated'
      };

      // Mock getWidget to return existing widget
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });

      mockDb.returning.mockResolvedValue([mockWidget]);
      // Mock the final select query after update
      mockDb.limit.mockResolvedValue([mockWidget]);

      await widgetService.updateWidget('widget-123', 'user-123', request);

      expect(mockDb.set).toHaveBeenCalledWith({
        name: 'Only Name Updated',
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('deleteWidget', () => {
    it('should delete widget and all associated data', async () => {
      // Mock getWidget to verify ownership
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });

      const result = await widgetService.deleteWidget('widget-123', 'user-123');

      expect(widgetService.getWidget).toHaveBeenCalledWith('widget-123', 'user-123');
      expect(mockVectorSearch.deleteEmbeddingsForWidget).toHaveBeenCalledWith('widget-123');
      expect(mockFileStorage.deleteAllWidgetFiles).toHaveBeenCalledWith('widget-123');
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();

      expect(result).toBe(true);
    });

    it('should return false if widget not found', async () => {
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue(null);

      const result = await widgetService.deleteWidget('non-existent', 'user-123');

      expect(result).toBe(false);
      expect(mockVectorSearch.deleteEmbeddingsForWidget).not.toHaveBeenCalled();
      expect(mockFileStorage.deleteAllWidgetFiles).not.toHaveBeenCalled();
      expect(mockDb.delete).not.toHaveBeenCalled();
    });
  });

  describe('searchWidgetContent', () => {
    it('should search widget content successfully', async () => {
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });

      const mockSearchResults = [
        { content: 'Result 1', similarity: 0.9 },
        { content: 'Result 2', similarity: 0.8 }
      ];
      mockVectorSearch.searchSimilarContent.mockResolvedValue(mockSearchResults);

      const results = await widgetService.searchWidgetContent('widget-123', 'user-123', 'search query', 5);

      expect(widgetService.getWidget).toHaveBeenCalledWith('widget-123', 'user-123');
      expect(mockVectorSearch.searchSimilarContent).toHaveBeenCalledWith('search query', 'widget-123', 5);
      expect(results).toEqual(mockSearchResults);
    });

    it('should throw error if widget not found', async () => {
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue(null);

      await expect(
        widgetService.searchWidgetContent('non-existent', 'user-123', 'query')
      ).rejects.toThrow('Widget not found');
    });

    it('should use default limit of 10', async () => {
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });

      await widgetService.searchWidgetContent('widget-123', 'user-123', 'query');

      expect(mockVectorSearch.searchSimilarContent).toHaveBeenCalledWith('query', 'widget-123', 10);
    });
  });

  describe('searchPublicWidgetContent', () => {
    it('should search public widget content', async () => {
      vi.spyOn(widgetService, 'getPublicWidget').mockResolvedValue({
        ...mockWidget,
        isPublic: true,
        files: [],
        embeddingsCount: 5
      });

      const mockSearchResults = [{ content: 'Public result', similarity: 0.85 }];
      mockVectorSearch.searchSimilarContent.mockResolvedValue(mockSearchResults);

      const results = await widgetService.searchPublicWidgetContent('widget-123', 'query', 15);

      expect(widgetService.getPublicWidget).toHaveBeenCalledWith('widget-123');
      expect(mockVectorSearch.searchSimilarContent).toHaveBeenCalledWith('query', 'widget-123', 15);
      expect(results).toEqual(mockSearchResults);
    });

    it('should throw error if widget not public', async () => {
      vi.spyOn(widgetService, 'getPublicWidget').mockResolvedValue(null);

      await expect(
        widgetService.searchPublicWidgetContent('widget-123', 'query')
      ).rejects.toThrow('Widget not found or not public');
    });
  });

  describe('searchAllUserWidgets', () => {
    it('should search across all user widgets', async () => {
      mockDb.where.mockResolvedValue([
        { id: 'widget-1' },
        { id: 'widget-2' }
      ]);

      const mockSearchResults = [
        { content: 'Result from widget 1', similarity: 0.9 },
        { content: 'Result from widget 2', similarity: 0.85 }
      ];
      mockVectorSearch.searchSimilarContent.mockResolvedValue(mockSearchResults);

      const results = await widgetService.searchAllUserWidgets('user-123', 'query', 20);

      expect(mockDb.select).toHaveBeenCalledWith({ id: expect.anything() });
      expect(mockVectorSearch.searchSimilarContent).toHaveBeenCalledWith('query', undefined, 20);
      expect(results).toEqual(mockSearchResults);
    });

    it('should return empty array if user has no widgets', async () => {
      mockDb.where.mockResolvedValue([]);

      const results = await widgetService.searchAllUserWidgets('user-123', 'query');

      expect(mockVectorSearch.searchSimilarContent).not.toHaveBeenCalled();
      expect(results).toEqual([]);
    });
  });

  describe('addFileToWidget', () => {
    it('should add file to widget successfully', async () => {
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });

      const mockFile = new File(['new content'], 'new-file.pdf', { type: 'application/pdf' });

      const result = await widgetService.addFileToWidget('widget-123', 'user-123', mockFile);

      expect(widgetService.getWidget).toHaveBeenCalledWith('widget-123', 'user-123');
      expect(mockFileStorage.uploadFile).toHaveBeenCalledWith({
        file: mockFile,
        widgetId: 'widget-123'
      });
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({ updatedAt: expect.any(Date) });

      expect(result).toMatchObject({
        id: 'file-123',
        filename: 'test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024
      });
    });

    it('should throw error if widget not found', async () => {
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue(null);

      const mockFile = new File(['content'], 'file.txt', { type: 'text/plain' });

      await expect(
        widgetService.addFileToWidget('non-existent', 'user-123', mockFile)
      ).rejects.toThrow('Widget not found');
    });
  });

  describe('removeFileFromWidget', () => {
    it('should remove file from widget successfully', async () => {
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });

      const result = await widgetService.removeFileFromWidget('widget-123', 'file-123', 'user-123');

      expect(widgetService.getWidget).toHaveBeenCalledWith('widget-123', 'user-123');
      expect(mockVectorSearch.deleteEmbeddingsForFile).toHaveBeenCalledWith('widget-123', 'file-123');
      expect(mockFileStorage.deleteFile).toHaveBeenCalledWith('file-123', 'widget-123');
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({ updatedAt: expect.any(Date) });

      expect(result).toBe(true);
    });

    it('should return false if widget not found', async () => {
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue(null);

      const result = await widgetService.removeFileFromWidget('widget-123', 'file-123', 'user-123');

      expect(result).toBe(false);
      expect(mockVectorSearch.deleteEmbeddingsForFile).not.toHaveBeenCalled();
      expect(mockFileStorage.deleteFile).not.toHaveBeenCalled();
    });

    it('should not update widget if file deletion fails', async () => {
      vi.spyOn(widgetService, 'getWidget').mockResolvedValue({
        ...mockWidget,
        files: [],
        embeddingsCount: 5
      });
      mockFileStorage.deleteFile.mockResolvedValue(false);

      const result = await widgetService.removeFileFromWidget('widget-123', 'file-123', 'user-123');

      expect(mockDb.update).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});