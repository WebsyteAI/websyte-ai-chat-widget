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
  embedding: vector('embedding', { dimensions: 1536 }), // OpenAI ada-002 dimensions
  metadata: json('metadata').$type<{
    chunkIndex: number;
    source?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  widgetIdIdx: index('widget_embedding_widget_id_idx').on(table.widgetId),
  fileIdIdx: index('widget_embedding_file_id_idx').on(table.fileId),
  embeddingIdx: index('widget_embedding_vector_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
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
  emailVerified: boolean('emailVerified').default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

export const session = pgTable("session", {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

export const verification = pgTable("verification", {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow()
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