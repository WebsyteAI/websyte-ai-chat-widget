import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RAGAgent, type RAGChatRequest, type RAGChatOptions } from './rag-agent';
import type { WidgetService } from './widget';
import type { ChatMessage } from '../types';

// Mock ai SDK
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'mock-model')
}));

vi.mock('ai', () => ({
  generateText: vi.fn(),
  streamText: vi.fn(),
  embed: vi.fn()
}));

// Mock WidgetService
vi.mock('./widget');

describe('RAGAgent', () => {
  let ragAgent: RAGAgent;
  let mockWidgetService: WidgetService;
  let mockGenerateText: any;
  let mockStreamText: any;

  const mockSearchResults = [
    {
      chunk: 'This is relevant information about AI.',
      similarity: 0.9,
      metadata: { chunkIndex: 0, source: 'document1' },
      widgetId: 'widget-123'
    },
    {
      chunk: 'More information about machine learning.',
      similarity: 0.8,
      metadata: { chunkIndex: 1, source: 'document2' },
      widgetId: 'widget-123'
    },
    {
      chunk: 'Less relevant content.',
      similarity: 0.3,
      metadata: { chunkIndex: 2, source: 'document3' },
      widgetId: 'widget-123'
    }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock WidgetService
    mockWidgetService = {
      searchWidgetContent: vi.fn().mockResolvedValue(mockSearchResults)
    } as any;

    // Get mocked functions
    const aiModule = await import('ai');
    mockGenerateText = vi.mocked(aiModule.generateText);
    mockStreamText = vi.mocked(aiModule.streamText);

    // Set default mock responses
    mockGenerateText.mockResolvedValue({
      text: 'Generated response based on context.'
    });

    mockStreamText.mockReturnValue({
      textStream: 'mock-stream'
    });

    ragAgent = new RAGAgent('test-api-key', mockWidgetService);
  });

  describe('retrieveRelevantContext', () => {
    it('should retrieve relevant context from widget service', async () => {
      const retrieveContext = (ragAgent as any).retrieveRelevantContext.bind(ragAgent);
      
      const result = await retrieveContext(
        'query about AI',
        'widget-123',
        'user-456',
        4,
        0
      );

      expect(mockWidgetService.searchWidgetContent).toHaveBeenCalledWith(
        'widget-123',
        'user-456',
        'query about AI',
        4
      );

      expect(result).toEqual({
        chunks: [
          'This is relevant information about AI.',
          'More information about machine learning.',
          'Less relevant content.'
        ],
        sources: mockSearchResults
      });
    });

    it('should filter results by similarity threshold', async () => {
      const retrieveContext = (ragAgent as any).retrieveRelevantContext.bind(ragAgent);
      
      const result = await retrieveContext(
        'query',
        'widget-123',
        'user-456',
        4,
        0.5 // Filter out results below 0.5 similarity
      );

      expect(result.chunks).toEqual([
        'This is relevant information about AI.',
        'More information about machine learning.'
      ]);
      expect(result.sources).toHaveLength(2);
    });

    it('should handle search errors gracefully', async () => {
      mockWidgetService.searchWidgetContent = vi.fn().mockRejectedValue(new Error('Search failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const retrieveContext = (ragAgent as any).retrieveRelevantContext.bind(ragAgent);
      const result = await retrieveContext('query', 'widget-123', 'user-456');

      expect(result).toEqual({ chunks: [], sources: [] });
      expect(consoleSpy).toHaveBeenCalledWith('[RAG] Error retrieving context:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('buildSystemPrompt', () => {
    it('should build system prompt with retrieved chunks', () => {
      const buildPrompt = (ragAgent as any).buildSystemPrompt.bind(ragAgent);
      const chunks = ['Chunk 1 content', 'Chunk 2 content'];
      
      const prompt = buildPrompt(chunks);

      expect(prompt).toContain('You are an AI assistant');
      expect(prompt).toContain('## Retrieved Knowledge Base Context:');
      expect(prompt).toContain('### Source [1]:\nChunk 1 content');
      expect(prompt).toContain('### Source [2]:\nChunk 2 content');
    });

    it('should include webpage context when provided', () => {
      const buildPrompt = (ragAgent as any).buildSystemPrompt.bind(ragAgent);
      const webpageContent = {
        url: 'https://example.com',
        title: 'Example Page',
        content: 'This is the webpage content'
      };
      
      const prompt = buildPrompt([], webpageContent);

      expect(prompt).toContain('## Current Webpage Context:');
      expect(prompt).toContain('URL: https://example.com');
      expect(prompt).toContain('Title: Example Page');
      expect(prompt).toContain('Content: This is the webpage content');
    });

    it('should truncate long webpage content', () => {
      const buildPrompt = (ragAgent as any).buildSystemPrompt.bind(ragAgent);
      const longContent = 'a'.repeat(20000);
      const webpageContent = {
        url: 'https://example.com',
        title: 'Long Page',
        content: longContent
      };
      
      const prompt = buildPrompt([], webpageContent);

      expect(prompt).toContain('Content: ' + 'a'.repeat(10000));
      expect(prompt).not.toContain('a'.repeat(10001));
    });

    it('should include note when no context is available', () => {
      const buildPrompt = (ragAgent as any).buildSystemPrompt.bind(ragAgent);
      
      const prompt = buildPrompt([]);

      expect(prompt).toContain('No specific knowledge base context was found');
    });
  });

  describe('formatMessages', () => {
    it('should format messages with system prompt and user message', () => {
      const formatMessages = (ragAgent as any).formatMessages.bind(ragAgent);
      const request: RAGChatRequest = {
        message: 'What is AI?'
      };
      const systemPrompt = 'System prompt';
      
      const messages = formatMessages(request, systemPrompt);

      expect(messages).toEqual([
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'What is AI?' }
      ]);
    });

    it('should include conversation history', () => {
      const formatMessages = (ragAgent as any).formatMessages.bind(ragAgent);
      const history: ChatMessage[] = [
        { role: 'user', content: 'Previous question' },
        { role: 'assistant', content: 'Previous answer' }
      ];
      const request: RAGChatRequest = {
        message: 'Follow-up question',
        history
      };
      
      const messages = formatMessages(request, 'System prompt');

      expect(messages).toEqual([
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'Previous question' },
        { role: 'assistant', content: 'Previous answer' },
        { role: 'user', content: 'Follow-up question' }
      ]);
    });
  });

  describe('generateResponse', () => {
    it('should generate response with retrieved context', async () => {
      const request: RAGChatRequest = {
        message: 'Tell me about AI',
        widgetId: 'widget-123'
      };

      const result = await ragAgent.generateResponse(request, 'user-456');

      expect(mockWidgetService.searchWidgetContent).toHaveBeenCalledWith(
        'widget-123',
        'user-456',
        'Tell me about AI',
        5
      );

      expect(mockGenerateText).toHaveBeenCalledWith({
        model: 'mock-model',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user', content: 'Tell me about AI' })
        ]),
        temperature: 0.2,
        maxTokens: 5000
      });

      expect(result).toEqual({
        response: 'Generated response based on context.',
        sources: mockSearchResults
      });
    });

    it('should work without widgetId', async () => {
      const request: RAGChatRequest = {
        message: 'General question'
      };

      const result = await ragAgent.generateResponse(request, 'user-456');

      expect(mockWidgetService.searchWidgetContent).not.toHaveBeenCalled();
      expect(result).toEqual({
        response: 'Generated response based on context.',
        sources: undefined
      });
    });

    it('should use custom options', async () => {
      const request: RAGChatRequest = {
        message: 'Question',
        widgetId: 'widget-123'
      };
      const options: RAGChatOptions = {
        maxRetrievedChunks: 10,
        similarityThreshold: 0.7
      };

      await ragAgent.generateResponse(request, 'user-456', options);

      expect(mockWidgetService.searchWidgetContent).toHaveBeenCalledWith(
        'widget-123',
        'user-456',
        'Question',
        10
      );
    });

    it('should include webpage context', async () => {
      const request: RAGChatRequest = {
        message: 'Question about this page',
        context: {
          url: 'https://example.com',
          title: 'Example',
          content: 'Page content'
        }
      };

      await ragAgent.generateResponse(request, 'user-456');

      const systemMessage = mockGenerateText.mock.calls[0][0].messages[0];
      expect(systemMessage.content).toContain('Current Webpage Context');
      expect(systemMessage.content).toContain('https://example.com');
    });

    it('should handle generation errors', async () => {
      mockGenerateText.mockRejectedValue(new Error('API error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const request: RAGChatRequest = {
        message: 'Question'
      };

      await expect(
        ragAgent.generateResponse(request, 'user-456')
      ).rejects.toThrow('Failed to generate response');

      expect(consoleSpy).toHaveBeenCalledWith('Error generating RAG response:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should not include sources when no results found', async () => {
      mockWidgetService.searchWidgetContent = vi.fn().mockResolvedValue([]);
      
      const request: RAGChatRequest = {
        message: 'Question',
        widgetId: 'widget-123'
      };

      const result = await ragAgent.generateResponse(request, 'user-456');

      expect(result.sources).toBeUndefined();
    });
  });

  describe('streamResponse', () => {
    it('should stream response with retrieved context', async () => {
      const request: RAGChatRequest = {
        message: 'Tell me about AI',
        widgetId: 'widget-123'
      };

      const result = await ragAgent.streamResponse(request, 'user-456');

      expect(mockWidgetService.searchWidgetContent).toHaveBeenCalledWith(
        'widget-123',
        'user-456',
        'Tell me about AI',
        4
      );

      expect(mockStreamText).toHaveBeenCalledWith({
        model: 'mock-model',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user', content: 'Tell me about AI' })
        ]),
        temperature: 0.2,
        maxTokens: 5000
      });

      expect(result).toEqual({ textStream: 'mock-stream' });
    });

    it('should work without widgetId', async () => {
      const request: RAGChatRequest = {
        message: 'General question'
      };

      await ragAgent.streamResponse(request, 'user-456');

      expect(mockWidgetService.searchWidgetContent).not.toHaveBeenCalled();
    });

    it('should use custom options', async () => {
      const request: RAGChatRequest = {
        message: 'Question',
        widgetId: 'widget-123'
      };
      const options: RAGChatOptions = {
        maxRetrievedChunks: 8,
        similarityThreshold: 0.6
      };

      await ragAgent.streamResponse(request, 'user-456', options);

      expect(mockWidgetService.searchWidgetContent).toHaveBeenCalledWith(
        'widget-123',
        'user-456',
        'Question',
        8
      );
    });

    it('should handle streaming errors', async () => {
      mockStreamText.mockImplementation(() => {
        throw new Error('Stream error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const request: RAGChatRequest = {
        message: 'Question'
      };

      await expect(
        ragAgent.streamResponse(request, 'user-456')
      ).rejects.toThrow('Failed to stream response');

      expect(consoleSpy).toHaveBeenCalledWith('Error streaming RAG response:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle stream interruption gracefully', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield 'Starting response...';
          yield 'Partial content';
          throw new Error('Stream interrupted');
        }
      };
      
      mockStreamText.mockReturnValue({ textStream: mockStream });
      
      const request: RAGChatRequest = {
        message: 'Question',
        widgetId: 'widget-123'
      };
      
      const result = await ragAgent.streamResponse(request, 'user-456');
      
      // Consumer of the stream should handle the interruption
      const chunks = [];
      try {
        for await (const chunk of result.textStream) {
          chunks.push(chunk);
        }
      } catch (error) {
        expect(error.message).toBe('Stream interrupted');
      }
      
      expect(chunks).toEqual(['Starting response...', 'Partial content']);
    });

    it('should handle malformed stream responses', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield null; // Invalid chunk
          yield undefined; // Invalid chunk
          yield 'Valid content';
          yield { invalid: 'object' }; // Non-string chunk
        }
      };
      
      mockStreamText.mockReturnValue({ textStream: mockStream });
      
      const request: RAGChatRequest = {
        message: 'Question'
      };
      
      const result = await ragAgent.streamResponse(request, 'user-456');
      
      const chunks = [];
      for await (const chunk of result.textStream) {
        chunks.push(chunk);
      }
      
      expect(chunks).toContain('Valid content');
    });

    it('should handle empty stream', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          // Empty stream - yields nothing
        }
      };
      
      mockStreamText.mockReturnValue({ textStream: mockStream });
      
      const request: RAGChatRequest = {
        message: 'Question'
      };
      
      const result = await ragAgent.streamResponse(request, 'user-456');
      
      const chunks = [];
      for await (const chunk of result.textStream) {
        chunks.push(chunk);
      }
      
      expect(chunks).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle extremely large context gracefully', async () => {
      // Generate 100 large search results
      const largeSearchResults = Array(100).fill(null).map((_, i) => ({
        chunk: 'x'.repeat(1000), // 1KB per chunk
        similarity: 0.9 - (i * 0.001),
        metadata: { chunkIndex: i, source: `document${i}` },
        widgetId: 'widget-123'
      }));
      
      mockWidgetService.searchWidgetContent = vi.fn().mockResolvedValue(largeSearchResults);
      
      const request: RAGChatRequest = {
        message: 'Question',
        widgetId: 'widget-123'
      };
      
      await ragAgent.generateResponse(request, 'user-456');
      
      // Should still work with large context
      expect(mockGenerateText).toHaveBeenCalled();
      const systemMessage = mockGenerateText.mock.calls[0][0].messages[0];
      expect(systemMessage.content).toContain('Retrieved Knowledge Base Context');
    });

    it('should handle special characters in messages', async () => {
      const request: RAGChatRequest = {
        message: 'What about <script>alert("xss")</script> and \n\r special chars?',
        widgetId: 'widget-123'
      };
      
      await ragAgent.generateResponse(request, 'user-456');
      
      const userMessage = mockGenerateText.mock.calls[0][0].messages.find(m => m.role === 'user');
      expect(userMessage.content).toBe('What about <script>alert("xss")</script> and \n\r special chars?');
    });

    it('should handle very long conversation history', async () => {
      const longHistory: ChatMessage[] = Array(50).fill(null).map((_, i) => [
        { role: 'user', content: `Question ${i}` },
        { role: 'assistant', content: `Answer ${i}` }
      ]).flat();
      
      const request: RAGChatRequest = {
        message: 'Final question',
        history: longHistory,
        widgetId: 'widget-123'
      };
      
      await ragAgent.generateResponse(request, 'user-456');
      
      const messages = mockGenerateText.mock.calls[0][0].messages;
      expect(messages).toHaveLength(102); // 1 system + 100 history + 1 current
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(5).fill(null).map((_, i) => ({
        message: `Question ${i}`,
        widgetId: 'widget-123'
      }));
      
      const promises = requests.map(req => 
        ragAgent.generateResponse(req, 'user-456')
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      expect(mockWidgetService.searchWidgetContent).toHaveBeenCalledTimes(5);
      expect(mockGenerateText).toHaveBeenCalledTimes(5);
    });
  });
});