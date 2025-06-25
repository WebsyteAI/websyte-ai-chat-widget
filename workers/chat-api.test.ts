import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { DatabaseService } from '../services/database';
import { OpenAIService } from '../services/openai';
import { ChatService } from '../services/chat';
import { MessageService } from '../services/messages';
import { WidgetService } from '../services/widget';
import { VectorSearchService } from '../services/vector-search';
import { FileStorageService } from '../services/file-storage';
import { RAGAgent } from '../services/rag-agent';
import { chatMessage, widget } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { Env } from '../types';

// Mock OpenAI service
class MockOpenAIService extends OpenAIService {
  constructor() {
    super('test-key');
  }

  async chatCompletion(messages: any[], options: any) {
    return 'Mock AI response';
  }
}

// Mock RAG Agent
class MockRAGAgent extends RAGAgent {
  constructor() {
    super('test-key', {} as any);
  }

  async generateResponse(request: any, userId: string) {
    return {
      response: 'Mock RAG response with sources',
      sources: [
        { chunk: 'Source 1', similarity: 0.9 },
        { chunk: 'Source 2', similarity: 0.85 },
      ],
    };
  }
}

describe('Chat API with Message Persistence', () => {
  let app: Hono;
  let database: DatabaseService;
  let messageService: MessageService;
  let widgetService: WidgetService;
  let chatService: ChatService;
  let testWidgetId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Initialize services
    database = new DatabaseService(process.env.DATABASE_URL!);
    messageService = new MessageService(database);
    
    const vectorSearch = new VectorSearchService(process.env.OPENAI_API_KEY!, database);
    const fileStorage = new FileStorageService(
      { put: async () => {}, get: async () => null, delete: async () => {} } as any,
      database,
      process.env.MISTRAL_AI_API_KEY!,
      vectorSearch
    );
    widgetService = new WidgetService(database, vectorSearch, fileStorage);
    
    const mockOpenAI = new MockOpenAIService();
    const mockRAGAgent = new MockRAGAgent();
    chatService = new ChatService(mockOpenAI, database, mockRAGAgent, widgetService, messageService);
    
    // Create test widget
    testUserId = uuidv4();
    const testWidget = await widgetService.createWidget(
      testUserId,
      'Test Chat Widget',
      'Widget for chat API testing'
    );
    testWidgetId = testWidget.id;
    
    // Make widget public for anonymous testing
    await database.db.update(widget)
      .set({ isPublic: true })
      .where(eq(widget.id, testWidgetId));
    
    // Set up test app
    app = new Hono<{ Bindings: Env }>();
    app.post('/api/chat', async (c) => {
      c.set('services', { 
        chat: chatService,
        messages: messageService,
        widget: widgetService,
      } as any);
      c.set('auth', { user: { id: testUserId } });
      return chatService.handleChat(c as any);
    });
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

  describe('Authenticated User Chat', () => {
    it('should save messages for authenticated users', async () => {
      const sessionId = uuidv4();
      const res = await app.request('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello, AI assistant!',
          widgetId: testWidgetId,
          sessionId,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe('Mock RAG response with sources');
      expect(data.sources).toHaveLength(2);
      expect(data.sessionId).toBe(sessionId);

      // Verify messages were saved
      const messages = await messageService.getMessages({ widgetId: testWidgetId });
      expect(messages).toHaveLength(2);
      
      const userMessage = messages.find(m => m.role === 'user');
      expect(userMessage?.content).toBe('Hello, AI assistant!');
      expect(userMessage?.userId).toBe(testUserId);
      
      const assistantMessage = messages.find(m => m.role === 'assistant');
      expect(assistantMessage?.content).toBe('Mock RAG response with sources');
      expect(assistantMessage?.metadata?.sources).toHaveLength(2);
      expect(assistantMessage?.metadata?.model).toBe('gpt-4.1-mini');
    });

    it('should generate session ID if not provided', async () => {
      const res = await app.request('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test without session ID',
          widgetId: testWidgetId,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.sessionId).toBeTruthy();
      expect(data.sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

      // Verify messages have the generated session ID
      const messages = await messageService.getMessages({ widgetId: testWidgetId });
      expect(messages).toHaveLength(2);
      expect(messages[0].sessionId).toBe(data.sessionId);
      expect(messages[1].sessionId).toBe(data.sessionId);
    });

    it('should maintain conversation history within a session', async () => {
      const sessionId = uuidv4();
      
      // First message
      await app.request('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'First message',
          widgetId: testWidgetId,
          sessionId,
        }),
      });

      // Second message in same session
      await app.request('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Second message',
          widgetId: testWidgetId,
          sessionId,
          history: [
            { role: 'user', content: 'First message' },
            { role: 'assistant', content: 'Mock RAG response with sources' },
          ],
        }),
      });

      const messages = await messageService.getMessages({ 
        widgetId: testWidgetId,
        sessionId,
      });
      
      expect(messages).toHaveLength(4);
      const contents = messages.map(m => m.content);
      expect(contents).toContain('First message');
      expect(contents).toContain('Second message');
    });
  });

  describe('Anonymous User Chat', () => {
    it('should save messages for anonymous users with public widgets', async () => {
      // Create app without auth
      const anonymousApp = new Hono<{ Bindings: Env }>();
      anonymousApp.post('/api/chat', async (c) => {
        c.set('services', { 
          chat: chatService,
          messages: messageService,
          widget: widgetService,
        } as any);
        // No auth set - anonymous user
        return chatService.handleChat(c as any);
      });

      const sessionId = uuidv4();
      const res = await anonymousApp.request('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Anonymous user message',
          widgetId: testWidgetId,
          sessionId,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe('Mock RAG response with sources');

      // Verify messages were saved without userId
      const messages = await messageService.getMessages({ widgetId: testWidgetId });
      expect(messages).toHaveLength(2);
      
      const userMessage = messages.find(m => m.role === 'user');
      expect(userMessage?.content).toBe('Anonymous user message');
      expect(userMessage?.userId).toBeNull();
      
      const assistantMessage = messages.find(m => m.role === 'assistant');
      expect(assistantMessage?.userId).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing widget ID', async () => {
      const res = await app.request('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test message',
          // No widgetId
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Content context is required');
    });

    it('should handle invalid message', async () => {
      const res = await app.request('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '',
          widgetId: testWidgetId,
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Invalid message');
    });
  });

  describe('Message Metadata', () => {
    it('should save metadata with messages', async () => {
      const sessionId = uuidv4();
      const res = await app.request('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Test Browser/1.0',
          'X-Forwarded-For': '192.168.1.1',
        },
        body: JSON.stringify({
          message: 'Test with metadata',
          widgetId: testWidgetId,
          sessionId,
        }),
      });

      expect(res.status).toBe(200);

      const messages = await messageService.getMessages({ widgetId: testWidgetId });
      const userMessage = messages.find(m => m.role === 'user');
      
      expect(userMessage?.metadata?.userAgent).toBe('Test Browser/1.0');
      expect(userMessage?.metadata?.ipAddress).toBe('192.168.1.1');
      
      const assistantMessage = messages.find(m => m.role === 'assistant');
      expect(assistantMessage?.metadata?.responseTime).toBeGreaterThan(0);
    });
  });
});