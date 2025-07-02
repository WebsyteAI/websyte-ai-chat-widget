import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Message, Recommendation, UnifiedChatConfig, ChatState, ChatActions } from "../types";

export interface UseUnifiedChatOptions {
  externalMessages?: Message[];
  onExternalSendMessage?: (message: string) => Promise<void>;
}

export function useUnifiedChat(config: UnifiedChatConfig, options?: UseUnifiedChatOptions): ChatState & ChatActions {
  const [messages, setMessages] = useState<Message[]>(options?.externalMessages || []);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>(config.sessionId || uuidv4());
  
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(undefined);
  }, []);
  
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);
  
  const cancelMessage = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);
  
  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);
  
  const loadRecommendations = useCallback(async () => {
    if (!config.widgetId || !config.showRecommendations) return;
    
    setLoadingRecommendations(true);
    try {
      const response = await fetch(`${config.baseUrl || ""}/api/widgets/${config.widgetId}/recommendations`);
      if (!response.ok) throw new Error("Failed to load recommendations");
      
      const data = await response.json() as { recommendations?: Recommendation[] };
      setRecommendations((data.recommendations || []) as Recommendation[]);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [config.widgetId, config.showRecommendations, config.baseUrl]);
  
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || loading) return;
    
    // Cancel any ongoing request
    cancelMessage();
    
    // Add user message
    const userMessage = addMessage({
      content: message,
      role: "user",
    });
    
    setInputValue("");
    setLoading(true);
    setError(undefined);
    
    // Notify callbacks
    config.onChatStarted?.();
    config.onMessageSent?.(message);
    
    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const endpoint = config.mode === "rag" && config.widgetId
        ? `/api/widgets/${config.widgetId}/chat`
        : "/api/chat";
      
      const requestBody: any = {
        message,
        sessionId: sessionIdRef.current,
      };
      
      if (config.saveChatMessages !== undefined) {
        requestBody.saveChatMessages = config.saveChatMessages;
      }
      
      const response = await fetch(`${config.baseUrl || ""}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");
      
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let assistantMessage: Message | null = null;
      let sources: Message["sources"] = undefined;
      let debugInfo: Message["debug"] = undefined;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === "content") {
                accumulatedContent += data.content;
                
                if (!assistantMessage) {
                  assistantMessage = addMessage({
                    content: accumulatedContent,
                    role: "assistant",
                  });
                } else {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage!.id
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }
              } else if (data.type === "sources") {
                sources = data.sources;
              } else if (data.type === "debug") {
                debugInfo = data.debug;
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", e);
            }
          }
        }
      }
      
      // Update message with sources and debug info
      if (assistantMessage && (sources || debugInfo)) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage!.id
              ? { ...msg, sources, debug: debugInfo }
              : msg
          )
        );
      }
      
      // Notify callbacks
      if (assistantMessage) {
        config.onMessageReceived?.(assistantMessage);
      }
      
    } catch (err: any) {
      if (err.name !== "AbortError") {
        const errorMessage = err.message || "Failed to send message";
        setError(errorMessage);
        config.onError?.(errorMessage);
        
        // Add error message
        addMessage({
          content: `Error: ${errorMessage}`,
          role: "system",
        });
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [
    loading,
    cancelMessage,
    addMessage,
    config,
  ]);
  
  // Load recommendations on mount if configured
  useEffect(() => {
    if (config.showRecommendations && config.widgetId) {
      loadRecommendations();
    }
  }, [config.showRecommendations, config.widgetId, loadRecommendations]);
  
  return {
    // State
    messages,
    inputValue,
    loading,
    error,
    recommendations,
    loadingRecommendations,
    abortController: abortControllerRef.current || undefined,
    
    // Actions
    sendMessage,
    setInputValue,
    clearMessages,
    clearError,
    cancelMessage,
    loadRecommendations,
  };
}