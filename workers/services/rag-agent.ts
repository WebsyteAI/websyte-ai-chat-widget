import { openai } from '@ai-sdk/openai';
import { generateText, streamText, embed } from 'ai';
import type { WidgetService } from './widget.js';
import type { ChatMessage, ChatRequest } from '../types.js';
import { createLogger } from '../lib/logger';

export interface RAGChatRequest extends ChatRequest {
  widgetId?: string;
}

export interface RAGChatOptions {
  stream?: boolean;
  maxRetrievedChunks?: number;
  similarityThreshold?: number;
}

export class RAGAgent {
  private logger = createLogger('RAGAgent');
  
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
    const start = Date.now();
    const contextLogger = this.logger.child({ widgetId, userId });
    
    try {
      contextLogger.debug({ queryLength: query.length, maxChunks }, 'Retrieving context');
      
      const searchStart = Date.now();
      const searchResults = await this.widgetService.searchWidgetContent(
        widgetId,
        userId,
        query,
        maxChunks
      );
      const searchDuration = Date.now() - searchStart;
      contextLogger.debug({ duration_ms: searchDuration }, 'Widget content search completed');

      contextLogger.info({ count: searchResults.length }, 'Search results');

      // Filter by similarity threshold
      const filteredResults = searchResults.filter((result: any) => result.similarity >= threshold);
      
      contextLogger.info({ 
        count: filteredResults.length,
        threshold,
        avgSimilarity: filteredResults.length > 0 
          ? filteredResults.reduce((sum, r) => sum + r.similarity, 0) / filteredResults.length 
          : 0
      }, 'Filtered results');
      
      return {
        chunks: filteredResults.map((result: any) => result.chunk),
        sources: filteredResults
      };
    } catch (error) {
      contextLogger.error({ err: error }, 'Error retrieving context');
      return { chunks: [], sources: [] };
    } finally {
      const duration = Date.now() - start;
      contextLogger.debug({ duration_ms: duration }, 'Context retrieval completed');
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
4. CRITICAL CITATION RULES:
   - NEVER combine multiple citations like [1,2,3]
   - Each sentence or fact should cite ONLY ONE source
   - If information comes from multiple sources, split it into separate sentences, each with its own citation
   - Example: "Feature X does Y [1]. Additionally, feature X supports Z [2]." NOT "Feature X does Y and supports Z [1,2]."
5. Structure your response to ensure single-source attribution:
   - Break down complex information into discrete facts
   - Attribute each fact to exactly one source
   - Use transitional phrases like "Additionally," "Furthermore," "Also," to connect related facts from different sources
6. Place citations immediately after the specific information they support, not at the end of paragraphs
7. Be helpful, accurate, and concise while maintaining clear source attribution`;

    if (retrievedChunks.length > 0) {
      systemPrompt += `\n\n## Retrieved Knowledge Base Context:\n`;
      retrievedChunks.forEach((chunk, index) => {
        systemPrompt += `\n### Source [${index + 1}]:\n${chunk}\n`;
      });
    }

    if (webpageContent?.content) {
      // Include full webpage content without truncation
      // Token limits are handled by the model itself
      systemPrompt += `\n\n## Current Webpage Context:\nURL: ${webpageContent.url}\nTitle: ${webpageContent.title}\nContent: ${webpageContent.content}`;
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
    const start = Date.now();
    const responseLogger = this.logger.child({ 
      widgetId: request.widgetId, 
      userId,
      messageLength: request.message.length 
    });
    
    try {
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

      const llmStart = Date.now();
      const result = await generateText({
        model: openai('gpt-4.1-mini'),
        messages,
        temperature: 0.2,
        maxTokens: 5000,
      });
      const llmDuration = Date.now() - llmStart;
      responseLogger.debug({ duration_ms: llmDuration }, 'LLM generation completed');

      responseLogger.info({
        responseLength: result.text.length,
        sourcesCount: sources.length,
        hasContext: retrievedChunks.length > 0
      }, 'Response generated');

      return {
        response: result.text,
        sources: sources.length > 0 ? sources : undefined
      };
    } catch (error) {
      responseLogger.error({ err: error }, 'Error generating RAG response');
      throw new Error('Failed to generate response');
    } finally {
      const duration = Date.now() - start;
      responseLogger.info({ total_duration_ms: duration }, 'RAG response generation completed');
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