ALTER TABLE "transactions" ALTER COLUMN "payment_method" SET DEFAULT 'QRIS';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "payment_method" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "full_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "user_profile_id" uuid;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "store_id" uuid;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;