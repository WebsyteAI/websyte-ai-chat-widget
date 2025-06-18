import { eq, and, desc, sql } from 'drizzle-orm';
import { DatabaseService } from './database';
import { VectorSearchService } from './vector-search';
import { FileStorageService } from './file-storage';
import { widget, type Widget, type NewWidget } from '../db/schema';

export interface CreateWidgetRequest {
  name: string;
  description?: string;
  url?: string;
  content?: string;
  files?: File[];
}

export interface UpdateWidgetRequest {
  name?: string;
  description?: string;
  url?: string;
  content?: string;
}

export interface WidgetWithFiles extends Widget {
  files: Array<{
    id: number;
    filename: string;
    fileType: string;
    fileSize: number;
    createdAt: Date;
  }>;
  embeddingsCount: number;
}

export class WidgetService {
  private db: DatabaseService;
  private vectorSearch: VectorSearchService;
  private fileStorage: FileStorageService;

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

        // Create embeddings for file content
        const fileContent = await this.fileStorage.getFileContent(storedFile.id, createdWidget.id);
        if (fileContent) {
          await this.vectorSearch.createEmbeddingsForWidget(
            createdWidget.id,
            fileContent,
            `file:${storedFile.filename}`,
            storedFile.id
          );
        }
      }
    }

    const embeddingsCount = await this.vectorSearch.getEmbeddingsCount(createdWidget.id);

    return {
      ...createdWidget,
      files: uploadedFiles.map(f => ({
        id: f.id,
        filename: f.filename,
        fileType: f.fileType,
        fileSize: f.fileSize,
        createdAt: f.createdAt
      })),
      embeddingsCount
    };
  }

  async getWidget(id: number, userId: string): Promise<WidgetWithFiles | null> {
    const [widgetRecord] = await this.db.getDatabase()
      .select()
      .from(widget)
      .where(and(
        eq(widget.id, id),
        eq(widget.userId, userId)
      ))
      .limit(1);

    if (!widgetRecord) {
      return null;
    }

    const files = await this.fileStorage.getWidgetFiles(id);
    const embeddingsCount = await this.vectorSearch.getEmbeddingsCount(id);

    return {
      ...widgetRecord,
      files: files.map(f => ({
        id: f.id,
        filename: f.filename,
        fileType: f.fileType,
        fileSize: f.fileSize,
        createdAt: f.createdAt
      })),
      embeddingsCount
    };
  }

  async getUserWidgets(userId: string, limit: number = 50, offset: number = 0): Promise<WidgetWithFiles[]> {
    const widgets = await this.db.getDatabase()
      .select()
      .from(widget)
      .where(eq(widget.userId, userId))
      .orderBy(desc(widget.updatedAt))
      .limit(limit)
      .offset(offset);

    const result: WidgetWithFiles[] = [];
    
    for (const w of widgets) {
      const files = await this.fileStorage.getWidgetFiles(w.id);
      const embeddingsCount = await this.vectorSearch.getEmbeddingsCount(w.id);
      
      result.push({
        ...w,
        files: files.map((f: any) => ({
          id: f.id,
          filename: f.filename,
          fileType: f.fileType,
          fileSize: f.fileSize,
          createdAt: f.createdAt
        })),
        embeddingsCount
      });
    }

    return result;
  }

  async updateWidget(id: number, userId: string, request: UpdateWidgetRequest): Promise<WidgetWithFiles | null> {
    const updateData: Partial<NewWidget> = {};
    
    if (request.name !== undefined) updateData.name = request.name;
    if (request.description !== undefined) updateData.description = request.description;
    if (request.url !== undefined) updateData.url = request.url;

    const [updatedWidget] = await this.db.getDatabase()
      .update(widget)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(
        eq(widget.id, id),
        eq(widget.userId, userId)
      ))
      .returning();

    if (!updatedWidget) {
      return null;
    }

    // Handle content updates
    if (request.content !== undefined) {
      // Delete existing text embeddings (keep file embeddings)
      await this.db.getDatabase().execute(
        sql`DELETE FROM widget_embedding WHERE widget_id = ${id} AND (metadata->>'source' = 'text_content' OR metadata->>'source' = 'text')`
      );

      // Create new embeddings if content provided
      if (request.content) {
        await this.vectorSearch.createEmbeddingsForWidget(id, request.content, 'text_content');
      }
    }

    const files = await this.fileStorage.getWidgetFiles(id);
    const embeddingsCount = await this.vectorSearch.getEmbeddingsCount(id);

    return {
      ...updatedWidget,
      files: files.map(f => ({
        id: f.id,
        filename: f.filename,
        fileType: f.fileType,
        fileSize: f.fileSize,
        createdAt: f.createdAt
      })),
      embeddingsCount
    };
  }

  async deleteWidget(id: number, userId: string): Promise<boolean> {
    // Verify ownership
    const widgetRecord = await this.getWidget(id, userId);
    if (!widgetRecord) {
      return false;
    }

    // Delete embeddings
    await this.vectorSearch.deleteEmbeddingsForWidget(id);

    // Delete files from R2 and database
    await this.fileStorage.deleteAllWidgetFiles(id);

    // Delete widget record
    await this.db.getDatabase()
      .delete(widget)
      .where(and(
        eq(widget.id, id),
        eq(widget.userId, userId)
      ));

    return true;
  }

  async searchWidgetContent(id: number, userId: string, query: string, limit: number = 10) {
    // Verify ownership
    const widgetRecord = await this.getWidget(id, userId);
    if (!widgetRecord) {
      throw new Error('Widget not found');
    }

    return await this.vectorSearch.searchSimilarContent(query, id, limit);
  }

  async searchAllUserWidgets(userId: string, query: string, limit: number = 20) {
    // Get user's widget IDs
    const userWidgets = await this.db.getDatabase()
      .select({ id: widget.id })
      .from(widget)
      .where(eq(widget.userId, userId));

    const widgetIds = userWidgets.map(w => w.id);

    if (widgetIds.length === 0) {
      return [];
    }

    // Search across all widgets (vectorSearch will handle filtering by widget IDs)
    return await this.vectorSearch.searchSimilarContent(query, undefined, limit);
  }

  async addFileToWidget(id: number, userId: string, file: File) {
    // Verify ownership
    const widgetRecord = await this.getWidget(id, userId);
    if (!widgetRecord) {
      throw new Error('Widget not found');
    }

    // Upload file
    const storedFile = await this.fileStorage.uploadFile({
      file,
      widgetId: id
    });

    // Create embeddings for file content
    const fileContent = await this.fileStorage.getFileContent(storedFile.id, id);
    if (fileContent) {
      await this.vectorSearch.createEmbeddingsForWidget(
        id,
        fileContent,
        `file:${storedFile.filename}`,
        storedFile.id
      );
    }

    // Update widget timestamp
    await this.db.getDatabase()
      .update(widget)
      .set({ updatedAt: new Date() })
      .where(eq(widget.id, id));

    return {
      id: storedFile.id,
      filename: storedFile.filename,
      fileType: storedFile.fileType,
      fileSize: storedFile.fileSize,
      createdAt: storedFile.createdAt
    };
  }

  async removeFileFromWidget(widgetId: number, fileId: number, userId: string): Promise<boolean> {
    // Verify ownership
    const widgetRecord = await this.getWidget(widgetId, userId);
    if (!widgetRecord) {
      return false;
    }

    // Delete embeddings for this file
    await this.vectorSearch.deleteEmbeddingsForFile(widgetId, fileId);

    // Delete file from storage
    const deleted = await this.fileStorage.deleteFile(fileId, widgetId);

    if (deleted) {
      // Update widget timestamp
      await this.db.getDatabase()
        .update(widget)
        .set({ updatedAt: new Date() })
        .where(eq(widget.id, widgetId));
    }

    return deleted;
  }
}