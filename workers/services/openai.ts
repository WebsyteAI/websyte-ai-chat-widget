import type { ChatMessage, OpenAIResponse } from '../types';

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
      model = "gpt-4o-mini",
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

  async generateSummary(content: string, signal?: AbortSignal): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "You are a helpful assistant that creates concise, informative summaries of web page content. Provide a clear summary in 2-3 paragraphs."
      },
      {
        role: "user",
        content: `Please summarize this webpage content: ${content.slice(0, 4000)}`
      }
    ];

    return this.chatCompletion(messages, {
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      maxTokens: 300,
      signal
    });
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
        Generate exactly 6 specific, engaging questions that someone might ask about this article and 1 input placeholder. 
        Each question should be concise (4-8 words) and directly related to the article's content - like "What causes this problem?" or "How does this work?"
        The placeholder should follow the format "Ask me about [specific topic]" where [specific topic] relates to the main subject (keep it under 50 characters).
        Return only a JSON object with "recommendations" array (title = question, description = what the question explores) and "placeholder" string.
        Example format: {"recommendations": [{"title": "What causes climate change?", "description": "Explore the main drivers"}], "placeholder": "Ask me about climate science"}`
      },
      {
        role: "user", 
        content: `Based on this webpage content, generate 6 specific questions someone might ask about this article and an input placeholder:
        Title: ${title}
        URL: ${url}
        Content: ${content.slice(0, 2000)}`
      }
    ];

    const responseContent = await this.chatCompletion(messages, {
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 300,
      signal
    });

    // Try to parse as JSON, fallback to default response if parsing fails
    try {
      return JSON.parse(responseContent);
    } catch {
      return {
        recommendations: [
          { title: "What is this about?", description: "Understand the main topic" },
          { title: "How does this work?", description: "Learn the process" },
          { title: "Why is this important?", description: "Explore the significance" },
          { title: "What are the implications?", description: "Consider the impact" },
          { title: "Who is this for?", description: "Identify the target audience" },
          { title: "What happens next?", description: "Explore future steps" }
        ],
        placeholder: "Ask me about this article"
      };
    }
  }
}