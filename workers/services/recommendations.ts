import type { Context } from 'hono';
import { OpenAIService } from './openai';
import type { RecommendationsRequest, Env } from '../types';

export class RecommendationsService {
  constructor(private openai: OpenAIService) {}

  async handleRecommendations(c: Context<{ Bindings: Env }>): Promise<Response> {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }

    try {
      const body: RecommendationsRequest = await c.req.json();
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
      if (error instanceof Error && error.name === 'AbortError') {
        return c.json({ 
          error: "Request cancelled",
          recommendations: [],
          placeholder: "Ask me about this content"
        }, 499);
      }
      
      console.error("Recommendations API error:", error);
      
      // Return fallback response on error
      const fallbackResponse = {
        recommendations: [
          { title: "What is this about?", description: "Understand the main topic" },
          { title: "How does this work?", description: "Learn the process" },
          { title: "Why is this important?", description: "Explore the significance" },
          { title: "What are the implications?", description: "Consider the impact" }
        ],
        placeholder: "Ask me about this article"
      };
      
      return c.json(fallbackResponse, 200);
    }
  }
}