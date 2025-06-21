/**
 * OCR Service for processing documents with Mistral AI
 * 
 * This service processes non-text files (PDFs, images, etc.) using Mistral AI's OCR API
 * and stores the extracted content as individual markdown page files in R2 storage.
 * 
 * File Structure: widgets/{widgetId}/{fileId}/
 * ├── original_file.pdf          # Original uploaded file  
 * ├── page_1.md                  # OCR extracted page 1
 * ├── page_2.md                  # OCR extracted page 2
 * └── page_N.md                  # OCR extracted page N
 * 
 * Integration:
 * - Automatically processes eligible files after upload
 * - Creates embeddings for chunked content from OCR pages
 * - Skips text files (.md, .txt, .json, .csv) that don't need OCR
 */

import { FileStorageService } from './file-storage';
import { VectorSearchService } from './vector-search';

export interface MistralOCRImage {
  id: string;
  top_left_x: number;
  top_left_y: number;
  bottom_right_x: number;
  bottom_right_y: number;
  image_base64: string;
}

export interface MistralOCRPage {
  index: number;
  markdown: string;
  images?: MistralOCRImage[];
  dimensions: {
    dpi: number;
    height: number;
    width: number;
  };
}

export interface MistralOCRResponse {
  pages: MistralOCRPage[];
  model: string;
  usage_info: {
    pages_processed: number;
    doc_size_bytes: number | null;
  };
}

export interface ProcessedOCRResult {
  totalPages: number;
  fullText: string;
  pages: ProcessedOCRPage[];
  images: ProcessedImage[];
  processedAt: Date;
}

export interface ProcessedOCRPage {
  pageNumber: number;
  markdown: string;
  images: MistralOCRImage[];
  dimensions: {
    dpi: number;
    height: number;
    width: number;
  };
}

export interface ProcessedImage {
  id: string;
  pageNumber: number;
  imageIndex: number;
  boundingBox: {
    topLeftX: number;
    topLeftY: number;
    bottomRightX: number;
    bottomRightY: number;
  };
  base64Data: string;
}

export class OCRService {
  private fileStorage: FileStorageService;
  private mistralApiKey: string;
  private vectorSearch?: VectorSearchService;

  constructor(fileStorage: FileStorageService, mistralApiKey: string, vectorSearch?: VectorSearchService) {
    this.fileStorage = fileStorage;
    this.mistralApiKey = mistralApiKey;
    this.vectorSearch = vectorSearch;
  }

  async processDocument(
    widgetId: string,
    fileId: string,
    buffer: ArrayBuffer
  ): Promise<ProcessedOCRResult> {
    console.log(`[OCR_START] widget_id=${widgetId} file_id=${fileId} buffer_size=${buffer.byteLength} operation=ocr_processing`);

    if (!this.mistralApiKey) {
      throw new Error("MISTRAL_AI_API_KEY environment variable is required");
    }

    try {
      // Convert ArrayBuffer to base64
      const uint8Array = new Uint8Array(buffer);
      const base64PDF = btoa(
        uint8Array.reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      
      console.log(`[OCR_API_PROGRESS] widget_id=${widgetId} file_id=${fileId} step=pdf_converted_to_base64 base64_length=${base64PDF.length}`);

      // Create the API request using the correct Mistral OCR format
      const requestBody = {
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          document_url: `data:application/pdf;base64,${base64PDF}`
        },
        include_image_base64: true
      };

      console.log(`[OCR_API_START] widget_id=${widgetId} file_id=${fileId} api_endpoint=mistral_ocr buffer_size=${buffer.byteLength}`);

      // Call Mistral OCR API
      const response = await fetch("https://api.mistral.ai/v1/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.mistralApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[OCR_API_ERROR] widget_id=${widgetId} file_id=${fileId} status=${response.status} error=${errorText}`);
        throw new Error(`Mistral OCR API error: ${response.status} - ${errorText}`);
      }

      const ocrResponse: MistralOCRResponse = await response.json();
      console.log(`[OCR_API_PROGRESS] widget_id=${widgetId} file_id=${fileId} pages_processed=${ocrResponse.usage_info.pages_processed}`);

      // Process the OCR response
      const processedResult = this.processOCRResponse(widgetId, fileId, ocrResponse);
      
      // Store individual page files
      await this.storePageFiles(widgetId, fileId, processedResult.pages);
      
      // Create embeddings if vector search is available
      if (this.vectorSearch) {
        try {
          const pageData = processedResult.pages.map(page => ({
            pageNumber: page.pageNumber,
            markdown: page.markdown
          }));
          
          await this.vectorSearch.createEmbeddingsFromOCRPages(widgetId, fileId, pageData);
          console.log(`[OCR_EMBEDDINGS] widget_id=${widgetId} file_id=${fileId} embeddings_created=true`);
        } catch (embeddingError) {
          console.error(`[OCR_EMBEDDINGS] widget_id=${widgetId} file_id=${fileId} embeddings_failed=true error=${embeddingError instanceof Error ? embeddingError.message : String(embeddingError)}`);
          // Don't fail OCR if embeddings fail
        }
      }
      
      console.log(`[OCR_SUCCESS] widget_id=${widgetId} file_id=${fileId} total_pages=${processedResult.totalPages} images_count=${processedResult.images.length} text_length=${processedResult.fullText.length}`);
      
      return processedResult;
    } catch (error) {
      console.error(`[OCR_ERROR] widget_id=${widgetId} file_id=${fileId} error_type=ocr_processing_failed error_name=${error instanceof Error ? error.name : 'Unknown'} error_message=${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private processOCRResponse(
    widgetId: string,
    fileId: string,
    ocrResponse: MistralOCRResponse
  ): ProcessedOCRResult {
    const pages: ProcessedOCRPage[] = [];
    const images: ProcessedImage[] = [];
    let fullText = "";

    // Process each page
    for (const page of ocrResponse.pages) {
      const pageNumber = page.index + 1; // Convert from 0-based to 1-based
      
      // Add page text to full text
      if (page.markdown) {
        fullText += page.markdown + "\n\n";
      }

      // Process images on this page
      const pageImages = page.images || [];
      for (let imageIndex = 0; imageIndex < pageImages.length; imageIndex++) {
        const image = pageImages[imageIndex];
        
        images.push({
          id: image.id,
          pageNumber,
          imageIndex,
          boundingBox: {
            topLeftX: image.top_left_x,
            topLeftY: image.top_left_y,
            bottomRightX: image.bottom_right_x,
            bottomRightY: image.bottom_right_y,
          },
          base64Data: image.image_base64,
        });
      }

      // Create processed page
      pages.push({
        pageNumber,
        markdown: page.markdown || "",
        images: pageImages,
        dimensions: page.dimensions,
      });
    }

    return {
      totalPages: ocrResponse.pages.length,
      fullText: fullText.trim(),
      pages,
      images,
      processedAt: new Date(),
    };
  }

  private async storePageFiles(widgetId: string, fileId: string, pages: ProcessedOCRPage[]): Promise<void> {
    const storePromises = pages.map(page => 
      this.fileStorage.storePageFile(widgetId, fileId, page.pageNumber, page.markdown)
    );
    
    await Promise.all(storePromises);
    console.log(`[OCR_STORAGE] widget_id=${widgetId} file_id=${fileId} stored_pages=${pages.length}`);
  }

  private shouldProcessWithOCR(fileType: string): boolean {
    // Skip text files that don't need OCR
    const textTypes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/csv'
    ];
    
    return !textTypes.includes(fileType.toLowerCase());
  }
}