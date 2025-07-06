# Database Architecture

## 🗄️ Overview

The database layer uses Neon PostgreSQL with pgvector extension for vector similarity search, managed through Drizzle ORM for type-safe database operations.

## 📊 Technology Stack

- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Drizzle ORM with full TypeScript support
- **Vector Search**: pgvector extension (1536 dimensions)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: HTTP-based for edge compatibility

## 🏗️ Schema Design

### Core Tables

#### User Table
```typescript
export const user = pgTable("user", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  role: text('role'),
  banned: boolean('banned'),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires')
});
```

#### Widget Table
```typescript
export const widget = pgTable('widget', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }), // Nullable for anonymous
  name: text('name').notNull(),
  description: text('description'),
  url: text('url').unique(), // Unique URL for website widgets
  logoUrl: text('logo_url').default('https://websyte.ai/websyte-ai-logo.svg'),
  instructions: text('instructions'),
  additionalContext: text('additional_context'),
  metadata: json('metadata').$type<any>(),
  summaries: json('summaries').$type<{
    short: string;
    medium: string;
  } | null>(),
  recommendations: json('recommendations').$type<Array<{
    title: string;
    description: string;
  }>>().default([]),
  links: json('links').$type<Array<{
    url: string;
    text: string;
    importance: string;
    category: string;
  }>>().default([]),
  cacheEnabled: boolean('cache_enabled').default(false).notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  crawlUrl: text('crawl_url'),
  crawlStatus: text('crawl_status'), // 'pending' | 'crawling' | 'completed' | 'failed'
  crawlRunId: text('crawl_run_id'), // Apify run ID
  workflowId: text('workflow_id'), // Cloudflare Workflow ID
  lastCrawlAt: timestamp('last_crawl_at'),
  crawlPageCount: integer('crawl_page_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('widget_user_id_idx').on(table.userId),
  urlIdx: index('widget_url_idx').on(table.url),
}));
```

#### Widget File Table
```typescript
export const widgetFile = pgTable('widget_file', {
  id: uuid('id').defaultRandom().primaryKey(),
  widgetId: uuid('widget_id').notNull()
    .references(() => widget.id, { onDelete: 'cascade' }),
  r2Key: text('r2_key').notNull().unique(),
  filename: text('filename').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  widgetIdIdx: index('widget_file_widget_id_idx').on(table.widgetId),
  r2KeyIdx: index('widget_file_r2_key_idx').on(table.r2Key),
}));
```

### Vector Search Tables

#### Widget Embedding Table
```typescript
export const widgetEmbedding = pgTable('widget_embedding', {
  id: uuid('id').defaultRandom().primaryKey(),
  widgetId: uuid('widget_id').notNull()
    .references(() => widget.id, { onDelete: 'cascade' }),
  fileId: uuid('file_id').notNull()
    .references(() => widgetFile.id, { onDelete: 'cascade' }),
  contentChunk: text('content_chunk').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }), // OpenAI text-embedding-3-small
  metadata: json('metadata').$type<{
    chunkIndex: number;
    source?: string;
    fileId?: string;
    pageNumber?: number;
    url?: string;
    title?: string;
    crawledFrom?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  widgetIdIdx: index('widget_embedding_widget_id_idx').on(table.widgetId),
  fileIdIdx: index('widget_embedding_file_id_idx').on(table.fileId),
  // Using HNSW index for better performance
  embeddingIdx: index('widget_embedding_vector_idx')
    .using('hnsw', table.embedding.op('vector_cosine_ops')),
}));
```

### Message Persistence Tables

#### Chat Message Table
```typescript
export const chatMessage = pgTable('chat_message', {
  id: uuid('id').defaultRandom().primaryKey(),
  widgetId: uuid('widget_id').notNull()
    .references(() => widget.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull(), // Group messages by conversation
  userId: text('user_id'), // Nullable for anonymous users
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  metadata: json('metadata').$type<{
    model?: string;
    sources?: any[];
    responseTime?: number;
    userAgent?: string;
    ipAddress?: string;
    error?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  widgetIdIdx: index('chat_message_widget_id_idx').on(table.widgetId),
  sessionIdIdx: index('chat_message_session_id_idx').on(table.sessionId),
  createdAtIdx: index('chat_message_created_at_idx').on(table.createdAt),
  widgetSessionIdx: index('chat_message_widget_session_idx')
    .on(table.widgetId, table.sessionId),
}));
```

### Authentication Tables

#### Session Table
```typescript
export const session = pgTable("session", {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by')
});
```

#### Account Table
```typescript
export const account = pgTable("account", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
```

## 🔍 Vector Search Implementation

### pgvector Setup
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create HNSW index for fast similarity search
-- HNSW (Hierarchical Navigable Small World) provides better query performance
CREATE INDEX widget_embedding_vector_idx 
ON widget_embedding 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### Index Performance Tuning
```sql
-- Adjust HNSW parameters for your use case
-- m: Maximum number of connections per layer (16-64)
-- ef_construction: Size of dynamic candidate list (64-200)
-- Higher values = better recall, slower build time
```

### Similarity Search Query
```typescript
// Vector similarity search with Drizzle
const searchResults = await db
  .select({
    id: embeddings.id,
    content: embeddings.contentChunk,
    similarity: sql`1 - (${embeddings.embedding} <=> ${queryEmbedding})`,
    metadata: embeddings.metadata,
  })
  .from(embeddings)
  .where(and(
    eq(embeddings.widgetId, widgetId),
    sql`${embeddings.embedding} <=> ${queryEmbedding} < ${1 - threshold}`
  ))
  .orderBy(sql`${embeddings.embedding} <=> ${queryEmbedding}`)
  .limit(limit);
```

### Embedding Creation Process
```typescript
// 1. Chunk text content
const chunks = await chunkText(content, {
  maxWords: 2000,
  overlapWords: 100
});

// 2. Generate embeddings
const embeddings = await Promise.all(
  chunks.map(chunk => generateEmbedding(chunk.text))
);

// 3. Store in database
await db.insert(embeddings).values(
  chunks.map((chunk, i) => ({
    widgetId,
    fileId,
    contentChunk: chunk.text,
    embedding: embeddings[i],
    metadata: {
      chunkIndex: i,
      totalChunks: chunks.length,
      startOffset: chunk.startOffset,
      endOffset: chunk.endOffset
    }
  }))
);
```

## 🔄 Migration Strategy

### Drizzle Kit Configuration
```typescript
// drizzle.config.ts
export default {
  schema: "./workers/db/schema.ts",
  out: "./workers/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
};
```

### Migration Commands
```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:push

# Open Drizzle Studio for visual editing
pnpm db:studio
```

### Migration Best Practices
1. **Always test migrations** in development first
2. **Backup production data** before applying migrations
3. **Use transactions** for multi-step migrations
4. **Version control** all migration files
5. **Document breaking changes** in migration files

## 🚀 Performance Optimization

### Indexing Strategy
```typescript
// Composite indexes for common queries
export const widgetFilesIndexes = {
  widgetSourceIdx: index("idx_widget_file_widget_source")
    .on(widgetFiles.widgetId, widgetFiles.source),
  
  uploadTimeIdx: index("idx_widget_file_uploaded")
    .on(widgetFiles.uploadedAt),
};

// Partial indexes for filtered queries
CREATE INDEX idx_widget_public 
ON widget(id) 
WHERE publicAccess = true;
```

### Query Optimization
```typescript
// Use select specific columns
const widgets = await db
  .select({
    id: widgets.id,
    name: widgets.name,
    publicAccess: widgets.publicAccess,
  })
  .from(widgets)
  .where(eq(widgets.userId, userId))
  .limit(10);

// Batch operations
await db.transaction(async (tx) => {
  await tx.insert(embeddings).values(embeddingData);
  await tx.update(widgetFiles)
    .set({ status: 'processed' })
    .where(eq(widgetFiles.id, fileId));
});
```

### Connection Pooling
```typescript
// Neon serverless adapter for edge
import { neon } from '@neondatabase/serverless';

export function createDb(env: Env) {
  const sql = neon(env.DATABASE_URL, {
    fetchOptions: {
      // Connection timeout
      timeout: 10000,
      // Keep-alive
      keepalive: true,
    },
  });
  
  return drizzle(sql, { schema });
}
```

## 🔒 Security Considerations

### Row-Level Security
```typescript
// Always filter by userId for user data
const userWidgets = await db
  .select()
  .from(widgets)
  .where(eq(widgets.userId, authenticatedUserId));

// Public access check
const publicWidget = await db
  .select()
  .from(widgets)
  .where(and(
    eq(widgets.id, widgetId),
    eq(widgets.publicAccess, true)
  ));
```

### Data Validation
```typescript
// Input validation before database operations
const createWidgetSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  publicAccess: z.boolean().default(false),
  settings: z.object({
    maxTokens: z.number().min(100).max(4000),
    temperature: z.number().min(0).max(2),
  }).optional(),
});

// Validate before insert
const validatedData = createWidgetSchema.parse(input);
await db.insert(widgets).values(validatedData);
```

## 📊 Data Types and Enums

### Custom Types
```typescript
// Widget customization type
interface WidgetCustomization {
  primaryColor?: string;
  logo?: string;
  welcomeMessage?: string;
  placeholder?: string;
  position?: 'bottom-right' | 'bottom-left';
}

// Message metadata type
interface MessageMetadata {
  model?: string;
  sources?: Array<{
    fileId: string;
    fileName: string;
    relevance: number;
  }>;
  responseTime?: number;
  error?: string;
}

// Embedding metadata type
interface EmbeddingMetadata {
  chunkIndex: number;
  totalChunks: number;
  startOffset: number;
  endOffset: number;
  pageNumber?: number;
  sectionTitle?: string;
}
```

## 🔄 Backup and Recovery

### Automated Backups
- **Neon automatic backups**: Point-in-time recovery
- **Daily snapshots**: 30-day retention
- **Branch creation**: For testing migrations

### Manual Backup Commands
```bash
# Export schema
pg_dump $DATABASE_URL --schema-only > schema.sql

# Export data
pg_dump $DATABASE_URL --data-only > data.sql

# Full backup
pg_dump $DATABASE_URL > full_backup.sql
```

## 📈 Monitoring and Metrics

### Query Performance
```typescript
// Log slow queries
const startTime = performance.now();
const result = await complexQuery();
const duration = performance.now() - startTime;

if (duration > 1000) {
  console.warn('Slow query detected', {
    query: 'complexQuery',
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
}
```

### Database Health Checks
```typescript
export async function healthCheck(db: Database) {
  try {
    // Test basic connectivity
    await db.select({ now: sql`NOW()` }).from(sql`dual`);
    
    // Check critical tables
    const tableChecks = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(widgets),
      db.select({ count: count() }).from(embeddings),
    ]);
    
    return {
      status: 'healthy',
      tables: {
        users: tableChecks[0][0].count,
        widgets: tableChecks[1][0].count,
        embeddings: tableChecks[2][0].count,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
}
```

---

For related documentation:
- [Backend Architecture](./BACKEND.md)
- [RAG Pipeline](./RAG-PIPELINE.md)
- [API Reference](../API/README.md)