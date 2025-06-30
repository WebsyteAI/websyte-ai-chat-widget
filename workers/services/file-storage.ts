import { DatabaseService } from './database';
import { widgetFile, type NewWidgetFile, type WidgetFile } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { OCRService } from './ocr-service';
import { VectorSearchService } from './vector-search';

export interface FileUpload {
  file: File;
  widgetId: string;
}

export interface StoredFile {
  id: string;
  widgetId: string;
  r2Key: string;
  filename: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export class FileStorageService {
  private r2: R2Bucket;
  private db: DatabaseService;
  private ocrService?: OCRService;
  private vectorSearch?: VectorSearchService;

  constructor(r2Bucket: R2Bucket, databaseService: DatabaseService, mistralApiKey?: string, vectorSearchService?: VectorSearchService) {
    this.r2 = r2Bucket;
    this.db = databaseService;
    this.vectorSearch = vectorSearchService;
    
    if (mistralApiKey) {
      this.ocrService = new OCRService(this, mistralApiKey, vectorSearchService);
    }
  }

  private generateR2Key(widgetId: string, fileId: string, filename: string): string {
    // Clean filename to be URL-safe
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // New structure: widgets/{widgetId}/{fileId}/{filename}
    return `widgets/${widgetId}/${fileId}/${cleanFilename}`;
  }

  private generatePageR2Key(widgetId: string, fileId: string, pageNumber: number): string {
    return `widgets/${widgetId}/${fileId}/page_${pageNumber}.md`;
  }

  async uploadFile(upload: FileUpload): Promise<StoredFile> {
    const { file, widgetId } = upload;
    
    // Generate a temporary unique ID for the r2Key
    const tempId = crypto.randomUUID();
    
    // Insert file record first to get the ID
    const fileRecord: NewWidgetFile = {
      widgetId,
      r2Key: `temp_${tempId}`, // Temporary unique key to avoid constraint violations
      filename: file.name,
      fileType: file.type,
      fileSize: file.size
    };

    const [insertedFile] = await this.db.getDatabase()
      .insert(widgetFile)
      .values(fileRecord)
      .returning();

    // Generate R2 key with the file ID
    const r2Key = this.generateR2Key(widgetId, insertedFile.id, file.name);

    try {
      // Upload to R2
      await this.r2.put(r2Key, file.stream(), {
        httpMetadata: {
          contentType: file.type,
          contentDisposition: `attachment; filename="${file.name}"`
        }
      });

      // Update the file record with the correct R2 key
      await this.db.getDatabase()
        .update(widgetFile)
        .set({ r2Key })
        .where(eq(widgetFile.id, insertedFile.id));

      // Process with OCR if applicable
      if (this.ocrService && this.shouldProcessWithOCR(file.type)) {
        try {
          console.log(`[FILE_UPLOAD] widget_id=${widgetId} file_id=${insertedFile.id} starting_ocr=true`);
          
          // Get file buffer for OCR processing
          const fileBuffer = await file.arrayBuffer();
          await this.ocrService.processDocument(widgetId, insertedFile.id, fileBuffer);
          
          console.log(`[FILE_UPLOAD] widget_id=${widgetId} file_id=${insertedFile.id} ocr_completed=true`);
        } catch (ocrError) {
          console.error(`[FILE_UPLOAD] widget_id=${widgetId} file_id=${insertedFile.id} ocr_failed=true error=${ocrError instanceof Error ? ocrError.message : String(ocrError)}`);
          // Don't fail the upload if OCR fails, just log the error
        }
      }

      return {
        id: insertedFile.id,
        widgetId: insertedFile.widgetId,
        r2Key: insertedFile.r2Key,
        filename: insertedFile.filename,
        fileType: insertedFile.fileType,
        fileSize: insertedFile.fileSize,
        createdAt: insertedFile.createdAt
      };
    } catch (error) {
      // Clean up any partial upload
      await this.cleanupFailedUpload(widgetId, insertedFile?.id || '', r2Key);
      
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async downloadFile(fileId: string, widgetId: string): Promise<R2ObjectBody | null> {
    try {
      // Get file metadata from database
      const [fileRecord] = await this.db.getDatabase()
        .select()
        .from(widgetFile)
        .where(and(
          eq(widgetFile.id, fileId),
          eq(widgetFile.widgetId, widgetId)
        ))
        .limit(1);

      if (!fileRecord) {
        return null;
      }

      // Get file from R2
      const r2Object = await this.r2.get(fileRecord.r2Key);
      return r2Object;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file');
    }
  }

  async deleteFile(fileId: string, widgetId: string): Promise<boolean> {
    try {
      // Get file metadata from database
      const [fileRecord] = await this.db.getDatabase()
        .select()
        .from(widgetFile)
        .where(and(
          eq(widgetFile.id, fileId),
          eq(widgetFile.widgetId, widgetId)
        ))
        .limit(1);

      if (!fileRecord) {
        return false;
      }

      // Delete from R2
      await this.r2.delete(fileRecord.r2Key);
      
      // Delete page files if they exist
      try {
        await this.deletePageFiles(widgetId, fileId);
      } catch (pageDeleteError) {
        console.error('Error deleting page files:', pageDeleteError);
        // Don't fail the whole operation if page file deletion fails
      }

      // Delete embeddings if vector search service is available
      if (this.vectorSearch) {
        try {
          await this.vectorSearch.deleteEmbeddingsForFile(widgetId, fileId);
        } catch (embeddingDeleteError) {
          console.error('Error deleting embeddings:', embeddingDeleteError);
          // Don't fail the whole operation if embedding deletion fails
        }
      }

      // Delete from database
      await this.db.getDatabase()
        .delete(widgetFile)
        .where(eq(widgetFile.id, fileId));

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getWidgetFiles(widgetId: string, includePageFiles: boolean = false): Promise<StoredFile[]> {
    try {
      const files = await this.db.getDatabase()
        .select()
        .from(widgetFile)
        .where(eq(widgetFile.widgetId, widgetId))
        .orderBy(widgetFile.createdAt);

      // Filter out page files unless explicitly requested
      const filteredFiles = includePageFiles 
        ? files 
        : files.filter(f => !f.filename.startsWith('page-') || !f.filename.endsWith('.md'));

      return filteredFiles.map(file => ({
        id: file.id,
        widgetId: file.widgetId,
        r2Key: file.r2Key,
        filename: file.filename,
        fileType: file.fileType,
        fileSize: file.fileSize,
        createdAt: file.createdAt
      }));
    } catch (error) {
      console.error('Error getting widget files:', error);
      throw new Error('Failed to get widget files');
    }
  }

  async deleteAllWidgetFiles(widgetId: string): Promise<void> {
    try {
      // Get all files for the widget
      const files = await this.getWidgetFiles(widgetId);

      // Delete all files from R2 and their page files
      const deletePromises = files.map(async (file: any) => {
        // Delete original file
        await this.r2.delete(file.r2Key);
        
        // Delete page files
        try {
          await this.deletePageFiles(widgetId, file.id);
        } catch (pageDeleteError) {
          console.error(`Error deleting page files for file ${file.id}:`, pageDeleteError);
          // Don't fail the whole operation
        }
      });
      
      await Promise.all(deletePromises);

      // Delete all records from database
      await this.db.getDatabase()
        .delete(widgetFile)
        .where(eq(widgetFile.widgetId, widgetId));
    } catch (error) {
      console.error('Error deleting all widget files:', error);
      throw new Error('Failed to delete all widget files');
    }
  }

  async getFileContent(fileId: string, widgetId: string): Promise<string | null> {
    try {
      const r2Object = await this.downloadFile(fileId, widgetId);
      if (!r2Object) {
        return null;
      }

      // Convert to text (works for text files, PDFs would need special handling)
      const arrayBuffer = await r2Object.arrayBuffer();
      const text = new TextDecoder().decode(arrayBuffer);
      return text;
    } catch (error) {
      console.error('Error getting file content:', error);
      throw new Error('Failed to get file content');
    }
  }

  async getFileUrl(fileId: string, widgetId: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      // Get file metadata from database
      const [fileRecord] = await this.db.getDatabase()
        .select()
        .from(widgetFile)
        .where(and(
          eq(widgetFile.id, fileId),
          eq(widgetFile.widgetId, widgetId)
        ))
        .limit(1);

      if (!fileRecord) {
        return null;
      }

      // Generate presigned URL (if R2 supports it, otherwise return a download endpoint)
      // For now, return a download endpoint that the API will handle
      return `/api/widgets/${widgetId}/files/${fileId}/download`;
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw new Error('Failed to get file URL');
    }
  }

  async storePageFile(widgetId: string, fileId: string, pageNumber: number, markdownContent: string): Promise<void> {
    try {
      const r2Key = this.generatePageR2Key(widgetId, fileId, pageNumber);
      
      // Upload to R2
      await this.r2.put(r2Key, markdownContent, {
        httpMetadata: {
          contentType: 'text/markdown',
        }
      });
      
      // Create database record for the page file
      const filename = `page-${pageNumber}.md`;
      const fileSize = new Blob([markdownContent]).size;
      
      await this.db.getDatabase()
        .insert(widgetFile)
        .values({
          widgetId,
          r2Key,
          filename,
          fileType: 'text/markdown',
          fileSize,
        })
        .onConflictDoNothing(); // In case the page already exists
        
    } catch (error) {
      console.error('Error storing page file:', error);
      throw new Error('Failed to store page file');
    }
  }

  async getPageFile(widgetId: string, fileId: string, pageNumber: number): Promise<string | null> {
    try {
      const r2Key = this.generatePageR2Key(widgetId, fileId, pageNumber);
      const r2Object = await this.r2.get(r2Key);
      
      if (!r2Object) {
        return null;
      }

      return await r2Object.text();
    } catch (error) {
      console.error('Error getting page file:', error);
      throw new Error('Failed to get page file');
    }
  }

  async deletePageFiles(widgetId: string, fileId: string): Promise<void> {
    try {
      // List all page files for this document
      const prefix = `widgets/${widgetId}/${fileId}/page_`;
      const objects = await this.r2.list({ prefix });
      
      // Delete from R2
      const deletePromises = objects.objects.map(obj => this.r2.delete(obj.key));
      await Promise.all(deletePromises);
      
      // Delete from database - find all page files by their r2Key pattern
      const pageFiles = await this.db.getDatabase()
        .select()
        .from(widgetFile)
        .where(and(
          eq(widgetFile.widgetId, widgetId),
          eq(widgetFile.fileType, 'text/markdown')
        ));
      
      // Filter for page files by checking if r2Key matches the page pattern
      const pageFileIds = pageFiles
        .filter(f => f.r2Key.startsWith(prefix))
        .map(f => f.id);
      
      if (pageFileIds.length > 0) {
        await this.db.getDatabase()
          .delete(widgetFile)
          .where(and(
            eq(widgetFile.widgetId, widgetId),
            eq(widgetFile.fileType, 'text/markdown')
          ));
      }
    } catch (error) {
      console.error('Error deleting page files:', error);
      throw new Error('Failed to delete page files');
    }
  }

  async countPageFiles(widgetId: string, fileId: string): Promise<number> {
    try {
      // List all page files for this document
      const prefix = `widgets/${widgetId}/${fileId}/page_`;
      const objects = await this.r2.list({ prefix });
      
      // Count only .md page files
      const pageFiles = objects.objects.filter(obj => obj.key.endsWith('.md'));
      return pageFiles.length;
    } catch (error) {
      console.error('Error counting page files:', error);
      return 0;
    }
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

  async cleanupFailedUpload(widgetId: string, fileId: string, r2Key?: string): Promise<void> {
    try {
      // Delete from R2 if key is provided
      if (r2Key) {
        try {
          await this.r2.delete(r2Key);
        } catch (r2Error) {
          console.error('Error cleaning up R2 object:', r2Error);
        }
      }

      // Delete page files if they exist
      try {
        await this.deletePageFiles(widgetId, fileId);
      } catch (pageDeleteError) {
        console.error('Error cleaning up page files:', pageDeleteError);
      }

      // Delete database record
      try {
        await this.db.getDatabase()
          .delete(widgetFile)
          .where(eq(widgetFile.id, fileId));
      } catch (dbError) {
        console.error('Error cleaning up database record:', dbError);
      }

      console.log(`[CLEANUP] Cleaned up failed upload: widget_id=${widgetId} file_id=${fileId}`);
    } catch (error) {
      console.error('Error during cleanup:', error);
      // Don't throw - cleanup is best effort
    }
  }
}