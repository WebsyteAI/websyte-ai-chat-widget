import type { Context } from 'hono';
import { OpenAIService } from './openai';
import type { ChatRequest, ChatMessage, Env } from '../types';
import { ServiceValidation, ErrorHandler } from './common';

type AppContext = Context<{ Bindings: Env; Variables: any }>;

export class ChatService {
  constructor(private openai: OpenAIService) {}

  async handleChat(c: AppContext): Promise<Response> {
    const methodError = ServiceValidation.validatePostMethod(c);
    if (methodError) return methodError;

    try {
      const body: ChatRequest = await ServiceValidation.parseRequestBody<ChatRequest>(c);
      const { message, history = [], context } = body;

      if (!message || typeof message !== "string") {
        return c.json({ error: "Invalid message" }, 400);
      }

      if (!context) {
        return c.json({ error: "Content context is required" }, 400);
      }

      const messages: ChatMessage[] = [
        {
          role: "system",
          content: `You are a helpful AI assistant embedded on the webpage "${context.title}" (${context.url}). ${context.content ? `You have access to the page content and can help users understand, summarize, or discuss it. Always base your responses on the provided page content when relevant. Page content: ${context.content.slice(0, 50000)}` : 'You can help users with questions about this webpage.'}`
        },
        ...history.slice(-10),
        { role: "user", content: message }
      ];

      const assistantMessage = await this.openai.chatCompletion(messages, {
        model: "gpt-4.1-mini",
        temperature: 0.2,
        signal: c.req.raw.signal,
      });

      return c.json({ message: assistantMessage });

    } catch (error) {
      if (ErrorHandler.isAbortError(error)) {
        return ErrorHandler.handleAbortError(c, {
          message: "Request was cancelled by the user."
        });
      }
      
      return ErrorHandler.handleGeneralError(
        c,
        error,
        "Chat API error:",
        { 
          error: "Internal server error",
          message: "Sorry, I'm having trouble processing your request right now."
        }
      );
    }
  }
}
