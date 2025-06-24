import { 
  pgTable, 
  text, 
  timestamp, 
  boolean, 
  json,
  index,
  integer,
  serial,
  vector,
  real,
  uuid
} from 'drizzle-orm/pg-core';

// New widget table - replaces old widgets table
export const widget = pgTable('widget', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }), // Nullable for anonymous widgets
  name: text('name').notNull(),
  description: text('description'),
  url: text('url').unique(), // Unique URL for website widgets
  summaries: json('summaries').$type<{
    short: string;
    medium: string;
  } | null>(),
  recommendations: json('recommendations').$type<Array<{
    title: string;
    description: string;
  }> | null>(),
  cacheEnabled: boolean('cache_enabled').default(false).notNull(),
  isPublic: boolean('is_public').default(false).notNull(), // Allow public embedding
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('widget_user_id_idx').on(table.userId),
  urlIdx: index('widget_url_idx').on(table.url),
}));

// Widget embeddings for vector search
export const widgetEmbedding = pgTable('widget_embedding', {
  id: uuid('id').defaultRandom().primaryKey(),
  widgetId: uuid('widget_id').notNull().references(() => widget.id, { onDelete: 'cascade' }),
  fileId: uuid('file_id').notNull().references(() => widgetFile.id, { onDelete: 'cascade' }), // Reference to source file
  contentChunk: text('content_chunk').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }), // OpenAI text-embedding-3-small dimensions
  metadata: json('metadata').$type<{
    chunkIndex: number;
    source?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  widgetIdIdx: index('widget_embedding_widget_id_idx').on(table.widgetId),
  fileIdIdx: index('widget_embedding_file_id_idx').on(table.fileId),
  embeddingIdx: index('widget_embedding_vector_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
  contentSearchIdx: index('widget_embedding_content_search_idx').on(table.contentChunk),
}));

// Widget files stored in R2
export const widgetFile = pgTable('widget_file', {
  id: uuid('id').defaultRandom().primaryKey(),
  widgetId: uuid('widget_id').notNull().references(() => widget.id, { onDelete: 'cascade' }),
  r2Key: text('r2_key').notNull().unique(),
  filename: text('filename').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  widgetIdIdx: index('widget_file_widget_id_idx').on(table.widgetId),
  r2KeyIdx: index('widget_file_r2_key_idx').on(table.r2Key),
}));


// Auth tables from Better Auth
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

export const session = pgTable("session", {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by')
});

export const account = pgTable("account", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
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

export const verification = pgTable("verification", {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// New widget types
export type Widget = typeof widget.$inferSelect;
export type NewWidget = typeof widget.$inferInsert;
export type WidgetEmbedding = typeof widgetEmbedding.$inferSelect;
export type NewWidgetEmbedding = typeof widgetEmbedding.$inferInsert;
export type WidgetFile = typeof widgetFile.$inferSelect;
export type NewWidgetFile = typeof widgetFile.$inferInsert;


// Auth types
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;