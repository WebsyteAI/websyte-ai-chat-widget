import { VectorSearchService } from '../vector-search';
import { FileStorageService } from '../file-storage';
import { createLogger } from '../../lib/logger';
import { WidgetCrudService } from './widget-crud.service';

export class WidgetEmbeddingsService {
  private vectorSearch: VectorSearchService;
  private fileStorage: FileStorageService;
  private widgetCrud: WidgetCrudService;
  private logger = createLogger('WidgetEmbeddingsService');

  constructor(
    vectorSearchService: VectorSearchService,
    fileStorageService: FileStorageService,
    widgetCrudService: WidgetCrudService
  ) {
    this.vectorSearch = vectorSearchService;
    this.fileStorage = fileStorageService;
    this.widgetCrud = widgetCrudService;
  }

  async refreshEmbeddings(widgetId: string, userId: string) {
    try {
      // Verify ownership
      const widgetRecord = await this.widgetCrud.getWidget(widgetId, userId);
      if (!widgetRecord) {
        return { embeddingsCreated: 0 };
      }

      // Delete all existing embeddings
      await this.vectorSearch.deleteEmbeddingsForWidget(widgetId);
      
      this.logger.info({ widgetId }, 'Deleted existing embeddings');

      let embeddingsCreated = 0;

      // Recreate embeddings for all files
      const files = widgetRecord.files;
      for (const file of files) {
        try {
          const content = await this.fileStorage.getFileContent(file.id, widgetId);
          
          if (content) {
            // Different handling for crawl files vs uploaded files
            const sourceType = file.filename.startsWith('crawl_') ? 'crawl' : 'file';
            const metadata = file.filename.startsWith('crawl_') 
              ? { sourceUrl: file.metadata?.sourceUrl || '' }
              : {};

            const count = await this.vectorSearch.createEmbeddingsForWidget(
              widgetId,
              content,
              sourceType,
              file.id,
              file.filename,
              metadata
            );
            
            embeddingsCreated += count;
            
            this.logger.info({ 
              widgetId, 
              fileId: file.id, 
              filename: file.filename,
              embeddingsCount: count 
            }, 'Created embeddings for file');
          }
        } catch (error) {
          this.logger.error({ 
            err: error, 
            widgetId, 
            fileId: file.id 
          }, 'Error creating embeddings for file');
        }
      }

      this.logger.info({ 
        widgetId, 
        totalEmbeddings: embeddingsCreated 
      }, 'Embeddings refresh completed');

      return { embeddingsCreated };
    } catch (error) {
      this.logger.error({ err: error, widgetId }, 'Error refreshing embeddings');
      throw error;
    }
  }

  async getEmbeddingsStats(widgetId: string, userId: string) {
    // Verify ownership
    const widgetRecord = await this.widgetCrud.getWidget(widgetId, userId);
    if (!widgetRecord) {
      return null;
    }

    const totalCount = await this.vectorSearch.getEmbeddingsCount(widgetId);
    
    // Get count by source type
    const stats = {
      total: totalCount,
      bySourceType: {
        file: 0,
        crawl: 0,
        text_content: 0
      },
      files: widgetRecord.files.length
    };

    // TODO: Implement detailed stats query if needed
    
    return stats;
  }

  async validateEmbeddings(widgetId: string, userId: string): Promise<boolean> {
    // Verify ownership
    const widgetRecord = await this.widgetCrud.getWidget(widgetId, userId);
    if (!widgetRecord) {
      return false;
    }

    const embeddingsCount = await this.vectorSearch.getEmbeddingsCount(widgetId);
    
    // Widget should have embeddings if it has files or content
    const shouldHaveEmbeddings = widgetRecord.files.length > 0 || 
                                 widgetRecord.crawlPageCount > 0;
    
    if (shouldHaveEmbeddings && embeddingsCount === 0) {
      this.logger.warn({ widgetId }, 'Widget has content but no embeddings');
      return false;
    }

    return true;
  }
}