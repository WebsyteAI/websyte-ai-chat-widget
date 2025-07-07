export interface Source {
  chunk: string;
  similarity: number;
  metadata: {
    source?: string;
    chunkIndex: number;
    url?: string;
    title?: string;
    crawledFrom?: string;
  };
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface ChatWidgetProps {
  baseUrl?: string;
  advertiserName?: string;
  advertiserLogo?: string;
  advertiserUrl?: string;
  isTargetedInjection?: boolean;
  contentSelector?: string;
  hidePoweredBy?: boolean;
  enableSmartSelector?: boolean;
  widgetId?: string;
  widgetName?: string; // Actual widget name from database
  saveChatMessages?: boolean; // Whether to save chat messages to database
  isFullScreen?: boolean; // Whether to render as full-screen interface
  isEmbed?: boolean; // Whether widget is running in iframe embed mode
  recommendations?: Recommendation[]; // Optional recommendations to pass directly
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface WidgetLink {
  url: string;
  text: string;
  importance?: string;
  category?: string;
}

export interface Summaries {
  short: string;
  medium: string;
}

export type ContentMode = 'original' | 'short' | 'medium';

// PostMessage API types for parent-iframe communication
export interface IframeMessageEvent {
  type: 'websyte-ai-chat-widget';
  action: string;
  data?: any;
}

// Messages sent from widget to parent
export interface WidgetToParentMessage extends IframeMessageEvent {
  action: 
    | 'resize' 
    | 'ready' 
    | 'chat-response'
    | 'error'
    | 'chat-started'
    | 'chat-closed';
  data?: {
    // For resize action
    height?: number;
    width?: number;
    // For chat-response action
    message?: Message;
    // For error action
    error?: string;
  };
}

// Messages sent from parent to widget
export interface ParentToWidgetMessage extends IframeMessageEvent {
  action: 
    | 'configure' 
    | 'send-message'
    | 'clear-chat'
    | 'set-placeholder';
  data?: {
    // For configure action
    config?: Partial<ChatWidgetProps>;
    // For send-message action
    message?: string;
    // For set-placeholder action
    placeholder?: string;
  };
}

// Configuration for iframe messaging
export interface IframeMessagingConfig {
  allowedOrigins?: string[]; // If not specified, accepts messages from any origin
  enableAutoResize?: boolean; // Default: true
  resizeDebounceMs?: number; // Default: 100ms
}
