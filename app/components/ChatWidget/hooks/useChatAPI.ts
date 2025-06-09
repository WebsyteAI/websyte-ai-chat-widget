import { useState, useCallback, useRef } from 'react';
import { type Message } from '../types';
import { ContentExtractor } from '../../../lib/content-extractor';

export interface UseChatAPIProps {
  apiEndpoint: string;
  baseUrl: string;
  contentTarget: string;
}

export interface UseChatAPIReturn {
  isLoading: boolean;
  sendMessage: (
    messageContent: string,
    messageHistory: Message[],
    onSuccess: (response: string) => void,
    onError?: (error: Error) => void,
    onCancel?: () => void
  ) => Promise<void>;
  cancel: () => void;
}

export function useChatAPI({ apiEndpoint, baseUrl, contentTarget }: UseChatAPIProps): UseChatAPIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const extractPageContent = useCallback(async () => {
    return await ContentExtractor.extractPageContent(contentTarget);
  }, [contentTarget]);

  const sendMessage = useCallback(async (
    messageContent: string,
    messageHistory: Message[],
    onSuccess: (response: string) => void,
    onError?: (error: Error) => void,
    onCancel?: () => void
  ) => {
    if (isLoading) return;

    setIsLoading(true);
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const pageContent = await extractPageContent();
      
      const response = await fetch(`${baseUrl}${apiEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageContent,
          history: messageHistory.slice(-10),
          context: pageContent,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json() as { message?: string };
      const responseMessage = data.message || "Sorry, I couldn't process your request.";
      
      onSuccess(responseMessage);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        onCancel?.();
      } else {
        console.error("Error sending message:", error);
        const errorMessage = error instanceof Error ? error : new Error("Unknown error occurred");
        onError?.(errorMessage);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, apiEndpoint, baseUrl, extractPageContent]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    isLoading,
    sendMessage,
    cancel,
  };
}