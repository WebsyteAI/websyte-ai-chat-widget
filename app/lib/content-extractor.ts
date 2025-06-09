interface PageContent {
  url: string;
  title: string;
  content: string;
}

export class ContentExtractor {
  static async extractPageContent(contentTarget: string): Promise<PageContent> {
    const url = window.location.href;
    const title = document.title || "";
    const content = await this.extractMainContentWithRetry(contentTarget);

    return {
      url,
      title,
      content,
    };
  }

  private static async extractMainContentWithRetry(contentTarget: string, maxRetries: number = 3, delay: number = 1000): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return this.extractMainContent(contentTarget);
      } catch (error) {
        if (attempt === maxRetries) {
          throw error; // Final attempt failed, throw the error
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
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

  static isValidContent(content: string): boolean {
    return content.length > 50 && content.split(" ").length > 10;
  }
}