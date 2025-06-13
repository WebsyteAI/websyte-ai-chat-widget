import type { Context } from 'hono';
import type { Env } from '../types';

type AppContext = Context<{ Bindings: Env; Variables: any }>;

export class ServiceValidation {
  static validatePostMethod(c: AppContext): Response | null {
    if (c.req.method !== "POST") {
      return c.json({ error: "Method not allowed" }, 405);
    }
    return null;
  }

  static async parseRequestBody<T>(c: AppContext): Promise<T> {
    return await c.req.json();
  }
}

export class ErrorHandler {
  static handleAbortError(c: AppContext, customResponse?: any): Response {
    return c.json({ 
      error: "Request cancelled",
      ...customResponse
    }, 400);
  }

  static handleGeneralError(
    c: AppContext, 
    error: unknown, 
    logMessage: string,
    fallbackResponse: any,
    statusCode: 200 | 400 | 500 = 500
  ): Response {
    console.error(logMessage, error);
    return c.json(fallbackResponse, statusCode);
  }

  static isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
  }
}

export class FallbackResponses {
  static readonly DEFAULT_RECOMMENDATIONS = [
    { title: "What is this about?", description: "Understand the main topic" },
    { title: "How does this work?", description: "Learn the process" },
    { title: "Why is this important?", description: "Explore the significance" },
    { title: "What are the implications?", description: "Consider the impact" },
    { title: "Who is this for?", description: "Identify the target audience" },
    { title: "What happens next?", description: "Explore future steps" }
  ];

  static readonly DEFAULT_PLACEHOLDER = "Ask me about this article";

  static getRecommendationsResponse() {
    return {
      recommendations: this.DEFAULT_RECOMMENDATIONS,
      placeholder: this.DEFAULT_PLACEHOLDER
    };
  }
}
