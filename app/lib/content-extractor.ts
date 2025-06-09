import { contentCache } from './content-cache';

interface PageContent {
  url: string;
  title: string;
  content: string;
}

interface ContentStructure {
  mainContent: Element | null;
  title: Element | null;
  metadata: Element[];
  navigation: Element[];
}

export class ContentExtractor {
  /**
   * Extract page content with caching support
   * @param contentTarget CSS selector for content extraction
   * @param useCache Whether to use caching (default: true)
   * @param cacheOnly Whether to only return cached content (default: false)
   */
  static async extractPageContent(
    contentTarget: string, 
    useCache: boolean = true,
    cacheOnly: boolean = false
  ): Promise<PageContent> {
    const url = window.location.href;
    
    // Try cache first if enabled
    if (useCache) {
      const cachedContent = contentCache.get(url, contentTarget);
      if (cachedContent) {
        console.log(`ContentExtractor: Using cached content for "${contentTarget}"`);
        return cachedContent;
      }
      
      // If cache-only mode and no cache hit, throw error
      if (cacheOnly) {
        throw new Error(`No cached content available for selector "${contentTarget}"`);
      }
    }

    // Extract fresh content
    console.log(`ContentExtractor: Extracting fresh content for "${contentTarget}"`);
    const title = document.title || "";
    const content = await this.extractMainContentWithRetry(contentTarget);

    const pageContent: PageContent = {
      url,
      title,
      content,
    };

    // Cache the result if caching is enabled
    if (useCache) {
      contentCache.set(url, contentTarget, pageContent);
      console.log(`ContentExtractor: Cached content for "${contentTarget}"`);
    }

    return pageContent;
  }

  /**
   * Warm up the cache by extracting and caching content
   */
  static async warmCache(contentTarget: string): Promise<void> {
    try {
      await this.extractPageContent(contentTarget, true, false);
      console.log(`ContentExtractor: Cache warmed for "${contentTarget}"`);
    } catch (error) {
      console.warn(`ContentExtractor: Failed to warm cache for "${contentTarget}":`, error);
    }
  }

  /**
   * Clear cache for current page or all cache
   */
  static clearCache(urlOnly: boolean = false): void {
    if (urlOnly) {
      contentCache.clearUrl(window.location.href);
      console.log('ContentExtractor: Cleared cache for current URL');
    } else {
      contentCache.clear();
      console.log('ContentExtractor: Cleared all cache');
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return contentCache.getStats();
  }

  private static async extractMainContentWithRetry(contentTarget: string, maxRetries: number = 3, delay: number = 1000): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Content extraction attempt ${attempt}/${maxRetries} for selector: "${contentTarget}"`);
        const result = this.extractMainContent(contentTarget);
        console.log(`Content extraction successful on attempt ${attempt}`);
        return result;
      } catch (error) {
        console.warn(`Content extraction attempt ${attempt}/${maxRetries} failed:`, error instanceof Error ? error.message : error);
        
        if (attempt === maxRetries) {
          console.error(`All ${maxRetries} content extraction attempts failed for selector: "${contentTarget}"`);
          throw error; // Final attempt failed, throw the error
        }
        
        const nextDelay = Math.round(delay);
        console.log(`Retrying content extraction in ${nextDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, nextDelay));
        
        // Increase delay for next attempt (exponential backoff)
        delay *= 1.5;
      }
    }
    
    // This should never be reached, but TypeScript requires it
    throw new Error('Unexpected error in retry logic');
  }

  private static extractMainContent(contentTarget: string): string {
    const targetElement = document.querySelector(contentTarget);
    if (!targetElement) {
      throw new Error(`Content target selector "${contentTarget}" not found on page`);
    }
    
    const targetContent = this.cleanText(this.removeScriptAndStyleContent(targetElement));
    if (!this.isValidContent(targetContent)) {
      throw new Error(`Content target "${contentTarget}" found but contains insufficient content`);
    }
    
    return targetContent;
  }

  private static removeScriptAndStyleContent(element: Element): string {
    // Clone the element to avoid modifying the original DOM
    const clonedElement = element.cloneNode(true) as Element;
    
    // Remove all script tags and their content
    const scripts = clonedElement.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove all style tags and their content
    const styles = clonedElement.querySelectorAll('style');
    styles.forEach(style => style.remove());
    
    
    return clonedElement.textContent || "";
  }

  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/[\r\n]+/g, " ")
      .trim()
      .slice(0, 10000);
  }

  /**
   * Intelligently analyze page structure to find main content vs headers/navigation
   * @param targetElement The main container element to analyze
   */
  static analyzeContentStructure(targetElement: Element): ContentStructure {
    const result: ContentStructure = {
      mainContent: null,
      title: null,
      metadata: [],
      navigation: []
    };

    // Find potential title elements (h1, h2, header elements with specific classes)
    const titleSelectors = [
      'h1', 
      'h2.title', 
      '.title', 
      '.headline', 
      '.article-title',
      'header h1',
      'header h2',
      '[data-testid*="title"]',
      '[class*="title"]'
    ];
    
    for (const selector of titleSelectors) {
      const titleEl = targetElement.querySelector(selector);
      if (titleEl && !result.title) {
        // Check if this looks like a real title (not too long, not in navigation)
        const text = titleEl.textContent?.trim() || '';
        if (text.length > 10 && text.length < 200 && !this.isInNavigation(titleEl)) {
          result.title = titleEl;
          break;
        }
      }
    }

    // Find navigation elements
    const navSelectors = [
      'nav',
      '.nav',
      '.navigation', 
      '.menu',
      '.breadcrumb',
      '.sidebar',
      '.header-nav',
      '.footer-nav',
      '[role="navigation"]'
    ];
    
    navSelectors.forEach(selector => {
      const navElements = targetElement.querySelectorAll(selector);
      navElements.forEach(el => result.navigation.push(el));
    });

    // Find metadata elements (dates, authors, tags, etc.)
    const metadataSelectors = [
      '.meta',
      '.metadata', 
      '.article-meta',
      '.byline',
      '.author',
      '.date',
      '.published',
      '.tags',
      '.category',
      'time',
      '[datetime]',
      '.social-share',
      '.share'
    ];
    
    metadataSelectors.forEach(selector => {
      const metaElements = targetElement.querySelectorAll(selector);
      metaElements.forEach(el => result.metadata.push(el));
    });

    // Find main content area - look for content that's not title, nav, or metadata
    const contentSelectors = [
      '.content',
      '.article-content', 
      '.post-content',
      '.entry-content',
      '.main-content',
      '.article-body',
      '.text-content',
      'article > div',
      '.prose',
      'main > div',
      '[role="main"] > div'
    ];

    for (const selector of contentSelectors) {
      const contentEl = targetElement.querySelector(selector);
      if (contentEl && this.isMainContent(contentEl, result)) {
        result.mainContent = contentEl;
        break;
      }
    }

    // If no specific content area found, try to find the largest text block
    if (!result.mainContent) {
      result.mainContent = this.findLargestTextBlock(targetElement, result);
    }

    return result;
  }

  /**
   * Find the main content element that should be replaced with summaries
   */
  static findMainContentElement(contentTarget: string): Element | null {
    const targetElement = document.querySelector(contentTarget);
    if (!targetElement) return null;

    const structure = this.analyzeContentStructure(targetElement);
    
    // Return the main content if found, otherwise the whole target
    return structure.mainContent || targetElement;
  }

  private static isInNavigation(element: Element): boolean {
    let current = element.parentElement;
    while (current) {
      const tagName = current.tagName.toLowerCase();
      const className = current.className.toLowerCase();
      
      if (tagName === 'nav' || 
          className.includes('nav') || 
          className.includes('menu') ||
          className.includes('header') ||
          className.includes('sidebar')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  private static isMainContent(element: Element, structure: ContentStructure): boolean {
    // Don't select if it's already identified as title, nav, or metadata
    if (element === structure.title) return false;
    if (structure.navigation.includes(element)) return false;
    if (structure.metadata.includes(element)) return false;
    
    // Check if any parent is navigation or metadata
    if (this.isInNavigation(element)) return false;
    
    // Should have substantial text content
    const textContent = element.textContent?.trim() || '';
    return textContent.length > 200;
  }

  private static findLargestTextBlock(container: Element, structure: ContentStructure): Element | null {
    const candidates: { element: Element; textLength: number }[] = [];
    
    // Get all direct children and analyze their text content
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          const element = node as Element;
          
          // Skip if it's title, nav, or metadata
          if (element === structure.title) return NodeFilter.FILTER_REJECT;
          if (structure.navigation.includes(element)) return NodeFilter.FILTER_REJECT;
          if (structure.metadata.includes(element)) return NodeFilter.FILTER_REJECT;
          if (this.isInNavigation(element)) return NodeFilter.FILTER_REJECT;
          
          // Skip script, style, hidden elements
          const tagName = element.tagName.toLowerCase();
          if (tagName === 'script' || tagName === 'style') return NodeFilter.FILTER_REJECT;
          
          const styles = window.getComputedStyle(element);
          if (styles.display === 'none' || styles.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      const element = node as Element;
      const textContent = element.textContent?.trim() || '';
      
      // Only consider elements with substantial text content
      if (textContent.length > 100) {
        candidates.push({ element, textLength: textContent.length });
      }
    }
    
    // Sort by text length and return the largest
    candidates.sort((a, b) => b.textLength - a.textLength);
    return candidates.length > 0 ? candidates[0].element : null;
  }

  static isValidContent(content: string): boolean {
    return content.length > 50 && content.split(" ").length > 10;
  }
}