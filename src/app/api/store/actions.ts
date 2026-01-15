"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/utils/require-admin";
import {
  createStoreService,
  deleteStoreService,
  updateStoreService,
} from "@/lib/services/store.service";

export async function createStore(data: {
  name: string;
  address: string;
}) {
  const admin = await requireAdmin();

  await createStoreService(admin.id, data);
  revalidatePath("/admin/shops");
}

export async function deleteStore(storeId: string) {
  const admin = await requireAdmin();

  await deleteStoreService(admin.id, storeId);
  revalidatePath("/admin/shops");
}

export async function updateStore(data: {
  storeId: string;
  name: string;
  address: string;
}) {
  const admin = await requireAdmin();

  await updateStoreService(admin.id, data);
  revalidatePath("/admin/shops");
}
