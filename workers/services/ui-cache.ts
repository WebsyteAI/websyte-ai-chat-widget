import type { Recommendation, SummariesResponse, RecommendationsResponse } from '../types';

export interface UICacheData {
  summaries?: SummariesResponse;
  recommendations?: RecommendationsResponse;
  timestamp: number;
}

export class UICacheService {
  constructor(private kv: KVNamespace) {}

  private generateCacheKey(url: string): string {
    return `ui:${url}`;
  }

  private generateCacheEnabledKey(url: string): string {
    return `cache_enabled:${url}`;
  }

  async get(url: string): Promise<UICacheData | null> {
    try {
      const key = this.generateCacheKey(url);
      console.log(`UICacheService: Getting cache for key: ${key}`);
      const cached = await this.kv.get(key);
      
      if (!cached) {
        console.log(`UICacheService: No cache found for key: ${key}`);
        return null;
      }

      console.log(`UICacheService: Cache found for key: ${key}`);
      return JSON.parse(cached) as UICacheData;
    } catch (error) {
      console.error('UICacheService get error:', error);
      return null;
    }
  }

  async set(url: string, data: Partial<UICacheData>): Promise<void> {
    try {
      const key = this.generateCacheKey(url);
      console.log(`UICacheService: Setting cache for key: ${key}`, data);
      
      // Get existing data or create new
      let existing = await this.get(url);
      if (!existing) {
        existing = { timestamp: Date.now() };
      }

      // Merge with existing data
      const merged: UICacheData = {
        ...existing,
        ...data,
        timestamp: Date.now()
      };

      await this.kv.put(key, JSON.stringify(merged));
      console.log(`UICacheService: Cache set successfully for key: ${key}`);
    } catch (error) {
      console.error('UICacheService set error:', error);
    }
  }

  async setSummaries(url: string, summaries: SummariesResponse): Promise<void> {
    await this.set(url, { summaries });
  }

  async setRecommendations(url: string, recommendations: RecommendationsResponse): Promise<void> {
    await this.set(url, { recommendations });
  }

  async getSummaries(url: string): Promise<SummariesResponse | null> {
    const cached = await this.get(url);
    return cached?.summaries || null;
  }

  async getRecommendations(url: string): Promise<RecommendationsResponse | null> {
    console.log(`Fetching recommendations for URL: ${url}`);
    const cached = await this.get(url);
    console.log(`Cached recommendations:`, cached?.recommendations);
    return cached?.recommendations || null;
  }

  async clear(url: string): Promise<void> {
    try {
      const key = this.generateCacheKey(url);
      await this.kv.delete(key);
    } catch (error) {
      console.error('UICacheService clear error:', error);
    }
  }

  async getCacheEnabled(url: string): Promise<boolean> {
    try {
      const key = this.generateCacheEnabledKey(url);
      const value = await this.kv.get(key);
      return value === 'true';
    } catch (error) {
      console.error('UICacheService getCacheEnabled error:', error);
      return false;
    }
  }

  async setCacheEnabled(url: string, enabled: boolean): Promise<void> {
    try {
      const key = this.generateCacheEnabledKey(url);
      await this.kv.put(key, enabled.toString());
      console.log(`UICacheService: Cache ${enabled ? 'enabled' : 'disabled'} for URL: ${url}`);
    } catch (error) {
      console.error('UICacheService setCacheEnabled error:', error);
    }
  }

  async listCachedUrls(): Promise<string[]> {
    try {
      const list = await this.kv.list({ prefix: 'ui:' });
      return list.keys.map(key => key.name.replace('ui:', ''));
    } catch (error) {
      console.error('UICacheService listCachedUrls error:', error);
      return [];
    }
  }

  async getCacheStats(): Promise<{ totalCached: number; enabledUrls: string[]; disabledUrls: string[] }> {
    try {
      const cachedUrls = await this.listCachedUrls();
      const enabledUrls: string[] = [];
      const disabledUrls: string[] = [];

      for (const url of cachedUrls) {
        const isEnabled = await this.getCacheEnabled(url);
        if (isEnabled) {
          enabledUrls.push(url);
        } else {
          disabledUrls.push(url);
        }
      }

      return {
        totalCached: cachedUrls.length,
        enabledUrls,
        disabledUrls
      };
    } catch (error) {
      console.error('UICacheService getCacheStats error:', error);
      return { totalCached: 0, enabledUrls: [], disabledUrls: [] };
    }
  }

  async clearAll(): Promise<void> {
    try {
      const list = await this.kv.list({ prefix: 'ui:' });
      const cacheEnabledList = await this.kv.list({ prefix: 'cache_enabled:' });
      
      const deletePromises = [
        ...list.keys.map(key => this.kv.delete(key.name)),
        ...cacheEnabledList.keys.map(key => this.kv.delete(key.name))
      ];
      
      await Promise.all(deletePromises);
      console.log('UICacheService: All cache cleared');
    } catch (error) {
      console.error('UICacheService clearAll error:', error);
    }
  }
}