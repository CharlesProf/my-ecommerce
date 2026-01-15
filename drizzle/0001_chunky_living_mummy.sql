ALTER TABLE "products" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "image_urls" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_active" integer DEFAULT 1;