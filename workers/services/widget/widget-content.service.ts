import { eq, and, sql } from 'drizzle-orm';
import { DatabaseService } from '../database';
import { VectorSearchService } from '../vector-search';
import { OpenAIService } from '../openai';
import { widget, widgetEmbedding } from '../../db/schema';
import { createLogger } from '../../lib/logger';
import { WidgetCrudService } from './widget-crud.service';

interface ImportantLink {
  url: string;
  text: string;
  importance: 'high' | 'medium' | 'low';
  category: string;
}

export class WidgetContentService {
  private db: DatabaseService;
  private vectorSearch: VectorSearchService;
  private widgetCrud: WidgetCrudService;
  private openaiApiKey: string;
  private logger = createLogger('WidgetContentService');

  constructor(
    databaseService: DatabaseService,
    vectorSearchService: VectorSearchService,
    widgetCrudService: WidgetCrudService,
    openaiApiKey?: string
  ) {
    this.db = databaseService;
    this.vectorSearch = vectorSearchService;
    this.widgetCrud = widgetCrudService;
    this.openaiApiKey = openaiApiKey || '';
  }

  async getWidgetSampleContent(widgetId: string, limit = 10) {
    const samples = await this.db.getDatabase()
      .select({
        text: widgetEmbedding.text,
        source: widgetEmbedding.source
      })
      .from(widgetEmbedding)
      .where(eq(widgetEmbedding.widgetId, widgetId))
      .limit(limit);

    return samples;
  }

  async generateWidgetRecommendations(widgetId: string) {
    try {
      const widgetRecord = await this.widgetCrud.getWidget(widgetId, '');
      if (!widgetRecord) {
        return { recommendations: [] };
      }

      // Get sample content from widget
      const sampleContent = await this.getWidgetSampleContent(widgetId, 10);
      if (sampleContent.length === 0) {
        this.logger.info({ widgetId }, 'No content available for recommendations');
        return { recommendations: [] };
      }

      // Combine sample content
      const contentText = sampleContent.map(s => s.text).join('\n');

      // Generate recommendations using OpenAI
      const openai = new OpenAIService(this.openaiApiKey);
      const recommendations = await openai.generateRecommendations(contentText);

      // Update widget with recommendations
      await this.db.getDatabase()
        .update(widget)
        .set({ recommendations })
        .where(eq(widget.id, widgetId));

      this.logger.info({ widgetId, count: recommendations.length }, 'Generated recommendations');

      return { recommendations };
    } catch (error) {
      this.logger.error({ err: error, widgetId }, 'Error generating recommendations');
      
      // Update widget with empty recommendations on error
      await this.db.getDatabase()
        .update(widget)
        .set({ recommendations: [] })
        .where(eq(widget.id, widgetId));

      return { recommendations: [] };
    }
  }

  async extractImportantLinks(widgetId: string) {
    try {
      const widgetRecord = await this.widgetCrud.getWidget(widgetId, '');
      if (!widgetRecord || !widgetRecord.crawlUrl) {
        return { links: [] };
      }

      const baseUrl = new URL(widgetRecord.crawlUrl).origin;

      // Get all links from crawled content
      const linksQuery = sql`
        SELECT DISTINCT 
          jsonb_array_elements_text(metadata->'links') as url,
          metadata->>'sourceUrl' as source_url
        FROM ${widgetEmbedding}
        WHERE widget_id = ${widgetId}
          AND source_type = 'file'
          AND metadata->'links' IS NOT NULL
      `;

      const rawLinks = await this.db.getDatabase().execute(linksQuery);
      const uniqueUrls = new Set<string>();
      const linkMap = new Map<string, string>();

      // Process and deduplicate links
      for (const row of rawLinks.rows) {
        const url = row.url as string;
        const sourceUrl = row.source_url as string;
        
        if (url && !uniqueUrls.has(url)) {
          uniqueUrls.add(url);
          linkMap.set(url, sourceUrl);
        }
      }

      let importantLinks: ImportantLink[] = [];

      if (this.openaiApiKey && uniqueUrls.size > 0) {
        // Use OpenAI to rank and categorize links
        try {
          const openai = new OpenAIService(this.openaiApiKey);
          
          // Process links in batches
          const linkArray = Array.from(uniqueUrls);
          const batchSize = 20;
          
          for (let i = 0; i < linkArray.length; i += batchSize) {
            const batch = linkArray.slice(i, i + batchSize);
            const contextUrls = batch.map(url => ({
              url,
              sourceUrl: linkMap.get(url) || ''
            }));

            const rankedBatch = await openai.rankImportantLinks(
              contextUrls,
              baseUrl,
              widgetRecord.name || 'Website'
            );

            importantLinks.push(...rankedBatch);
          }

          // Sort by importance and take top links
          importantLinks = importantLinks
            .sort((a, b) => {
              const importanceOrder = { high: 3, medium: 2, low: 1 };
              return importanceOrder[b.importance] - importanceOrder[a.importance];
            })
            .slice(0, 15);

        } catch (error) {
          this.logger.error({ err: error, widgetId }, 'Error using OpenAI to rank links');
          // Fall back to heuristic ranking
          importantLinks = await this.rankLinksHeuristically(
            Array.from(uniqueUrls),
            baseUrl
          );
        }
      } else if (uniqueUrls.size > 0) {
        // Use heuristic ranking if no OpenAI key
        importantLinks = await this.rankLinksHeuristically(
          Array.from(uniqueUrls),
          baseUrl
        );
      }

      // Store important links
      await this.storeImportantLinks(widgetId, importantLinks);

      this.logger.info({ widgetId, count: importantLinks.length }, 'Extracted important links');

      return { links: importantLinks };
    } catch (error) {
      this.logger.error({ err: error, widgetId }, 'Error extracting important links');
      return { links: [] };
    }
  }

  private async rankLinksHeuristically(urls: string[], baseUrl: string): Promise<ImportantLink[]> {
    const importantLinks: ImportantLink[] = [];
    const processedUrls = new Set<string>();

    for (const url of urls) {
      try {
        // Skip if already processed or external links
        if (processedUrls.has(url) || !url.startsWith(baseUrl)) {
          continue;
        }
        processedUrls.add(url);

        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();
        
        // Categorize and score based on URL patterns
        let category = 'other';
        let importance: 'high' | 'medium' | 'low' = 'low';
        let text = '';

        // Extract text from URL
        text = await this.extractTextFromUrl(pathname);

        // High importance pages
        if (pathname === '/' || pathname === '/index' || pathname === '/home') {
          category = 'main';
          importance = 'high';
          text = text || 'Home';
        } else if (pathname.includes('doc') || pathname.includes('guide') || pathname.includes('tutorial')) {
          category = 'documentation';
          importance = 'high';
          text = text || 'Documentation';
        } else if (pathname.includes('api') && !pathname.includes('api-key')) {
          category = 'api';
          importance = 'high';
          text = text || 'API Reference';
        } else if (pathname.includes('pricing') || pathname.includes('plans')) {
          category = 'pricing';
          importance = 'high';
          text = text || 'Pricing';
        } else if (pathname.includes('contact') || pathname.includes('support')) {
          category = 'contact';
          importance = 'high';
          text = text || 'Contact';
        }
        // Medium importance pages
        else if (pathname.includes('about')) {
          category = 'about';
          importance = 'medium';
          text = text || 'About';
        } else if (pathname.includes('feature')) {
          category = 'features';
          importance = 'medium';
          text = text || 'Features';
        } else if (pathname.includes('blog') || pathname.includes('news')) {
          category = 'content';
          importance = 'medium';
          text = text || 'Blog';
        } else if (pathname.includes('faq') || pathname.includes('help')) {
          category = 'support';
          importance = 'medium';
          text = text || 'FAQ';
        }

        if (importance !== 'low' || importantLinks.length < 10) {
          importantLinks.push({
            url,
            text: text || pathname.split('/').filter(Boolean).join(' - '),
            importance,
            category
          });
        }

      } catch (error) {
        this.logger.warn({ err: error, url }, 'Error processing URL for ranking');
      }
    }

    // Sort and limit
    return importantLinks
      .sort((a, b) => {
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      })
      .slice(0, 15);
  }

  private async extractTextFromUrl(pathname: string): string {
    // Remove leading/trailing slashes and file extensions
    let text = pathname.replace(/^\/|\/$/g, '').replace(/\.[^/.]+$/, '');
    
    // Replace common separators with spaces
    text = text.replace(/[-_/]/g, ' ');
    
    // Capitalize words
    text = text.split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return text;
  }

  private async storeImportantLinks(widgetId: string, links: ImportantLink[]) {
    try {
      await this.db.getDatabase()
        .update(widget)
        .set({ links: links as any })
        .where(eq(widget.id, widgetId));
    } catch (error) {
      this.logger.error({ err: error, widgetId }, 'Error storing important links');
    }
  }
}