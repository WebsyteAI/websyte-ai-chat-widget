import { OpenAI } from 'openai';
import { eq, desc, sql } from 'drizzle-orm';
import { DatabaseService } from './database';
import { widgetEmbedding, type NewWidgetEmbedding, type WidgetEmbedding } from '../db/schema';
import { CHUNK_CONFIG } from '../config/chunking';

export interface EmbeddingChunk {
  text: string;
  metadata: {
    chunkIndex: number;
    source?: string;
    fileId?: string;
    pageNumber?: number;
    url?: string;
    title?: string;
    crawledFrom?: string;
  };
}

export interface SearchResult {
  chunk: string;
  similarity: number;
  metadata: {
    chunkIndex: number;
    source?: string;
    fileId?: string;
    pageNumber?: number;
    url?: string;
    title?: string;
    crawledFrom?: string;
  };
  widgetId: string;
}

export class VectorSearchService {
  private openai: OpenAI;
  private db: DatabaseService;

  constructor(openaiApiKey: string, databaseService: DatabaseService) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.db = databaseService;
  }

  async chunkText(
    text: string, 
    maxWords: number = CHUNK_CONFIG.DEFAULT_CHUNK_SIZE, 
    overlapWords: number = CHUNK_CONFIG.OVERLAP_SIZE
  ): Promise<EmbeddingChunk[]> {
    const chunks: EmbeddingChunk[] = [];
    
    if (!text || !text.trim()) {
      return chunks;
    }
    
    const words = text.split(/\s+/);
    const totalWords = words.length;
    // Only log for debugging when needed
    console.log(`[CHUNKING] Input text: ${totalWords} words, maxWords: ${maxWords}`);
    
    // Calculate safe token limit (more conservative to avoid hitting limits)
    const maxTokensPerChunk = CHUNK_CONFIG.MAX_TOKENS_PER_CHUNK;
    
    // If the text is small enough, check if it fits in a single chunk
    if (totalWords <= maxWords) {
      const chunkText = words.join(' ');
      const estimatedTokens = this.estimateTokenCount(chunkText);
      console.log(`[CHUNKING] Single chunk check: ${totalWords} words, estimated ${estimatedTokens} tokens`);
      
      // If even a single chunk is too large, we need to split it
      if (estimatedTokens > maxTokensPerChunk) {
        // console.log(`[CHUNKING] Single chunk too large, forcing split`);
        // Calculate appropriate chunk size based on token limit
        const targetWords = Math.floor((maxTokensPerChunk * 3.5) / (chunkText.length / totalWords));
        return this.chunkText(text, targetWords, Math.floor(targetWords * 0.1));
      }
      
      return [{
        text: chunkText.trim(),
        metadata: {
          chunkIndex: 0,
          source: 'text'
        }
      }];
    }
    
    // Create overlapping chunks
    let i = 0;
    while (i < words.length) {
      // Determine chunk size for this iteration
      let currentMaxWords = Math.min(maxWords, words.length - i);
      let chunkWords = words.slice(i, i + currentMaxWords);
      let chunkText = chunkWords.join(' ');
      let estimatedTokens = this.estimateTokenCount(chunkText);
      
      // Only log every Nth chunk to reduce noise
      if (chunks.length % CHUNK_CONFIG.PROGRESS_LOG_INTERVAL === 0 && chunks.length > 0) {
        console.log(`[CHUNKING] Progress: ${chunks.length} chunks created...`);
      }
      
      // Iteratively reduce chunk size if still too large
      while (estimatedTokens > maxTokensPerChunk && currentMaxWords > CHUNK_CONFIG.MIN_CHUNK_SIZE) {
        currentMaxWords = Math.floor(currentMaxWords * CHUNK_CONFIG.CHUNK_REDUCTION_FACTOR);
        chunkWords = words.slice(i, i + currentMaxWords);
        chunkText = chunkWords.join(' ');
        estimatedTokens = this.estimateTokenCount(chunkText);
        // console.log(`[CHUNKING] Reduced chunk ${chunks.length} to ${currentMaxWords} words, estimated ${estimatedTokens} tokens`);
      }
      
      // Final safety check
      if (estimatedTokens > maxTokensPerChunk) {
        console.error(`[CHUNKING] Unable to reduce chunk size below token limit. Skipping chunk.`);
        // Move forward by a minimal amount to avoid infinite loop
        i += Math.max(1, Math.floor(currentMaxWords / 2));
        continue;
      }
      
      chunks.push({
        text: chunkText.trim(),
        metadata: {
          chunkIndex: chunks.length,
          source: 'text'
        }
      });
      
      // Calculate next position with overlap
      // Always ensure forward progress by at least 1 word
      const stepSize = Math.max(1, currentMaxWords - overlapWords);
      i += stepSize;
    }

    // Final summary log
    if (chunks.length > CHUNK_CONFIG.LARGE_CHUNK_THRESHOLD) {
      console.log(`[CHUNKING] Completed: ${chunks.length} chunks created from ${words.length} words`);
    }
    return chunks;
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 3.5 characters for English text
    // This is conservative to stay well under the 8192 limit
    return Math.ceil(text.length / CHUNK_CONFIG.TOKEN_ESTIMATE_DIVISOR);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const cleanText = text.replace(/\n/g, ' ').trim();
      const estimatedTokens = this.estimateTokenCount(cleanText);
      
      // Instead of truncating, throw an error if text is too large
      // This ensures we never lose data and forces proper chunking upstream
      if (estimatedTokens > CHUNK_CONFIG.MAX_TOKENS_PER_CHUNK) {
        throw new Error(
          `Text chunk too large for embedding: ${estimatedTokens} estimated tokens ` +
          `(${cleanText.length} characters). Maximum is ${CHUNK_CONFIG.MAX_TOKENS_PER_CHUNK} tokens. ` +
          `Please use the chunkText method to split the text into smaller chunks.`
        );
      }
      
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: cleanText,
        encoding_format: 'float'
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      if (error instanceof Error && error.message.includes('Text chunk too large')) {
        throw error; // Re-throw our custom error as-is
      }
      throw new Error('Failed to generate embedding');
    }
  }

  async createEmbeddingsForWidget(
    widgetId: string, 
    content: string, 
    source?: string,
    fileId?: string
  ): Promise<void> {
    const chunks = await this.chunkText(content);
    const embeddings: NewWidgetEmbedding[] = [];

    for (const chunk of chunks) {
      const embedding = await this.generateEmbedding(chunk.text);
      
      embeddings.push({
        widgetId,
        fileId: fileId!,
        contentChunk: chunk.text,
        embedding: embedding,
        metadata: {
          chunkIndex: chunk.metadata.chunkIndex,
          source: source || chunk.metadata.source
        }
      });
    }

    // Batch insert embeddings
    await this.db.getDatabase().insert(widgetEmbedding).values(embeddings);
  }

  async searchSimilarContent(
    query: string, 
    widgetId?: string, 
    limit: number = 10,
    threshold: number = 0
  ): Promise<SearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const queryVector = JSON.stringify(queryEmbedding);

    const baseSelect = this.db.getDatabase()
      .select({
        id: widgetEmbedding.id,
        widgetId: widgetEmbedding.widgetId,
        contentChunk: widgetEmbedding.contentChunk,
        metadata: widgetEmbedding.metadata,
        similarity: sql<number>`1 - (${widgetEmbedding.embedding} <=> ${queryVector})`.as('similarity')
      })
      .from(widgetEmbedding);

    const searchQuery = widgetId 
      ? baseSelect.where(sql`1 - (${widgetEmbedding.embedding} <=> ${queryVector}) > ${threshold} AND ${widgetEmbedding.widgetId} = ${widgetId}`)
      : baseSelect.where(sql`1 - (${widgetEmbedding.embedding} <=> ${queryVector}) > ${threshold}`);

    const results = await searchQuery
      .orderBy(desc(sql`1 - (${widgetEmbedding.embedding} <=> ${queryVector})`))
      .limit(limit);

    return results.map((result: any) => ({
      chunk: result.contentChunk,
      similarity: result.similarity,
      metadata: result.metadata as { chunkIndex: number; source?: string; pageNumber?: number },
      widgetId: result.widgetId
    }));
  }

  async deleteEmbeddingsForWidget(widgetId: string): Promise<void> {
    await this.db.getDatabase()
      .delete(widgetEmbedding)
      .where(eq(widgetEmbedding.widgetId, widgetId));
  }

  async deleteEmbeddingsForFile(widgetId: string, fileId: string): Promise<void> {
    try {
      await this.db.getDatabase()
        .delete(widgetEmbedding)
        .where(
          sql`${widgetEmbedding.widgetId} = ${widgetId} AND ${widgetEmbedding.fileId} = ${fileId}`
        );
      console.log(`[EMBEDDINGS] Deleted embeddings for file: widget_id=${widgetId} file_id=${fileId}`);
    } catch (error) {
      console.error(`[EMBEDDINGS] Error deleting embeddings for file: widget_id=${widgetId} file_id=${fileId}`, error);
      throw new Error('Failed to delete embeddings for file');
    }
  }

  async getEmbeddingsCount(widgetId: string): Promise<number> {
    const result = await this.db.getDatabase()
      .select({ count: sql<number>`count(*)` })
      .from(widgetEmbedding)
      .where(eq(widgetEmbedding.widgetId, widgetId));

    return result[0]?.count || 0;
  }

  async createEmbeddingsFromOCRPages(
    widgetId: string,
    fileId: string,
    pages: Array<{ pageNumber: number; markdown: string }>
  ): Promise<void> {
    const allEmbeddings: NewWidgetEmbedding[] = [];

    for (const page of pages) {
      if (!page.markdown || !page.markdown.trim()) {
        continue;
      }

      const chunks = await this.chunkText(page.markdown);
      
      for (const chunk of chunks) {
        const embedding = await this.generateEmbedding(chunk.text);
        
        allEmbeddings.push({
          widgetId,
          fileId,
          contentChunk: chunk.text,
          embedding: embedding,
          metadata: {
            chunkIndex: chunk.metadata.chunkIndex,
            source: `page_${page.pageNumber}`,
            pageNumber: page.pageNumber
          }
        });
      }
    }

    if (allEmbeddings.length > 0) {
      // Batch insert all embeddings
      await this.db.getDatabase().insert(widgetEmbedding).values(allEmbeddings);
      console.log(`[EMBEDDINGS] Created ${allEmbeddings.length} embeddings for ${pages.length} pages`);
    }
  }

  async createEmbeddingsFromCrawlPages(
    widgetId: string,
    fileId: string,
    pages: Array<{ pageNumber: number; markdown: string; metadata?: any }>
  ): Promise<number> {
    console.log(`[EMBEDDINGS] Starting createEmbeddingsFromCrawlPages for widget ${widgetId}, fileId ${fileId}, pages: ${pages.length}`);
    
    // Test database connection
    try {
      const testCount = await this.getEmbeddingsCount(widgetId);
      console.log(`[EMBEDDINGS] Database test successful - widget currently has ${testCount} embeddings`);
    } catch (dbTestError) {
      console.error('[EMBEDDINGS] Database connection test failed:', dbTestError);
      throw new Error('Database connection failed');
    }
    
    const BATCH_SIZE = 10; // Process 10 embeddings at a time to avoid memory issues
    let totalEmbeddings = 0;

    for (const page of pages) {
      if (!page.markdown || !page.markdown.trim()) {
        continue;
      }

      // Chunk the page content
      const chunks = await this.chunkText(page.markdown);
      console.log(`[EMBEDDINGS] Page ${page.pageNumber}: ${chunks.length} chunks created from ${page.markdown.length} characters`);
      
      // Debug: Log first chunk to see what's being created
      if (chunks.length > 0) {
        const firstChunkPreview = chunks[0].text.substring(0, 200);
        console.log(`[EMBEDDINGS] First chunk preview: "${firstChunkPreview}..."`);
        console.log(`[EMBEDDINGS] First chunk word count: ${chunks[0].text.split(/\s+/).length} words`);
      }
      
      const pageEmbeddings: NewWidgetEmbedding[] = [];
      
      for (const chunk of chunks) {
        try {
          const embedding = await this.generateEmbedding(chunk.text);
          console.log(`[EMBEDDINGS] Generated embedding for chunk ${chunk.metadata.chunkIndex} of page ${page.pageNumber}`);
          
          // Merge page metadata with chunk metadata
          const metadata = {
            chunkIndex: chunk.metadata.chunkIndex,
            source: `page_${page.pageNumber}`,
            pageNumber: page.pageNumber,
            ...(page.metadata ? page.metadata : {})
          };
          
          pageEmbeddings.push({
            widgetId,
            fileId,
            contentChunk: chunk.text,
            embedding: embedding,
            metadata
          });
        } catch (embError) {
          console.error(`[EMBEDDINGS] Error generating embedding for chunk ${chunk.metadata.chunkIndex} of page ${page.pageNumber}:`, embError);
          throw embError;
        }
        
        // Batch insert when we reach the batch size
        if (pageEmbeddings.length >= BATCH_SIZE) {
          console.log(`[EMBEDDINGS] Inserting batch of ${pageEmbeddings.length} embeddings for widget ${widgetId}`);
          try {
            await this.db.getDatabase().insert(widgetEmbedding).values(pageEmbeddings);
            totalEmbeddings += pageEmbeddings.length;
            console.log(`[EMBEDDINGS] Successfully inserted batch, total so far: ${totalEmbeddings}`);
          } catch (dbError) {
            console.error('[EMBEDDINGS] Database insert error:', dbError);
            throw dbError;
          }
          pageEmbeddings.length = 0; // Clear array
        }
      }
      
      // Insert any remaining embeddings for this page
      if (pageEmbeddings.length > 0) {
        console.log(`[EMBEDDINGS] Inserting final batch of ${pageEmbeddings.length} embeddings for widget ${widgetId}`);
        try {
          await this.db.getDatabase().insert(widgetEmbedding).values(pageEmbeddings);
          totalEmbeddings += pageEmbeddings.length;
          console.log(`[EMBEDDINGS] Successfully inserted final batch, total so far: ${totalEmbeddings}`);
        } catch (dbError) {
          console.error('[EMBEDDINGS] Database insert error:', dbError);
          throw dbError;
        }
      }
    }

    console.log(`[EMBEDDINGS] Created ${totalEmbeddings} embeddings for ${pages.length} crawled pages`);
    return totalEmbeddings;
  }
}