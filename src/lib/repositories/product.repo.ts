import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function insertProduct(data: {
  name: string;
  description: string | null;
  price: string;
  productionCost: string | null;
  stock: number;
  sku: string | null;
  imageUrl: string | null;
  storeId: string;
  subcategoryId: string;
}) {
  return db.insert(products).values({
    ...data,
    isActive: 1,
  });
}

export async function findProductWithAdmin(productId: string) {
  const [product] = await db
    .select({
      id: products.id,
      isActive: products.isActive,
      storeId: products.storeId,
      adminId: stores.adminId,
    })
    .from(products)
    .leftJoin(stores, eq(products.storeId, stores.id))
    .where(eq(products.id, productId))
    .limit(1);

  return product;
}

export async function deleteProductById(productId: string) {
  return db.delete(products).where(eq(products.id, productId));
}

export async function updateProductStatus(
  productId: string,
  isActive: number
) {
  return db
    .update(products)
    .set({ isActive })
    .where(eq(products.id, productId));
}

export async function updateProductById(
  productId: string,
  data: {
    name: string;
    description: string | null;
    price: string;
    productionCost: string | null;
    stock: number;
    sku: string | null;
    imageUrl: string | null;
    storeId: string;
    subcategoryId: string | null;
  }
) {
  return db
    .update(products)
    .set(data)
    .where(eq(products.id, productId));
}
