"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/utils/require-admin";
import {
  createProductService,
  deleteProductService,
  toggleProductStatusService,
} from "@/lib/services/product.service";

export async function createProduct(formData: FormData) {
  const admin = await requireAdmin();

  await createProductService(admin.id, formData);
  revalidatePath("/admin/products");
}

export async function deleteProduct(productId: string) {
  const admin = await requireAdmin();

  await deleteProductService(admin.id, productId);
  revalidatePath("/admin/products");
}

export async function toggleProductStatus(productId: string) {
  const admin = await requireAdmin();

  await toggleProductStatusService(admin.id, productId);
  revalidatePath("/admin/products");
}
