import { 
  pgTable, 
  text, 
  timestamp, 
  boolean, 
  json,
  index 
} from 'drizzle-orm/pg-core';

export const widgets = pgTable('widgets', {
  url: text('url').primaryKey(),
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
});

export type Widget = typeof widgets.$inferSelect;
export type NewWidget = typeof widgets.$inferInsert;