import { useState } from 'react';
import { toast } from '../../../lib/use-toast';
import { createLogger } from '../../../lib/logger';
import { ContentExtractor } from '../../../lib/content-extractor';
import type { Message, Summaries, ContentMode } from '../../types';

const logger = createLogger('useChatLogic');

interface UseChatLogicProps {
  baseUrl: string;
  widgetId?: string;
  currentContent: string;
  summaries: Summaries;
  currentContentMode: ContentMode;
  isLoadingSummaries: boolean;
  saveChatMessages: boolean;
  notifyChatResponse?: (response: string) => void;
  notifyError?: (error: string) => void;
}

export function useChatLogic({
  baseUrl,
  widgetId,
  currentContent,
  summaries,
  currentContentMode,
  isLoadingSummaries,
  saveChatMessages,
  notifyChatResponse,
  notifyError
}: UseChatLogicProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleSendMessage = async (
    message: string,
    messages: Message[],
    addMessage: (message: Message) => void,
    setInputValue: (value: string) => void
  ) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = { 
      id: Date.now().toString(),
      role: 'user', 
      content: message 
    };
    
    addMessage(userMessage);
    setInputValue('');
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    let pageContent = currentContent;
    if (currentContentMode === 'long' && summaries.long) {
      pageContent = summaries.long;
    } else if (currentContentMode === 'medium' && summaries.medium) {
      pageContent = summaries.medium;
    } else if (currentContentMode === 'short' && summaries.short) {
      pageContent = summaries.short;
    }

    if (!pageContent && !isLoadingSummaries) {
      try {
        logger.info('Extracting page content for empty content');
        pageContent = ContentExtractor.extractPageContent();
        logger.info({ contentLength: pageContent.length }, 'Page content extracted');
      } catch (error) {
        logger.error({ err: error }, 'Failed to extract page content');
        pageContent = 'Unable to extract page content.';
      }
    }

    const assistantMessage: Message = { 
      id: (Date.now() + 1).toString(),
      role: 'assistant', 
      content: '' 
    };
    addMessage(assistantMessage);

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          pageContent,
          mode: currentContentMode,
          widgetId,
          saveChatMessages
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  accumulatedContent += data.text;
                  // Update the assistant message with accumulated content
                  addMessage({
                    ...assistantMessage,
                    content: accumulatedContent
                  });
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }

      notifyChatResponse?.(accumulatedContent);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        logger.info('Chat request aborted');
      } else {
        logger.error({ err: error }, 'Error sending message');
        toast.error('Failed to send message. Please try again.');
        notifyError?.(error.message || 'Failed to send message');
        
        // Update assistant message with error
        addMessage({
          ...assistantMessage,
          content: 'Sorry, I encountered an error. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  };

  const handleRecommendationClick = async (
    recommendationText: string,
    recommendationResponse: string,
    messages: Message[],
    addMessage: (message: Message) => void,
    setCurrentView: (view: 'main' | 'chat') => void
  ) => {
    setCurrentView('chat');
    
    // Add the recommendation as a user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: recommendationText
    };
    addMessage(userMessage);
    
    // Add the pre-generated response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: recommendationResponse
    };
    addMessage(assistantMessage);
    
    notifyChatResponse?.(recommendationResponse);
  };

  return {
    isLoading,
    handleSendMessage,
    handleStopGeneration,
    handleRecommendationClick
  };
}