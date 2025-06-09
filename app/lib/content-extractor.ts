interface PageContent {
  url: string;
  title: string;
  content: string;
  description?: string;
}

export class ContentExtractor {
  static extractPageContent(contentTarget: string): PageContent {
    const url = window.location.href;
    const title = document.title || "";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    const description = metaDescription?.getAttribute("content") || "";

    const content = this.extractMainContent(contentTarget);

    return {
      url,
      title,
      content,
      description,
    };
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