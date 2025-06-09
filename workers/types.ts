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
}