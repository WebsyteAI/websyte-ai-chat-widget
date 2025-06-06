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
          { title: "Main Topic", description: "Discuss the main subject" },
          { title: "Key Points", description: "Explore important details" },
          { title: "Implications", description: "Consider the broader impact" },
          { title: "Questions", description: "Ask about unclear aspects" }
        ],
        placeholder: "Ask me anything"
      };
      
      return c.json(fallbackResponse, 200);
    }
  }
}