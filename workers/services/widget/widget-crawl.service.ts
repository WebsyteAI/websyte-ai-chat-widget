import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database';
import { VectorSearchService } from '../vector-search';
import { FileStorageService } from '../file-storage';
import { ApifyCrawlerService } from '../apify-crawler';
import { widget } from '../../db/schema';
import { createLogger } from '../../lib/logger';
import { WidgetCrudService } from './widget-crud.service';

export class WidgetCrawlService {
  private db: DatabaseService;
  private vectorSearch: VectorSearchService;
  private fileStorage: FileStorageService;
  private apifyCrawler: ApifyCrawlerService;
  private widgetCrud: WidgetCrudService;
  private logger = createLogger('WidgetCrawlService');

  constructor(
    databaseService: DatabaseService,
    vectorSearchService: VectorSearchService,
    fileStorageService: FileStorageService,
    apifyCrawlerService: ApifyCrawlerService,
    widgetCrudService: WidgetCrudService
  ) {
    this.db = databaseService;
    this.vectorSearch = vectorSearchService;
    this.fileStorage = fileStorageService;
    this.apifyCrawler = apifyCrawlerService;
    this.widgetCrud = widgetCrudService;
  }

  async deleteExistingCrawlFiles(widgetId: string) {
    try {
      const files = await this.fileStorage.getWidgetFiles(widgetId);
      const crawlFiles = files.filter(f => f.filename.startsWith('crawl_'));
      
      for (const file of crawlFiles) {
        await this.vectorSearch.deleteEmbeddingsForFile(widgetId, file.id);
        await this.fileStorage.deleteFile(file.id, widgetId);
      }
      
      this.logger.info({ widgetId, deletedCount: crawlFiles.length }, 'Deleted existing crawl files');
    } catch (error) {
      this.logger.error({ err: error, widgetId }, 'Error deleting crawl files');
    }
  }

  async getCrawlStatus(widgetId: string, userId: string) {
    const widgetRecord = await this.widgetCrud.getWidget(widgetId, userId);
    if (!widgetRecord) {
      return null;
    }
    return widgetRecord;
  }

  async checkCrawlStatus(widgetId: string, runId: string, userId: string) {
    this.logger.info({ widgetId, runId }, 'Checking crawl status');
    
    try {
      const status = await this.apifyCrawler.getCrawlStatus(runId);
      this.logger.info({ widgetId, status }, 'Crawl status retrieved');
      
      if (status.status === 'SUCCEEDED') {
        await this.processCrawlResults(widgetId, runId, userId);
      } else if (status.status === 'FAILED' || status.status === 'ABORTED' || status.status === 'TIMED-OUT') {
        this.logger.error({ widgetId, status: status.status }, 'Crawl failed');
        await this.db.getDatabase()
          .update(widget)
          .set({ 
            crawlStatus: 'failed',
            crawlRunId: null 
          })
          .where(eq(widget.id, widgetId));
      } else {
        // Still running - update page count if available
        if (status.itemCount !== undefined && status.itemCount > 0) {
          await this.db.getDatabase()
            .update(widget)
            .set({ 
              crawlPageCount: status.itemCount
            })
            .where(eq(widget.id, widgetId));
        }
      }
    } catch (error) {
      this.logger.error({ err: error, widgetId, runId }, 'Error checking crawl status');
      
      await this.db.getDatabase()
        .update(widget)
        .set({ 
          crawlStatus: 'failed',
          crawlRunId: null 
        })
        .where(eq(widget.id, widgetId));
    }
  }

  async processCrawlResults(widgetId: string, runId: string, userId: string) {
    this.logger.info({ widgetId, runId }, 'Processing crawl results');
    
    try {
      // Check if already processing or completed
      const widgetRecord = await this.widgetCrud.getWidget(widgetId, userId);
      if (!widgetRecord || !widgetRecord.crawlUrl) throw new Error('Widget not found');
      
      // If already completed or processing, skip
      if (widgetRecord.crawlStatus === 'completed' || widgetRecord.crawlStatus === 'processing') {
        this.logger.info({ widgetId }, 'Crawl already processed or processing, skipping');
        return;
      }
      
      // Mark as processing to prevent concurrent calls
      await this.db.getDatabase()
        .update(widget)
        .set({ crawlStatus: 'processing' })
        .where(eq(widget.id, widgetId));
      
      // Get crawl results
      const results = await this.apifyCrawler.getCrawlResults(runId);
      this.logger.info({ widgetId, pageCount: results.length }, 'Retrieved crawl results');
      
      // If no results, mark as completed with 0 pages
      if (!results || results.length === 0) {
        this.logger.info({ widgetId }, 'No pages found in crawl results');
        await this.db.getDatabase()
          .update(widget)
          .set({
            crawlStatus: 'completed',
            crawlRunId: null,
            lastCrawlAt: new Date(),
            crawlPageCount: 0
          })
          .where(eq(widget.id, widgetId));
        return;
      }
      
      // Delete existing crawl files before adding new ones
      await this.deleteExistingCrawlFiles(widgetId);
      
      // Process and store crawl results
      const baseUrl = new URL(widgetRecord.crawlUrl).origin;
      let processedCount = 0;
      
      for (const result of results) {
        try {
          // Skip if no text content
          if (!result.text || result.text.trim().length < 50) {
            continue;
          }
          
          // Create filename from URL
          const urlPath = new URL(result.url).pathname;
          const filename = `crawl_${urlPath.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
          
          // Create a File object from the text content
          const blob = new Blob([result.text], { type: 'text/plain' });
          const file = new File([blob], filename, { type: 'text/plain' });
          
          // Store as file
          const storedFile = await this.fileStorage.uploadFile({
            file,
            widgetId,
            metadata: {
              sourceUrl: result.url,
              crawlRunId: runId,
              title: result.metadata?.title || urlPath
            }
          });
          
          processedCount++;
          this.logger.info({ 
            widgetId, 
            filename: storedFile.filename,
            sourceUrl: result.url 
          }, 'Stored crawl result');
          
        } catch (error) {
          this.logger.error({ 
            err: error, 
            widgetId, 
            url: result.url 
          }, 'Error processing crawl result');
        }
      }
      
      // Update widget with completion status
      await this.db.getDatabase()
        .update(widget)
        .set({
          crawlStatus: 'completed',
          crawlRunId: null,
          lastCrawlAt: new Date(),
          crawlPageCount: processedCount
        })
        .where(eq(widget.id, widgetId));
      
      this.logger.info({ 
        widgetId, 
        processedCount, 
        totalResults: results.length 
      }, 'Crawl processing completed');
      
      // Trigger recommendation generation after successful crawl
      try {
        const { WidgetContentService } = await import('./widget-content.service');
        const contentService = new WidgetContentService(
          this.db,
          this.vectorSearch,
          this.widgetCrud,
          process.env.OPENAI_API_KEY
        );
        
        await contentService.generateWidgetRecommendations(widgetId);
        await contentService.extractImportantLinks(widgetId);
      } catch (error) {
        this.logger.error({ err: error, widgetId }, 'Error generating recommendations/links after crawl');
      }
      
    } catch (error) {
      this.logger.error({ err: error, widgetId, runId }, 'Error processing crawl results');
      
      await this.db.getDatabase()
        .update(widget)
        .set({
          crawlStatus: 'failed',
          crawlRunId: null
        })
        .where(eq(widget.id, widgetId));
    }
  }

  async resetStuckCrawl(widgetId: string, userId: string): Promise<boolean> {
    const widgetRecord = await this.widgetCrud.getWidget(widgetId, userId);
    if (!widgetRecord) return false;

    // Only reset if status is crawling or processing
    if (widgetRecord.crawlStatus !== 'crawling' && widgetRecord.crawlStatus !== 'processing') {
      return false;
    }

    await this.db.getDatabase()
      .update(widget)
      .set({
        crawlStatus: null,
        crawlRunId: null
      })
      .where(eq(widget.id, widgetId));

    this.logger.info({ widgetId }, 'Reset stuck crawl');
    return true;
  }
}