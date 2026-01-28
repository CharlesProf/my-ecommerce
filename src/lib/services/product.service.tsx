import { uploadImage } from "@/lib/utils/image-upload";
import {
  insertProduct,
  findProductWithAdmin,
  deleteProductById,
  updateProductStatus,
  updateProductById,
} from "@/lib/repositories/product.repo";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createProductService(
  adminId: string,
  formData: FormData
) {
  const storeId = formData.get("storeId") as string;

  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (!store || store.adminId !== adminId) {
    throw new Error("Unauthorized");
  }

  const imageUrl = await uploadImage(
    formData.get("image") as File | null
  );

  return insertProduct({
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    price: formData.get("price") as string,
    productionCost:
      (formData.get("productionCost") as string) || null,
    stock: Number(formData.get("stock") || 0),
    sku: (formData.get("sku") as string) || null,
    imageUrl,
    storeId,
    subcategoryId: formData.get("subcategoryId") as string,
  });
}

export async function deleteProductService(
  adminId: string,
  productId: string
) {
  const product = await findProductWithAdmin(productId);

  if (!product || product.adminId !== adminId) {
    throw new Error("Unauthorized");
  }

  return deleteProductById(productId);
}

export async function toggleProductStatusService(
  adminId: string,
  productId: string
) {
  const product = await findProductWithAdmin(productId);

  if (!product || product.adminId !== adminId) {
    throw new Error("Unauthorized");
  }

  const newStatus = product.isActive === 1 ? 0 : 1;
  return updateProductStatus(productId, newStatus);
}

export async function updateProductService(
  data: {
    productId: string;
    name: string;
    description: string;
    price: string;
    productionCost: string;
    stock: number | null;
    imageUrl: string;
    sku: string;
    storeId: string;
    subcategoryId: string;
  }
){
  return updateProductById(data.productId, {
    name: data.name,
    description: data.description || null,
    price: data.price,
    productionCost: data.productionCost || null,
    stock: data.stock ?? 0,
    sku: data.sku || null,
    imageUrl: data.imageUrl || null,
    storeId: data.storeId,
    subcategoryId: data.subcategoryId || null,
  });
}