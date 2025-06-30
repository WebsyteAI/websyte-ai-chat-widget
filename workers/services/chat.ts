import type { Context } from 'hono';
import { OpenAIService } from './openai';
import { DatabaseService } from './database';
import { WidgetService } from './widget';
import { MessageService } from './messages';
import type { ChatRequest, ChatMessage, Env } from '../types';
import { ServiceValidation, ErrorHandler } from './common';
import { RAGAgent } from './rag-agent';
import { createLogger } from '../lib/logger';

type AppContext = Context<{ Bindings: Env; Variables: any }>;

export class ChatService {
  private ragAgent?: RAGAgent;
  private widgetService?: WidgetService;
  private messageService?: MessageService;
  private logger = createLogger('ChatService');

  constructor(
    private openai: OpenAIService, 
    private database?: DatabaseService,
    ragAgent?: RAGAgent,
    widgetService?: WidgetService,
    messageService?: MessageService
  ) {
    this.ragAgent = ragAgent;
    this.widgetService = widgetService;
    this.messageService = messageService;
  }

  async handleChat(c: AppContext): Promise<Response> {
    const methodError = ServiceValidation.validatePostMethod(c);
    if (methodError) return methodError;

    const requestLogger = c.get('logger') || this.logger;
    
    try {
      const body: ChatRequest = await ServiceValidation.parseRequestBody<ChatRequest>(c);
      const { message, history = [], context, widgetId, sessionId, isEmbedded } = body;

      const chatLogger = requestLogger.child({ widgetId, sessionId: sessionId || 'unknown' });
      chatLogger.info({ isEmbedded, messageLength: message?.length }, 'Received chat request');

      if (!message || typeof message !== "string") {
        return c.json({ error: "Invalid message" }, 400);
      }

      // Validate message length
      const MAX_MESSAGE_LENGTH = 10000; // 10k characters
      if (message.length > MAX_MESSAGE_LENGTH) {
        return c.json({ error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` }, 400);
      }

      // Generate session ID on server if not provided (more secure)
      let chatSessionId = sessionId;
      if (!chatSessionId && this.messageService) {
        chatSessionId = this.messageService.generateSessionId();
      }
      if (!chatSessionId) {
        chatSessionId = 'fallback-session';
      }

      // Ensure URL is tracked in database regardless of caching status
      if (context?.url && this.database) {
        await this.database.ensureUrlTracked(context.url);
      }

      // Get user agent and IP for metadata (make IP optional based on privacy settings)
      const userAgent = c.req.header('user-agent') || undefined;
      // Only store IP if explicitly enabled (for GDPR compliance)
      const storeIpAddress = c.env.STORE_IP_ADDRESSES === 'true';
      const ipAddress = storeIpAddress 
        ? (c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || undefined)
        : undefined;

      // Use RAG if widgetId is provided and RAG agent is available
      if (widgetId && this.ragAgent && this.widgetService && this.messageService) {
        try {
          const auth = c.get('auth');
          chatLogger.debug({ authenticated: !!auth, userId: auth?.user?.id || 'none' }, 'Auth status');
          
          const userId = auth?.user?.id || null;
          const startTime = Date.now();
          
          // Only save messages if this is from an embedded widget (not editor)
          if (isEmbedded) {
            chatLogger.info({ widgetId, sessionId: chatSessionId, userId: userId || 'anonymous' }, 'Saving user message');
            // Save user message
            await this.messageService.saveMessage({
              widgetId,
              sessionId: chatSessionId,
              userId: userId || null,
              role: 'user',
              content: message,
              metadata: {
                userAgent,
                ipAddress,
              }
            });
          } else {
            chatLogger.debug({ widgetId, isEmbedded }, 'Skipping message save (not embedded)');
          }
          
          // If user is authenticated, use their ID (for widget editor and authenticated access)
          if (auth?.user?.id) {
            const ragResult = await this.ragAgent.generateResponse(body, auth.user.id);
            const responseTime = Date.now() - startTime;
            
            // Only save assistant response if from embedded widget
            if (isEmbedded) {
              chatLogger.info({ widgetId, sessionId: chatSessionId, userId: auth.user.id }, 'Saving assistant message');
              await this.messageService.saveMessage({
                widgetId,
                sessionId: chatSessionId,
                userId: auth.user.id,
                role: 'assistant',
                content: ragResult.response,
                metadata: {
                  model: 'gpt-4.1-mini',
                  sources: ragResult.sources,
                  responseTime,
                }
              });
            } else {
              chatLogger.debug({ widgetId, isEmbedded }, 'Skipping assistant message save (not embedded)');
            }
            
            return c.json({ 
              message: ragResult.response,
              sources: ragResult.sources,
              sessionId: chatSessionId 
            });
          }
          
          // For unauthenticated users, check if widget is public
          const publicWidget = await this.widgetService.getPublicWidget(widgetId);
          
          if (publicWidget) {
            // Public widget - use anonymous user ID
            const ragResult = await this.ragAgent.generateResponse(body, 'anonymous');
            const responseTime = Date.now() - startTime;
            
            // Only save assistant response if from embedded widget
            if (isEmbedded) {
              chatLogger.info({ widgetId, sessionId: chatSessionId, userId: 'anonymous' }, 'Saving assistant message (public widget)');
              await this.messageService.saveMessage({
                widgetId,
                sessionId: chatSessionId,
                userId: undefined,
                role: 'assistant',
                content: ragResult.response,
                metadata: {
                  model: 'gpt-4.1-mini',
                  sources: ragResult.sources,
                  responseTime,
                }
              });
            } else {
              chatLogger.debug({ widgetId, isEmbedded }, 'Skipping assistant message save (public widget, not embedded)');
            }
            
            return c.json({ 
              message: ragResult.response,
              sources: ragResult.sources,
              sessionId: chatSessionId 
            });
          } else {
            return c.json({ error: "Widget not found or authentication required" }, 401);
          }
        } catch (ragError) {
          chatLogger.error({ err: ragError }, 'RAG error, falling back to standard chat');
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
