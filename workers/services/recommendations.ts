import type { Context } from 'hono';
import { OpenAIService } from './openai';
import type { RecommendationsRequest, Env } from '../types';
import { ServiceValidation, ErrorHandler, FallbackResponses } from './common';

type AppContext = Context<{ Bindings: Env; Variables: any }>;

export class RecommendationsService {
  constructor(private openai: OpenAIService) {}

  async handleRecommendations(c: AppContext): Promise<Response> {
    const methodError = ServiceValidation.validatePostMethod(c);
    if (methodError) return methodError;

    try {
      const body: RecommendationsRequest = await ServiceValidation.parseRequestBody<RecommendationsRequest>(c);
      const { content = "", url = "", title = "" } = body;

      if (!content && !title) {
        return c.json({ error: "Content or title required" }, 400);
      }

      const result = await this.openai.generateRecommendations(
        content, 
        title, 
        url, 
        c.req.raw.signal
      );

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
