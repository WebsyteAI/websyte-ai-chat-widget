import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers';
import type { Env } from '../types';

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
    
    // Import services dynamically to avoid circular dependencies
    const { DatabaseService } = await import('../services/database');
    const { ApifyCrawlerService } = await import('../services/apify-crawler');
    const { FileStorageService } = await import('../services/file-storage');
    const { VectorSearchService } = await import('../services/vector-search');
    const { widget } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');
    
    // Step 1: Update widget status to crawling
    await step.do('update-widget-status-crawling', async () => {
      const db = new DatabaseService(this.env.DATABASE_URL);
      await db.getDatabase()
        .update(widget)
        .set({
          crawlStatus: 'crawling',
          lastCrawlAt: new Date()
        })
        .where(eq(widget.id, widgetId));
    });

    // Step 2: Start Apify crawl and wait for completion
    const crawlResult = await step.do('start-and-process-crawl', async (): Promise<CrawlResult> => {
      try {
        const fileStorage = new FileStorageService(this.env.WIDGET_FILES);
        const db = new DatabaseService(this.env.DATABASE_URL);
        const { WidgetService } = await import('../services/widget');
        const widgetService = new WidgetService(
          db,
          new VectorSearchService(this.env.OPENAI_API_KEY, db),
          fileStorage,
          new ApifyCrawlerService(this.env.APIFY_API_TOKEN, fileStorage)
        );
        
        // Clean URL
        const url = new URL(crawlUrl);
        const cleanUrl = `${url.protocol}//${url.hostname}`;
        
        // Delete existing crawl files if recrawling
        if (isRecrawl) {
          await widgetService.deleteExistingCrawlFiles(widgetId);
        }
        
        // Start crawl using the existing service method
        const crawler = new ApifyCrawlerService(this.env.APIFY_API_TOKEN, fileStorage);
        const { runId } = await crawler.crawlWebsite(cleanUrl, {
          maxPages: maxPages,
          hostname: url.hostname
        });
        
        // Update widget with crawl runId
        await db.getDatabase()
          .update(widget)
          .set({
            crawlRunId: runId,
            crawlUrl: cleanUrl
          })
          .where(eq(widget.id, widgetId));
        
        // Wait for crawl to complete with timeout
        const maxWaitTime = 10 * 60 * 1000; // 10 minutes
        const startTime = Date.now();
        let pageCount = 0;
        
        while (Date.now() - startTime < maxWaitTime) {
          const status = await crawler.getCrawlStatus(runId);
          
          if (status.status === 'SUCCEEDED') {
            // Process the results
            const processedFiles = await widgetService.processCrawlResults(widgetId, runId);
            pageCount = processedFiles.filter(f => f.filename.includes('-page-')).length;
            break;
          } else if (status.status === 'FAILED' || status.status === 'ABORTED') {
            throw new Error(`Crawl failed with status: ${status.status}`);
          }
          
          // Wait before checking again
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds
        }
        
        if (pageCount === 0) {
          throw new Error('Crawl timed out or produced no results');
        }
        
        return {
          runId: runId,
          pageCount: pageCount,
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
        await db.getDatabase()
          .update(widget)
          .set({
            crawlStatus: 'failed',
            crawlRunId: crawlResult.runId
          })
          .where(eq(widget.id, widgetId));
      });
      
      throw new Error(`Crawl failed: ${crawlResult.error}`);
    }

    // Step 4: Get crawled files from R2
    const files = await step.do('get-crawled-files', async () => {
      const fileStorage = new FileStorageService(this.env.WIDGET_FILES);
      return await fileStorage.getWidgetFiles(widgetId);
    });

    // Step 5: Process embeddings from the crawled files
    let totalEmbeddings = 0;
    const crawlFileId = files.find(f => f.filename.endsWith('.crawl.md'))?.id;
    
    if (crawlFileId) {
      const embeddingCount = await step.do('process-all-embeddings', async () => {
        const db = new DatabaseService(this.env.DATABASE_URL);
        const fileStorage = new FileStorageService(this.env.WIDGET_FILES);
        const vectorSearch = new VectorSearchService(this.env.OPENAI_API_KEY, db);
        
        // Get all page files for this crawl
        const pageFiles = files.filter(f => 
          f.filename.includes(`-page-`) && f.filename.endsWith('.md')
        );
        
        let totalCreated = 0;
        
        // Process pages in small batches to avoid memory issues
        const BATCH_SIZE = 3;
        for (let i = 0; i < pageFiles.length; i += BATCH_SIZE) {
          const batch = pageFiles.slice(i, i + BATCH_SIZE);
          
          for (const file of batch) {
            try {
              // Extract page number from filename
              const pageMatch = file.filename.match(/-page-(\d+)\.md$/);
              const pageNumber = pageMatch ? parseInt(pageMatch[1]) : i + 1;
              
              // Get file content from R2
              const content = await fileStorage.getFileContent(file.r2Key);
              
              if (content) {
                // Delete old embeddings if recrawling
                if (isRecrawl) {
                  await vectorSearch.deleteEmbeddingsForFile(widgetId, file.id);
                }
                
                // Create embeddings
                const count = await vectorSearch.createEmbeddingsFromCrawlPages(
                  widgetId,
                  file.id,
                  [{
                    pageNumber: pageNumber,
                    markdown: content,
                    metadata: {}
                  }]
                );
                
                totalCreated += count;
              }
            } catch (error) {
              console.error(`[WORKFLOW] Failed to process embeddings for file ${file.id}:`, error);
              // Continue with other files
            }
          }
          
          // Add delay between batches to avoid rate limits
          if (i + BATCH_SIZE < pageFiles.length) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          }
        }
        
        return totalCreated;
      });
      
      totalEmbeddings = embeddingCount;
    }

    // Step 6: Update widget status to completed
    await step.do('update-widget-status-completed', async () => {
      const db = new DatabaseService(this.env.DATABASE_URL);
      await db.getDatabase()
        .update(widget)
        .set({
          crawlStatus: 'completed',
          crawlRunId: crawlResult.runId,
          crawlPageCount: crawlResult.pageCount
        })
        .where(eq(widget.id, widgetId));
    });

    // Step 7: Generate recommendations (optional)
    await step.do('generate-recommendations', async () => {
      try {
        const db = new DatabaseService(this.env.DATABASE_URL);
        const widgetRecord = await db.getDatabase()
          .select()
          .from(widget)
          .where(eq(widget.id, widgetId))
          .limit(1);
        
        if (widgetRecord.length > 0 && widgetRecord[0].summaries) {
          const { RecommendationsService } = await import('../services/recommendations');
          const recommendationService = new RecommendationsService(this.env.OPENAI_API_KEY);
          
          const recommendations = await recommendationService.generateRecommendations(
            widgetRecord[0].summaries.short,
            widgetRecord[0].summaries.medium
          );
          
          await db.getDatabase()
            .update(widget)
            .set({ recommendations })
            .where(eq(widget.id, widgetId));
        }
      } catch (error) {
        console.error('[WORKFLOW] Failed to generate recommendations:', error);
        // Don't fail the workflow if recommendations fail
      }
    });

    return {
      widgetId,
      crawlRunId: crawlResult.runId,
      pagesCrawled: crawlResult.pageCount,
      embeddingsCreated: totalEmbeddings,
      status: 'completed'
    };
  }
}