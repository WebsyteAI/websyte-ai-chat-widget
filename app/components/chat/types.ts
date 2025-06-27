export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: MessageSource[];
  metadata?: MessageMetadata;
}

export interface MessageSource {
  chunk: string;
  similarity: number;
  metadata: {
    source?: string;
    chunkIndex: number;
    fileId?: string;
    url?: string;
    crawledFrom?: string;
    title?: string;
    pageNumber?: number;
  };
  widgetId?: string;
}

export interface MessageMetadata {
  responseTime?: number;
  tokenCount?: number;
  model?: string;
  retrievedChunks?: number;
  debug?: {
    similarityThreshold: number;
    maxChunks: number;
    actualChunks: number;
  };
}

export interface ChatConfig {
  widgetId?: string;
  enabled: boolean;
  baseUrl: string;
  enableSources?: boolean;
  enableDebug?: boolean;
  mode?: "standard" | "rag";
  isEmbedded?: boolean; // True when chat is embedded on external site
}

export interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  inputValue: string;
  abortController: AbortController | null;
}

export interface ChatAPI {
  sendMessage: (message: string) => Promise<void>;
  cancelMessage: () => void;
  clearMessages: () => void;
  setInputValue: (value: string) => void;
  clearError: () => void;
}

export interface ChatResponse {
  message: string;
  sources?: MessageSource[];
  metadata?: MessageMetadata;
  sessionId?: string;
}

export interface ChatRequest {
  message: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  context?: {
    url: string;
    title: string;
    content: string;
  };
  widgetId?: string;
  sessionId?: string;
  isEmbedded?: boolean; // Track if request is from embedded widget
}

export type ChatLayout = "widget" | "fullscreen" | "sidebar" | "panel";