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
        return this.cleanText(element.textContent || "");
      }
    }

    const bodyText = document.body.textContent || "";
    return this.cleanText(bodyText).slice(0, 5000);
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