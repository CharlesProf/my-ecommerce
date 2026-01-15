import { db } from "@/lib/db";
import { categories, subcategories, stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/* ---------- CATEGORY ---------- */

export async function insertCategory(name: string, storeId: string) {
  return db.insert(categories).values({
    name,
    storeId,
  });
}

export async function findCategoryWithAdmin(categoryId: string) {
  const [category] = await db
    .select({
      id: categories.id,
      storeId: categories.storeId,
      adminId: stores.adminId,
    })
    .from(categories)
    .leftJoin(stores, eq(categories.storeId, stores.id))
    .where(eq(categories.id, categoryId))
    .limit(1);

  return category;
}

export async function deleteCategoryById(categoryId: string) {
  return db.delete(categories).where(eq(categories.id, categoryId));
}

export async function updateCategoryWithAdmin(  
  categoryId: string,
  name: string,
) {
  return db
    .update(categories)
    .set({ name }) // update the name field
    .where(eq(categories.id, categoryId));
}

/* ---------- SUBCATEGORY ---------- */

export async function insertSubcategory(name: string, categoryId: string) {
  return db.insert(subcategories).values({
    name,
    categoryId,
  });
}

export async function findSubcategoryWithAdmin(subcategoryId: string) {
  const [subcategory] = await db
    .select({
      id: subcategories.id,
      categoryId: subcategories.categoryId,
      adminId: stores.adminId,
    })
    .from(subcategories)
    .leftJoin(categories, eq(subcategories.categoryId, categories.id))
    .leftJoin(stores, eq(categories.storeId, stores.id))
    .where(eq(subcategories.id, subcategoryId))
    .limit(1);

  return subcategory;
}

export async function deleteSubcategoryById(subcategoryId: string) {
  return db.delete(subcategories).where(eq(subcategories.id, subcategoryId));
}

export async function deleteSubcategoriesByCategory(categoryId: string) {
  return db
    .delete(subcategories)
    .where(eq(subcategories.categoryId, categoryId));
}

export async function findAdminCategories(adminId: string) {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      storeId: categories.storeId,
      storeName: stores.name,
      createdAt: categories.createdAt,
    })
    .from(categories)
    .leftJoin(stores, eq(categories.storeId, stores.id))
    .where(eq(stores.adminId, adminId));
}

export async function findAdminSubcategories(adminId: string) {
  return db
    .select({
      id: subcategories.id,
      name: subcategories.name,
      categoryId: subcategories.categoryId,
      categoryName: categories.name,
      createdAt: subcategories.createdAt,
    })
    .from(subcategories)
    .leftJoin(categories, eq(subcategories.categoryId, categories.id))
    .leftJoin(stores, eq(categories.storeId, stores.id))
    .where(eq(stores.adminId, adminId));
}

export async function updateSubcategoryWithAdmin(  
  categoryId: string,
  subcategoryId: string,
  name: string,
) {
  return db
    .update(subcategories)
    .set({ name, categoryId }) // update the name field
    .where(eq(subcategories.id, subcategoryId));
}
