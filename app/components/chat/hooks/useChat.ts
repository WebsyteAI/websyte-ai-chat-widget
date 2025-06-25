import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, ChatConfig, ChatState, ChatAPI, ChatRequest, ChatResponse } from '../types';

const SESSION_STORAGE_KEY = 'websyte-chat-session';
const SESSION_EXPIRY_HOURS = 24;

export function useChat(config: ChatConfig): ChatState & ChatAPI {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const messageIdCounter = useRef(0);

  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${++messageIdCounter.current}`;
  }, []);

  // Session management
  const getOrCreateSessionId = useCallback(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const { id, expiry } = JSON.parse(stored);
        if (new Date(expiry) > new Date()) {
          return id;
        }
      }
    } catch (e) {
      console.error('Error reading session from localStorage:', e);
    }

    // Generate new session
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + SESSION_EXPIRY_HOURS);
    
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        id: newSessionId,
        expiry: expiry.toISOString(),
      }));
    } catch (e) {
      console.error('Error saving session to localStorage:', e);
    }

    return newSessionId;
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

      // Add widgetId and sessionId for RAG mode
      if (config.mode === 'rag' && config.widgetId) {
        chatRequest.widgetId = config.widgetId;
        // Only create session ID on first message if embedded
        if (config.isEmbedded) {
          if (!sessionId) {
            const newSessionId = getOrCreateSessionId();
            setSessionId(newSessionId);
            chatRequest.sessionId = newSessionId;
          } else {
            chatRequest.sessionId = sessionId;
          }
          chatRequest.isEmbedded = true;
        }
      }

      const response = await fetch(`${config.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(chatRequest),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      const endTime = Date.now();
      
      // Update session ID if returned from server
      if (data.sessionId) {
        setSessionId(data.sessionId);
        
        // Update localStorage with new session ID
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + SESSION_EXPIRY_HOURS);
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            id: data.sessionId,
            expiry: expiry.toISOString(),
          }));
        } catch (e) {
          console.error('Error updating session in localStorage:', e);
        }
      }
      
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
    // Generate new session when clearing messages
    if (config.mode === 'rag' && config.widgetId) {
      const newSessionId = getOrCreateSessionId();
      setSessionId(newSessionId);
    }
  }, [config.mode, config.widgetId, getOrCreateSessionId]);

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