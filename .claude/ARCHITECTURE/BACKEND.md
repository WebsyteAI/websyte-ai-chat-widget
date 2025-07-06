# Backend Architecture

## 🚀 Overview

The backend is built on Cloudflare Workers using the Hono framework, providing a globally distributed, serverless API with sub-50ms latency worldwide.

## 🏗️ Service Architecture

### Directory Structure
```
workers/
├── routes/              # API route handlers
│   ├── index.ts        # Route registration
│   ├── auth.routes.ts  # Authentication endpoints
│   ├── chat.routes.ts  # Chat functionality
│   ├── widget.routes.ts # Widget management
│   └── ...             # Other route modules
├── services/           # Business logic services
│   ├── auth.ts        # Authentication service
│   ├── chat.ts        # Chat processing
│   ├── rag-agent.ts   # RAG implementation
│   └── ...            # Other services
├── lib/                # Shared utilities
│   ├── middleware.ts   # Middleware stack
│   ├── rate-limiter.ts # Rate limiting
│   └── validation.ts   # Input validation
├── db/                 # Database layer
│   ├── schema.ts      # Drizzle schemas
│   └── migrations/    # SQL migrations
└── app.ts             # Main entry point
```

## 🛣️ Route Architecture

### Modular Route System
Routes are organized by domain for better maintainability:

```typescript
// workers/routes/index.ts
export function registerAllRoutes(app: AppType) {
  registerAuthRoutes(app);        // Authentication
  registerChatRoutes(app);        // Chat endpoints
  registerWidgetRoutes(app);      // Widget CRUD
  registerWidgetCrawlRoutes(app); // Web crawling
  registerWidgetDocsRoutes(app);  // Document management
  registerAutomationRoutes(app);  // Automation API
  registerPublicRoutes(app);      // Public access
  registerAdminRoutes(app);       // Admin functions
  registerServiceRoutes(app);     // General services
}
```

### Route Modules

#### Authentication Routes (`auth.routes.ts`)
```typescript
// Session-based auth for web users
app.get("/api/auth/session", authMiddleware, async (c) => {
  return c.json({ user: c.get("auth")?.user || null });
});

// OAuth login flow
app.get("/api/auth/google", async (c) => {
  // Redirect to Google OAuth
});

// Logout endpoint
app.post("/api/auth/logout", async (c) => {
  // Clear session cookies
});
```

#### Chat Routes (`chat.routes.ts`)
```typescript
// Main chat endpoint with streaming
app.post("/api/chat", rateLimiter, async (c) => {
  const chatService = new ChatService(/* deps */);
  return chatService.handleChat(c);
});

// Get chat history
app.get("/api/chat/history/:widgetId", authMiddleware, async (c) => {
  const messages = await messageService.getMessagesForWidget(widgetId);
  return c.json({ messages });
});
```

#### Widget Routes (`widget.routes.ts`)
```typescript
// CRUD operations for widgets
app.get("/api/widgets", authMiddleware, async (c) => {
  const widgets = await widgetService.getUserWidgets(userId);
  return c.json({ widgets });
});

app.post("/api/widgets", authMiddleware, async (c) => {
  const widget = await widgetService.createWidget(userId, body);
  return c.json({ widget });
});

app.put("/api/widgets/:id", authMiddleware, async (c) => {
  const widget = await widgetService.updateWidget(id, userId, body);
  return c.json({ widget });
});
```

#### Automation Routes (`automation.routes.ts`)
```typescript
// Bearer token protected endpoints
app.use("/api/automation/*", bearerTokenMiddleware);

app.get("/api/automation/widgets", async (c) => {
  const widgets = await widgetService.getAllWidgets();
  return c.json({ widgets });
});

app.post("/api/automation/widgets/:id/crawl", async (c) => {
  const result = await crawlerService.crawlWebsite(widgetId, url);
  return c.json({ result });
});
```

## 🔧 Service Layer

### Service Architecture Pattern
Each service encapsulates business logic for a specific domain:

```typescript
// Base service pattern
export class BaseService {
  constructor(
    protected db: NeonHttpDatabase,
    protected env: Env
  ) {}
  
  // Common validation methods
  protected validateInput(data: unknown): void {
    // Validation logic
  }
  
  // Common error handling
  protected handleError(error: Error): Response {
    // Error response formatting
  }
}
```

### Core Services

#### Chat Service (`chat.ts`)
Handles chat message processing and streaming:
```typescript
export class ChatService {
  async handleChat(c: AppContext): Promise<Response> {
    const { message, widgetId, isEmbedded } = await c.req.json();
    
    // Rate limiting for anonymous users
    if (!auth?.user?.id) {
      await this.checkRateLimit(identifier, 10);
    }
    
    // RAG processing for custom widgets
    if (widgetId && this.ragAgent) {
      const response = await this.ragAgent.generateResponse(
        { message, widgetId },
        userId || 'anonymous'
      );
      
      // Save messages if embedded
      if (isEmbedded) {
        await this.saveMessage(/* ... */);
      }
      
      return new Response(response.stream);
    }
    
    // Standard OpenAI chat
    return this.openAIService.streamChat(message);
  }
}
```

#### RAG Agent Service (`rag-agent.ts`)
Implements Retrieval-Augmented Generation:
```typescript
export class RAGAgent {
  async generateResponse(
    request: ChatRequest,
    userId: string
  ): Promise<RAGResponse> {
    // 1. Retrieve relevant context
    const context = await this.retrieveRelevantContext(
      request.message,
      request.widgetId,
      userId
    );
    
    // 2. Build system prompt
    const systemPrompt = this.buildSystemPrompt(
      context.chunks,
      request.additionalContext
    );
    
    // 3. Generate response
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.message }
      ],
      stream: true
    });
    
    return {
      stream: response,
      sources: context.sources
    };
  }
}
```

#### Vector Search Service (`vector-search.ts`)
Manages embeddings and similarity search:
```typescript
export class VectorSearchService {
  async searchSimilarContent(
    query: string,
    widgetId?: string,
    limit = 10,
    threshold = 0.7
  ): Promise<SearchResult[]> {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Vector similarity search with pgvector
    const results = await this.db
      .select({
        content: embeddings.contentChunk,
        similarity: sql`1 - (${embeddings.embedding} <=> ${queryEmbedding})`,
        metadata: embeddings.metadata
      })
      .from(embeddings)
      .where(and(
        widgetId ? eq(embeddings.widgetId, widgetId) : undefined,
        sql`${embeddings.embedding} <=> ${queryEmbedding} < ${1 - threshold}`
      ))
      .orderBy(sql`${embeddings.embedding} <=> ${queryEmbedding}`)
      .limit(limit);
    
    return results;
  }
}
```

#### Widget Service (`widget.ts`)
Manages widget lifecycle and access control:
```typescript
export class WidgetService {
  async getWidget(
    id: string, 
    userId: string
  ): Promise<WidgetWithFiles | null> {
    // Verify ownership
    const widget = await this.db
      .select()
      .from(widgets)
      .where(and(
        eq(widgets.id, id),
        eq(widgets.userId, userId)
      ))
      .limit(1);
    
    if (!widget[0]) return null;
    
    // Load associated files
    const files = await this.getWidgetFiles(id);
    
    return { ...widget[0], files };
  }
  
  async getPublicWidget(id: string): Promise<WidgetWithFiles | null> {
    // No auth check for public widgets
    const widget = await this.db
      .select()
      .from(widgets)
      .where(eq(widgets.id, id))
      .limit(1);
    
    return widget[0] ? { ...widget[0], files: [] } : null;
  }
}
```

## 🔒 Middleware Stack

### Middleware Pipeline
Requests flow through multiple middleware layers:

```typescript
// workers/app.ts
app.use('*', cors()); // CORS for widget embedding
app.use('*', iframeMiddleware); // CSP headers
app.use('/api/*', rateLimiter); // Rate limiting
app.use('/api/auth/*', authMiddleware); // Session auth
app.use('/api/automation/*', bearerTokenMiddleware); // API auth
```

### Core Middleware

#### Rate Limiter (`rate-limiter.ts`)
```typescript
export const rateLimiter = async (c: Context, next: Next) => {
  const limiter = new RateLimiter();
  const identifier = c.env.CF?.ip || 'anonymous';
  
  const allowed = await limiter.checkRateLimit(
    identifier,
    c.get('auth')?.user ? 30 : 10, // Higher limit for auth users
    60000 // 1 minute window
  );
  
  if (!allowed) {
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }
  
  await next();
};
```

#### Authentication Middleware (`middleware.ts`)
```typescript
export const authMiddleware = async (c: Context, next: Next) => {
  const auth = createAuthClient(c);
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  
  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  c.set('auth', session);
  await next();
};
```

#### Bearer Token Middleware
```typescript
export const bearerTokenMiddleware = async (c: Context, next: Next) => {
  const token = c.env.API_BEARER_TOKEN;
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing Authorization header' }, 401);
  }
  
  if (authHeader.substring(7) !== token) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  await next();
};
```

## 📊 Database Layer

### Drizzle ORM Configuration
```typescript
// workers/db/index.ts
export function createDb(env: Env) {
  return drizzle(neon(env.DATABASE_URL), {
    schema,
    logger: env.NODE_ENV === 'development'
  });
}
```

### Connection Management
```typescript
// Middleware sets up DB connection
app.use('*', async (c, next) => {
  const db = createDb(c.env);
  c.set('db', db);
  c.set('widgets', db.select().from(widgets));
  // ... other table references
  await next();
});
```

## 🌐 External Service Integration

### OpenAI Integration
```typescript
export class OpenAIService {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }
  
  async streamChat(messages: ChatMessage[]): Promise<Response> {
    const stream = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true
    });
    
    // Convert to Response stream
    return new Response(
      Readable.from(stream).pipe(new TransformStream()),
      { headers: { 'Content-Type': 'text/event-stream' } }
    );
  }
}
```

### Cloudflare R2 Storage
```typescript
export class FileStorageService {
  async uploadFile(
    bucket: R2Bucket,
    key: string,
    file: File
  ): Promise<string> {
    await bucket.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      }
    });
    
    return `r2://${key}`;
  }
  
  async getFile(bucket: R2Bucket, key: string): Promise<R2Object | null> {
    return bucket.get(key);
  }
}
```

## ⚡ Performance Features

### Caching Strategy
```typescript
export class CacheService {
  private cache: KVNamespace;
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.cache.get(key, 'json');
    if (!cached) return null;
    
    const { data, expires } = cached;
    if (Date.now() > expires) {
      await this.cache.delete(key);
      return null;
    }
    
    return data as T;
  }
  
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.cache.put(key, JSON.stringify({
      data: value,
      expires: Date.now() + ttl
    }));
  }
}
```

### Concurrent Processing
```typescript
// Parallel API calls
const [userData, widgetData, messageHistory] = await Promise.all([
  getUserData(userId),
  getWidgetData(widgetId),
  getMessageHistory(sessionId)
]);
```

## 🔍 Error Handling

### Global Error Handler
```typescript
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  
  if (err instanceof ValidationError) {
    return c.json({ error: err.message, fields: err.fields }, 400);
  }
  
  if (err instanceof AuthenticationError) {
    return c.json({ error: 'Authentication failed' }, 401);
  }
  
  // Generic error response
  return c.json({ 
    error: 'Internal server error',
    requestId: c.env.CF?.ray
  }, 500);
});
```

### Service-Level Error Handling
```typescript
try {
  const result = await riskyOperation();
  return c.json({ success: true, data: result });
} catch (error) {
  await logError(error, { context: 'riskyOperation' });
  return c.json({ 
    success: false, 
    error: 'Operation failed' 
  }, 500);
}
```

## 📝 Logging and Monitoring

### Structured Logging
```typescript
export function log(level: LogLevel, message: string, meta?: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  }));
}
```

### Request Tracing
```typescript
app.use('*', async (c, next) => {
  const requestId = c.env.CF?.ray || crypto.randomUUID();
  c.set('requestId', requestId);
  
  const start = Date.now();
  await next();
  
  log('info', 'Request completed', {
    requestId,
    path: c.req.path,
    method: c.req.method,
    status: c.res.status,
    duration: Date.now() - start
  });
});
```

## 🚀 Deployment Configuration

### Wrangler Configuration
```toml
# wrangler.toml
name = "websyte-ai-chat-widget"
main = "workers/app.ts"
compatibility_date = "2025-01-06"

[env.production]
workers_dev = false
route = "https://yourdomain.com/api/*"

[[r2_buckets]]
binding = "FILE_STORAGE"
bucket_name = "widget-files"

[vars]
NODE_ENV = "production"
```

### Environment Variables
```typescript
interface Env {
  // Database
  DATABASE_URL: string;
  
  // AI Services
  OPENAI_API_KEY: string;
  MISTRAL_API_KEY: string;
  
  // Authentication
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  API_BEARER_TOKEN: string;
  
  // Storage
  FILE_STORAGE: R2Bucket;
  
  // Feature Flags
  ENABLE_RATE_LIMITING: string;
  STORE_IP_ADDRESSES: string;
}
```

---

For related documentation:
- [Database Architecture](./DATABASE.md)
- [Authentication System](./AUTHENTICATION.md)
- [API Reference](../API/README.md)