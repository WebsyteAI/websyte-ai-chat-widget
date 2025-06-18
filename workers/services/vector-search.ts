import { OpenAI } from 'openai';
import { eq, desc, sql } from 'drizzle-orm';
import { DatabaseService } from './database';
import { widgetEmbedding, type NewWidgetEmbedding, type WidgetEmbedding } from '../db/schema';

export interface EmbeddingChunk {
  text: string;
  metadata: {
    chunkIndex: number;
    source?: string;
    fileId?: number;
  };
}

export interface SearchResult {
  chunk: string;
  similarity: number;
  metadata: {
    chunkIndex: number;
    source?: string;
    fileId?: number;
  };
  widgetId: number;
}

export class VectorSearchService {
  private openai: OpenAI;
  private db: DatabaseService;

  constructor(openaiApiKey: string, databaseService: DatabaseService) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.db = databaseService;
  }

  async chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 100): Promise<EmbeddingChunk[]> {
    const chunks: EmbeddingChunk[] = [];
    const words = text.split(/\s+/);
    
    for (let i = 0; i < words.length; i += maxChunkSize - overlap) {
      const chunkWords = words.slice(i, i + maxChunkSize);
      const chunkText = chunkWords.join(' ');
      
      if (chunkText.trim()) {
        chunks.push({
          text: chunkText,
          metadata: {
            chunkIndex: chunks.length,
            source: 'text'
          }
        });
      }
    }

    return chunks;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text.replace(/\n/g, ' ').trim(),
        encoding_format: 'float'
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async createEmbeddingsForWidget(
    widgetId: number, 
    content: string, 
    source?: string,
    fileId?: number
  ): Promise<void> {
    const chunks = await this.chunkText(content);
    const embeddings: NewWidgetEmbedding[] = [];

    for (const chunk of chunks) {
      const embedding = await this.generateEmbedding(chunk.text);
      
      embeddings.push({
        widgetId,
        contentChunk: chunk.text,
        embedding: embedding,
        metadata: {
          chunkIndex: chunk.metadata.chunkIndex,
          source: source || chunk.metadata.source,
          fileId
        }
      });
    }

    // Batch insert embeddings
    await this.db.getDatabase().insert(widgetEmbedding).values(embeddings);
  }

  async searchSimilarContent(
    query: string, 
    widgetId?: number, 
    limit: number = 10,
    threshold: number = 0.7
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
      metadata: result.metadata as { chunkIndex: number; source?: string; fileId?: number },
      widgetId: result.widgetId
    }));
  }

  async deleteEmbeddingsForWidget(widgetId: number): Promise<void> {
    await this.db.getDatabase()
      .delete(widgetEmbedding)
      .where(eq(widgetEmbedding.widgetId, widgetId));
  }

  async deleteEmbeddingsForFile(widgetId: number, fileId: number): Promise<void> {
    await this.db.getDatabase()
      .delete(widgetEmbedding)
      .where(
        sql`${widgetEmbedding.widgetId} = ${widgetId} AND ${widgetEmbedding.metadata}->>'fileId' = ${fileId.toString()}`
      );
  }

  async getEmbeddingsCount(widgetId: number): Promise<number> {
    const result = await this.db.getDatabase()
      .select({ count: sql<number>`count(*)` })
      .from(widgetEmbedding)
      .where(eq(widgetEmbedding.widgetId, widgetId));

    return result[0]?.count || 0;
  }
}