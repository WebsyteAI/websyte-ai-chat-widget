import type { Widget } from '../../../stores';

export interface WidgetFormProps {
  widget?: Widget;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  onWidgetUpdated?: (widget: Widget) => void;
  loading?: boolean;
}

export interface ExistingFile {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export type CrawlStatus = 'pending' | 'crawling' | 'completed' | 'failed' | 'processing' | null;

export interface Recommendation {
  text: string;
  response: string;
}

export interface WidgetLink {
  url: string;
  text: string;
  importance: string;
  category: string;
}

export interface WidgetFormState {
  deletingFileId: string | null;
  existingFiles: ExistingFile[];
  isPublic: boolean;
  crawlUrl: string;
  crawling: boolean;
  crawlStatus: CrawlStatus;
  crawlPageCount: number;
  crawlStarting: boolean;
  workflowId: string | null;
  uploadingFiles: Set<string>;
  generatingRecommendations: boolean;
  recommendations: Recommendation[];
  showCrawlDebug: boolean;
  links: WidgetLink[];
  generatingLinks: boolean;
}

export interface FormData {
  name: string;
  description: string;
  url: string;
  logoUrl: string;
  content: string;
  files: File[];
}

export interface ApiResponse<T> {
  success: boolean;
  widget?: Widget;
  recommendations?: Recommendation[];
  links?: WidgetLink[];
  error?: string;
}