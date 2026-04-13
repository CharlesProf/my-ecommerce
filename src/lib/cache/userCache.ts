// lib/data/get-admin-user.ts
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { runDbQuery } from "@/lib/db/query-retry";

export const getUser = unstable_cache(
  async (userId: string) => {
    try {
      const [user] = await runDbQuery(() =>
        db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)
      );

      return user;
    } catch (error) {
      console.error("Failed to load admin user cache:", error);
      return null;
    }
  },
  ["admin-user"],
  { revalidate: 300 } // 5 minutes
);
