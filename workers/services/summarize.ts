import type { Context } from 'hono';
import { OpenAIService } from './openai';
import type { SummarizeRequest, Env } from '../types';
import { ServiceValidation, ErrorHandler } from './common';

export class SummarizeService {
  constructor(private openai: OpenAIService) {}

  async handleSummarize(c: Context<{ Bindings: Env }>): Promise<Response> {
    const methodError = ServiceValidation.validatePostMethod(c);
    if (methodError) return methodError;

    try {
      const body: SummarizeRequest = await ServiceValidation.parseRequestBody<SummarizeRequest>(c);
      const { content, url = "", title = "" } = body;

      if (!content || typeof content !== "string" || content.trim() === "") {
        return c.json({ error: "Invalid content" }, 400);
      }

      const summary = await this.openai.generateSummary(content, title, url, c.req.raw.signal);

      return c.json({ summary });

    } catch (error) {
      return ErrorHandler.handleGeneralError(
        c,
        error,
        "Summarize API error:",
        { 
          error: "Internal server error",
          summary: "Sorry, I couldn't generate a summary right now."
        }
      );
    }
  }
}