import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq, and, or, like, sql } from "drizzle-orm";


export async function insertStore(data: {
  name: string;
  address: string | null;
  adminId: string;
}) {
  return db.insert(stores).values(data);
}

export async function findStoreById(storeId: string) {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  return store;
}

export async function deleteStoreById(storeId: string) {
  return db.delete(stores).where(eq(stores.id, storeId));
}

export async function updateStoreById(
  storeId: string,
  data: { name: string; address: string | null }
) {
  return db
    .update(stores)
    .set(data)
    .where(eq(stores.id, storeId));
}

export async function findAdminStores(
  adminId: string,
  search?: string,
) {
  if (!search) {
    return db
      .select()
      .from(stores)
      .where(eq(stores.adminId, adminId));
  }
  console.log(search);
  return db
    .select()
    .from(stores)
    .where(
      and(
        eq(stores.adminId, adminId),
        or(
        sql`LOWER(${stores.name}) LIKE ${`%${search.toLowerCase()}%`}`,
        sql`LOWER(${stores.address}) LIKE ${`%${search.toLowerCase()}%`}`
        )
      )
    );
}
