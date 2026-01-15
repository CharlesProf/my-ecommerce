import {
  insertStore,
  findStoreById,
  deleteStoreById,
  updateStoreById,
  findAdminStores,
} from "@/lib/repositories/store.repo";

export async function createStoreService(
  adminId: string,
  data: { name: string; address: string }
) {
  return insertStore({
    name: data.name,
    address: data.address || null,
    adminId,
  });
}

export async function deleteStoreService(
  adminId: string,
  storeId: string
) {
  const store = await findStoreById(storeId);

  if (!store || store.adminId !== adminId) {
    throw new Error("Unauthorized");
  }

  return deleteStoreById(storeId);
}

export async function updateStoreService(
  adminId: string,
  data: { storeId: string; name: string; address: string }
) {
  const store = await findStoreById(data.storeId);

  if (!store || store.adminId !== adminId) {
    throw new Error("Unauthorized");
  }

  return updateStoreById(data.storeId, {
    name: data.name,
    address: data.address || null,
  });
}

export async function findStoreService(
  adminId: string,
  search?: string,
) {
  return findAdminStores(adminId, search);
}

