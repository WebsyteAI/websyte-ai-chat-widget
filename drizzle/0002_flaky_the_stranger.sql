ALTER TABLE "widget" ADD COLUMN "crawl_url" text;--> statement-breakpoint
ALTER TABLE "widget" ADD COLUMN "crawl_status" text;--> statement-breakpoint
ALTER TABLE "widget" ADD COLUMN "crawl_run_id" text;--> statement-breakpoint
ALTER TABLE "widget" ADD COLUMN "last_crawl_at" timestamp;--> statement-breakpoint
ALTER TABLE "widget" ADD COLUMN "crawl_page_count" integer DEFAULT 0;