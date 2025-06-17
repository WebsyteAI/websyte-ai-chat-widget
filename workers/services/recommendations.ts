import type { Context } from 'hono';
import { OpenAIService } from './openai';
import type { RecommendationsRequest, Env } from '../types';
import { ServiceValidation, ErrorHandler, FallbackResponses } from './common';
import { DatabaseService } from './database';

type AppContext = Context<{ Bindings: Env; Variables: any }>;

export class RecommendationsService {
  constructor(private openai: OpenAIService, private database?: DatabaseService) {}

  async handleRecommendations(c: AppContext): Promise<Response> {
    const methodError = ServiceValidation.validatePostMethod(c);
    if (methodError) return methodError;

    try {
      const body: RecommendationsRequest = await ServiceValidation.parseRequestBody<RecommendationsRequest>(c);
      const { content = "", url = "", title = "" } = body;

      if (!content && !title) {
        return c.json({ error: "Content or title required" }, 400);
      }

      // Ensure URL is tracked in database regardless of caching status
      if (url && this.database) {
        await this.database.ensureUrlTracked(url);
      }

      // Check cache first if URL is provided, database is available, and caching is enabled for this URL
      if (url && this.database && await this.database.getCacheEnabled(url)) {
        const cached = await this.database.getRecommendations(url);
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

      // Always store the result if URL is provided and database is available (for tracking purposes)
      if (url && this.database) {
        await this.database.setRecommendations(url, result);
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
