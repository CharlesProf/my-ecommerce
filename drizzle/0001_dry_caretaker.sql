ALTER TABLE "staff" DROP CONSTRAINT "staff_store_id_stores_id_fk";
--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "owner_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" DROP COLUMN "store_id";--> statement-breakpoint
ALTER TABLE "staff" DROP COLUMN "role";