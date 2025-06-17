CREATE TABLE "widgets" (
	"url" text PRIMARY KEY NOT NULL,
	"summaries" json,
	"recommendations" json,
	"cache_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
