"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/utils/require-admin";
import {
  createCategoryService,
  deleteCategoryService,
  createSubcategoryService,
  deleteSubcategoryService,
  updateSubcategoryService,
  updateCategoryService,
} from "@/lib/services/category.service";

/* ---------- CATEGORY ---------- */

export async function createCategory(data: {
  name: string;
  storeId: string;
}) {
  const admin = await requireAdmin();

  await createCategoryService(admin.id, data.name, data.storeId);
  revalidatePath("/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  const admin = await requireAdmin();

  await deleteCategoryService(admin.id, categoryId);
  revalidatePath("/admin/categories");
}

export async function updateCategory(data: {
  name: string;
  categoryId: string;
}){
  const admin = await requireAdmin();

  await updateCategoryService(data.categoryId, data.name);
  revalidatePath("/admin/category");
}

/* ---------- SUBCATEGORY ---------- */

export async function createSubcategory(data: {
  name: string;
  categoryId: string;
}) {
  const admin = await requireAdmin();

  await createSubcategoryService(admin.id, data.name, data.categoryId);
  revalidatePath("/admin/categories");
}

export async function deleteSubcategory(subcategoryId: string) {
  const admin = await requireAdmin();

  await deleteSubcategoryService(admin.id, subcategoryId);
  revalidatePath("/admin/categories");
}

export async function updateSubcategory(categoryId: string, subcategoryId: string, name: string){
  const admin = await requireAdmin();

  await updateSubcategoryService(categoryId, subcategoryId, name);
  revalidatePath("/admin/categories");
}