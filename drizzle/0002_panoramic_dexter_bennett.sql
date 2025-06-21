DROP INDEX "widget_embedding_content_search_idx";--> statement-breakpoint
CREATE INDEX "widget_embedding_content_search_idx" ON "widget_embedding" USING gin ("content_chunk");