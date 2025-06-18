CREATE TABLE "widget" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"url" text,
	"summaries" json,
	"recommendations" json,
	"cache_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "widget_embedding" (
	"id" serial PRIMARY KEY NOT NULL,
	"widget_id" integer NOT NULL,
	"content_chunk" text NOT NULL,
	"embedding" vector(1536),
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "widget_file" (
	"id" serial PRIMARY KEY NOT NULL,
	"widget_id" integer NOT NULL,
	"r2_key" text NOT NULL,
	"filename" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "widget_file_r2_key_unique" UNIQUE("r2_key")
);
--> statement-breakpoint
ALTER TABLE "widget" ADD CONSTRAINT "widget_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_embedding" ADD CONSTRAINT "widget_embedding_widget_id_widget_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widget"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_file" ADD CONSTRAINT "widget_file_widget_id_widget_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widget"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "widget_user_id_idx" ON "widget" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "widget_url_idx" ON "widget" USING btree ("url");--> statement-breakpoint
CREATE INDEX "widget_embedding_widget_id_idx" ON "widget_embedding" USING btree ("widget_id");--> statement-breakpoint
CREATE INDEX "widget_embedding_vector_idx" ON "widget_embedding" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "widget_file_widget_id_idx" ON "widget_file" USING btree ("widget_id");--> statement-breakpoint
CREATE INDEX "widget_file_r2_key_idx" ON "widget_file" USING btree ("r2_key");