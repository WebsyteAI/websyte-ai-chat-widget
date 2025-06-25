import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileStorageService, type FileUpload, type StoredFile } from './file-storage';
import { DatabaseService } from './database';
import { OCRService } from './ocr-service';
import { VectorSearchService } from './vector-search';

// Mock dependencies
vi.mock('./database');
vi.mock('./ocr-service');
vi.mock('./vector-search');

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  and: vi.fn((...conditions) => ({ conditions }))
}));

describe('FileStorageService', () => {
  let fileStorageService: FileStorageService;
  let mockR2Bucket: any;
  let mockDatabase: DatabaseService;
  let mockVectorSearch: VectorSearchService;
  let mockDb: any;

  const mockFile = {
    id: 'file-123',
    widgetId: 'widget-456',
    r2Key: 'widgets/widget-456/file-123/test.txt',
    filename: 'test.txt',
    fileType: 'text/plain',
    fileSize: 1024,
    createdAt: new Date('2025-01-01')
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock R2 bucket
    mockR2Bucket = {
      put: vi.fn().mockResolvedValue(undefined),
      get: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue({ objects: [] })
    };

    // Mock database query builder
    mockDb = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([mockFile]),
      limit: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([mockFile])
    };

    // Mock database service
    mockDatabase = {
      getDatabase: vi.fn().mockReturnValue(mockDb)
    } as any;

    // Mock vector search service
    mockVectorSearch = {
      deleteEmbeddingsForFile: vi.fn().mockResolvedValue(undefined)
    } as any;

    fileStorageService = new FileStorageService(mockR2Bucket, mockDatabase, 'test-mistral-key', mockVectorSearch);
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFileObject = {
        name: 'test.txt',
        type: 'text/plain',
        size: 1024,
        stream: vi.fn().mockReturnValue('file-stream'),
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024))
      } as any;

      const upload: FileUpload = {
        file: mockFileObject,
        widgetId: 'widget-456'
      };

      const result = await fileStorageService.uploadFile(upload);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith({
        widgetId: 'widget-456',
        r2Key: '',
        filename: 'test.txt',
        fileType: 'text/plain',
        fileSize: 1024
      });

      expect(mockR2Bucket.put).toHaveBeenCalledWith(
        'widgets/widget-456/file-123/test.txt',
        'file-stream',
        {
          httpMetadata: {
            contentType: 'text/plain',
            contentDisposition: 'attachment; filename="test.txt"'
          }
        }
      );

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({ 
        r2Key: 'widgets/widget-456/file-123/test.txt' 
      });

      expect(result).toEqual({
        id: mockFile.id,
        widgetId: mockFile.widgetId,
        r2Key: mockFile.r2Key,
        filename: mockFile.filename,
        fileType: mockFile.fileType,
        fileSize: mockFile.fileSize,
        createdAt: mockFile.createdAt
      });
    });

    it('should clean filename for R2 key generation', async () => {
      const mockFileObject = {
        name: 'test file with spaces & symbols!.txt',
        type: 'text/plain',
        size: 1024,
        stream: vi.fn().mockReturnValue('file-stream'),
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024))
      } as any;

      const upload: FileUpload = {
        file: mockFileObject,
        widgetId: 'widget-456'
      };

      await fileStorageService.uploadFile(upload);

      expect(mockR2Bucket.put).toHaveBeenCalledWith(
        'widgets/widget-456/file-123/test_file_with_spaces___symbols_.txt',
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should process PDF files with OCR', async () => {
      const mockPdfFile = {
        name: 'document.pdf',
        type: 'application/pdf',
        size: 2048,
        stream: vi.fn().mockReturnValue('pdf-stream'),
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(2048))
      } as any;

      const upload: FileUpload = {
        file: mockPdfFile,
        widgetId: 'widget-456'
      };

      const result = await fileStorageService.uploadFile(upload);

      expect(mockPdfFile.arrayBuffer).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle upload failure and cleanup', async () => {
      mockR2Bucket.put.mockRejectedValue(new Error('Upload failed'));

      const mockFileObject = {
        name: 'test.txt',
        type: 'text/plain',
        size: 1024,
        stream: vi.fn().mockReturnValue('file-stream'),
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024))
      } as any;

      const upload: FileUpload = {
        file: mockFileObject,
        widgetId: 'widget-456'
      };

      await expect(fileStorageService.uploadFile(upload)).rejects.toThrow('Failed to upload file');

      // Verify cleanup was attempted
      expect(mockR2Bucket.delete).toHaveBeenCalledWith('widgets/widget-456/file-123/test.txt');
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe('downloadFile', () => {
    it('should download a file successfully', async () => {
      const mockR2Object = {
        body: 'file-content',
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024))
      };
      mockR2Bucket.get.mockResolvedValue(mockR2Object);
      mockDb.limit.mockResolvedValue([mockFile]);

      const result = await fileStorageService.downloadFile('file-123', 'widget-456');

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockR2Bucket.get).toHaveBeenCalledWith('widgets/widget-456/file-123/test.txt');
      expect(result).toBe(mockR2Object);
    });

    it('should return null if file not found in database', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await fileStorageService.downloadFile('non-existent', 'widget-456');

      expect(result).toBeNull();
      expect(mockR2Bucket.get).not.toHaveBeenCalled();
    });

    it('should handle download errors', async () => {
      mockDb.limit.mockRejectedValue(new Error('Database error'));

      await expect(
        fileStorageService.downloadFile('file-123', 'widget-456')
      ).rejects.toThrow('Failed to download file');
    });
  });

  describe('deleteFile', () => {
    it('should delete a file and its associated data', async () => {
      mockDb.limit.mockResolvedValue([mockFile]);

      const result = await fileStorageService.deleteFile('file-123', 'widget-456');

      expect(mockR2Bucket.delete).toHaveBeenCalledWith('widgets/widget-456/file-123/test.txt');
      expect(mockR2Bucket.list).toHaveBeenCalledWith({ 
        prefix: 'widgets/widget-456/file-123/page_' 
      });
      expect(mockVectorSearch.deleteEmbeddingsForFile).toHaveBeenCalledWith('widget-456', 'file-123');
      expect(mockDb.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if file not found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await fileStorageService.deleteFile('non-existent', 'widget-456');

      expect(result).toBe(false);
      expect(mockR2Bucket.delete).not.toHaveBeenCalled();
    });

    it('should continue deletion even if page file deletion fails', async () => {
      mockDb.limit.mockResolvedValue([mockFile]);
      mockR2Bucket.list.mockRejectedValue(new Error('List failed'));

      const result = await fileStorageService.deleteFile('file-123', 'widget-456');

      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should continue deletion even if embedding deletion fails', async () => {
      mockDb.limit.mockResolvedValue([mockFile]);
      mockVectorSearch.deleteEmbeddingsForFile = vi.fn().mockRejectedValue(new Error('Embedding delete failed'));

      const result = await fileStorageService.deleteFile('file-123', 'widget-456');

      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      mockDb.limit.mockResolvedValue([mockFile]);
      mockR2Bucket.delete.mockRejectedValue(new Error('R2 delete failed'));

      await expect(
        fileStorageService.deleteFile('file-123', 'widget-456')
      ).rejects.toThrow('Failed to delete file');
    });
  });

  describe('getWidgetFiles', () => {
    it('should retrieve all files for a widget', async () => {
      const mockFiles = [
        mockFile,
        { ...mockFile, id: 'file-789', filename: 'another.txt' }
      ];
      mockDb.orderBy.mockResolvedValue(mockFiles);

      const result = await fileStorageService.getWidgetFiles('widget-456');

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'file-123',
        filename: 'test.txt'
      });
    });

    it('should handle errors when retrieving files', async () => {
      mockDb.orderBy.mockRejectedValue(new Error('Database error'));

      await expect(
        fileStorageService.getWidgetFiles('widget-456')
      ).rejects.toThrow('Failed to get widget files');
    });
  });

  describe('deleteAllWidgetFiles', () => {
    it('should delete all files for a widget', async () => {
      const mockFiles = [
        mockFile,
        { ...mockFile, id: 'file-789', r2Key: 'widgets/widget-456/file-789/another.txt' }
      ];
      mockDb.orderBy.mockResolvedValue(mockFiles);

      await fileStorageService.deleteAllWidgetFiles('widget-456');

      expect(mockR2Bucket.delete).toHaveBeenCalledTimes(2);
      expect(mockR2Bucket.delete).toHaveBeenCalledWith('widgets/widget-456/file-123/test.txt');
      expect(mockR2Bucket.delete).toHaveBeenCalledWith('widgets/widget-456/file-789/another.txt');
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should handle errors when deleting all files', async () => {
      mockDb.orderBy.mockRejectedValue(new Error('Database error'));

      await expect(
        fileStorageService.deleteAllWidgetFiles('widget-456')
      ).rejects.toThrow('Failed to delete all widget files');
    });
  });

  describe('getFileContent', () => {
    it('should retrieve file content as text', async () => {
      const mockContent = 'Hello, world!';
      const mockR2Object = {
        arrayBuffer: vi.fn().mockResolvedValue(new TextEncoder().encode(mockContent).buffer)
      };
      mockR2Bucket.get.mockResolvedValue(mockR2Object);
      mockDb.limit.mockResolvedValue([mockFile]);

      const result = await fileStorageService.getFileContent('file-123', 'widget-456');

      expect(result).toBe(mockContent);
    });

    it('should return null if file not found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await fileStorageService.getFileContent('non-existent', 'widget-456');

      expect(result).toBeNull();
    });

    it('should handle errors when getting file content', async () => {
      mockDb.limit.mockRejectedValue(new Error('Database error'));

      await expect(
        fileStorageService.getFileContent('file-123', 'widget-456')
      ).rejects.toThrow('Failed to get file content');
    });
  });

  describe('getFileUrl', () => {
    it('should generate a file download URL', async () => {
      mockDb.limit.mockResolvedValue([mockFile]);

      const result = await fileStorageService.getFileUrl('file-123', 'widget-456');

      expect(result).toBe('/api/widgets/widget-456/files/file-123/download');
    });

    it('should return null if file not found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await fileStorageService.getFileUrl('non-existent', 'widget-456');

      expect(result).toBeNull();
    });

    it('should handle errors when getting file URL', async () => {
      mockDb.limit.mockRejectedValue(new Error('Database error'));

      await expect(
        fileStorageService.getFileUrl('file-123', 'widget-456')
      ).rejects.toThrow('Failed to get file URL');
    });
  });

  describe('storePageFile', () => {
    it('should store a page file', async () => {
      const markdownContent = '# Page 1\nContent here';

      await fileStorageService.storePageFile('widget-456', 'file-123', 1, markdownContent);

      expect(mockR2Bucket.put).toHaveBeenCalledWith(
        'widgets/widget-456/file-123/page_1.md',
        markdownContent,
        {
          httpMetadata: {
            contentType: 'text/markdown'
          }
        }
      );
    });

    it('should handle errors when storing page file', async () => {
      mockR2Bucket.put.mockRejectedValue(new Error('R2 error'));

      await expect(
        fileStorageService.storePageFile('widget-456', 'file-123', 1, 'content')
      ).rejects.toThrow('Failed to store page file');
    });
  });

  describe('getPageFile', () => {
    it('should retrieve a page file', async () => {
      const mockContent = '# Page 1\nContent here';
      const mockR2Object = {
        text: vi.fn().mockResolvedValue(mockContent)
      };
      mockR2Bucket.get.mockResolvedValue(mockR2Object);

      const result = await fileStorageService.getPageFile('widget-456', 'file-123', 1);

      expect(mockR2Bucket.get).toHaveBeenCalledWith('widgets/widget-456/file-123/page_1.md');
      expect(result).toBe(mockContent);
    });

    it('should return null if page file not found', async () => {
      mockR2Bucket.get.mockResolvedValue(null);

      const result = await fileStorageService.getPageFile('widget-456', 'file-123', 1);

      expect(result).toBeNull();
    });

    it('should handle errors when getting page file', async () => {
      mockR2Bucket.get.mockRejectedValue(new Error('R2 error'));

      await expect(
        fileStorageService.getPageFile('widget-456', 'file-123', 1)
      ).rejects.toThrow('Failed to get page file');
    });
  });

  describe('deletePageFiles', () => {
    it('should delete all page files for a document', async () => {
      mockR2Bucket.list.mockResolvedValue({
        objects: [
          { key: 'widgets/widget-456/file-123/page_1.md' },
          { key: 'widgets/widget-456/file-123/page_2.md' }
        ]
      });

      await fileStorageService.deletePageFiles('widget-456', 'file-123');

      expect(mockR2Bucket.list).toHaveBeenCalledWith({ 
        prefix: 'widgets/widget-456/file-123/page_' 
      });
      expect(mockR2Bucket.delete).toHaveBeenCalledTimes(2);
      expect(mockR2Bucket.delete).toHaveBeenCalledWith('widgets/widget-456/file-123/page_1.md');
      expect(mockR2Bucket.delete).toHaveBeenCalledWith('widgets/widget-456/file-123/page_2.md');
    });

    it('should handle errors when deleting page files', async () => {
      mockR2Bucket.list.mockRejectedValue(new Error('R2 error'));

      await expect(
        fileStorageService.deletePageFiles('widget-456', 'file-123')
      ).rejects.toThrow('Failed to delete page files');
    });
  });

  describe('shouldProcessWithOCR', () => {
    it('should return false for text file types', () => {
      const service = fileStorageService as any;

      expect(service.shouldProcessWithOCR('text/plain')).toBe(false);
      expect(service.shouldProcessWithOCR('text/markdown')).toBe(false);
      expect(service.shouldProcessWithOCR('application/json')).toBe(false);
      expect(service.shouldProcessWithOCR('text/csv')).toBe(false);
    });

    it('should return true for non-text file types', () => {
      const service = fileStorageService as any;

      expect(service.shouldProcessWithOCR('application/pdf')).toBe(true);
      expect(service.shouldProcessWithOCR('image/png')).toBe(true);
      expect(service.shouldProcessWithOCR('application/msword')).toBe(true);
    });
  });

  describe('cleanupFailedUpload', () => {
    it('should cleanup all resources after failed upload', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await fileStorageService.cleanupFailedUpload('widget-456', 'file-123', 'widgets/widget-456/file-123/test.txt');

      expect(mockR2Bucket.delete).toHaveBeenCalledWith('widgets/widget-456/file-123/test.txt');
      expect(mockR2Bucket.list).toHaveBeenCalledWith({ 
        prefix: 'widgets/widget-456/file-123/page_' 
      });
      expect(mockDb.delete).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[CLEANUP] Cleaned up failed upload: widget_id=widget-456 file_id=file-123'
      );

      consoleSpy.mockRestore();
    });

    it('should not throw even if cleanup operations fail', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockR2Bucket.delete.mockRejectedValue(new Error('R2 error'));
      mockDb.delete.mockRejectedValue(new Error('DB error'));

      // Should not throw
      await fileStorageService.cleanupFailedUpload('widget-456', 'file-123', 'key');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('without OCR service', () => {
    it('should work without OCR service', async () => {
      // Create service without Mistral API key
      const serviceWithoutOCR = new FileStorageService(mockR2Bucket, mockDatabase);

      const mockPdfFile = {
        name: 'document.pdf',
        type: 'application/pdf',
        size: 2048,
        stream: vi.fn().mockReturnValue('pdf-stream'),
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(2048))
      } as any;

      const upload: FileUpload = {
        file: mockPdfFile,
        widgetId: 'widget-456'
      };

      const result = await serviceWithoutOCR.uploadFile(upload);

      // Should not call arrayBuffer for OCR processing
      expect(mockPdfFile.arrayBuffer).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('without vector search service', () => {
    it('should work without vector search service', async () => {
      // Create service without vector search
      const serviceWithoutVectorSearch = new FileStorageService(mockR2Bucket, mockDatabase, 'test-mistral-key');
      
      mockDb.limit.mockResolvedValue([mockFile]);

      const result = await serviceWithoutVectorSearch.deleteFile('file-123', 'widget-456');

      expect(result).toBe(true);
      // Should not attempt to delete embeddings
      expect(mockVectorSearch.deleteEmbeddingsForFile).not.toHaveBeenCalled();
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent file uploads', async () => {
      const createMockFile = (name: string) => ({
        name,
        type: 'text/plain',
        size: 1024,
        stream: vi.fn().mockReturnValue(`stream-${name}`),
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024))
      }) as any;

      const uploads = Array(5).fill(null).map((_, i) => ({
        file: createMockFile(`file${i}.txt`),
        widgetId: 'widget-456'
      }));

      // Mock unique file IDs for each upload
      mockDb.returning.mockImplementation(() => 
        Promise.resolve([{ ...mockFile, id: `file-${Date.now()}-${Math.random()}` }])
      );

      const results = await Promise.all(
        uploads.map(upload => fileStorageService.uploadFile(upload))
      );

      expect(results).toHaveLength(5);
      expect(mockR2Bucket.put).toHaveBeenCalledTimes(5);
      expect(mockDb.insert).toHaveBeenCalledTimes(5);
    });

    it('should handle R2 storage quota errors', async () => {
      mockR2Bucket.put.mockRejectedValue(new Error('Storage quota exceeded'));

      const mockFileObject = {
        name: 'test.txt',
        type: 'text/plain',
        size: 1024,
        stream: vi.fn().mockReturnValue('file-stream'),
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024))
      } as any;

      const upload = { file: mockFileObject, widgetId: 'widget-456' };

      await expect(fileStorageService.uploadFile(upload)).rejects.toThrow('Failed to upload file');

      // Verify cleanup was attempted
      expect(mockR2Bucket.delete).toHaveBeenCalled();
    });
  });
});