import { eq, and, desc, sql } from 'drizzle-orm';
import { DatabaseService } from '../database';
import { VectorSearchService } from '../vector-search';
import { FileStorageService } from '../file-storage';
import { widget, widgetEmbedding, type Widget, type NewWidget } from '../../db/schema';
import { createLogger } from '../../lib/logger';

export interface CreateWidgetRequest {
  name: string;
  description?: string;
  url?: string;
  logoUrl?: string;
  content?: string;
  files?: File[];
}

export interface UpdateWidgetRequest {
  name?: string;
  description?: string;
  url?: string;
  logoUrl?: string;
  content?: string;
  isPublic?: boolean;
  crawlUrl?: string;
}

export interface WidgetWithFiles extends Widget {
  files: Array<{
    id: string;
    filename: string;
    fileType: string;
    fileSize: number;
    createdAt: Date;
  }>;
  embeddingsCount: number;
}

export class WidgetCrudService {
  private db: DatabaseService;
  private vectorSearch: VectorSearchService;
  private fileStorage: FileStorageService;
  private logger = createLogger('WidgetCrudService');

  constructor(
    databaseService: DatabaseService,
    vectorSearchService: VectorSearchService,
    fileStorageService: FileStorageService
  ) {
    this.db = databaseService;
    this.vectorSearch = vectorSearchService;
    this.fileStorage = fileStorageService;
  }

  async createWidget(userId: string, request: CreateWidgetRequest): Promise<WidgetWithFiles> {
    // Create widget record
    const newWidget: NewWidget = {
      userId,
      name: request.name,
      description: request.description,
      url: request.url,
      logoUrl: request.logoUrl,
      cacheEnabled: true
    };

    const [createdWidget] = await this.db.getDatabase()
      .insert(widget)
      .values(newWidget)
      .returning();

    // Handle content embeddings
    if (request.content) {
      await this.vectorSearch.createEmbeddingsForWidget(
        createdWidget.id,
        request.content,
        'text_content'
      );
    }

    // Handle file uploads
    const uploadedFiles = [];
    if (request.files && request.files.length > 0) {
      for (const file of request.files) {
        const storedFile = await this.fileStorage.uploadFile({
          file,
          widgetId: createdWidget.id
        });
        uploadedFiles.push(storedFile);
        
        this.logger.info({ 
          filename: storedFile.filename, 
          fileType: storedFile.fileType, 
          widgetId: createdWidget.id 
        }, 'Uploaded file');
      }
    }

    // Get embeddings count
    const embeddingsCount = await this.vectorSearch.getEmbeddingsCount(createdWidget.id);

    return {
      ...createdWidget,
      files: uploadedFiles,
      embeddingsCount
    };
  }

  async getWidget(widgetId: string, userId: string): Promise<WidgetWithFiles | null> {
    const [widgetRecord] = await this.db.getDatabase()
      .select()
      .from(widget)
      .where(and(eq(widget.id, widgetId), eq(widget.userId, userId)))
      .limit(1);

    if (!widgetRecord) return null;

    const files = await this.fileStorage.getWidgetFiles(widgetId);
    const embeddingsCount = await this.vectorSearch.getEmbeddingsCount(widgetId);

    return {
      ...widgetRecord,
      files,
      embeddingsCount
    };
  }

  async getPublicWidget(widgetId: string): Promise<WidgetWithFiles | null> {
    const [widgetRecord] = await this.db.getDatabase()
      .select()
      .from(widget)
      .where(and(eq(widget.id, widgetId), eq(widget.isPublic, true)))
      .limit(1);

    if (!widgetRecord) return null;

    // For public widgets, we don't expose file details
    const embeddingsCount = await this.vectorSearch.getEmbeddingsCount(widgetId);

    return {
      ...widgetRecord,
      files: [],
      embeddingsCount,
      links: widgetRecord.links || []
    };
  }

  async getUserWidgets(userId: string, limit = 50, offset = 0): Promise<WidgetWithFiles[]> {
    const widgets = await this.db.getDatabase()
      .select()
      .from(widget)
      .where(eq(widget.userId, userId))
      .orderBy(desc(widget.createdAt))
      .limit(limit)
      .offset(offset);

    const widgetsWithFiles = await Promise.all(
      widgets.map(async (w) => {
        const files = await this.fileStorage.getWidgetFiles(w.id);
        const embeddingsCount = await this.vectorSearch.getEmbeddingsCount(w.id);
        return {
          ...w,
          files,
          embeddingsCount
        };
      })
    );

    return widgetsWithFiles;
  }

  async getUserWidgetsCount(userId: string): Promise<number> {
    const result = await this.db.getDatabase()
      .select({ count: sql`count(*)` })
      .from(widget)
      .where(eq(widget.userId, userId))
      .execute();

    return Number(result[0].count);
  }

  async getAllWidgets(limit = 50, offset = 0): Promise<WidgetWithFiles[]> {
    const widgets = await this.db.getDatabase()
      .select()
      .from(widget)
      .orderBy(desc(widget.createdAt))
      .limit(limit)
      .offset(offset);

    const widgetsWithFiles = await Promise.all(
      widgets.map(async (w) => {
        const files = await this.fileStorage.getWidgetFiles(w.id);
        const embeddingsCount = await this.vectorSearch.getEmbeddingsCount(w.id);
        return {
          ...w,
          files,
          embeddingsCount
        };
      })
    );

    return widgetsWithFiles;
  }

  async getAllWidgetsCount(): Promise<number> {
    const result = await this.db.getDatabase()
      .select({ count: sql`count(*)` })
      .from(widget)
      .execute();

    return Number(result[0].count);
  }

  async updateWidget(widgetId: string, userId: string, request: UpdateWidgetRequest): Promise<WidgetWithFiles | null> {
    // Verify ownership
    const existingWidget = await this.getWidget(widgetId, userId);
    if (!existingWidget) return null;

    const updateData: Partial<Widget> = {
      updatedAt: new Date()
    };

    // Update basic fields
    if (request.name !== undefined) updateData.name = request.name;
    if (request.description !== undefined) updateData.description = request.description;
    if (request.url !== undefined) updateData.url = request.url;
    if (request.logoUrl !== undefined) updateData.logoUrl = request.logoUrl;
    if (request.isPublic !== undefined) updateData.isPublic = request.isPublic;

    // Handle content update
    if (request.content !== undefined) {
      // Delete existing text content embeddings
      await this.db.getDatabase()
        .delete(widgetEmbedding)
        .where(and(
          eq(widgetEmbedding.widgetId, widgetId),
          eq(widgetEmbedding.sourceType, 'text_content')
        ))
        .execute();

      // Create new embeddings if content is not empty
      if (request.content) {
        await this.vectorSearch.createEmbeddingsForWidget(
          widgetId,
          request.content,
          'text_content'
        );
      }
    }

    // Handle crawlUrl update
    if (request.crawlUrl !== undefined) {
      const crawlUrlChanged = existingWidget.crawlUrl !== request.crawlUrl;
      
      if (crawlUrlChanged && existingWidget.crawlUrl) {
        // Delete existing crawl files if URL changed
        await this.deleteExistingCrawlFiles(widgetId);
      }

      updateData.crawlUrl = request.crawlUrl || null;
      
      if (crawlUrlChanged) {
        updateData.crawlStatus = null;
        updateData.crawlRunId = null;
        updateData.workflowId = null;
        updateData.crawlPageCount = 0;
      }
    }

    // Update widget
    const [updatedWidget] = await this.db.getDatabase()
      .update(widget)
      .set(updateData)
      .where(eq(widget.id, widgetId))
      .returning();

    // Return updated widget with files
    return this.getWidget(widgetId, userId);
  }

  async deleteWidget(widgetId: string, userId: string): Promise<boolean> {
    // Verify ownership
    const existingWidget = await this.getWidget(widgetId, userId);
    if (!existingWidget) return false;

    // Delete embeddings
    await this.vectorSearch.deleteEmbeddingsForWidget(widgetId);

    // Delete files
    await this.fileStorage.deleteAllWidgetFiles(widgetId);

    // Delete widget
    await this.db.getDatabase()
      .delete(widget)
      .where(eq(widget.id, widgetId));

    return true;
  }

  private async deleteExistingCrawlFiles(widgetId: string): Promise<void> {
    try {
      const files = await this.fileStorage.getWidgetFiles(widgetId);
      const crawlFiles = files.filter(f => f.filename.startsWith('crawl_'));
      
      for (const file of crawlFiles) {
        await this.vectorSearch.deleteEmbeddingsForFile(widgetId, file.id);
        await this.fileStorage.deleteFile(file.id, widgetId);
      }
    } catch (error) {
      this.logger.error({ err: error, widgetId }, 'Error deleting crawl files');
    }
  }
}