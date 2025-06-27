import type { ChatMessage, OpenAIResponse } from '../types';
import { FallbackResponses } from './common';

export class OpenAIService {
  constructor(private apiKey: string) {}

  async chatCompletion(
    messages: ChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<string> {
    const {
      model = "gpt-4.1-mini",
      temperature = 0.2,
      maxTokens,
      signal
    } = options;

    const body: any = {
      model,
      messages,
      temperature,
    };

    if (maxTokens) {
      body.max_tokens = maxTokens;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as OpenAIResponse;
    return data.choices?.[0]?.message?.content || "I couldn't generate a response.";
  }

  async generateSummary(content: string, title: string, url: string, signal?: AbortSignal): Promise<string> {
    const webpageInfo = title || url ? 
      `You are working with${title ? ` the webpage "${title}"` : ''}${url ? ` (${url})` : ''}.` : 
      'You are working with webpage content.';

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a helpful assistant that creates concise, informative summaries of web page content. 
        ${webpageInfo} ${content ? `Page content: ${content}` : 'No content available.'}
        
        Provide a brief, direct summary in 1-2 short paragraphs based on the provided content. Keep it concise and focused on key points. Start directly with the summary content - do not include any prefacing text, headers, or phrases like "Summary of", "This article discusses", "The content covers", etc. Begin immediately with the substantive information.`
      },
      {
        role: "user",
        content: `Provide a direct summary without any introductory phrases.`
      }
    ];

    return this.chatCompletion(messages, {
      model: "gpt-4.1-mini",
      temperature: 0.5,
      maxTokens: 200,
      signal
    });
  }

  async analyzeHtmlStructure(html: string, title: string, url: string, signal?: AbortSignal): Promise<{ contentSelector: string; reasoning: string }> {
    const prompt = `You are an expert web developer analyzing HTML structure to find the best CSS selector for replacing article content while preserving headers and navigation.

Analyze this HTML snippet and identify the optimal CSS selector that targets ONLY the main article body content (paragraphs, text, content) while preserving:
- Article titles and headers (h1, h2, etc.)
- Author bylines and metadata
- Navigation elements
- Publication info
- Any branding elements

${title ? `Page Title: "${title}"` : ''}
${url ? `URL: ${url}` : ''}

HTML to analyze:
${html}

Return a JSON object with:
- contentSelector: A specific CSS selector that targets only the main content area
- reasoning: Brief explanation of why this selector was chosen

The selector should be as specific as possible to avoid accidentally selecting headers, navigation, or metadata.

Examples of good selectors:
- "article .content"
- ".article-body"  
- ".post-content"
- "main .prose"
- "#main-article .content"

Response format:
{
  "contentSelector": ".article-content",
  "reasoning": "This selector targets the main content div while preserving the header and byline elements"
}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert web developer and CSS selector specialist. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.1,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json() as OpenAIResponse;
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Parse JSON response
      try {
        const parsed = JSON.parse(content);
        return {
          contentSelector: parsed.contentSelector || '',
          reasoning: parsed.reasoning || 'AI analysis completed'
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        console.warn('Failed to parse OpenAI JSON response, using fallback');
        return {
          contentSelector: 'article',
          reasoning: 'Fallback selector due to parsing error'
        };
      }
    } catch (error) {
      console.error('OpenAI HTML analysis error:', error);
      throw error;
    }
  }

  async generateBatchSummaries(content: string, title: string, url: string, signal?: AbortSignal): Promise<{ short: string; medium: string }> {
    const webpageInfo = title || url ? 
      `You are working with${title ? ` the webpage "${title}"` : ''}${url ? ` (${url})` : ''}.` : 
      'You are working with webpage content.';

    const baseContent = `${webpageInfo} ${content ? `Page content: ${content}` : 'No content available.'}`;

    // Generate short and medium summaries in parallel
    const [shortSummary, mediumSummary] = await Promise.all([
      // Short summary (3-4 sentences, ~100 tokens)
      this.chatCompletion([
        {
          role: "system",
          content: `You are a helpful assistant that creates very concise HTML summaries of web page content. 
          ${baseContent}
          
          Generate a very brief summary in exactly 3-4 sentences wrapped in proper HTML structure. Use <h1>, <h2>, <p>, <div>, and other HTML tags as appropriate to match typical article structure. Focus only on the most essential information. Return ONLY the raw HTML content without any markdown formatting, code blocks, or backticks - just pure HTML.`
        },
        {
          role: "user",
          content: `Generate a direct 3-4 sentence HTML summary with proper tags like <h1>, <p>, etc.`
        }
      ], {
        model: "gpt-4.1-mini",
        temperature: 0.3,
        maxTokens: 150,
        signal
      }),

      // Medium summary (1-2 paragraphs, ~200 tokens)
      this.chatCompletion([
        {
          role: "system",
          content: `You are a helpful assistant that creates concise, informative HTML summaries of web page content. 
          ${baseContent}
          
          Generate a balanced summary in 1-2 short paragraphs wrapped in proper HTML structure. Use <h1>, <h2>, <p>, <div>, and other HTML tags as appropriate to match typical article structure. Include key points and important details. Return ONLY the raw HTML content without any markdown formatting, code blocks, or backticks - just pure HTML.`
        },
        {
          role: "user",
          content: `Generate a direct HTML summary with proper tags like <h1>, <p>, etc.`
        }
      ], {
        model: "gpt-4.1-mini",
        temperature: 0.5,
        maxTokens: 250,
        signal
      })
    ]);

    // Clean up any markdown code block wrappers that might still appear
    const cleanHtml = (html: string): string => {
      return html
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    };

    return {
      short: cleanHtml(shortSummary),
      medium: cleanHtml(mediumSummary)
    };
  }

  async generateRecommendations(
    content: string,
    title: string,
    url: string,
    signal?: AbortSignal
  ): Promise<{ recommendations: Array<{ title: string; description: string }>; placeholder: string }> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a helpful assistant that generates thoughtful questions about webpage content. 
        You are working with the webpage "${title}" (${url}). ${content ? `Page content: ${content}` : 'No content available.'}
        
        Generate exactly 6 specific, engaging questions that someone might ask about this article and 1 input placeholder. 
        Each question should be concise (4-8 words) and directly related to the article's content - like "What causes this problem?" or "How does this work?"
        The placeholder should follow the format "Ask me about [specific topic]" where [specific topic] relates to the main subject (keep it under 50 characters).
        Return only a JSON object with "recommendations" array (title = question, description = what the question explores) and "placeholder" string.
        Example format: {"recommendations": [{"title": "What causes climate change?", "description": "Explore the main drivers"}], "placeholder": "Ask me about climate science"}`
      },
      {
        role: "user", 
        content: `Generate 6 specific questions someone might ask about this article and an input placeholder.`
      }
    ];

    const responseContent = await this.chatCompletion(messages, {
      model: "gpt-4.1-mini",
      temperature: 0.7,
      maxTokens: 300,
      signal
    });

    // Try to parse as JSON, fallback to default response if parsing fails
    try {
      return JSON.parse(responseContent);
    } catch {
      return FallbackResponses.getRecommendationsResponse();
    }
  }
}