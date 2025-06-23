import type { Context } from 'hono';
import { OpenAIService } from './openai';
import { DatabaseService } from './database';
import { WidgetService } from './widget';
import type { ChatRequest, ChatMessage, Env } from '../types';
import { ServiceValidation, ErrorHandler } from './common';
import { RAGAgent } from './rag-agent';

type AppContext = Context<{ Bindings: Env; Variables: any }>;

export class ChatService {
  private ragAgent?: RAGAgent;
  private widgetService?: WidgetService;

  constructor(
    private openai: OpenAIService, 
    private database?: DatabaseService,
    ragAgent?: RAGAgent,
    widgetService?: WidgetService
  ) {
    this.ragAgent = ragAgent;
    this.widgetService = widgetService;
  }

  async handleChat(c: AppContext): Promise<Response> {
    const methodError = ServiceValidation.validatePostMethod(c);
    if (methodError) return methodError;

    try {
      const body: ChatRequest = await ServiceValidation.parseRequestBody<ChatRequest>(c);
      const { message, history = [], context, widgetId } = body;

      if (!message || typeof message !== "string") {
        return c.json({ error: "Invalid message" }, 400);
      }

      // Ensure URL is tracked in database regardless of caching status
      if (context?.url && this.database) {
        await this.database.ensureUrlTracked(context.url);
      }

      // Use RAG if widgetId is provided and RAG agent is available
      if (widgetId && this.ragAgent && this.widgetService) {
        try {
          const auth = c.get('auth');
          
          // Check if widget is public
          const publicWidget = await this.widgetService.getPublicWidget(widgetId);
          
          if (publicWidget) {
            // Public widget - no auth required, use anonymous user ID
            const ragResult = await this.ragAgent.generateResponse(body, 'anonymous');
            
            return c.json({ 
              message: ragResult.response,
              sources: ragResult.sources 
            });
          } else if (auth?.user?.id) {
            // Private widget - requires auth
            const ragResult = await this.ragAgent.generateResponse(body, auth.user.id);
            
            return c.json({ 
              message: ragResult.response,
              sources: ragResult.sources 
            });
          } else {
            return c.json({ error: "Widget not found or authentication required" }, 401);
          }
        } catch (ragError) {
          console.error('RAG error, falling back to standard chat:', ragError);
          // Fall through to standard chat functionality
        }
      }

      // Standard chat functionality (fallback or when no widgetId)
      if (!context) {
        return c.json({ error: "Content context is required for standard chat" }, 400);
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
