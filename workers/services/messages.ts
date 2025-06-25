import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { DatabaseService } from './database';
import { chatMessage, type NewChatMessage, type ChatMessage } from '../db/schema';

export interface SaveMessageOptions {
  widgetId: string;
  sessionId: string;
  userId?: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    model?: string;
    sources?: any[];
    responseTime?: number;
    userAgent?: string;
    ipAddress?: string;
    error?: string;
  };
}

export interface GetMessagesOptions {
  widgetId: string;
  sessionId?: string;
  userId?: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ChatSession {
  sessionId: string;
  widgetId: string;
  userId?: string;
  messageCount: number;
  firstMessageAt: Date;
  lastMessageAt: Date;
}

export class MessageService {
  constructor(private database: DatabaseService) {}

  /**
   * Generate a new session ID (cryptographically secure)
   */
  generateSessionId(): string {
    // Use crypto.randomUUID if available in the environment
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `session_${crypto.randomUUID()}`;
    }
    
    // Fallback to more secure random generation
    const array = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
      return `session_${Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')}`;
    }
    
    // Last resort fallback (less secure but better than Math.random alone)
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substr(2);
    const random2 = Math.random().toString(36).substr(2);
    return `session_${timestamp}_${random1}_${random2}`;
  }

  /**
   * Save a chat message
   */
  async saveMessage(options: SaveMessageOptions): Promise<ChatMessage> {
    try {
      const newMessage: NewChatMessage = {
        widgetId: options.widgetId,
        sessionId: options.sessionId,
        userId: options.userId || null,
        role: options.role,
        content: options.content,
        metadata: options.metadata || null,
      };

      const [message] = await (this.database as any).db
        .insert(chatMessage)
        .values(newMessage)
        .returning();

      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error('Failed to save message');
    }
  }

  /**
   * Get messages for a widget with optional filtering
   */
  async getMessages(options: GetMessagesOptions): Promise<ChatMessage[]> {
    try {
      let query = (this.database as any).db
        .select()
        .from(chatMessage)
        .where(eq(chatMessage.widgetId, options.widgetId));

      // Add optional filters
      const conditions = [eq(chatMessage.widgetId, options.widgetId)];

      if (options.sessionId) {
        conditions.push(eq(chatMessage.sessionId, options.sessionId));
      }

      if (options.userId) {
        conditions.push(eq(chatMessage.userId, options.userId));
      }

      if (options.startDate) {
        conditions.push(gte(chatMessage.createdAt, options.startDate));
      }

      if (options.endDate) {
        conditions.push(lte(chatMessage.createdAt, options.endDate));
      }

      query = query.where(and(...conditions));

      // Add ordering and pagination
      query = query
        .orderBy(desc(chatMessage.createdAt))
        .limit(options.limit || 50)
        .offset(options.offset || 0);

      const messages = await query;
      return messages;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw new Error('Failed to get messages');
    }
  }

  /**
   * Get chat sessions for a widget
   */
  async getSessions(widgetId: string, userId?: string): Promise<ChatSession[]> {
    try {
      const conditions = [eq(chatMessage.widgetId, widgetId)];
      if (userId) {
        conditions.push(eq(chatMessage.userId, userId));
      }

      const sessions = await (this.database as any).db
        .select({
          sessionId: chatMessage.sessionId,
          widgetId: chatMessage.widgetId,
          userId: chatMessage.userId,
          messageCount: sql<number>`count(*)::int`,
          firstMessageAt: sql<Date>`min(${chatMessage.createdAt})`,
          lastMessageAt: sql<Date>`max(${chatMessage.createdAt})`,
        })
        .from(chatMessage)
        .where(and(...conditions))
        .groupBy(chatMessage.sessionId, chatMessage.widgetId, chatMessage.userId)
        .orderBy(desc(sql`max(${chatMessage.createdAt})`));

      return sessions as ChatSession[];
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw new Error('Failed to get sessions');
    }
  }

  /**
   * Delete a specific message
   */
  async deleteMessage(messageId: string, userId?: string): Promise<boolean> {
    try {
      const conditions = [eq(chatMessage.id, messageId)];
      
      // If userId is provided, ensure the message belongs to this user
      if (userId) {
        conditions.push(eq(chatMessage.userId, userId));
      }

      const result = await (this.database as any).db
        .delete(chatMessage)
        .where(and(...conditions));

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }

  /**
   * Delete all messages for a widget (admin only)
   */
  async deleteWidgetMessages(widgetId: string): Promise<boolean> {
    try {
      await (this.database as any).db
        .delete(chatMessage)
        .where(eq(chatMessage.widgetId, widgetId));

      return true;
    } catch (error) {
      console.error('Error deleting widget messages:', error);
      throw new Error('Failed to delete widget messages');
    }
  }

  /**
   * Delete old messages based on retention policy
   */
  async deleteOldMessages(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await (this.database as any).db
        .delete(chatMessage)
        .where(lte(chatMessage.createdAt, cutoffDate));

      return 0; // Drizzle doesn't return count directly
    } catch (error) {
      console.error('Error deleting old messages:', error);
      throw new Error('Failed to delete old messages');
    }
  }

  /**
   * Get message count for a widget
   */
  async getMessageCount(widgetId: string): Promise<number> {
    try {
      const result = await (this.database as any).db
        .select({ count: sql<number>`count(*)::int` })
        .from(chatMessage)
        .where(eq(chatMessage.widgetId, widgetId));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      throw new Error('Failed to get message count');
    }
  }
}