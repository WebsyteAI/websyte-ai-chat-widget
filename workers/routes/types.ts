import type { ChatService } from '../services/chat';
import type { SummariesService } from '../services/summaries';
import type { RecommendationsService } from '../services/recommendations';
import type { SelectorAnalysisService } from '../services/selector-analysis';
import type { AuthService } from '../services/auth';
import type { WidgetService } from '../services/widget';
import type { VectorSearchService } from '../services/vector-search';
import type { FileStorageService } from '../services/file-storage';
import type { MessageService } from '../services/messages';
import type { AuthContext } from '../lib/middleware';
import type { Logger } from 'pino';
import type { Env } from '../types';

export type AppType = {
  Bindings: Env;
  Variables: {
    services: {
      chat: ChatService;
      summaries: SummariesService;
      recommendations: RecommendationsService;
      selectorAnalysis: SelectorAnalysisService;
      auth: AuthService;
      widget: WidgetService;
      vectorSearch: VectorSearchService;
      fileStorage: FileStorageService;
      messages: MessageService;
    };
    auth?: AuthContext;
    requestId: string;
    logger: Logger;
  };
};