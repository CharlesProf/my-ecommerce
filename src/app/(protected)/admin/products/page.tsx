import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { stores, products, subcategories, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ProductsClient } from "./products-client";
import { getUser } from "@/lib/cache/userCache";
import { runDbQuery } from "@/lib/db/query-retry";

export default async function ProductsPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await getUser(clerkUser.id);

  if (!dbUser || dbUser.role !== "admin") {
    redirect("/");
  }
  const [userStores, allProducts, categoriesWithSubs, allSubcategories] =
    await Promise.all([
      runDbQuery(() =>
        db
          .select()
          .from(stores)
          .where(eq(stores.adminId, clerkUser.id))
      ),
      runDbQuery(() =>
        db
          .select({
            id: products.id,
            name: products.name,
            description: products.description,
            price: products.price,
            priceSales: products.priceSales,
            isSales: products.isSales,
            productionCost: products.productionCost,
            stock: products.stock,
            imageUrl: products.imageUrl,
            sku: products.sku,
            isActive: products.isActive,
            storeId: products.storeId,
            storeName: stores.name,
            subcategoryId: products.subcategoryId,
            subcategoryName: subcategories.name,
            categoryName: categories.name,
            createdAt: products.createdAt,
          })
          .from(products)
          .leftJoin(stores, eq(products.storeId, stores.id))
          .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id))
          .leftJoin(categories, eq(subcategories.categoryId, categories.id))
          .where(eq(stores.adminId, clerkUser.id))
      ),
      runDbQuery(() =>
        db
          .select({
            id: categories.id,
            name: categories.name,
            storeId: categories.storeId,
            storeName: stores.name,
          })
          .from(categories)
          .leftJoin(stores, eq(categories.storeId, stores.id))
          .where(eq(stores.adminId, clerkUser.id))
      ),
      runDbQuery(() =>
        db
          .select({
            id: subcategories.id,
            name: subcategories.name,
            categoryId: subcategories.categoryId,
          })
          .from(subcategories)
          .leftJoin(categories, eq(subcategories.categoryId, categories.id))
          .leftJoin(stores, eq(categories.storeId, stores.id))
          .where(eq(stores.adminId, clerkUser.id))
      ),
    ]);

  // Serialize data with proper null handling
  const serializedStores = userStores.map(store => ({
    id: store.id || "",
    name: store.name || "",
    address: store.address || null,
    createdAt: store.createdAt ? store.createdAt.toISOString() : null,
  }));

  const serializedProducts = allProducts.map(product => ({
    id: product.id || "",
    name: product.name || "",
    description: product.description || null,
    price: product.price?.toString() || "0",
    productionCost: product.productionCost?.toString() || null,
    stock: product.stock ?? 0,
    imageUrl: product.imageUrl || null,
    sku: product.sku || null,
    priceSales: product.priceSales?.toString() || null,
    isSales: product.isSales ?? 0,
    isActive: product.isActive ?? 1,
    storeId: product.storeId || null,
    storeName: product.storeName || null,
    subcategoryId: product.subcategoryId || null,
    subcategoryName: product.subcategoryName || null,
    categoryName: product.categoryName || null,
    createdAt: product.createdAt ? product.createdAt.toISOString() : null,
  }));

  const serializedCategories = categoriesWithSubs.map(cat => ({
    id: cat.id || "",
    name: cat.name || "",
    storeId: cat.storeId || null,
    storeName: cat.storeName || null,
  }));

  const serializedSubcategories = allSubcategories.map(sub => ({
    id: sub.id || "",
    name: sub.name || "",
    categoryId: sub.categoryId || null,
  }));

  return (
    <ProductsClient
      stores={serializedStores}
      products={serializedProducts}
      categories={serializedCategories}
      subcategories={serializedSubcategories}
    />
  );
}
