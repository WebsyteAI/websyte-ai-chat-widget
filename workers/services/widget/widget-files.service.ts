import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database';
import { VectorSearchService } from '../vector-search';
import { FileStorageService } from '../file-storage';
import { widget } from '../../db/schema';
import { createLogger } from '../../lib/logger';
import { WidgetCrudService } from './widget-crud.service';

export class WidgetFilesService {
  private db: DatabaseService;
  private vectorSearch: VectorSearchService;
  private fileStorage: FileStorageService;
  private widgetCrud: WidgetCrudService;
  private logger = createLogger('WidgetFilesService');

  constructor(
    databaseService: DatabaseService,
    vectorSearchService: VectorSearchService,
    fileStorageService: FileStorageService,
    widgetCrudService: WidgetCrudService
  ) {
    this.db = databaseService;
    this.vectorSearch = vectorSearchService;
    this.fileStorage = fileStorageService;
    this.widgetCrud = widgetCrudService;
  }

  async addFileToWidget(widgetId: string, userId: string, file: File) {
    // Verify ownership
    const widgetRecord = await this.widgetCrud.getWidget(widgetId, userId);
    if (!widgetRecord) {
      throw new Error('Widget not found');
    }

    // Upload file
    const storedFile = await this.fileStorage.uploadFile({
      file,
      widgetId
    });

    // Update widget timestamp
    await this.db.getDatabase()
      .update(widget)
      .set({ updatedAt: new Date() })
      .where(eq(widget.id, widgetId));

    this.logger.info({ 
      filename: storedFile.filename, 
      fileType: storedFile.fileType, 
      widgetId 
    }, 'Added file to widget');

    return storedFile;
  }

  async removeFileFromWidget(widgetId: string, fileId: string, userId: string): Promise<boolean> {
    // Verify ownership
    const widgetRecord = await this.widgetCrud.getWidget(widgetId, userId);
    if (!widgetRecord) return false;

    // Delete embeddings for this file
    await this.vectorSearch.deleteEmbeddingsForFile(widgetId, fileId);

    // Delete file
    const deleted = await this.fileStorage.deleteFile(fileId, widgetId);

    if (deleted) {
      // Update widget timestamp
      await this.db.getDatabase()
        .update(widget)
        .set({ updatedAt: new Date() })
        .where(eq(widget.id, widgetId));

      this.logger.info({ fileId, widgetId }, 'Removed file from widget');
    }

    return deleted;
  }

  async getWidgetFiles(widgetId: string, userId: string) {
    // Verify ownership
    const widgetRecord = await this.widgetCrud.getWidget(widgetId, userId);
    if (!widgetRecord) return [];

    return this.fileStorage.getWidgetFiles(widgetId);
  }

  async getFileContent(widgetId: string, fileId: string, userId: string): Promise<string | null> {
    // Verify ownership
    const widgetRecord = await this.widgetCrud.getWidget(widgetId, userId);
    if (!widgetRecord) return null;

    return this.fileStorage.getFileContent(fileId, widgetId);
  }

  async downloadFile(widgetId: string, fileId: string, userId: string): Promise<Buffer | null> {
    // Verify ownership
    const widgetRecord = await this.widgetCrud.getWidget(widgetId, userId);
    if (!widgetRecord) return null;

    try {
      const fileContent = await this.fileStorage.downloadFile(fileId, widgetId);
      return fileContent;
    } catch (error) {
      this.logger.error({ err: error, fileId, widgetId }, 'Error downloading file');
      return null;
    }
  }

  async deleteAllWidgetFiles(widgetId: string, userId: string): Promise<boolean> {
    // Verify ownership
    const widgetRecord = await this.widgetCrud.getWidget(widgetId, userId);
    if (!widgetRecord) return false;

    // Delete all embeddings
    await this.vectorSearch.deleteEmbeddingsForWidget(widgetId);

    // Delete all files
    await this.fileStorage.deleteAllWidgetFiles(widgetId);

    // Update widget timestamp
    await this.db.getDatabase()
      .update(widget)
      .set({ updatedAt: new Date() })
      .where(eq(widget.id, widgetId));

    return true;
  }
}