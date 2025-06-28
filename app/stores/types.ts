// Shared types for stores
export interface WidgetFile {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface Widget {
  id: string;
  name: string;
  description?: string;
  url?: string;
  cacheEnabled: boolean;
  isPublic: boolean;
  crawlUrl?: string;
  crawlStatus?: 'pending' | 'crawling' | 'completed' | 'failed';
  crawlRunId?: string;
  lastCrawlAt?: string;
  crawlPageCount?: number;
  createdAt: string;
  updatedAt: string;
  files: WidgetFile[];
  embeddingsCount: number;
  recommendations?: Array<{
    title: string;
    description: string;
  }>;
}

export interface SearchResult {
  chunk: string;
  similarity: number;
  metadata: {
    chunkIndex: number;
    source?: string;
    fileId?: string;
  };
  widgetId: string;
}

export interface ApiError {
  message: string;
  status?: number;
}