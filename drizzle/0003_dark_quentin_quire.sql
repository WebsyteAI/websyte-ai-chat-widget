DROP INDEX "widget_embedding_content_search_idx";--> statement-breakpoint
ALTER TABLE "widget" ALTER COLUMN "recommendations" SET DEFAULT '[]'::json;