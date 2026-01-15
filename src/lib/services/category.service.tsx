import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  insertCategory,
  insertSubcategory,
  findCategoryWithAdmin,
  findSubcategoryWithAdmin,
  deleteCategoryById,
  deleteSubcategoryById,
  deleteSubcategoriesByCategory,
  findAdminCategories,
  findAdminSubcategories,
  updateCategoryWithAdmin,
  updateSubcategoryWithAdmin,
} from "@/lib/repositories/category.repo";
import { findAdminStores } from "../repositories/store.repo";

/* ---------- CATEGORY ---------- */

export async function createCategoryService(
  adminId: string,
  name: string,
  storeId: string
) {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (!store || store.adminId !== adminId) {
    throw new Error("Unauthorized");
  }

  return insertCategory(name, storeId);
}

export async function deleteCategoryService(
  adminId: string,
  categoryId: string
) {
  const category = await findCategoryWithAdmin(categoryId);

  if (!category || category.adminId !== adminId) {
    throw new Error("Unauthorized");
  }

  // cascade delete (explicit, safe)
  await deleteSubcategoriesByCategory(categoryId);
  return deleteCategoryById(categoryId);
}

export async function updateCategoryService(
  categoryId: string,
  name: string,
){
  return await updateCategoryWithAdmin(categoryId, name);
}

export async function getAdminCategoryPageData(adminId: string) {
  const [stores, categories, subcategories] = await Promise.all([
    findAdminStores(adminId),
    findAdminCategories(adminId),
    findAdminSubcategories(adminId),
  ]);

  return {
    stores: serializeDates(stores),
    categories: serializeDates(categories),
    subcategories: serializeDates(subcategories),
  };
}
/* ---------- SUBCATEGORY ---------- */

export async function createSubcategoryService(
  adminId: string,
  name: string,
  categoryId: string
) {
  const category = await findCategoryWithAdmin(categoryId);

  if (!category || category.adminId !== adminId) {
    throw new Error("Unauthorized");
  }

  return insertSubcategory(name, categoryId);
}

export async function updateSubcategoryService(
  categoryId: string,
  subcategoryId: string,
  name: string, 
){
  return updateSubcategoryWithAdmin(categoryId, subcategoryId, name)
}

export async function deleteSubcategoryService(
  adminId: string,
  subcategoryId: string
) {
  const subcategory = await findSubcategoryWithAdmin(subcategoryId);

  if (!subcategory || subcategory.adminId !== adminId) {
    throw new Error("Unauthorized");
  }

  return deleteSubcategoryById(subcategoryId);
}

function serializeDates<T extends { createdAt: Date | null }>(data: T[]) {
  return data.map((item) => ({
    ...item,
    createdAt: item.createdAt?.toISOString() ?? null,
  }));
}

