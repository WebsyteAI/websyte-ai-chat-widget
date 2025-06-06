import { createRequestHandler } from "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  context?: {
    url: string;
    title: string;
    content: string;
  };
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

async function handleChatAPI(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body: ChatRequest = await request.json();
    const { message, history = [], context } = body;

    if (!message || typeof message !== "string") {
      return new Response("Invalid message", { status: 400 });
    }

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: context 
          ? `You are a helpful AI assistant embedded on the webpage "${context.title}" (${context.url}). You have access to the page content and can help users understand, summarize, or discuss it. Page content: ${context.content.slice(0, 3000)}`
          : "You are a helpful AI assistant. Answer questions concisely and helpfully."
      },
      ...history.slice(-10),
      { role: "user", content: message }
    ];

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages,
        temperature: 0.2,
      }),
      signal: request.signal,
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const assistantMessage = openaiData.choices?.[0]?.message?.content || "I couldn't generate a response.";

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(JSON.stringify({ 
        error: "Request cancelled",
        message: "Request was cancelled by the user."
      }), { 
        status: 499,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      });
    }
    
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: "Sorry, I'm having trouble processing your request right now."
    }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  }
}

async function handleSummarizeAPI(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json() as { content?: string; url?: string; title?: string };
    const { content, url } = body;

    if (!content || typeof content !== "string") {
      return new Response("Invalid content", { status: 400 });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates concise, informative summaries of web page content. Provide a clear summary in 2-3 paragraphs."
          },
          {
            role: "user",
            content: `Please summarize this webpage content: ${content.slice(0, 4000)}`
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const summary = openaiData.choices?.[0]?.message?.content || "I couldn't generate a summary.";

    return new Response(JSON.stringify({ summary }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });

  } catch (error) {
    console.error("Summarize API error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      summary: "Sorry, I couldn't generate a summary right now."
    }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  }
}

async function handleRecommendationsAPI(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json() as {
      content?: string;
      url?: string;
      title?: string;
    };

    const { content = "", url = "", title = "" } = body;

    if (!content && !title) {
      return new Response("Content or title required", { status: 400 });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that generates conversation starters based on webpage content. 
            Generate exactly 4 short, engaging conversation prompts related to the content. 
            Each prompt should be 3-6 words and encourage discussion about the topic.
            Return only a JSON array of objects with "title" and "description" fields.
            Example format: [{"title": "Key Topic", "description": "Brief description"}]`
          },
          {
            role: "user", 
            content: `Based on this webpage content, generate 4 conversation starters:
            Title: ${title}
            URL: ${url}
            Content: ${content.slice(0, 2000)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
      signal: request.signal,
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    
    const responseContent = openaiData.choices?.[0]?.message?.content || "[]";
    
    // Try to parse as JSON, fallback to default recommendations if parsing fails
    let recommendations;
    try {
      recommendations = JSON.parse(responseContent);
    } catch {
      recommendations = [
        { title: "Main Topic", description: "Discuss the main subject" },
        { title: "Key Points", description: "Explore important details" },
        { title: "Implications", description: "Consider the broader impact" },
        { title: "Questions", description: "Ask about unclear aspects" }
      ];
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(JSON.stringify({ 
        error: "Request cancelled",
        recommendations: []
      }), { 
        status: 499,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      });
    }
    
    console.error("Recommendations API error:", error);
    
    // Return fallback recommendations on error
    const fallbackRecommendations = [
      { title: "Main Topic", description: "Discuss the main subject" },
      { title: "Key Points", description: "Explore important details" },
      { title: "Implications", description: "Consider the broader impact" },
      { title: "Questions", description: "Ask about unclear aspects" }
    ];
    
    return new Response(JSON.stringify({ 
      recommendations: fallbackRecommendations 
    }), { 
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === "/api/chat") {
      return handleChatAPI(request, env);
    }
    
    if (url.pathname === "/api/summarize") {
      return handleSummarizeAPI(request, env);
    }
    
    if (url.pathname === "/api/recommendations") {
      return handleRecommendationsAPI(request, env);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
