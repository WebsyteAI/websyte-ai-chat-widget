import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc, isNull } from 'drizzle-orm';
import { 
  widget as widgetTable,
  type Widget,
  type NewWidget
} from '../db/schema';
import type { SummariesResponse, RecommendationsResponse } from '../types';

export interface UICacheData {
  summaries?: SummariesResponse;
  recommendations?: RecommendationsResponse;
  timestamp: number;
}

export class DatabaseService {
  private db;

  constructor(databaseUrl: string) {
    const sql = neon(databaseUrl);
    this.db = drizzle(sql);
  }

  getDatabase() {
    return this.db;
  }



  async get(url: string): Promise<UICacheData | null> {
    try {
      console.log(`DatabaseService: Getting cache for URL: ${url}`);
      
      const result = await this.db
        .select()
        .from(widgetTable)
        .where(eq(widgetTable.url, url))
        .limit(1);

      if (result.length === 0) {
        console.log(`DatabaseService: No cache found for URL: ${url}`);
        return null;
      }

      const widget = result[0];
      console.log(`DatabaseService: Cache found for URL: ${url}`);
      
      const recommendations = widget.recommendations ? {
        recommendations: widget.recommendations,
        placeholder: "Ask me about this content"
      } : undefined;

      return {
        summaries: widget.summaries || undefined,
        recommendations,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('DatabaseService get error:', error);
      return null;
    }
  }

  async setSummaries(url: string, summaries: SummariesResponse): Promise<void> {
    try {
      console.log(`DatabaseService: Setting summaries for URL: ${url}`, summaries);
      
      const now = new Date();
      
      // Find existing widget for this URL
      const existingWidget = await this.db
        .select({ id: widgetTable.id })
        .from(widgetTable)
        .where(eq(widgetTable.url, url))
        .limit(1);

      if (existingWidget.length > 0) {
        // Update existing widget
        await this.db
          .update(widgetTable)
          .set({
            summaries,
            updatedAt: now
          })
          .where(eq(widgetTable.id, existingWidget[0].id));
      } else {
        // Insert new widget
        await this.db
          .insert(widgetTable)
          .values({
            userId: null,
            name: `Widget - ${url}`,
            url,
            summaries,
            cacheEnabled: false,
            createdAt: now,
            updatedAt: now
          });
      }

      console.log(`DatabaseService: Summaries set successfully for URL: ${url}`);
    } catch (error) {
      console.error('DatabaseService setSummaries error:', error);
    }
  }

  async setRecommendations(url: string, recommendations: RecommendationsResponse): Promise<void> {
    try {
      console.log(`DatabaseService: Setting recommendations for URL: ${url}`, recommendations);
      
      const now = new Date();
      
      // Find existing widget for this URL
      const existingWidget = await this.db
        .select({ id: widgetTable.id })
        .from(widgetTable)
        .where(eq(widgetTable.url, url))
        .limit(1);

      if (existingWidget.length > 0) {
        // Update existing widget
        await this.db
          .update(widgetTable)
          .set({
            recommendations: recommendations.recommendations,
            updatedAt: now
          })
          .where(eq(widgetTable.id, existingWidget[0].id));
      } else {
        // Insert new widget
        await this.db
          .insert(widgetTable)
          .values({
            userId: null,
            name: `Widget - ${url}`,
            url,
            recommendations: recommendations.recommendations,
            cacheEnabled: false,
            createdAt: now,
            updatedAt: now
          });
      }

      console.log(`DatabaseService: Recommendations set successfully for URL: ${url}`);
    } catch (error) {
      console.error('DatabaseService setRecommendations error:', error);
    }
  }

  async getSummaries(url: string): Promise<SummariesResponse | null> {
    try {
      const result = await this.db
        .select({ summaries: widgetTable.summaries })
        .from(widgetTable)
        .where(eq(widgetTable.url, url))
        .limit(1);

      if (result.length === 0 || !result[0].summaries) {
        return null;
      }

      return result[0].summaries;
    } catch (error) {
      console.error('DatabaseService getSummaries error:', error);
      return null;
    }
  }

  async getRecommendations(url: string): Promise<RecommendationsResponse | null> {
    try {
      console.log(`DatabaseService: Fetching recommendations for URL: ${url}`);
      
      const result = await this.db
        .select({ recommendations: widgetTable.recommendations })
        .from(widgetTable)
        .where(eq(widgetTable.url, url))
        .limit(1);

      if (result.length === 0 || !result[0].recommendations) {
        console.log(`DatabaseService: No recommendations found for URL: ${url}`);
        return null;
      }

      const response: RecommendationsResponse = {
        recommendations: result[0].recommendations,
        placeholder: "Ask me about this content"
      };

      console.log(`DatabaseService: Found recommendations:`, response);
      return response;
    } catch (error) {
      console.error('DatabaseService getRecommendations error:', error);
      return null;
    }
  }

  async clear(url: string): Promise<void> {
    try {
      await this.db
        .delete(widgetTable)
        .where(eq(widgetTable.url, url));
      
      console.log(`DatabaseService: Cache cleared for URL: ${url}`);
    } catch (error) {
      console.error('DatabaseService clear error:', error);
    }
  }

  async getCacheEnabled(url: string): Promise<boolean> {
    try {
      const result = await this.db
        .select({ cacheEnabled: widgetTable.cacheEnabled })
        .from(widgetTable)
        .where(eq(widgetTable.url, url))
        .limit(1);

      return result.length > 0 ? result[0].cacheEnabled : false;
    } catch (error) {
      console.error('DatabaseService getCacheEnabled error:', error);
      return false;
    }
  }

  async setCacheEnabled(url: string, enabled: boolean): Promise<void> {
    try {
      const now = new Date();
      
      // Find existing widget for this URL
      const existingWidget = await this.db
        .select({ id: widgetTable.id })
        .from(widgetTable)
        .where(eq(widgetTable.url, url))
        .limit(1);

      if (existingWidget.length > 0) {
        // Update existing widget
        await this.db
          .update(widgetTable)
          .set({
            cacheEnabled: enabled,
            updatedAt: now
          })
          .where(eq(widgetTable.id, existingWidget[0].id));
      } else {
        // Insert new widget
        await this.db
          .insert(widgetTable)
          .values({
            userId: null,
            name: `Widget - ${url}`,
            url,
            cacheEnabled: enabled,
            createdAt: now,
            updatedAt: now
          });
      }

      console.log(`DatabaseService: Cache ${enabled ? 'enabled' : 'disabled'} for URL: ${url}`);
    } catch (error) {
      console.error('DatabaseService setCacheEnabled error:', error);
    }
  }

  async ensureUrlTracked(url: string): Promise<void> {
    try {
      const result = await this.db
        .select({ url: widgetTable.url })
        .from(widgetTable)
        .where(eq(widgetTable.url, url))
        .limit(1);

      if (result.length === 0) {
        const now = new Date();
        
        await this.db
          .insert(widgetTable)
          .values({
            userId: null,
            name: `Widget - ${url}`,
            url,
            cacheEnabled: false,
            createdAt: now,
            updatedAt: now
          })
          .onConflictDoNothing();
        
        console.log(`DatabaseService: URL tracked with caching disabled: ${url}`);
      }
    } catch (error) {
      console.error('DatabaseService ensureUrlTracked error:', error);
    }
  }

  async listCachedUrls(): Promise<string[]> {
    try {
      const result = await this.db
        .select({ url: widgetTable.url })
        .from(widgetTable)
        .where(isNull(widgetTable.userId))
        .orderBy(desc(widgetTable.createdAt));

      return result.map(row => row.url).filter(url => url !== null) as string[];
    } catch (error) {
      console.error('DatabaseService listCachedUrls error:', error);
      return [];
    }
  }

  async getCacheStats(): Promise<{ totalCached: number; enabledUrls: string[]; disabledUrls: string[] }> {
    try {
      const result = await this.db
        .select({
          url: widgetTable.url,
          cacheEnabled: widgetTable.cacheEnabled
        })
        .from(widgetTable)
        .where(isNull(widgetTable.userId))
        .orderBy(desc(widgetTable.createdAt));

      const enabledUrls: string[] = [];
      const disabledUrls: string[] = [];

      for (const widget of result) {
        if (widget.url) {
          if (widget.cacheEnabled) {
            enabledUrls.push(widget.url);
          } else {
            disabledUrls.push(widget.url);
          }
        }
      }

      return {
        totalCached: result.length,
        enabledUrls,
        disabledUrls
      };
    } catch (error) {
      console.error('DatabaseService getCacheStats error:', error);
      return { totalCached: 0, enabledUrls: [], disabledUrls: [] };
    }
  }

  async clearAll(): Promise<void> {
    try {
      await this.db
        .delete(widgetTable)
        .where(isNull(widgetTable.userId));
      console.log('DatabaseService: All cache cleared');
    } catch (error) {
      console.error('DatabaseService clearAll error:', error);
    }
  }
}