import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OCRService, type MistralOCRResponse, type ProcessedOCRResult } from './ocr-service';
import { FileStorageService } from './file-storage';
import { VectorSearchService } from './vector-search';

// Mock dependencies
vi.mock('./file-storage');
vi.mock('./vector-search');

// Mock global fetch
global.fetch = vi.fn();
global.btoa = vi.fn((str: string) => Buffer.from(str, 'binary').toString('base64'));

describe('OCRService', () => {
  let ocrService: OCRService;
  let mockFileStorage: FileStorageService;
  let mockVectorSearch: VectorSearchService;

  const mockOCRResponse: MistralOCRResponse = {
    pages: [
      {
        index: 0,
        markdown: '# Page 1\nThis is the first page content.',
        images: [
          {
            id: 'img-1',
            top_left_x: 100,
            top_left_y: 200,
            bottom_right_x: 300,
            bottom_right_y: 400,
            image_base64: 'mock-base64-image-data'
          }
        ],
        dimensions: {
          dpi: 300,
          height: 1100,
          width: 850
        }
      },
      {
        index: 1,
        markdown: '# Page 2\nThis is the second page content.',
        images: [],
        dimensions: {
          dpi: 300,
          height: 1100,
          width: 850
        }
      }
    ],
    model: 'mistral-ocr-latest',
    usage_info: {
      pages_processed: 2,
      doc_size_bytes: 1024
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockFileStorage = {
      storePageFile: vi.fn().mockResolvedValue(undefined)
    } as any;

    mockVectorSearch = {
      createEmbeddingsFromOCRPages: vi.fn().mockResolvedValue(undefined)
    } as any;

    ocrService = new OCRService(mockFileStorage, 'test-mistral-key', mockVectorSearch);
  });

  describe('processDocument', () => {
    it('should process a document successfully', async () => {
      const buffer = new ArrayBuffer(1024);
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockOCRResponse)
      } as any);

      const result = await ocrService.processDocument('widget-123', 'file-456', buffer);

      // Verify API call
      expect(mockFetch).toHaveBeenCalledWith('https://api.mistral.ai/v1/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-mistral-key'
        },
        body: expect.stringContaining('"model":"mistral-ocr-latest"')
      });

      // Verify result
      expect(result).toMatchObject({
        totalPages: 2,
        fullText: '# Page 1\nThis is the first page content.\n\n# Page 2\nThis is the second page content.',
        pages: expect.arrayContaining([
          expect.objectContaining({
            pageNumber: 1,
            markdown: '# Page 1\nThis is the first page content.',
            images: expect.arrayContaining([
              expect.objectContaining({ id: 'img-1' })
            ])
          }),
          expect.objectContaining({
            pageNumber: 2,
            markdown: '# Page 2\nThis is the second page content.',
            images: []
          })
        ]),
        images: expect.arrayContaining([
          expect.objectContaining({
            id: 'img-1',
            pageNumber: 1,
            imageIndex: 0,
            boundingBox: {
              topLeftX: 100,
              topLeftY: 200,
              bottomRightX: 300,
              bottomRightY: 400
            },
            base64Data: 'mock-base64-image-data'
          })
        ]),
        processedAt: expect.any(Date)
      });

      // Verify page files were stored
      expect(mockFileStorage.storePageFile).toHaveBeenCalledTimes(2);
      expect(mockFileStorage.storePageFile).toHaveBeenCalledWith(
        'widget-123',
        'file-456',
        1,
        '# Page 1\nThis is the first page content.'
      );
      expect(mockFileStorage.storePageFile).toHaveBeenCalledWith(
        'widget-123',
        'file-456',
        2,
        '# Page 2\nThis is the second page content.'
      );

      // Verify embeddings were created
      expect(mockVectorSearch.createEmbeddingsFromOCRPages).toHaveBeenCalledWith(
        'widget-123',
        'file-456',
        [
          { pageNumber: 1, markdown: '# Page 1\nThis is the first page content.' },
          { pageNumber: 2, markdown: '# Page 2\nThis is the second page content.' }
        ]
      );
    });

    it('should throw error if MISTRAL_AI_API_KEY is not provided', async () => {
      const serviceWithoutKey = new OCRService(mockFileStorage, '');
      const buffer = new ArrayBuffer(1024);

      await expect(
        serviceWithoutKey.processDocument('widget-123', 'file-456', buffer)
      ).rejects.toThrow('MISTRAL_AI_API_KEY environment variable is required');
    });

    it('should handle API errors', async () => {
      const buffer = new ArrayBuffer(1024);
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('Bad Request')
      } as any);

      await expect(
        ocrService.processDocument('widget-123', 'file-456', buffer)
      ).rejects.toThrow('Mistral OCR API error: 400 - Bad Request');
    });

    it('should handle network errors', async () => {
      const buffer = new ArrayBuffer(1024);
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        ocrService.processDocument('widget-123', 'file-456', buffer)
      ).rejects.toThrow('Network error');
    });

    it('should continue processing even if embeddings fail', async () => {
      const buffer = new ArrayBuffer(1024);
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockOCRResponse)
      } as any);

      mockVectorSearch.createEmbeddingsFromOCRPages = vi.fn().mockRejectedValue(new Error('Embedding error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await ocrService.processDocument('widget-123', 'file-456', buffer);

      expect(result).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[OCR_EMBEDDINGS]'));
      
      consoleSpy.mockRestore();
    });

    it('should handle pages without markdown content', async () => {
      const responseWithEmptyPage: MistralOCRResponse = {
        ...mockOCRResponse,
        pages: [
          {
            index: 0,
            markdown: '',
            images: [],
            dimensions: { dpi: 300, height: 1100, width: 850 }
          }
        ]
      };

      const buffer = new ArrayBuffer(1024);
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(responseWithEmptyPage)
      } as any);

      const result = await ocrService.processDocument('widget-123', 'file-456', buffer);

      expect(result.pages[0].markdown).toBe('');
      expect(result.fullText).toBe('');
    });
  });

  describe('processOCRResponse', () => {
    it('should process OCR response correctly', () => {
      const service = ocrService as any;
      const result = service.processOCRResponse('widget-123', 'file-456', mockOCRResponse);

      expect(result).toMatchObject({
        totalPages: 2,
        fullText: '# Page 1\nThis is the first page content.\n\n# Page 2\nThis is the second page content.',
        pages: expect.arrayContaining([
          expect.objectContaining({
            pageNumber: 1,
            markdown: '# Page 1\nThis is the first page content.'
          }),
          expect.objectContaining({
            pageNumber: 2,
            markdown: '# Page 2\nThis is the second page content.'
          })
        ]),
        images: expect.arrayContaining([
          expect.objectContaining({
            id: 'img-1',
            pageNumber: 1,
            imageIndex: 0
          })
        ])
      });
    });

    it('should handle pages without images', () => {
      const service = ocrService as any;
      const responseWithoutImages: MistralOCRResponse = {
        ...mockOCRResponse,
        pages: mockOCRResponse.pages.map(page => ({ ...page, images: undefined }))
      };

      const result = service.processOCRResponse('widget-123', 'file-456', responseWithoutImages);

      expect(result.images).toHaveLength(0);
      expect(result.pages[0].images).toEqual([]);
    });

    it('should handle pages with null markdown', () => {
      const service = ocrService as any;
      const responseWithNullMarkdown: MistralOCRResponse = {
        ...mockOCRResponse,
        pages: [
          {
            ...mockOCRResponse.pages[0],
            markdown: null as any
          }
        ]
      };

      const result = service.processOCRResponse('widget-123', 'file-456', responseWithNullMarkdown);

      expect(result.pages[0].markdown).toBe('');
      expect(result.fullText).toBe('');
    });
  });

  describe('storePageFiles', () => {
    it('should store all page files in parallel', async () => {
      const service = ocrService as any;
      const pages = [
        { pageNumber: 1, markdown: 'Page 1 content' },
        { pageNumber: 2, markdown: 'Page 2 content' }
      ];

      await service.storePageFiles('widget-123', 'file-456', pages);

      expect(mockFileStorage.storePageFile).toHaveBeenCalledTimes(2);
      expect(mockFileStorage.storePageFile).toHaveBeenCalledWith(
        'widget-123',
        'file-456',
        1,
        'Page 1 content'
      );
      expect(mockFileStorage.storePageFile).toHaveBeenCalledWith(
        'widget-123',
        'file-456',
        2,
        'Page 2 content'
      );
    });
  });

  describe('shouldProcessWithOCR', () => {
    it('should return false for text file types', () => {
      const service = ocrService as any;

      expect(service.shouldProcessWithOCR('text/plain')).toBe(false);
      expect(service.shouldProcessWithOCR('text/markdown')).toBe(false);
      expect(service.shouldProcessWithOCR('application/json')).toBe(false);
      expect(service.shouldProcessWithOCR('text/csv')).toBe(false);
    });

    it('should return true for non-text file types', () => {
      const service = ocrService as any;

      expect(service.shouldProcessWithOCR('application/pdf')).toBe(true);
      expect(service.shouldProcessWithOCR('image/png')).toBe(true);
      expect(service.shouldProcessWithOCR('application/msword')).toBe(true);
    });

    it('should be case-insensitive', () => {
      const service = ocrService as any;

      expect(service.shouldProcessWithOCR('TEXT/PLAIN')).toBe(false);
      expect(service.shouldProcessWithOCR('Text/CSV')).toBe(false);
    });
  });

  describe('without vector search', () => {
    it('should work without vector search service', async () => {
      const serviceWithoutVectorSearch = new OCRService(mockFileStorage, 'test-mistral-key');
      
      const buffer = new ArrayBuffer(1024);
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockOCRResponse)
      } as any);

      const result = await serviceWithoutVectorSearch.processDocument('widget-123', 'file-456', buffer);

      expect(result).toBeDefined();
      expect(mockVectorSearch.createEmbeddingsFromOCRPages).not.toHaveBeenCalled();
    });
  });

  describe('buffer to base64 conversion', () => {
    it('should convert ArrayBuffer to base64 correctly', async () => {
      const testString = 'Hello, World!';
      const encoder = new TextEncoder();
      const buffer = encoder.encode(testString).buffer;
      
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockOCRResponse)
      } as any);

      await ocrService.processDocument('widget-123', 'file-456', buffer);

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(callArgs.document.document_url).toContain('data:application/pdf;base64,');
    });
  });

  describe('multiple images per page', () => {
    it('should handle multiple images on a single page', () => {
      const service = ocrService as any;
      const responseWithMultipleImages: MistralOCRResponse = {
        ...mockOCRResponse,
        pages: [
          {
            index: 0,
            markdown: 'Page with multiple images',
            images: [
              {
                id: 'img-1',
                top_left_x: 100,
                top_left_y: 100,
                bottom_right_x: 200,
                bottom_right_y: 200,
                image_base64: 'image1-base64'
              },
              {
                id: 'img-2',
                top_left_x: 300,
                top_left_y: 300,
                bottom_right_x: 400,
                bottom_right_y: 400,
                image_base64: 'image2-base64'
              }
            ],
            dimensions: { dpi: 300, height: 1100, width: 850 }
          }
        ]
      };

      const result = service.processOCRResponse('widget-123', 'file-456', responseWithMultipleImages);

      expect(result.images).toHaveLength(2);
      expect(result.images[0]).toMatchObject({
        id: 'img-1',
        pageNumber: 1,
        imageIndex: 0,
        base64Data: 'image1-base64'
      });
      expect(result.images[1]).toMatchObject({
        id: 'img-2',
        pageNumber: 1,
        imageIndex: 1,
        base64Data: 'image2-base64'
      });
    });
  });

  describe('logging', () => {
    it('should log processing steps', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const buffer = new ArrayBuffer(1024);
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockOCRResponse)
      } as any);

      await ocrService.processDocument('widget-123', 'file-456', buffer);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[OCR_START]'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[OCR_API_PROGRESS]'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[OCR_API_START]'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[OCR_EMBEDDINGS]'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[OCR_STORAGE]'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[OCR_SUCCESS]'));

      consoleSpy.mockRestore();
    });

    it('should log errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const buffer = new ArrayBuffer(1024);
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockRejectedValue(new Error('Test error'));

      await expect(
        ocrService.processDocument('widget-123', 'file-456', buffer)
      ).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[OCR_ERROR]'));

      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle corrupt PDF files', async () => {
      const corruptBuffer = new ArrayBuffer(100); // Too small to be valid PDF
      const mockFetch = vi.mocked(global.fetch);
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('Invalid PDF format')
      } as any);
      
      await expect(
        ocrService.processDocument('widget-123', 'file-456', corruptBuffer)
      ).rejects.toThrow('Mistral OCR API error: 400 - Invalid PDF format');
      
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle documents in multiple languages', async () => {
      const multiLangResponse: MistralOCRResponse = {
        ...mockOCRResponse,
        pages: [
          {
            index: 0,
            markdown: '# 标题\n这是中文内容\n\n# Title\nThis is English content',
            images: [],
            dimensions: { dpi: 300, height: 1100, width: 850 }
          },
          {
            index: 1,
            markdown: '# Título\nEste es contenido en español\n\n# Titre\nCeci est du contenu en français',
            images: [],
            dimensions: { dpi: 300, height: 1100, width: 850 }
          }
        ]
      };

      const buffer = new ArrayBuffer(1024);
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(multiLangResponse)
      } as any);

      const result = await ocrService.processDocument('widget-123', 'file-123', buffer);

      expect(result.pages).toHaveLength(2);
      expect(result.pages[0].markdown).toContain('这是中文内容');
      expect(result.pages[0].markdown).toContain('This is English content');
      expect(result.pages[1].markdown).toContain('contenido en español');
      expect(result.pages[1].markdown).toContain('contenu en français');
    });

    it('should handle image-only PDFs', async () => {
      const imageOnlyResponse: MistralOCRResponse = {
        ...mockOCRResponse,
        pages: [{
          index: 0,
          markdown: '', // No text content
          images: [
            {
              id: 'img-1',
              top_left_x: 0,
              top_left_y: 0,
              bottom_right_x: 850,
              bottom_right_y: 1100,
              image_base64: 'base64imagedata'
            }
          ],
          dimensions: { dpi: 300, height: 1100, width: 850 }
        }]
      };

      const buffer = new ArrayBuffer(1024);
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(imageOnlyResponse)
      } as any);

      const result = await ocrService.processDocument('widget-123', 'file-123', buffer);

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].markdown).toBe('');
      expect(result.images).toHaveLength(1);
      expect(mockFileStorage.storePageFile).toHaveBeenCalledWith(
        'widget-123',
        'file-123',
        1,
        ''
      );
    });

    it('should handle mixed text and image content', async () => {
      const mixedContentResponse: MistralOCRResponse = {
        ...mockOCRResponse,
        pages: [{
          index: 0,
          markdown: '# Document with Images\n\nText before image\n\n![Figure 1](image_0)\n\nText after image',
          images: [
            {
              id: 'img-1',
              top_left_x: 100,
              top_left_y: 300,
              bottom_right_x: 700,
              bottom_right_y: 600,
              image_base64: 'base64imagedata'
            }
          ],
          dimensions: { dpi: 300, height: 1100, width: 850 }
        }]
      };

      const buffer = new ArrayBuffer(1024);
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mixedContentResponse)
      } as any);

      const result = await ocrService.processDocument('widget-123', 'file-123', buffer);

      expect(result.pages[0].markdown).toContain('![Figure 1](image_0)');
      expect(result.pages[0].markdown).toContain('Text before image');
      expect(result.pages[0].markdown).toContain('Text after image');
      expect(result.images).toHaveLength(1);
    });

    it('should handle very large documents', async () => {
      const largePagesResponse: MistralOCRResponse = {
        ...mockOCRResponse,
        pages: Array(100).fill(null).map((_, i) => ({
          index: i,
          markdown: `# Page ${i + 1}\nContent for page ${i + 1}`,
          images: [],
          dimensions: { dpi: 300, height: 1100, width: 850 }
        }))
      };

      const buffer = new ArrayBuffer(1024 * 1024 * 10); // 10MB
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(largePagesResponse)
      } as any);

      const result = await ocrService.processDocument('widget-123', 'file-123', buffer);

      expect(result.pages).toHaveLength(100);
      expect(mockFileStorage.storePageFile).toHaveBeenCalledTimes(100);
    });

    it('should handle scanned documents with poor quality', async () => {
      const poorQualityResponse: MistralOCRResponse = {
        ...mockOCRResponse,
        pages: [{
          index: 0,
          markdown: 'T#is is p00rly sc@nned t3xt w!th 3rr0rs', // OCR errors
          images: [],
          dimensions: { dpi: 150, height: 1100, width: 850 } // Low DPI
        }]
      };

      const buffer = new ArrayBuffer(1024);
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(poorQualityResponse)
      } as any);

      const result = await ocrService.processDocument('widget-123', 'file-123', buffer);

      expect(result.pages[0].markdown).toBe('T#is is p00rly sc@nned t3xt w!th 3rr0rs');
      expect(result.pages[0].dimensions.dpi).toBe(150);
    });
  });
});