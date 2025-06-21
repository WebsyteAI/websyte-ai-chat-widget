// Shared types for stores
export interface WidgetFile {
  id: number;
  filename: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface Widget {
  id: number;
  name: string;
  description?: string;
  url?: string;
  cacheEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  files: WidgetFile[];
  embeddingsCount: number;
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