import type { Context } from 'hono';
import { OpenAIService } from './openai';
import type { SummariesRequest, SummariesResponse, Env } from '../types';
import { ServiceValidation, ErrorHandler } from './common';
import { DatabaseService } from './database';

export class SummariesService {
  constructor(private openai: OpenAIService, private database?: DatabaseService) {}

  async handleSummaries(c: Context<{ Bindings: Env }>): Promise<Response> {
    const methodError = ServiceValidation.validatePostMethod(c);
    if (methodError) return methodError;

    try {
      const body: SummariesRequest = await ServiceValidation.parseRequestBody<SummariesRequest>(c);
      const { content, url = "", title = "" } = body;

      if (!content || typeof content !== "string" || content.trim() === "") {
        return c.json({ error: "Invalid content" }, 400);
      }

      // Ensure URL is tracked in database regardless of caching status
      if (url && this.database) {
        await this.database.ensureUrlTracked(url);
      }

      // Check cache first if URL is provided, database is available, and caching is enabled for this URL
      if (url && this.database && await this.database.getCacheEnabled(url)) {
        const cached = await this.database.getSummaries(url);
        if (cached) {
          return c.json(cached);
        }
      }

      const summaries = await this.openai.generateBatchSummaries(content, title, url, c.req.raw.signal);

      const response: SummariesResponse = {
        short: summaries.short,
        medium: summaries.medium
      };

      // Always store the result if URL is provided and database is available (for tracking purposes)
      if (url && this.database) {
        await this.database.setSummaries(url, response);
      }

      return c.json(response);

    } catch (error) {
      return ErrorHandler.handleGeneralError(
        c,
        error,
        "Summaries API error:",
        { 
          error: "Internal server error",
          short: "Unable to generate short summary.",
          medium: "Unable to generate medium summary."
        }
      );
    }
  }
}