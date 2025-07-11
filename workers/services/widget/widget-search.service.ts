import { VectorSearchService } from '../vector-search';
import { createLogger } from '../../lib/logger';

export interface SearchResult {
  text: string;
  source: string;
  similarity: number;
  metadata?: Record<string, any>;
}

export class WidgetSearchService {
  private vectorSearch: VectorSearchService;
  private logger = createLogger('WidgetSearchService');

  constructor(vectorSearchService: VectorSearchService) {
    this.vectorSearch = vectorSearchService;
  }

  async searchWidgetContent(
    widgetId: string, 
    query: string, 
    limit = 10
  ): Promise<SearchResult[]> {
    try {
      const results = await this.vectorSearch.searchSimilarContent(
        widgetId, 
        query, 
        limit
      );

      return results.map(result => ({
        text: result.text,
        source: result.source,
        similarity: result.similarity,
        metadata: result.metadata
      }));
    } catch (error) {
      this.logger.error({ 
        err: error, 
        widgetId, 
        query 
      }, 'Error searching widget content');
      return [];
    }
  }

  async searchPublicWidgetContent(
    widgetId: string, 
    query: string, 
    limit = 10
  ): Promise<SearchResult[]> {
    // For public widgets, we might want to apply additional filters
    // or transformations to the results
    return this.searchWidgetContent(widgetId, query, limit);
  }

  async searchMultipleWidgets(
    widgetIds: string[], 
    query: string, 
    limit = 10
  ): Promise<Map<string, SearchResult[]>> {
    const results = new Map<string, SearchResult[]>();

    await Promise.all(
      widgetIds.map(async (widgetId) => {
        const widgetResults = await this.searchWidgetContent(widgetId, query, limit);
        results.set(widgetId, widgetResults);
      })
    );

    return results;
  }

  async getRelatedContent(
    widgetId: string,
    referenceText: string,
    limit = 5
  ): Promise<SearchResult[]> {
    try {
      // Use the reference text to find similar content
      const results = await this.vectorSearch.searchSimilarContent(
        widgetId,
        referenceText,
        limit + 1 // Get one extra to exclude the exact match
      );

      // Filter out exact matches (very high similarity)
      return results
        .filter(result => result.similarity < 0.99)
        .slice(0, limit)
        .map(result => ({
          text: result.text,
          source: result.source,
          similarity: result.similarity,
          metadata: result.metadata
        }));
    } catch (error) {
      this.logger.error({ 
        err: error, 
        widgetId 
      }, 'Error getting related content');
      return [];
    }
  }
}