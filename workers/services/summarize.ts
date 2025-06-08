import type { Context } from 'hono';
import { OpenAIService } from './openai';
import type { SummarizeRequest, Env } from '../types';

export class SummarizeService {
  constructor(private openai: OpenAIService) {}

  async handleSummarize(c: Context<{ Bindings: Env }>): Promise<Response> {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      const body: SummarizeRequest = await c.req.json();
      const { content, url = "", title = "" } = body;

      if (!content || typeof content !== "string" || content.trim() === "") {
        return c.json({ error: "Invalid content" }, 400);
      }

      const summary = await this.openai.generateSummary(content, title, url, c.req.raw.signal);

      return c.json({ summary });

    } catch (error) {
      console.error("Summarize API error:", error);
      return c.json({ 
        error: "Internal server error",
        summary: "Sorry, I couldn't generate a summary right now."
      }, 500);
    }
  }
}