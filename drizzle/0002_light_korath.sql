ALTER TABLE "products" ADD COLUMN "is_sales" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price_sales" numeric(10, 2) DEFAULT '0';