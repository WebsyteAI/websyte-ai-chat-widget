import type { ComponentRegistry } from "../landing-chat/component-registry";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp?: Date;
  sources?: Array<{
    id: string;
    url: string;
    title: string;
    content: string;
    chunkIndex?: number;
  }>;
  debug?: {
    model?: string;
    ragMode?: boolean;
    searchResults?: number;
    processingTime?: number;
  };
}

export interface Recommendation {
  id?: string;
  title: string;
  description: string;
}

export interface UnifiedChatConfig {
  // API Configuration
  baseUrl?: string;
  widgetId?: string;
  widgetName?: string;
  sessionId?: string;
  
  // Display Options
  showRecommendations?: boolean;
  showDropShadow?: boolean;
  fullScreen?: boolean;
  showHeader?: boolean;
  showPoweredBy?: boolean;
  
  // Branding
  advertiserName?: string;
  advertiserLogo?: string;
  advertiserUrl?: string;
  
  // Input Options
  useDynamicIsland?: boolean;
  placeholder?: string;
  
  // Message Options
  enhancedMessages?: boolean;
  showSources?: boolean;
  showDebug?: boolean;
  fullWidthMessages?: boolean;
  
  // Behavior Options
  saveChatMessages?: boolean;
  enableComponents?: boolean;
  componentRegistry?: ComponentRegistry;
  
  // Chat Mode
  mode?: "standard" | "rag";
  enabled?: boolean;
  
  // Content Configuration
  contentSelector?: string;
  enableSmartSelector?: boolean;
  
  // Callbacks
  onChatStarted?: () => void;
  onChatClosed?: () => void;
  onMessageSent?: (message: string) => void;
  onMessageReceived?: (message: Message) => void;
  onError?: (error: string) => void;
}

export interface ChatState {
  messages: Message[];
  inputValue: string;
  loading: boolean;
  error?: string;
  recommendations: Recommendation[];
  loadingRecommendations: boolean;
  abortController?: AbortController;
}

export interface ChatActions {
  sendMessage: (message: string) => Promise<void>;
  setInputValue: (value: string) => void;
  clearMessages: () => void;
  clearError: () => void;
  cancelMessage: () => void;
  loadRecommendations: () => Promise<void>;
}

export type ChatPanelLayout = "panel" | "fullscreen" | "embedded";

export interface UnifiedChatPanelProps {
  config: UnifiedChatConfig;
  layout?: ChatPanelLayout;
  className?: string;
  title?: string;
  onClose?: () => void;
  welcomeContent?: React.ReactNode;
  emptyStateContent?: React.ReactNode;
}

export interface UnifiedMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onCancel?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  useDynamicIsland?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export interface UnifiedChatMessageProps {
  message: Message;
  enhanced?: boolean;
  showSources?: boolean;
  showDebug?: boolean;
  showTimestamp?: boolean;
  fullWidth?: boolean;
  componentRegistry?: ComponentRegistry;
  enableComponents?: boolean;
  onSourceClick?: (sourceId: string) => void;
}