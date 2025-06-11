/**
 * Simple HTML to Markdown converter that works in Cloudflare Workers
 * No external dependencies, server-compatible
 */

interface ConverterOptions {
  headingStyle?: 'atx' | 'setext';
  bulletListMarker?: '-' | '*' | '+';
  codeBlockStyle?: 'fenced' | 'indented';
  emDelimiter?: '*' | '_';
}

export class HtmlToMarkdownConverter {
  private options: Required<ConverterOptions>;

  constructor(options: ConverterOptions = {}) {
    this.options = {
      headingStyle: options.headingStyle || 'atx',
      bulletListMarker: options.bulletListMarker || '-',
      codeBlockStyle: options.codeBlockStyle || 'fenced',
      emDelimiter: options.emDelimiter || '*',
    };
  }

  convert(html: string): string {
    // Remove script and style tags completely
    html = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
    
    // Convert block elements
    html = this.convertHeadings(html);
    html = this.convertParagraphs(html);
    html = this.convertLists(html);
    html = this.convertBlockquotes(html);
    html = this.convertCodeBlocks(html);
    html = this.convertHorizontalRules(html);
    
    // Convert inline elements
    html = this.convertLinks(html);
    html = this.convertImages(html);
    html = this.convertEmphasis(html);
    html = this.convertStrong(html);
    html = this.convertCode(html);
    html = this.convertLineBreaks(html);
    
    // Clean up remaining HTML tags
    html = this.cleanupTags(html);
    
    // Clean up whitespace
    html = this.cleanupWhitespace(html);
    
    return html.trim();
  }

  private convertHeadings(html: string): string {
    return html.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (match, level, content) => {
      const text = this.stripTags(content).trim();
      const hashes = '#'.repeat(parseInt(level));
      return `\n\n${hashes} ${text}\n\n`;
    });
  }

  private convertParagraphs(html: string): string {
    return html.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, content) => {
      const text = content.trim();
      return text ? `\n\n${text}\n\n` : '';
    });
  }

  private convertLists(html: string): string {
    // Ordered lists
    html = html.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
      const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
      const listItems = items.map((item, index) => {
        const text = this.stripTags(item.replace(/<\/?li[^>]*>/gi, '')).trim();
        return `${index + 1}. ${text}`;
      }).join('\n');
      return `\n\n${listItems}\n\n`;
    });

    // Unordered lists
    html = html.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
      const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
      const listItems = items.map(item => {
        const text = this.stripTags(item.replace(/<\/?li[^>]*>/gi, '')).trim();
        return `${this.options.bulletListMarker} ${text}`;
      }).join('\n');
      return `\n\n${listItems}\n\n`;
    });

    return html;
  }

  private convertBlockquotes(html: string): string {
    return html.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
      const text = this.stripTags(content).trim();
      const lines = text.split('\n').map(line => `> ${line.trim()}`).join('\n');
      return `\n\n${lines}\n\n`;
    });
  }

  private convertCodeBlocks(html: string): string {
    return html.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, content) => {
      const text = this.stripTags(content);
      if (this.options.codeBlockStyle === 'fenced') {
        return `\n\n\`\`\`\n${text}\n\`\`\`\n\n`;
      } else {
        const lines = text.split('\n').map(line => `    ${line}`).join('\n');
        return `\n\n${lines}\n\n`;
      }
    });
  }

  private convertHorizontalRules(html: string): string {
    return html.replace(/<hr[^>]*\/?>/gi, '\n\n---\n\n');
  }

  private convertLinks(html: string): string {
    return html.replace(/<a[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (match, href, text) => {
      const linkText = this.stripTags(text).trim();
      return `[${linkText}](${href})`;
    });
  }

  private convertImages(html: string): string {
    return html.replace(/<img[^>]*src\s*=\s*["']([^"']*)["'][^>]*alt\s*=\s*["']([^"']*)["'][^>]*\/?>/gi, (match, src, alt) => {
      return `![${alt}](${src})`;
    });
    // Fallback for images without alt text
    return html.replace(/<img[^>]*src\s*=\s*["']([^"']*)["'][^>]*\/?>/gi, (match, src) => {
      return `![](${src})`;
    });
  }

  private convertEmphasis(html: string): string {
    return html.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (match, tag, content) => {
      const text = this.stripTags(content);
      return `${this.options.emDelimiter}${text}${this.options.emDelimiter}`;
    });
  }

  private convertStrong(html: string): string {
    return html.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (match, tag, content) => {
      const text = this.stripTags(content);
      return `**${text}**`;
    });
  }

  private convertCode(html: string): string {
    return html.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (match, content) => {
      const text = this.stripTags(content);
      return `\`${text}\``;
    });
  }

  private convertLineBreaks(html: string): string {
    return html.replace(/<br[^>]*\/?>/gi, '\n');
  }

  private stripTags(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  private cleanupTags(html: string): string {
    // Remove any remaining HTML tags
    return html.replace(/<[^>]*>/g, '');
  }

  private cleanupWhitespace(html: string): string {
    return html
      // Convert HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Remove excessive whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Clean up spacing around markdown elements
      .replace(/\n\n\s*\n\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '');
  }
}

// Export a default instance
export const htmlToMarkdown = new HtmlToMarkdownConverter({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
});