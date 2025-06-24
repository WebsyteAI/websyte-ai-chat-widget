CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "widget" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"description" text,
	"url" text,
	"summaries" json,
	"recommendations" json,
	"cache_enabled" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "widget_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "widget_embedding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"widget_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"content_chunk" text NOT NULL,
	"embedding" vector(1536),
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "widget_file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"widget_id" uuid NOT NULL,
	"r2_key" text NOT NULL,
	"filename" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "widget_file_r2_key_unique" UNIQUE("r2_key")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget" ADD CONSTRAINT "widget_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_embedding" ADD CONSTRAINT "widget_embedding_widget_id_widget_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widget"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_embedding" ADD CONSTRAINT "widget_embedding_file_id_widget_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."widget_file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_file" ADD CONSTRAINT "widget_file_widget_id_widget_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widget"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "widget_user_id_idx" ON "widget" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "widget_url_idx" ON "widget" USING btree ("url");--> statement-breakpoint
CREATE INDEX "widget_embedding_widget_id_idx" ON "widget_embedding" USING btree ("widget_id");--> statement-breakpoint
CREATE INDEX "widget_embedding_file_id_idx" ON "widget_embedding" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "widget_embedding_vector_idx" ON "widget_embedding" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "widget_embedding_content_search_idx" ON "widget_embedding" USING btree ("content_chunk");--> statement-breakpoint
CREATE INDEX "widget_file_widget_id_idx" ON "widget_file" USING btree ("widget_id");--> statement-breakpoint
CREATE INDEX "widget_file_r2_key_idx" ON "widget_file" USING btree ("r2_key");