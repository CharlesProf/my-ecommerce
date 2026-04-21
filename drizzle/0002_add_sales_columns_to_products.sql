ALTER TABLE "products"
  ADD COLUMN "is_sales" integer NOT NULL DEFAULT 0;

ALTER TABLE "products"
  ADD COLUMN "price_sales" numeric(10,2) NOT NULL DEFAULT 0;
