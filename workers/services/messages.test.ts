import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { DatabaseService } from '../database';
import { MessageService } from '../messages';
import { WidgetService } from '../widget';
import { VectorSearchService } from '../vector-search';
import { FileStorageService } from '../file-storage';
import { chatMessage, widget } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

describe('MessageService', () => {
  let database: DatabaseService;
  let messageService: MessageService;
  let widgetService: WidgetService;
  let testWidgetId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Initialize services with test database
    database = new DatabaseService(process.env.DATABASE_URL!);
    messageService = new MessageService(database);
    
    // Create services for widget creation
    const vectorSearch = new VectorSearchService(process.env.OPENAI_API_KEY!, database);
    const fileStorage = new FileStorageService(
      { put: async () => {}, get: async () => null, delete: async () => {} } as any,
      database,
      process.env.MISTRAL_AI_API_KEY!,
      vectorSearch
    );
    widgetService = new WidgetService(database, vectorSearch, fileStorage);
    
    // Create test user and widget
    testUserId = uuidv4();
    const testWidget = await widgetService.createWidget(
      testUserId,
      'Test Widget',
      'Test widget for message testing'
    );
    testWidgetId = testWidget.id;
  });

  afterAll(async () => {
    // Clean up test data
    await database.db.delete(chatMessage).where(eq(chatMessage.widgetId, testWidgetId));
    await database.db.delete(widget).where(eq(widget.id, testWidgetId));
  });

  beforeEach(async () => {
    // Clean up messages before each test
    await database.db.delete(chatMessage).where(eq(chatMessage.widgetId, testWidgetId));
  });

  describe('generateSessionId', () => {
    it('should generate a unique session ID', () => {
      const sessionId1 = messageService.generateSessionId();
      const sessionId2 = messageService.generateSessionId();
      
      expect(sessionId1).toBeTruthy();
      expect(sessionId2).toBeTruthy();
      expect(sessionId1).not.toBe(sessionId2);
      expect(sessionId1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
  });

  describe('saveMessage', () => {
    it('should save a user message', async () => {
      const sessionId = messageService.generateSessionId();
      const message = await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId,
        userId: testUserId,
        role: 'user',
        content: 'Hello, how are you?',
        metadata: {
          userAgent: 'Test Browser',
          ipAddress: '127.0.0.1',
        },
      });

      expect(message).toBeDefined();
      expect(message.id).toBeTruthy();
      expect(message.widgetId).toBe(testWidgetId);
      expect(message.sessionId).toBe(sessionId);
      expect(message.userId).toBe(testUserId);
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, how are you?');
      expect(message.metadata).toEqual({
        userAgent: 'Test Browser',
        ipAddress: '127.0.0.1',
      });
    });

    it('should save an assistant message with sources', async () => {
      const sessionId = messageService.generateSessionId();
      const message = await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId,
        userId: testUserId,
        role: 'assistant',
        content: 'I am doing well, thank you!',
        metadata: {
          model: 'gpt-4.1-mini',
          sources: [{ chunk: 'test source', similarity: 0.9 }],
          responseTime: 1234,
        },
      });

      expect(message).toBeDefined();
      expect(message.role).toBe('assistant');
      expect(message.metadata?.model).toBe('gpt-4.1-mini');
      expect(message.metadata?.sources).toHaveLength(1);
      expect(message.metadata?.responseTime).toBe(1234);
    });

    it('should save anonymous user messages', async () => {
      const sessionId = messageService.generateSessionId();
      const message = await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId,
        userId: undefined,
        role: 'user',
        content: 'Anonymous message',
      });

      expect(message).toBeDefined();
      expect(message.userId).toBeNull();
      expect(message.content).toBe('Anonymous message');
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages for a widget', async () => {
      const sessionId = messageService.generateSessionId();
      
      // Save some test messages
      await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId,
        userId: testUserId,
        role: 'user',
        content: 'Message 1',
      });

      await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId,
        userId: testUserId,
        role: 'assistant',
        content: 'Reply 1',
      });

      const messages = await messageService.getMessages({
        widgetId: testWidgetId,
      });

      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Reply 1'); // Most recent first
      expect(messages[1].content).toBe('Message 1');
    });

    it('should filter messages by session', async () => {
      const sessionId1 = messageService.generateSessionId();
      const sessionId2 = messageService.generateSessionId();
      
      // Save messages in different sessions
      await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId: sessionId1,
        userId: testUserId,
        role: 'user',
        content: 'Session 1 message',
      });

      await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId: sessionId2,
        userId: testUserId,
        role: 'user',
        content: 'Session 2 message',
      });

      const session1Messages = await messageService.getMessages({
        widgetId: testWidgetId,
        sessionId: sessionId1,
      });

      expect(session1Messages).toHaveLength(1);
      expect(session1Messages[0].content).toBe('Session 1 message');
    });

    it('should support pagination', async () => {
      const sessionId = messageService.generateSessionId();
      
      // Save multiple messages
      for (let i = 0; i < 5; i++) {
        await messageService.saveMessage({
          widgetId: testWidgetId,
          sessionId,
          userId: testUserId,
          role: 'user',
          content: `Message ${i}`,
        });
      }

      const page1 = await messageService.getMessages({
        widgetId: testWidgetId,
        limit: 2,
        offset: 0,
      });

      const page2 = await messageService.getMessages({
        widgetId: testWidgetId,
        limit: 2,
        offset: 2,
      });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1[0].content).not.toBe(page2[0].content);
    });
  });

  describe('getSessions', () => {
    it('should retrieve chat sessions for a widget', async () => {
      const sessionId1 = messageService.generateSessionId();
      const sessionId2 = messageService.generateSessionId();
      
      // Create messages in two sessions
      await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId: sessionId1,
        userId: testUserId,
        role: 'user',
        content: 'Session 1 - Message 1',
      });

      await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId: sessionId1,
        userId: testUserId,
        role: 'assistant',
        content: 'Session 1 - Reply 1',
      });

      await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId: sessionId2,
        userId: testUserId,
        role: 'user',
        content: 'Session 2 - Message 1',
      });

      const sessions = await messageService.getSessions(testWidgetId);

      expect(sessions).toHaveLength(2);
      
      const session1 = sessions.find(s => s.sessionId === sessionId1);
      expect(session1).toBeDefined();
      expect(session1?.messageCount).toBe(2);
      
      const session2 = sessions.find(s => s.sessionId === sessionId2);
      expect(session2).toBeDefined();
      expect(session2?.messageCount).toBe(1);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      const sessionId = messageService.generateSessionId();
      const message = await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId,
        userId: testUserId,
        role: 'user',
        content: 'Message to delete',
      });

      const deleted = await messageService.deleteMessage(message.id, testUserId);
      expect(deleted).toBe(true);

      const messages = await messageService.getMessages({
        widgetId: testWidgetId,
      });
      expect(messages).toHaveLength(0);
    });
  });

  describe('getMessageCount', () => {
    it('should count messages for a widget', async () => {
      const sessionId = messageService.generateSessionId();
      
      const initialCount = await messageService.getMessageCount(testWidgetId);
      expect(initialCount).toBe(0);

      await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId,
        userId: testUserId,
        role: 'user',
        content: 'Test message',
      });

      await messageService.saveMessage({
        widgetId: testWidgetId,
        sessionId,
        userId: testUserId,
        role: 'assistant',
        content: 'Test reply',
      });

      const count = await messageService.getMessageCount(testWidgetId);
      expect(count).toBe(2);
    });
  });
});