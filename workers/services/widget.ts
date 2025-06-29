import { eq, and, desc, sql, like } from 'drizzle-orm';
import { DatabaseService } from './database';
import { VectorSearchService } from './vector-search';
import { FileStorageService } from './file-storage';
import { ApifyCrawlerService } from './apify-crawler';
import { OpenAIService } from './openai';
import { widget, widgetEmbedding, type Widget, type NewWidget } from '../db/schema';

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

export class WidgetService {
  private db: DatabaseService;
  private vectorSearch: VectorSearchService;
  private fileStorage: FileStorageService;
  private apifyCrawler: ApifyCrawlerService;
  private openaiApiKey: string;

  constructor(
    databaseService: DatabaseService,
    vectorSearchService: VectorSearchService,
    fileStorageService: FileStorageService,
    apifyCrawlerService: ApifyCrawlerService,
    openaiApiKey?: string
  ) {
    this.db = databaseService;
    this.vectorSearch = vectorSearchService;
    this.fileStorage = fileStorageService;
    this.apifyCrawler = apifyCrawlerService;
    this.openaiApiKey = openaiApiKey || '';
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

    // Handle file uploads - OCR processing and embedding creation happens automatically
    const uploadedFiles = [];
    if (request.files && request.files.length > 0) {
      for (const file of request.files) {
        const storedFile = await this.fileStorage.uploadFile({
          file,
          widgetId: createdWidget.id
        });
        uploadedFiles.push(storedFile);
        
        console.log(`[WIDGET_CREATE] Uploaded file: ${storedFile.filename} (${storedFile.fileType})`);
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

  async getWidget(id: string, userId: string): Promise<WidgetWithFiles | null> {
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

  async getPublicWidget(id: string): Promise<WidgetWithFiles | null> {
    const [widgetRecord] = await this.db.getDatabase()
      .select()
      .from(widget)
      .where(and(
        eq(widget.id, id),
        eq(widget.isPublic, true)
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


  async updateWidget(id: string, userId: string, request: UpdateWidgetRequest): Promise<WidgetWithFiles | null> {
    console.log('[WidgetService] updateWidget called with:', { id, userId, request });
    
    // Get the current widget to check if crawlUrl is changing
    const currentWidget = await this.getWidget(id, userId);
    if (!currentWidget) {
      return null;
    }

    const updateData: Partial<NewWidget> = {};
    
    if (request.name !== undefined) updateData.name = request.name;
    if (request.description !== undefined) updateData.description = request.description;
    if (request.url !== undefined) updateData.url = request.url;
    if (request.isPublic !== undefined) updateData.isPublic = request.isPublic;
    if (request.crawlUrl !== undefined) updateData.crawlUrl = request.crawlUrl || null;
    
    console.log('[WidgetService] Current crawlUrl:', currentWidget.crawlUrl);
    console.log('[WidgetService] New crawlUrl:', request.crawlUrl);
    console.log('[WidgetService] Update data:', updateData);

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

    // Handle crawl URL updates - automatically start crawl if URL is new or changed
    if (request.crawlUrl !== undefined && request.crawlUrl !== currentWidget.crawlUrl) {
      console.log('[WidgetService] Crawl URL changed, processing...');
      if (request.crawlUrl) {
        console.log('[WidgetService] Starting crawl for URL:', request.crawlUrl);
        // Start crawl synchronously so the status is updated before returning
        try {
          await this.startWebsiteCrawl(id, userId, request.crawlUrl);
        } catch (error) {
          console.error('Error starting crawl after widget update:', error);
          // Re-throw the error so it can be handled by the API endpoint
          throw new Error(`Failed to start website crawl: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else if (!request.crawlUrl && currentWidget.crawlUrl) {
        console.log('[WidgetService] Crawl URL removed, deleting crawl files');
        // Crawl URL was removed, delete existing crawl files
        await this.deleteExistingCrawlFiles(id);
        // Reset crawl status
        await this.db.getDatabase()
          .update(widget)
          .set({
            crawlStatus: null,
            crawlRunId: null,
            lastCrawlAt: null,
            crawlPageCount: 0
          })
          .where(eq(widget.id, id));
      }
    }

    // Fetch the widget again to get the latest status (especially if crawl was started)
    const finalWidget = await this.db.getDatabase()
      .select()
      .from(widget)
      .where(eq(widget.id, id))
      .limit(1);

    const files = await this.fileStorage.getWidgetFiles(id);
    const embeddingsCount = await this.vectorSearch.getEmbeddingsCount(id);

    console.log('[WidgetService] Returning updated widget:', finalWidget[0]);

    return {
      ...finalWidget[0],
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

  async deleteWidget(id: string, userId: string): Promise<boolean> {
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

  async searchWidgetContent(id: string, userId: string, query: string, limit: number = 10) {
    console.log('[WIDGET] Searching content for widget:', id, 'user:', userId, 'query:', query);
    
    // Verify ownership
    const widgetRecord = await this.getWidget(id, userId);
    if (!widgetRecord) {
      console.error('[WIDGET] Widget not found or user does not have access. Widget ID:', id, 'User ID:', userId);
      throw new Error('Widget not found');
    }

    console.log('[WIDGET] Widget found, performing vector search');
    const results = await this.vectorSearch.searchSimilarContent(query, id, limit);
    console.log('[WIDGET] Vector search returned', results.length, 'results');
    
    return results;
  }

  async searchPublicWidgetContent(id: string, query: string, limit: number = 10) {
    // Verify widget is public
    const widgetRecord = await this.getPublicWidget(id);
    if (!widgetRecord) {
      throw new Error('Widget not found or not public');
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

  async addFileToWidget(id: string, userId: string, file: File) {
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

    // OCR processing and embedding creation happens automatically in FileStorageService
    console.log(`[WIDGET_FILE_ADD] Added file: ${storedFile.filename} (${storedFile.fileType})`);

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

  async removeFileFromWidget(widgetId: string, fileId: string, userId: string): Promise<boolean> {
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

  async startWebsiteCrawl(widgetId: string, userId: string, baseUrl: string) {
    console.log('[WidgetService] startWebsiteCrawl called:', { widgetId, userId, baseUrl });
    
    // Validate widget ownership
    const widgetRecord = await this.getWidget(widgetId, userId);
    if (!widgetRecord) throw new Error('Widget not found');
    
    // Validate URL format
    const url = new URL(baseUrl);
    const cleanUrl = `${url.protocol}//${url.hostname}`;
    const hostname = url.hostname;
    
    console.log('[WidgetService] Clean URL:', cleanUrl, 'Hostname:', hostname);
    
    // Check if already crawling
    if (widgetRecord.crawlStatus === 'crawling') {
      throw new Error('Crawl already in progress');
    }
    
    // Delete any existing crawl files
    await this.deleteExistingCrawlFiles(widgetId);
    
    // Start Apify crawl
    const { runId } = await this.apifyCrawler.crawlWebsite(cleanUrl, {
      maxPages: 25,
      hostname: hostname
    });
    
    // Update widget with crawl info
    await this.db.getDatabase()
      .update(widget)
      .set({
        crawlUrl: cleanUrl,
        crawlStatus: 'crawling',
        crawlRunId: runId,
        updatedAt: new Date()
      })
      .where(eq(widget.id, widgetId));
      
    console.log('[WidgetService] Crawl started with runId:', runId);
    // Note: Background processing doesn't work in Cloudflare Workers
    // The frontend needs to poll the status endpoint
    
    return { runId, status: 'crawling' };
  }

  async deleteExistingCrawlFiles(widgetId: string) {
    try {
      // Find and delete all crawl-related files
      const files = await this.fileStorage.getWidgetFiles(widgetId);
      const crawlFiles = files.filter(f => 
        f.filename.endsWith('.crawl.md')  // Only need to delete the main crawl file
      );
      
      console.log(`[WidgetService] Found ${crawlFiles.length} existing crawl files to delete`);
      
      for (const file of crawlFiles) {
        // This will also delete all page files associated with this file
        await this.fileStorage.deleteFile(file.id, widgetId);
      }
    } catch (error) {
      console.error('[WidgetService] Error deleting existing crawl files:', error);
      // Continue with crawl even if deletion fails
    }
  }

  public async checkCrawlStatus(widgetId: string, runId: string, userId: string) {
    console.log('[WidgetService] checkCrawlStatus called:', { widgetId, runId });
    
    try {
      const status = await this.apifyCrawler.getCrawlStatus(runId);
      console.log('[WidgetService] Crawl status:', status);
      
      if (status.status === 'SUCCEEDED') {
        await this.processCrawlResults(widgetId, runId, userId);
      } else if (status.status === 'FAILED' || status.status === 'ABORTED' || status.status === 'TIMED-OUT') {
        console.error('[WidgetService] Crawl failed with status:', status.status);
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
        // Frontend will continue polling
      }
    } catch (error) {
      console.error('Error checking crawl status:', error);
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          widgetId,
          runId
        });
      }
      
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
    console.log('[WidgetService] processCrawlResults called:', { widgetId, runId });
    
    try {
      // Check if already processing or completed
      const widgetRecord = await this.getWidget(widgetId, userId);
      if (!widgetRecord || !widgetRecord.crawlUrl) throw new Error('Widget not found');
      
      // If already completed or processing, skip
      if (widgetRecord.crawlStatus === 'completed' || widgetRecord.crawlStatus === 'processing') {
        console.log('[WidgetService] Crawl already processed or processing, skipping');
        return;
      }
      
      // Mark as processing to prevent concurrent calls
      await this.db.getDatabase()
        .update(widget)
        .set({ crawlStatus: 'processing' })
        .where(eq(widget.id, widgetId));
      
      // Get crawl results
      const results = await this.apifyCrawler.getCrawlResults(runId);
      console.log('[WidgetService] Got crawl results:', results.length, 'pages');
      
      // If no results, mark as completed with 0 pages
      if (!results || results.length === 0) {
        console.log('[WidgetService] No pages found in crawl results');
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
      
      const hostname = new URL(widgetRecord.crawlUrl).hostname;
      
      // 1. Create placeholder file with crawl metadata
      const placeholderContent = this.apifyCrawler.createPlaceholderContent(
        widgetRecord.crawlUrl,
        results.length
      );
      const placeholderBlob = new Blob([placeholderContent], { type: 'text/markdown' });
      const placeholderFile = new File([placeholderBlob], `${hostname}.crawl.md`, { 
        type: 'text/markdown' 
      });
      
      const storedFile = await this.fileStorage.uploadFile({
        file: placeholderFile,
        widgetId
      });
      
      // 2. Process pages in batches to avoid memory issues
      const BATCH_SIZE = 5; // Process 5 pages at a time
      
      for (let batchStart = 0; batchStart < results.length; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, results.length);
        const batchResults = results.slice(batchStart, batchEnd);
        const pageData: Array<{ pageNumber: number; markdown: string; metadata?: any }> = [];
        
        for (let i = 0; i < batchResults.length; i++) {
          const page = batchResults[i];
          const pageNumber = batchStart + i + 1;
          
          console.log(`[WIDGET_CRAWL] Processing page ${pageNumber}: ${page.url} - content length: ${page.markdown?.length || 0}`);
          
          // Don't skip small content - it can have meaningful value
          if (!page.markdown || page.markdown.trim().length === 0) {
            console.log(`[WIDGET_CRAWL] Skipping page ${pageNumber} - no content`);
            continue;
          }
          
          // Log word count for debugging
          const wordCount = page.markdown.split(/\s+/).length;
          console.log(`[WIDGET_CRAWL] Page ${pageNumber} word count: ${wordCount} words`);
          
          // Create page content with metadata header
          const pageContent = `---
url: ${page.url}
title: ${page.title || 'Untitled'}
crawled_from: ${widgetRecord.crawlUrl}
crawled_at: ${new Date().toISOString()}
page_number: ${pageNumber}
---

# ${page.title || new URL(page.url).pathname}

${page.markdown}
`;
          
          // Store as page file using the same pattern as OCR
          await this.fileStorage.storePageFile(widgetId, storedFile.id, pageNumber, pageContent);
          
          // Collect page data for embeddings (include metadata)
          const fullContentWordCount = pageContent.split(/\s+/).length;
          console.log(`[WIDGET_CRAWL] Page ${pageNumber} full content (with metadata): ${fullContentWordCount} words`);
          
          pageData.push({
            pageNumber,
            markdown: pageContent,
            metadata: {
              url: page.url,
              title: page.title || 'Untitled',
              crawledFrom: widgetRecord.crawlUrl
            }
          });
        }
        
        // 3. Create embeddings for this batch
        console.log(`[WIDGET_CRAWL] Batch ${batchStart}-${batchEnd}: collected ${pageData.length} pages for embedding (from ${batchResults.length} results)`);
        
        if (this.vectorSearch && pageData.length > 0) {
          try {
            console.log(`[WIDGET_CRAWL] Creating embeddings for batch ${batchStart}-${batchEnd} (${pageData.length} pages)`);
            await this.vectorSearch.createEmbeddingsFromCrawlPages(
              widgetId, 
              storedFile.id, 
              pageData
            );
            console.log(`[WIDGET_CRAWL] Progress: ${batchEnd}/${results.length} pages processed`);
          } catch (embeddingError) {
            console.error('[WIDGET_CRAWL] Error creating embeddings for batch:', embeddingError);
            console.error('[WIDGET_CRAWL] Error details:', {
              error: embeddingError instanceof Error ? embeddingError.message : 'Unknown error',
              stack: embeddingError instanceof Error ? embeddingError.stack : undefined,
              batch: `${batchStart}-${batchEnd}`,
              pageCount: pageData.length
            });
            // Don't fail the whole process if embeddings fail
          }
        } else {
          console.log(`[WIDGET_CRAWL] Skipping embeddings - vectorSearch: ${!!this.vectorSearch}, pageData.length: ${pageData.length}`);
        }
      }
      
      // 4. Generate recommendations based on the crawled content
      try {
        await this.generateWidgetRecommendations(widgetId);
        console.log('[WIDGET_CRAWL] Generated recommendations for widget');
      } catch (recommendationError) {
        console.error('[WIDGET_CRAWL] Error generating recommendations:', recommendationError);
        // Don't fail the whole process if recommendations fail
      }
      
      // Update widget status - only after embeddings are attempted
      await this.db.getDatabase()
        .update(widget)
        .set({
          crawlStatus: 'completed',
          crawlRunId: null,
          lastCrawlAt: new Date(),
          crawlPageCount: results.length
        })
        .where(eq(widget.id, widgetId));
        
      console.log(`[WIDGET_CRAWL] Completed crawl for ${widgetRecord.crawlUrl}: ${results.length} pages`);
        
    } catch (error) {
      console.error('Error processing crawl results:', error);
      await this.db.getDatabase()
        .update(widget)
        .set({ 
          crawlStatus: 'failed',
          crawlRunId: null 
        })
        .where(eq(widget.id, widgetId));
    }
  }

  async getWidgetSampleContent(widgetId: string, limit: number = 5): Promise<string> {
    try {
      // Get a sample of widget embeddings to understand the content
      const embeddings = await this.db.getDatabase()
        .select({
          contentChunk: widgetEmbedding.contentChunk,
          metadata: widgetEmbedding.metadata
        })
        .from(widgetEmbedding)
        .where(eq(widgetEmbedding.widgetId, widgetId))
        .limit(limit);

      console.log('[WidgetService] Found embeddings:', embeddings.length);

      if (embeddings.length === 0) {
        console.log('[WidgetService] No embeddings found for widget:', widgetId);
        return '';
      }

      // Combine sample content from different sources
      const contentSamples = embeddings.map(e => {
        const source = e.metadata?.source || 'unknown';
        const title = e.metadata?.title || '';
        const url = e.metadata?.url || '';
        return `${title ? `Title: ${title}\n` : ''}${url ? `URL: ${url}\n` : ''}Content: ${e.contentChunk}\n`;
      }).join('\n---\n');

      console.log('[WidgetService] Combined content samples length:', contentSamples.length);
      return contentSamples;
    } catch (error) {
      console.error('[WidgetService] Error getting widget sample content:', error);
      return '';
    }
  }

  async generateWidgetRecommendations(widgetId: string): Promise<void> {
    try {
      // Get widget details
      const [widgetRecord] = await this.db.getDatabase()
        .select()
        .from(widget)
        .where(eq(widget.id, widgetId))
        .limit(1);

      if (!widgetRecord) {
        throw new Error('Widget not found');
      }

      // Get sample content from widget embeddings
      const sampleContent = await this.getWidgetSampleContent(widgetId, 10);
      
      console.log('[WidgetService] Sample content length:', sampleContent?.length || 0);
      console.log('[WidgetService] Sample content preview:', sampleContent?.substring(0, 200) || 'No content');
      
      if (!sampleContent) {
        console.log('[WidgetService] No content found for recommendations');
        // Set empty recommendations instead of returning
        await this.db.getDatabase()
          .update(widget)
          .set({
            recommendations: []
          })
          .where(eq(widget.id, widgetId));
        return;
      }

      // Check if API key exists
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Use OpenAI to generate recommendations
      const openai = new OpenAIService(this.openaiApiKey);
      const response = await openai.generateRecommendations(
        sampleContent,
        widgetRecord.name,
        widgetRecord.crawlUrl || widgetRecord.url || ''
      );

      console.log('[WidgetService] Generated recommendations response:', JSON.stringify(response, null, 2));

      // Validate response
      if (!response || !response.recommendations || !Array.isArray(response.recommendations)) {
        console.error('[WidgetService] Invalid recommendations response:', response);
        throw new Error('Invalid recommendations response from OpenAI');
      }

      // Store recommendations in widget metadata
      const updateResult = await this.db.getDatabase()
        .update(widget)
        .set({
          recommendations: response.recommendations
        })
        .where(eq(widget.id, widgetId))
        .returning();

      console.log('[WidgetService] Update result:', updateResult);
      console.log('[WidgetService] Stored recommendations for widget:', widgetId, 'count:', response.recommendations.length);
    } catch (error) {
      console.error('[WidgetService] Error generating recommendations:', error);
      // Set empty recommendations on error
      try {
        await this.db.getDatabase()
          .update(widget)
          .set({
            recommendations: []
          })
          .where(eq(widget.id, widgetId));
      } catch (updateError) {
        console.error('[WidgetService] Error setting empty recommendations:', updateError);
      }
      throw error;
    }
  }

  async resetStuckCrawl(widgetId: string, userId: string): Promise<boolean> {
    console.log('[WidgetService] resetStuckCrawl called:', { widgetId, userId });
    
    try {
      // Verify ownership
      const widgetRecord = await this.getWidget(widgetId, userId);
      if (!widgetRecord) {
        return false;
      }
      
      // Reset crawl status if it's stuck
      if (widgetRecord.crawlStatus === 'crawling' || widgetRecord.crawlStatus === 'processing') {
        await this.db.getDatabase()
          .update(widget)
          .set({
            crawlStatus: 'failed',
            crawlRunId: null,
            updatedAt: new Date()
          })
          .where(and(
            eq(widget.id, widgetId),
            eq(widget.userId, userId)
          ));
        
        console.log('[WidgetService] Reset stuck crawl for widget:', widgetId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[WidgetService] Error resetting stuck crawl:', error);
      return false;
    }
  }

  async refreshEmbeddings(widgetId: string, userId: string): Promise<{ embeddingsCreated: number; filesProcessed: number }> {
    console.log('[WidgetService] refreshEmbeddings called:', { widgetId, userId });
    
    try {
      // Verify ownership
      const widgetRecord = await this.getWidget(widgetId, userId);
      if (!widgetRecord) {
        throw new Error('Widget not found');
      }
      
      // Delete existing embeddings
      await this.db.getDatabase()
        .delete(widgetEmbedding)
        .where(eq(widgetEmbedding.widgetId, widgetId));
      
      console.log('[WidgetService] Deleted existing embeddings for widget:', widgetId);
      
      // Get all files for the widget
      const files = await this.fileStorage.getWidgetFiles(widgetId);
      console.log(`[WidgetService] Found ${files.length} files to process`);
      
      let embeddingsCreated = 0;
      let filesProcessed = 0;
      
      // Process each file
      for (const file of files) {
        try {
          // Get file content
          const content = await this.fileStorage.getFileContent(file.id, widgetId);
          if (!content) {
            console.warn(`[WidgetService] No content found for file: ${file.filename}`);
            continue;
          }
          
          filesProcessed++;
          
          // Check if it's a crawl file
          if (file.filename.endsWith('.crawl.md')) {
            console.log(`[WidgetService] Processing crawl file: ${file.filename}`);
            
            // For crawl files, we need to manually recreate the page data
            // This is a simplified version - in production, you might want to
            // store page metadata separately or parse it from the crawl file
            console.log(`[WidgetService] Note: Individual page files are not accessible for re-processing`);
            console.log(`[WidgetService] Consider re-crawling for best results`);
            
            // Process the crawl summary file itself
            if (this.vectorSearch) {
              await this.vectorSearch.createEmbeddingsForWidget(
                widgetId,
                content,
                file.filename,
                file.id
              );
              
              // Count chunks created (rough estimate based on content size)
              const wordCount = content.split(/\s+/).length;
              const estimatedChunks = Math.ceil(wordCount / 900); // 1000 words - 100 overlap
              embeddingsCreated += estimatedChunks;
            }
          } else {
            // Regular file - create embeddings directly
            console.log(`[WidgetService] Processing regular file: ${file.filename}`);
            
            if (this.vectorSearch) {
              await this.vectorSearch.createEmbeddingsForWidget(
                widgetId,
                content,
                file.filename,
                file.id
              );
              
              // Count chunks created (rough estimate based on content size)
              const wordCount = content.split(/\s+/).length;
              const estimatedChunks = Math.ceil(wordCount / 900); // 1000 words - 100 overlap
              embeddingsCreated += estimatedChunks;
            }
          }
        } catch (error) {
          console.error(`[WidgetService] Error processing file ${file.filename}:`, error);
          // Continue with other files
        }
      }
      
      console.log(`[WidgetService] Refresh complete: ${embeddingsCreated} embeddings created from ${filesProcessed} files`);
      
      return {
        embeddingsCreated,
        filesProcessed
      };
    } catch (error) {
      console.error('[WidgetService] Error refreshing embeddings:', error);
      throw error;
    }
  }
}