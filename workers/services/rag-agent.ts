import { openai } from '@ai-sdk/openai';
import { generateText, streamText, embed } from 'ai';
import type { WidgetService } from './widget.js';
import type { ChatMessage, ChatRequest } from '../types.js';

export interface RAGChatRequest extends ChatRequest {
  widgetId?: string;
}

export interface RAGChatOptions {
  stream?: boolean;
  maxRetrievedChunks?: number;
  similarityThreshold?: number;
}

export class RAGAgent {
  constructor(
    private openaiApiKey: string,
    private widgetService: WidgetService
  ) {}

  private async retrieveRelevantContext(
    query: string,
    widgetId: string,
    userId: string,
    maxChunks: number = 4,
    threshold: number = 0
  ): Promise<{ chunks: string[]; sources: any[] }> {
    try {
      console.log('[RAG] Retrieving context for widget:', widgetId, 'user:', userId, 'query:', query);
      
      const searchResults = await this.widgetService.searchWidgetContent(
        widgetId,
        userId,
        query,
        maxChunks
      );

      console.log('[RAG] Search results count:', searchResults.length);

      // Filter by similarity threshold
      const filteredResults = searchResults.filter((result: any) => result.similarity >= threshold);
      
      console.log('[RAG] Filtered results count:', filteredResults.length);
      
      return {
        chunks: filteredResults.map((result: any) => result.chunk),
        sources: filteredResults
      };
    } catch (error) {
      console.error('[RAG] Error retrieving context:', error);
      return { chunks: [], sources: [] };
    }
  }

  private buildSystemPrompt(
    retrievedChunks: string[],
    webpageContent?: { url: string; title: string; content: string }
  ): string {
    let systemPrompt = `You are an AI assistant that answers questions based on the provided context. You should:

1. Use the retrieved information to answer questions accurately
2. If the retrieved information doesn't contain relevant details, say so clearly
3. When citing sources, use inline superscript numbers like [1] or [2] directly after the relevant information
4. If you use multiple sources for a single statement, cite them together like [1,2,3]
5. Be helpful, accurate, and concise
6. IMPORTANT: Place citations immediately after the information they support, not at the end of paragraphs`;

    if (retrievedChunks.length > 0) {
      systemPrompt += `\n\n## Retrieved Knowledge Base Context:\n`;
      retrievedChunks.forEach((chunk, index) => {
        systemPrompt += `\n### Source [${index + 1}]:\n${chunk}\n`;
      });
    }

    if (webpageContent?.content) {
      systemPrompt += `\n\n## Current Webpage Context:\nURL: ${webpageContent.url}\nTitle: ${webpageContent.title}\nContent: ${webpageContent.content.slice(0, 10000)}`;
    }

    if (retrievedChunks.length === 0 && !webpageContent?.content) {
      systemPrompt += `\n\nNote: No specific knowledge base context was found for this query. Please answer based on your general knowledge and indicate when information might be limited.`;
    }

    return systemPrompt;
  }

  private formatMessages(request: RAGChatRequest, systemPrompt: string): any[] {
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    if (request.history) {
      messages.push(...request.history.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: request.message
    });

    return messages;
  }

  async generateResponse(
    request: RAGChatRequest,
    userId: string,
    options: RAGChatOptions = {}
  ): Promise<{ response: string; sources?: any[] }> {
    const {
      maxRetrievedChunks = 5,
      similarityThreshold = 0
    } = options;

    let retrievedChunks: string[] = [];
    let sources: any[] = [];
    
    // Retrieve relevant context if widgetId is provided
    if (request.widgetId) {
      const contextResult = await this.retrieveRelevantContext(
        request.message,
        request.widgetId,
        userId,
        maxRetrievedChunks,
        similarityThreshold
      );
      retrievedChunks = contextResult.chunks;
      sources = contextResult.sources;
    }

    const systemPrompt = this.buildSystemPrompt(retrievedChunks, request.context);
    const messages = this.formatMessages(request, systemPrompt);

    try {
      const result = await generateText({
        model: openai('gpt-4.1-mini'),
        messages,
        temperature: 0.2,
        maxTokens: 5000,
      });

      return {
        response: result.text,
        sources: sources.length > 0 ? sources : undefined
      };
    } catch (error) {
      console.error('Error generating RAG response:', error);
      throw new Error('Failed to generate response');
    }
  }

  async streamResponse(
    request: RAGChatRequest,
    userId: string,
    options: RAGChatOptions = {}
  ) {
    const {
      maxRetrievedChunks = 4,
      similarityThreshold = 0
    } = options;

    let retrievedChunks: string[] = [];
    
    // Retrieve relevant context if widgetId is provided
    if (request.widgetId) {
      const contextResult = await this.retrieveRelevantContext(
        request.message,
        request.widgetId,
        userId,
        maxRetrievedChunks,
        similarityThreshold
      );
      retrievedChunks = contextResult.chunks;
    }

    const systemPrompt = this.buildSystemPrompt(retrievedChunks, request.context);
    const messages = this.formatMessages(request, systemPrompt);

    try {
      const result = streamText({
        model: openai('gpt-4.1-mini'),
        messages,
        temperature: 0.2,
        maxTokens: 5000,
      });

      return result;
    } catch (error) {
      console.error('Error streaming RAG response:', error);
      throw new Error('Failed to stream response');
    }
  }
}