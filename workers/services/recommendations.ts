import type { Context } from 'hono';
import { OpenAIService } from './openai';
import type { RecommendationsRequest, Env } from '../types';
import { ServiceValidation, ErrorHandler, FallbackResponses } from './common';
import { UICacheService } from './ui-cache';

type AppContext = Context<{ Bindings: Env; Variables: any }>;

export class RecommendationsService {
  constructor(private openai: OpenAIService, private cache?: UICacheService) {}

  async handleRecommendations(c: AppContext): Promise<Response> {
    const methodError = ServiceValidation.validatePostMethod(c);
    if (methodError) return methodError;

    try {
      const body: RecommendationsRequest = await ServiceValidation.parseRequestBody<RecommendationsRequest>(c);
      const { content = "", url = "", title = "" } = body;

      if (!content && !title) {
        return c.json({ error: "Content or title required" }, 400);
      }

      // Ensure URL is tracked in cache admin panel regardless of caching status
      if (url && this.cache) {
        await this.cache.ensureUrlTracked(url);
      }

      // Check cache first if URL is provided, cache is available, and caching is enabled for this URL
      if (url && this.cache && await this.cache.getCacheEnabled(url)) {
        const cached = await this.cache.getRecommendations(url);
        if (cached) {
          return c.json(cached);
        }
      }

      const result = await this.openai.generateRecommendations(
        content, 
        title, 
        url, 
        c.req.raw.signal
      );

      // Cache the result if URL is provided, cache is available, and caching is enabled for this URL
      if (url && this.cache && await this.cache.getCacheEnabled(url)) {
        await this.cache.setRecommendations(url, result);
      }

      return c.json(result);

    } catch (error) {
      if (ErrorHandler.isAbortError(error)) {
        return ErrorHandler.handleAbortError(c, {
          recommendations: [],
          placeholder: "Ask me about this content"
        });
      }
      
      return ErrorHandler.handleGeneralError(
        c,
        error,
        "Recommendations API error:",
        FallbackResponses.getRecommendationsResponse(),
        200
      );
    }
  }
}
