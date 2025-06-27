import { OpenAI } from 'openai';
import { eq, desc, sql } from 'drizzle-orm';
import { DatabaseService } from './database';
import { widgetEmbedding, type NewWidgetEmbedding, type WidgetEmbedding } from '../db/schema';

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

  async chunkText(text: string, maxWords: number = 2000, overlapWords: number = 100): Promise<EmbeddingChunk[]> {
    const chunks: EmbeddingChunk[] = [];
    
    if (!text || !text.trim()) {
      return chunks;
    }
    
    const words = text.split(/\s+/);
    const totalWords = words.length;
    console.log(`[CHUNKING] Input text: ${totalWords} words, maxWords: ${maxWords}`);
    
    // Calculate safe token limit (more conservative to avoid hitting limits)
    const maxTokensPerChunk = 7000; // Leave buffer for OpenAI's 8192 limit
    
    // If the text is small enough, check if it fits in a single chunk
    if (totalWords <= maxWords) {
      const chunkText = words.join(' ');
      const estimatedTokens = this.estimateTokenCount(chunkText);
      console.log(`[CHUNKING] Single chunk check: ${totalWords} words, estimated ${estimatedTokens} tokens`);
      
      // If even a single chunk is too large, we need to split it
      if (estimatedTokens > maxTokensPerChunk) {
        console.log(`[CHUNKING] Single chunk too large, forcing split`);
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
    for (let i = 0; i < words.length; i += maxWords - overlapWords) {
      const chunkWords = words.slice(i, i + maxWords);
      let chunkText = chunkWords.join(' ');
      let estimatedTokens = this.estimateTokenCount(chunkText);
      
      console.log(`[CHUNKING] Created chunk ${chunks.length}: ${chunkWords.length} words, estimated ${estimatedTokens} tokens`);
      
      // Iteratively reduce chunk size if still too large
      let currentMaxWords = chunkWords.length;
      while (estimatedTokens > maxTokensPerChunk && currentMaxWords > 100) {
        currentMaxWords = Math.floor(currentMaxWords * 0.8); // Reduce by 20% each iteration
        const reducedChunkWords = words.slice(i, i + currentMaxWords);
        chunkText = reducedChunkWords.join(' ');
        estimatedTokens = this.estimateTokenCount(chunkText);
        console.log(`[CHUNKING] Reduced chunk ${chunks.length} to ${currentMaxWords} words, estimated ${estimatedTokens} tokens`);
      }
      
      // Final safety check
      if (estimatedTokens > maxTokensPerChunk) {
        console.error(`[CHUNKING] Unable to reduce chunk size below token limit. Skipping chunk.`);
        continue;
      }
      
      chunks.push({
        text: chunkText.trim(),
        metadata: {
          chunkIndex: chunks.length,
          source: 'text'
        }
      });
      
      // Adjust loop increment if we had to reduce chunk size
      if (currentMaxWords < maxWords) {
        i = i + currentMaxWords - overlapWords - (maxWords - overlapWords);
      }
    }

    console.log(`[CHUNKING] Total chunks created: ${chunks.length}`);
    return chunks;
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 3.5 characters for English text
    // This is conservative to stay well under the 8192 limit
    return Math.ceil(text.length / 3.5);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const cleanText = text.replace(/\n/g, ' ').trim();
      const estimatedTokens = this.estimateTokenCount(cleanText);
      
      // Instead of truncating, throw an error if text is too large
      // This ensures we never lose data and forces proper chunking upstream
      if (estimatedTokens > 8000) {
        throw new Error(
          `Text chunk too large for embedding: ${estimatedTokens} estimated tokens ` +
          `(${cleanText.length} characters). Maximum is 8000 tokens. ` +
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
  ): Promise<void> {
    const allEmbeddings: NewWidgetEmbedding[] = [];

    for (const page of pages) {
      if (!page.markdown || !page.markdown.trim()) {
        continue;
      }

      // Use smaller chunks to avoid btree index size limits
      // The error shows we exceed the 2704 byte limit, so we need smaller chunks
      // 500 words should keep us well under the limit even with metadata
      const chunks = await this.chunkText(page.markdown, 500, 50);
      
      for (const chunk of chunks) {
        const embedding = await this.generateEmbedding(chunk.text);
        
        // Merge page metadata with chunk metadata
        const metadata = {
          chunkIndex: chunk.metadata.chunkIndex,
          source: `page_${page.pageNumber}`,
          pageNumber: page.pageNumber,
          ...(page.metadata ? page.metadata : {})
        };
        
        allEmbeddings.push({
          widgetId,
          fileId,
          contentChunk: chunk.text,
          embedding: embedding,
          metadata
        });
      }
    }

    if (allEmbeddings.length > 0) {
      // Batch insert all embeddings
      await this.db.getDatabase().insert(widgetEmbedding).values(allEmbeddings);
      console.log(`[EMBEDDINGS] Created ${allEmbeddings.length} embeddings for ${pages.length} crawled pages`);
    }
  }
}