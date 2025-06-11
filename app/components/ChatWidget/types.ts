export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatWidgetProps {
  baseUrl?: string;
  advertiserName?: string;
  advertiserLogo?: string;
  isTargetedInjection?: boolean;
  contentSelector?: string;
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