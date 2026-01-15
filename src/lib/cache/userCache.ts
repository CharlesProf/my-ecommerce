// lib/data/get-admin-user.ts
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const getAdminUser = unstable_cache(
  async (userId: string) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user;
  },
  ["admin-user"],
  { revalidate: 300 } // 5 minutes
);
