import { DatabaseService } from './database';
import { widgetFile, type NewWidgetFile, type WidgetFile } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface FileUpload {
  file: File;
  widgetId: number;
}

export interface StoredFile {
  id: number;
  widgetId: number;
  r2Key: string;
  filename: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export class FileStorageService {
  private r2: R2Bucket;
  private db: DatabaseService;

  constructor(r2Bucket: R2Bucket, databaseService: DatabaseService) {
    this.r2 = r2Bucket;
    this.db = databaseService;
  }

  private generateR2Key(widgetId: number, filename: string): string {
    // Clean filename to be URL-safe
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Simple structure: widgets/{widgetId}/{filename}
    return `widgets/${widgetId}/${cleanFilename}`;
  }

  async uploadFile(upload: FileUpload): Promise<StoredFile> {
    const { file, widgetId } = upload;
    const r2Key = this.generateR2Key(widgetId, file.name);

    try {
      // Upload to R2
      await this.r2.put(r2Key, file.stream(), {
        httpMetadata: {
          contentType: file.type,
          contentDisposition: `attachment; filename="${file.name}"`
        }
      });

      // Store file metadata in database
      const fileRecord: NewWidgetFile = {
        widgetId,
        r2Key,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size
      };

      const [insertedFile] = await this.db.getDatabase()
        .insert(widgetFile)
        .values(fileRecord)
        .returning();

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
      // Clean up R2 object if database insert fails
      try {
        await this.r2.delete(r2Key);
      } catch (deleteError) {
        console.error('Failed to clean up R2 object:', deleteError);
      }
      
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async downloadFile(fileId: number, widgetId: number): Promise<R2ObjectBody | null> {
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

  async deleteFile(fileId: number, widgetId: number): Promise<boolean> {
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

  async getWidgetFiles(widgetId: number): Promise<StoredFile[]> {
    try {
      const files = await this.db.getDatabase()
        .select()
        .from(widgetFile)
        .where(eq(widgetFile.widgetId, widgetId))
        .orderBy(widgetFile.createdAt);

      return files.map(file => ({
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

  async deleteAllWidgetFiles(widgetId: number): Promise<void> {
    try {
      // Get all files for the widget
      const files = await this.getWidgetFiles(widgetId);

      // Delete all files from R2
      const deletePromises = files.map((file: any) => this.r2.delete(file.r2Key));
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

  async getFileContent(fileId: number, widgetId: number): Promise<string | null> {
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

  async getFileUrl(fileId: number, widgetId: number, expiresIn: number = 3600): Promise<string | null> {
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
}