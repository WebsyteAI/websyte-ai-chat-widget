import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, ChatConfig, ChatState, ChatAPI, ChatRequest, ChatResponse } from '../types';

export function useChat(config: ChatConfig): ChatState & ChatAPI {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  const messageIdCounter = useRef(0);

  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${++messageIdCounter.current}`;
  }, []);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, sources?: any[], metadata?: any) => {
    const message: ChatMessage = {
      id: generateMessageId(),
      role,
      content,
      timestamp: new Date(),
      sources,
      metadata,
    };
    
    setMessages(prev => [...prev, message]);
    return message;
  }, [generateMessageId]);

  const sendMessage = useCallback(async (message: string) => {
    if (!config.enabled || !message.trim() || loading) {
      return;
    }

    // Clear any previous errors
    setError(null);
    
    // Add user message
    const userMessage = addMessage('user', message.trim());
    
    // Clear input
    setInputValue('');
    setLoading(true);

    // Create abort controller
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const startTime = Date.now();
      
      // Prepare request based on mode
      const chatRequest: ChatRequest = {
        message: userMessage.content,
        history: messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      };

      // Add widgetId for RAG mode
      if (config.mode === 'rag' && config.widgetId) {
        chatRequest.widgetId = config.widgetId;
      }

      const response = await fetch(`${config.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatRequest),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      const endTime = Date.now();
      
      // Prepare metadata
      const metadata: any = {
        responseTime: endTime - startTime,
        model: 'gpt-4.1-mini', // This should come from the response
        retrievedChunks: data.sources?.length || 0,
      };

      // Add debug information if available
      if (config.enableDebug && data.sources) {
        metadata.debug = {
          similarityThreshold: 0, // This should come from the response
          maxChunks: 4, // This should come from the response
          actualChunks: data.sources.length,
        };
      }

      // Add assistant message with sources
      addMessage(
        'assistant', 
        data.message || "Sorry, I couldn't process your request.",
        data.sources,
        metadata
      );

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        addMessage('assistant', "Message cancelled.");
      } else {
        console.error("Error sending message:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
        addMessage(
          'assistant', 
          "Sorry, I'm having trouble connecting right now. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  }, [config, loading, messages, addMessage]);

  const cancelMessage = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    messages,
    loading,
    error,
    inputValue,
    abortController,
    
    // Actions
    sendMessage,
    cancelMessage,
    clearMessages,
    setInputValue,
    clearError,
  };
}