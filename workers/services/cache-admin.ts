import type { Context } from 'hono';
import type { Env } from '../types';
import { DatabaseService } from './database';
import { ServiceValidation, ErrorHandler } from './common';

export interface CacheStatsResponse {
  totalCached: number;
  enabledUrls: string[];
  disabledUrls: string[];
}

export interface CacheListResponse {
  urls: Array<{
    url: string;
    enabled: boolean;
    data?: any;
  }>;
}

export class CacheAdminService {
  constructor(private database: DatabaseService) {}

  async handleGetStats(c: Context<{ Bindings: Env }>): Promise<Response> {
    try {
      const stats = await this.database.getCacheStats();
      const response: CacheStatsResponse = {
        totalCached: stats.totalCached,
        enabledUrls: stats.enabledUrls,
        disabledUrls: stats.disabledUrls
      };
      return c.json(response);
    } catch (error) {
      return ErrorHandler.handleGeneralError(
        c,
        error,
        "Cache stats error:",
        { error: "Failed to get cache stats" }
      );
    }
  }

  async handleGetList(c: Context<{ Bindings: Env }>): Promise<Response> {
    try {
      const urls = await this.database.listCachedUrls();
      const urlData = await Promise.all(
        urls.map(async (url) => ({
          url,
          enabled: await this.database.getCacheEnabled(url),
          data: await this.database.get(url)
        }))
      );

      const response: CacheListResponse = { urls: urlData };
      return c.json(response);
    } catch (error) {
      return ErrorHandler.handleGeneralError(
        c,
        error,
        "Cache list error:",
        { error: "Failed to get cache list" }
      );
    }
  }

  async handleToggleUrl(c: Context<{ Bindings: Env }>): Promise<Response> {
    try {
      const { url } = c.req.param();
      if (!url) {
        return c.json({ error: "URL parameter required" }, 400);
      }

      const decodedUrl = decodeURIComponent(url);
      const currentState = await this.database.getCacheEnabled(decodedUrl);
      await this.database.setCacheEnabled(decodedUrl, !currentState);

      return c.json({ 
        url: decodedUrl, 
        enabled: !currentState,
        message: `Cache ${!currentState ? 'enabled' : 'disabled'} for ${decodedUrl}`
      });
    } catch (error) {
      return ErrorHandler.handleGeneralError(
        c,
        error,
        "Cache toggle error:",
        { error: "Failed to toggle cache" }
      );
    }
  }

  async handleClearUrl(c: Context<{ Bindings: Env }>): Promise<Response> {
    try {
      const { url } = c.req.param();
      if (!url) {
        return c.json({ error: "URL parameter required" }, 400);
      }

      const decodedUrl = decodeURIComponent(url);
      await this.database.clear(decodedUrl);

      return c.json({ 
        url: decodedUrl,
        message: `Cache cleared for ${decodedUrl}`
      });
    } catch (error) {
      return ErrorHandler.handleGeneralError(
        c,
        error,
        "Cache clear error:",
        { error: "Failed to clear cache" }
      );
    }
  }

  async handleClearAll(c: Context<{ Bindings: Env }>): Promise<Response> {
    try {
      await this.database.clearAll();
      return c.json({ message: "All cache cleared successfully" });
    } catch (error) {
      return ErrorHandler.handleGeneralError(
        c,
        error,
        "Cache clear all error:",
        { error: "Failed to clear all cache" }
      );
    }
  }

}