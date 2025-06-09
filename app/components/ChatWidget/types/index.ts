// Shared types for ChatWidget components and hooks

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatWidgetProps {
  apiEndpoint?: string;
  baseUrl?: string;
  contentTarget: string;
  advertiserName?: string;
  advertiserLogo?: string;
  isTargetedInjection?: boolean;
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

export interface ChatState {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  abortController: AbortController | null;
  placeholder: string;
}

export interface AudioState {
  isPlaying: boolean;
  audioProgress: number;
  playbackSpeed: number;
  elapsedTime: number;
  totalTime: number;
}

export interface ContentState {
  summaries: Summaries | null;
  isLoadingSummaries: boolean;
  currentContentMode: ContentMode;
  originalContent: string;
  targetElement: Element | null;
  mainContentElement: Element | null;
}

export interface ViewState {
  currentView: "main" | "chat";
  hasRendered: boolean;
  isTransitioning: boolean;
  currentContent: "action" | "audio";
  contentFadeClass: string;
}

export interface RecommendationsState {
  recommendations: Recommendation[];
  isLoadingRecommendations: boolean;
}

export interface DropdownState {
  showSummaryDropdown: boolean;
}