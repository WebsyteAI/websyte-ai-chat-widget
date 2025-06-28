export interface CrawlResult {
  url: string;
  text: string;
  markdown: string;
  title?: string;
}

export class ApifyCrawlerService {
  private apiToken: string;
  private readonly MAX_PAGES = 25;
  private readonly DEFAULT_DEPTH = 2;
  private readonly ACTOR_NAME = 'apify~website-content-crawler';
  private readonly BASE_URL = 'https://api.apify.com/v2';
  
  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }
  
  async crawlWebsite(baseUrl: string, options?: {
    maxPages?: number;
    hostname?: string;
  }): Promise<{ runId: string }> {
    const maxPages = Math.min(options?.maxPages || 25, this.MAX_PAGES);
    const hostname = options?.hostname || new URL(baseUrl).hostname;
    
    const url = `${this.BASE_URL}/acts/${this.ACTOR_NAME}/runs?token=${this.apiToken}`;
    console.log('[ApifyCrawler] Starting crawl with URL:', url);
    
    // Create glob patterns to limit crawl to the same domain (both http and https)
    const includeGlobs = [
      { glob: `https://${hostname}/**` },
      { glob: `http://${hostname}/**` }
    ];
    console.log('[ApifyCrawler] Include glob patterns:', includeGlobs);
    
    const payload = {
      startUrls: [{ 
        url: baseUrl,
        method: "GET"
      }],
      maxResults: maxPages,
      includeUrlGlobs: includeGlobs, // Limit to same domain
      aggressivePrune: false,
      blockMedia: true, // Block images/videos to speed up crawling
      clickElementsCssSelector: "[aria-expanded=\"false\"]",
      debugLog: false,
      debugMode: false,
      expandIframes: true,
      ignoreCanonicalUrl: false,
      ignoreHttpsErrors: false,
      initialConcurrency: 5,
      keepUrlFragments: false,
      proxyConfiguration: {
        useApifyProxy: true
      },
      removeCookieWarnings: true,
      removeElementsCssSelector: 'nav, footer, script, style, noscript, svg,\n[role="alert"],\n[role="banner"],\n[role="dialog"],\n[role="alertdialog"],\n[role="region"][aria-label*="skip" i],\n[aria-modal="true"]',
      respectRobotsTxtFile: false,
      saveFiles: false, // We don't need files, just markdown
      saveHtml: false,
      saveHtmlAsFile: false,
      saveMarkdown: true,
      saveScreenshots: false,
      useSitemaps: true
    };
    
    console.log('[ApifyCrawler] Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apify API error response:', errorText);
      throw new Error(`Failed to start crawl: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json() as { data: { id: string } };
    return { runId: data.data.id };
  }
  
  async getCrawlStatus(runId: string) {
    const response = await fetch(`${this.BASE_URL}/actor-runs/${runId}?token=${this.apiToken}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get crawl status: ${response.statusText}`);
    }
    
    const data = await response.json() as { data: { status: string; finishedAt: string; stats?: { itemCount: number } } };
    const run = data.data;
    
    return {
      status: run.status,
      finishedAt: run.finishedAt,
      itemCount: run.stats?.itemCount || 0
    };
  }
  
  async getCrawlResults(runId: string): Promise<CrawlResult[]> {
    // First check if run is completed
    const status = await this.getCrawlStatus(runId);
    if (status.status !== 'SUCCEEDED') {
      throw new Error(`Crawl not completed. Status: ${status.status}`);
    }
    
    // Get the dataset ID for this run
    const runResponse = await fetch(`${this.BASE_URL}/actor-runs/${runId}?token=${this.apiToken}`, {
      method: 'GET'
    });
    
    if (!runResponse.ok) {
      throw new Error(`Failed to get run details: ${runResponse.statusText}`);
    }
    
    const runData = await runResponse.json() as { data: { defaultDatasetId: string } };
    const datasetId = runData.data.defaultDatasetId;
    
    // Get items from the dataset
    const itemsResponse = await fetch(
      `${this.BASE_URL}/datasets/${datasetId}/items?token=${this.apiToken}&limit=${this.MAX_PAGES}&format=json`,
      {
        method: 'GET'
      }
    );
    
    if (!itemsResponse.ok) {
      throw new Error(`Failed to get crawl results: ${itemsResponse.statusText}`);
    }
    
    const items = await itemsResponse.json() as Array<{ url: string; text?: string; markdown?: string; title?: string }>;
    
    console.log('[ApifyCrawler] Got results:', items.length, 'items');
    
    // Log first item to debug
    if (items.length > 0) {
      const firstItem = items[0];
      console.log('[ApifyCrawler] First item sample:', {
        url: firstItem.url,
        hasText: !!firstItem.text,
        textLength: firstItem.text?.length || 0,
        hasMarkdown: !!firstItem.markdown,
        markdownLength: firstItem.markdown?.length || 0,
        title: firstItem.title
      });
    }
    
    return items.map((item) => ({
      url: item.url,
      text: item.text || '',
      markdown: item.markdown || item.text || '',
      title: item.title
    }));
  }
  
  createPlaceholderContent(baseUrl: string, pageCount: number): string {
    const hostname = new URL(baseUrl).hostname;
    return `# Website Crawl: ${hostname}

Crawled on: ${new Date().toISOString()}
Base URL: ${baseUrl}
Total pages crawled: ${pageCount}
Maximum depth: 2 levels
Maximum pages: 25

This file serves as a placeholder for the website crawl. 
Individual pages have been saved as separate files and indexed for search.

---

Crawled using Apify Website Content Crawler
`;
  }
}