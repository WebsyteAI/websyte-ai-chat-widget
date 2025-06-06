interface PageContent {
  url: string;
  title: string;
  content: string;
  description?: string;
}

export class ContentExtractor {
  static extractPageContent(): PageContent {
    const url = window.location.href;
    const title = document.title || "";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    const description = metaDescription?.getAttribute("content") || "";

    const content = this.extractMainContent();

    return {
      url,
      title,
      content,
      description,
    };
  }

  private static extractMainContent(): string {
    const selectors = [
      'article',
      '[role="main"]',
      'main',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '.main-content',
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return this.cleanText(this.removeScriptAndStyleContent(element));
      }
    }

    const bodyText = this.removeScriptAndStyleContent(document.body);
    return this.cleanText(bodyText);
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
    
    // Remove elements commonly used for non-content purposes
    const unwantedSelectors = [
      'nav', 'header', 'footer', 'aside',
      '.navigation', '.nav', '.menu',
      '.sidebar', '.widget', '.advertisement',
      '.ads', '.social-media', '.share-buttons',
      '.comments', '.comment-form'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = clonedElement.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    return clonedElement.textContent || "";
  }

  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/[\r\n]+/g, " ")
      .trim()
      .slice(0, 10000);
  }

  static isValidContent(content: string): boolean {
    return content.length > 50 && content.split(" ").length > 10;
  }
}