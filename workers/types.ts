// Shared types for the workers
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  context?: {
    url: string;
    title: string;
    content: string;
  };
  widgetId?: string;
  sessionId?: string;
  isEmbedded?: boolean;
}

export interface ChatResponse {
  message: string;
  sources?: any[];
  sessionId?: string;
}

export interface SummarizeRequest {
  content: string;
  url?: string;
  title?: string;
}

export interface RecommendationsRequest {
  content?: string;
  url?: string;
  title?: string;
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  placeholder: string;
}

export interface SummariesRequest {
  content: string;
  url?: string;
  title?: string;
}

export interface SummariesResponse {
  short: string;
  medium: string;
}

export interface SelectorAnalysisRequest {
  html: string;
  url?: string;
  title?: string;
}

export interface SelectorAnalysisResponse {
  contentSelector: string;
  reasoning: string;
}

export interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export interface Env {
  OPENAI_API_KEY: string;
  MISTRAL_AI_API_KEY: string;
  DATABASE_URL: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  WIDGET_FILES: R2Bucket;
  STORE_IP_ADDRESSES?: string;
  MESSAGE_RETENTION_DAYS?: string;
  METRICS_ENDPOINT?: string;
}