import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { ApifyCrawlerService } from '../services/apify-crawler';
import { DatabaseService } from '../services/database';
import { VectorSearchService } from '../services/vector-search';
import { FileStorageService } from '../services/file-storage';

export interface WidgetContentPipelineParams {
  widgetId: string;
  crawlUrl: string;
  maxPages?: number;
  isRecrawl?: boolean;
}

interface CrawlResult {
  runId: string;
  pageCount: number;
  status: 'success' | 'failed';
  error?: string;
}

interface EmbeddingBatch {
  fileId: string;
  pageNumber: number;
  content: string;
  metadata: any;
}

export class WidgetContentPipeline extends WorkflowEntrypoint<Env, WidgetContentPipelineParams> {
  async run(event: WorkflowEvent<WidgetContentPipelineParams>, step: WorkflowStep) {
    const { widgetId, crawlUrl, maxPages = 25, isRecrawl = false } = event.payload;
    
    // Step 1: Update widget status to crawling
    await step.do('update-widget-status-crawling', async () => {
      const db = new DatabaseService(this.env.DATABASE_URL);
      await db.updateWidget(widgetId, {
        crawlStatus: 'crawling',
        lastCrawlAt: new Date()
      });
    });

    // Step 2: Start Apify crawl
    const crawlResult = await step.do('start-apify-crawl', async (): Promise<CrawlResult> => {
      try {
        const crawler = new ApifyCrawlerService(
          this.env.APIFY_API_TOKEN,
          new FileStorageService(this.env.WIDGET_FILES)
        );
        
        const result = await crawler.crawlWebsite(crawlUrl, widgetId, maxPages);
        
        return {
          runId: result.runId,
          pageCount: result.pages.length,
          status: 'success'
        };
      } catch (error) {
        console.error('[WORKFLOW] Crawl failed:', error);
        return {
          runId: '',
          pageCount: 0,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Step 3: Check if crawl was successful
    if (crawlResult.status === 'failed') {
      await step.do('update-widget-status-failed', async () => {
        const db = new DatabaseService(this.env.DATABASE_URL);
        await db.updateWidget(widgetId, {
          crawlStatus: 'failed',
          crawlRunId: crawlResult.runId
        });
      });
      
      throw new Error(`Crawl failed: ${crawlResult.error}`);
    }

    // Step 4: Get crawled files from R2
    const files = await step.do('get-crawled-files', async () => {
      const fileStorage = new FileStorageService(this.env.WIDGET_FILES);
      return await fileStorage.getFiles(widgetId);
    });

    // Step 5: Process embeddings in batches
    const BATCH_SIZE = 5; // Process 5 pages at a time
    const batches: EmbeddingBatch[][] = [];
    
    // Create batches
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE).map((file, index) => ({
        fileId: file.id,
        pageNumber: i + index + 1,
        content: file.content,
        metadata: file.metadata
      }));
      batches.push(batch);
    }

    // Process each batch
    let totalEmbeddings = 0;
    for (let i = 0; i < batches.length; i++) {
      const embeddingCount = await step.do(`process-embeddings-batch-${i}`, async () => {
        const db = new DatabaseService(this.env.DATABASE_URL);
        const vectorSearch = new VectorSearchService(this.env.OPENAI_API_KEY, db);
        
        let batchEmbeddings = 0;
        
        for (const item of batches[i]) {
          try {
            // Delete old embeddings if recrawling
            if (isRecrawl) {
              await vectorSearch.deleteEmbeddingsForFile(widgetId, item.fileId);
            }
            
            // Create new embeddings
            const count = await vectorSearch.createEmbeddingsFromCrawlPages(
              widgetId,
              item.fileId,
              [{
                pageNumber: item.pageNumber,
                markdown: item.content,
                metadata: item.metadata
              }]
            );
            
            batchEmbeddings += count;
          } catch (error) {
            console.error(`[WORKFLOW] Failed to process embeddings for file ${item.fileId}:`, error);
            // Continue with other files in the batch
          }
        }
        
        return batchEmbeddings;
      });
      
      totalEmbeddings += embeddingCount;
      
      // Add delay between batches to avoid rate limits
      if (i < batches.length - 1) {
        await step.sleep('rate-limit-delay', 1000); // 1 second delay
      }
    }

    // Step 6: Update widget status to completed
    await step.do('update-widget-status-completed', async () => {
      const db = new DatabaseService(this.env.DATABASE_URL);
      await db.updateWidget(widgetId, {
        crawlStatus: 'completed',
        crawlRunId: crawlResult.runId,
        crawlPageCount: files.length
      });
    });

    // Step 7: Generate recommendations (optional)
    await step.do('generate-recommendations', async () => {
      try {
        const db = new DatabaseService(this.env.DATABASE_URL);
        const widget = await db.getWidget(widgetId);
        
        if (widget && widget.summaries) {
          // Import recommendation service dynamically to avoid circular dependencies
          const { RecommendationService } = await import('../services/recommendation');
          const recommendationService = new RecommendationService(this.env.OPENAI_API_KEY);
          
          const recommendations = await recommendationService.generateRecommendations(
            widget.summaries.short,
            widget.summaries.medium
          );
          
          await db.updateWidget(widgetId, { recommendations });
        }
      } catch (error) {
        console.error('[WORKFLOW] Failed to generate recommendations:', error);
        // Don't fail the workflow if recommendations fail
      }
    });

    return {
      widgetId,
      crawlRunId: crawlResult.runId,
      pagesCrawled: files.length,
      embeddingsCreated: totalEmbeddings,
      status: 'completed'
    };
  }
}