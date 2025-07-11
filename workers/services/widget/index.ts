import { DatabaseService } from '../database';
import { VectorSearchService } from '../vector-search';
import { FileStorageService } from '../file-storage';
import { ApifyCrawlerService } from '../apify-crawler';
import { WidgetCrudService } from './widget-crud.service';
import { WidgetSearchService } from './widget-search.service';
import { WidgetFilesService } from './widget-files.service';
import { WidgetCrawlService } from './widget-crawl.service';
import { WidgetContentService } from './widget-content.service';
import { WidgetEmbeddingsService } from './widget-embeddings.service';

// Re-export types
export type {
  CreateWidgetRequest,
  UpdateWidgetRequest,
  WidgetWithFiles
} from './widget-crud.service';

export type {
  SearchResult
} from './widget-search.service';

/**
 * Main WidgetService that composes all widget-related services
 * This maintains backward compatibility with the original WidgetService API
 */
export class WidgetService {
  private crudService: WidgetCrudService;
  private searchService: WidgetSearchService;
  private filesService: WidgetFilesService;
  private crawlService: WidgetCrawlService;
  private contentService: WidgetContentService;
  private embeddingsService: WidgetEmbeddingsService;

  constructor(
    databaseService: DatabaseService,
    vectorSearchService: VectorSearchService,
    fileStorageService: FileStorageService,
    apifyCrawlerService: ApifyCrawlerService,
    openaiApiKey?: string
  ) {
    // Initialize all services
    this.crudService = new WidgetCrudService(
      databaseService,
      vectorSearchService,
      fileStorageService
    );

    this.searchService = new WidgetSearchService(vectorSearchService);

    this.filesService = new WidgetFilesService(
      databaseService,
      vectorSearchService,
      fileStorageService,
      this.crudService
    );

    this.crawlService = new WidgetCrawlService(
      databaseService,
      vectorSearchService,
      fileStorageService,
      apifyCrawlerService,
      this.crudService
    );

    this.contentService = new WidgetContentService(
      databaseService,
      vectorSearchService,
      this.crudService,
      openaiApiKey
    );

    this.embeddingsService = new WidgetEmbeddingsService(
      vectorSearchService,
      fileStorageService,
      this.crudService
    );
  }

  // CRUD operations
  createWidget = this.crudService.createWidget.bind(this.crudService);
  getWidget = this.crudService.getWidget.bind(this.crudService);
  getPublicWidget = this.crudService.getPublicWidget.bind(this.crudService);
  getUserWidgets = this.crudService.getUserWidgets.bind(this.crudService);
  getUserWidgetsCount = this.crudService.getUserWidgetsCount.bind(this.crudService);
  getAllWidgets = this.crudService.getAllWidgets.bind(this.crudService);
  getAllWidgetsCount = this.crudService.getAllWidgetsCount.bind(this.crudService);
  updateWidget = this.crudService.updateWidget.bind(this.crudService);
  deleteWidget = this.crudService.deleteWidget.bind(this.crudService);

  // Search operations
  searchWidgetContent = this.searchService.searchWidgetContent.bind(this.searchService);
  searchPublicWidgetContent = this.searchService.searchPublicWidgetContent.bind(this.searchService);

  // File operations
  addFileToWidget = this.filesService.addFileToWidget.bind(this.filesService);
  removeFileFromWidget = this.filesService.removeFileFromWidget.bind(this.filesService);

  // Crawl operations
  deleteExistingCrawlFiles = this.crawlService.deleteExistingCrawlFiles.bind(this.crawlService);
  getCrawlStatus = this.crawlService.getCrawlStatus.bind(this.crawlService);
  checkCrawlStatus = this.crawlService.checkCrawlStatus.bind(this.crawlService);
  processCrawlResults = this.crawlService.processCrawlResults.bind(this.crawlService);
  resetStuckCrawl = this.crawlService.resetStuckCrawl.bind(this.crawlService);

  // Content operations
  getWidgetSampleContent = this.contentService.getWidgetSampleContent.bind(this.contentService);
  generateWidgetRecommendations = this.contentService.generateWidgetRecommendations.bind(this.contentService);
  extractImportantLinks = this.contentService.extractImportantLinks.bind(this.contentService);

  // Embeddings operations
  refreshEmbeddings = this.embeddingsService.refreshEmbeddings.bind(this.embeddingsService);
}

// Export individual services for direct usage if needed
export {
  WidgetCrudService,
  WidgetSearchService,
  WidgetFilesService,
  WidgetCrawlService,
  WidgetContentService,
  WidgetEmbeddingsService
};