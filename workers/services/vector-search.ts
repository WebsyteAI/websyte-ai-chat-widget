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
    
    // If the text is small enough, return as single chunk
    if (totalWords <= maxWords) {
      const chunkText = words.join(' ');
      const estimatedTokens = this.estimateTokenCount(chunkText);
      console.log(`[CHUNKING] Single chunk: ${totalWords} words, estimated ${estimatedTokens} tokens`);
      
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
      const chunkText = chunkWords.join(' ');
      const estimatedTokens = this.estimateTokenCount(chunkText);
      
      console.log(`[CHUNKING] Created chunk ${chunks.length}: ${chunkWords.length} words, estimated ${estimatedTokens} tokens`);
      
      // Safety check - if still too many estimated tokens, reduce further
      if (estimatedTokens > 7500) {
        console.warn(`[CHUNKING] Chunk ${chunks.length} estimated at ${estimatedTokens} tokens, splitting further`);
        const reducedMaxWords = Math.floor(maxWords * 0.7); // Reduce by 30%
        const subChunkWords = words.slice(i, i + reducedMaxWords);
        const subChunkText = subChunkWords.join(' ');
        const subEstimatedTokens = this.estimateTokenCount(subChunkText);
        
        console.log(`[CHUNKING] Reduced chunk ${chunks.length}: ${subChunkWords.length} words, estimated ${subEstimatedTokens} tokens`);
        
        chunks.push({
          text: subChunkText.trim(),
          metadata: {
            chunkIndex: chunks.length,
            source: 'text'
          }
        });
        
        // Adjust the loop to continue from the reduced chunk size
        i = i + reducedMaxWords - overlapWords - (maxWords - overlapWords);
      } else {
        chunks.push({
          text: chunkText.trim(),
          metadata: {
            chunkIndex: chunks.length,
            source: 'text'
          }
        });
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
      
      // Safety check: if still too large, truncate
      if (estimatedTokens > 8000) {
        console.warn(`Text chunk estimated at ${estimatedTokens} tokens, truncating...`);
        const maxChars = Math.floor(8000 * 3.5); // Conservative truncation
        const truncatedText = cleanText.substring(0, maxChars);
        console.warn(`Truncated from ${cleanText.length} to ${truncatedText.length} characters`);
        
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: truncatedText,
          encoding_format: 'float'
        });

        return response.data[0].embedding;
      }
      
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: cleanText,
        encoding_format: 'float'
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
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

    const baseQuery = this.db.getDatabase()
      .select({
        id: widgetEmbedding.id,
        widgetId: widgetEmbedding.widgetId,
        contentChunk: widgetEmbedding.contentChunk,
        metadata: widgetEmbedding.metadata,
        similarity: sql<number>`1 - (${widgetEmbedding.embedding} <=> ${queryVector})`.as('similarity')
      })
      .from(widgetEmbedding)
      .where(sql`1 - (${widgetEmbedding.embedding} <=> ${queryVector}) > ${threshold}`);

    const searchQuery = widgetId 
      ? baseQuery.where(eq(widgetEmbedding.widgetId, widgetId))
      : baseQuery;

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
}