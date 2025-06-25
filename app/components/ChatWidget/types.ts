export interface Source {
  chunk: string;
  similarity: number;
  metadata: {
    source?: string;
    chunkIndex: number;
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
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface Summaries {
  short: string;
  medium: string;
}

export type ContentMode = 'original' | 'short' | 'medium';
