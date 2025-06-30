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
    
    try {
    
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

    // Step 2: Start Apify crawl
    const crawlRunId = await step.do<string>('start-crawl', async (): Promise<string> => {
      const db = new DatabaseService(this.env.DATABASE_URL);
      const fileStorage = new FileStorageService(this.env.WIDGET_FILES, db);
      const { WidgetService } = await import('../services/widget');
      const widgetService = new WidgetService(
        db,
        new VectorSearchService(this.env.OPENAI_API_KEY, db),
        fileStorage,
        new ApifyCrawlerService(this.env.APIFY_API_TOKEN),
        this.env.OPENAI_API_KEY
      );
      
      // Clean URL
      const url = new URL(crawlUrl);
      const cleanUrl = `${url.protocol}//${url.hostname}`;
      
      // Delete existing crawl files if recrawling
      if (isRecrawl) {
        await widgetService.deleteExistingCrawlFiles(widgetId);
      }
      
      // Start crawl using the existing service method
      const crawler = new ApifyCrawlerService(this.env.APIFY_API_TOKEN);
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
      
      return runId;
    });

    // Step 3: Poll for crawl completion
    let crawlResult: CrawlResult | null = null;
    const maxAttempts = 120; // 120 attempts * 5 seconds = 10 minutes
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const checkResult = await step.do<CrawlResult | null>(`check-crawl-status-${attempt}`, async (): Promise<CrawlResult | null> => {
        const db = new DatabaseService(this.env.DATABASE_URL);
        const fileStorage = new FileStorageService(this.env.WIDGET_FILES, db);
        const { WidgetService } = await import('../services/widget');
        const widgetService = new WidgetService(
          db,
          new VectorSearchService(this.env.OPENAI_API_KEY, db),
          fileStorage,
          new ApifyCrawlerService(this.env.APIFY_API_TOKEN),
          this.env.OPENAI_API_KEY
        );
        const crawler = new ApifyCrawlerService(this.env.APIFY_API_TOKEN);
        
        try {
          const status = await crawler.getCrawlStatus(crawlRunId);
          
          if (status.status === 'SUCCEEDED') {
            // Process the results and get page count from database
            const dbWidget = await db.getDatabase()
              .select()
              .from(widget)
              .where(eq(widget.id, widgetId))
              .limit(1);
            
            // Process crawl results (this updates widget files)
            await widgetService.processCrawlResults(widgetId, crawlRunId, dbWidget[0]?.userId || 'system');
            
            // Get the processed files to count pages (including page files)
            const files = await fileStorage.getWidgetFiles(widgetId, true);
            const pageCount = files.filter(f => f.filename.startsWith('page-') && f.filename.endsWith('.md')).length;
            
            return {
              runId: crawlRunId,
              pageCount: pageCount,
              status: 'success'
            };
          } else if (status.status === 'FAILED' || status.status === 'ABORTED') {
            return {
              runId: crawlRunId,
              pageCount: 0,
              status: 'failed',
              error: `Crawl failed with status: ${status.status}`
            };
          }
          
          // Still running, return null to continue polling
          return null;
        } catch (error) {
          console.error(`[WORKFLOW] Error checking crawl status (attempt ${attempt + 1}):`, error);
          // Return null to continue polling unless it's the last attempt
          if (attempt >= maxAttempts - 1) {
            return {
              runId: crawlRunId,
              pageCount: 0,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
          return null;
        }
      });
      
      if (checkResult !== null) {
        crawlResult = checkResult;
        break;
      }
      
      // Sleep before next check (except on last attempt)
      if (attempt < maxAttempts - 1) {
        await step.sleep(`wait-crawl-${attempt}`, '5 seconds');
      }
    }
    
    // If we exit the loop without a result, it means we timed out
    if (!crawlResult) {
      crawlResult = {
        runId: crawlRunId,
        pageCount: 0,
        status: 'failed',
        error: 'Crawl timed out after 10 minutes'
      };
    }

    // Step 4: Check if crawl was successful
    if (crawlResult.status === 'failed') {
      await step.do('update-widget-status-failed', async () => {
        const db = new DatabaseService(this.env.DATABASE_URL);
        await db.getDatabase()
          .update(widget)
          .set({
            crawlStatus: 'failed',
            crawlRunId: crawlResult.runId,
            workflowId: null // Clear workflowId when failed
          })
          .where(eq(widget.id, widgetId));
      });
      
      throw new Error(`Crawl failed: ${crawlResult.error}`);
    }

    // Step 4: Get crawled files from R2
    const files = await step.do<any[]>('get-crawled-files', async () => {
      const db = new DatabaseService(this.env.DATABASE_URL);
      const fileStorage = new FileStorageService(this.env.WIDGET_FILES, db);
      return await fileStorage.getWidgetFiles(widgetId);
    });

    // Step 5: Process embeddings from the crawled files
    let totalEmbeddings = 0;
    const crawlFileId = files.find(f => f.filename.endsWith('.crawl.md'))?.id;
    
    if (crawlFileId) {
      const embeddingCount = await step.do<number>('process-all-embeddings', async () => {
        const db = new DatabaseService(this.env.DATABASE_URL);
        const fileStorage = new FileStorageService(this.env.WIDGET_FILES, db);
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
              const content = await fileStorage.getFileContent(widgetId, file.r2Key);
              
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
          // Note: We can't use step.sleep inside step.do, so we'll rely on natural processing time
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
          crawlPageCount: crawlResult.pageCount,
          workflowId: null // Clear workflowId when completed
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
          const { OpenAIService } = await import('../services/openai');
          const openaiService = new OpenAIService(this.env.OPENAI_API_KEY);
          
          const { recommendations } = await openaiService.generateRecommendations(
            widgetRecord[0].summaries.short,
            widgetRecord[0].name || 'Widget',
            widgetRecord[0].crawlUrl || ''
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
    } catch (error) {
      // Ensure widget status is set to failed if workflow crashes
      console.error('[WORKFLOW] Widget content pipeline failed:', error);
      
      try {
        await step.do('update-widget-status-error', async () => {
          const db = new DatabaseService(this.env.DATABASE_URL);
          await db.getDatabase()
            .update(widget)
            .set({
              crawlStatus: 'failed',
              workflowId: null // Clear workflowId when failed
            })
            .where(eq(widget.id, widgetId));
        });
      } catch (updateError) {
        console.error('[WORKFLOW] Failed to update widget status on error:', updateError);
      }
      
      throw error; // Re-throw to mark workflow as failed
    }
  }
}