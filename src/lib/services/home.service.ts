import { db } from "@/lib/db";
import { categories, products, categoryLists, stores, subcategories } from "@/lib/db/schema";
import { eq, and, desc, count, gte, sql } from "drizzle-orm";
import { runDbQuery } from "@/lib/db/query-retry";

/**
 * Get top categories by product count
 * @param limit Number of categories to fetch
 * @returns Array of categories with product count
 */
export async function getTopCategories(limit: number = 10) {
  try {
    const result = await runDbQuery(() =>
      db
        .select({
          id: categories.id,
          name: categories.name,
          imageUrl: categoryLists.imageUrl,
          productCount: sql`COUNT(${products.id})`.as("productCount"),
        })
        .from(categories)
        .leftJoin(categoryLists, eq(categories.categoryListId, categoryLists.id))
        .leftJoin(
          subcategories,
          eq(subcategories.categoryId, categories.id)
        )
        .leftJoin(
          products,
          and(
            eq(products.subcategoryId, subcategories.id),
            eq(products.isActive, 1)
          )
        )
        .groupBy(categories.id, categories.name, categoryLists.imageUrl)
        .orderBy(desc(categories.createdAt))
        .limit(limit)
    );

    return result.map((category) => ({
      ...category,
      productCount: Number(category.productCount ?? 0),
    }));
  } catch (error) {
    console.error("Error fetching top categories:", error);
    return [];
  }
}

/**
 * Get featured products
 * @param limit Number of products to fetch
 * @returns Array of products with category information
 */
export async function getFeaturedProducts(limit: number = 10, storeId?: string) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const conditions = [
      eq(products.isActive, 1),
      gte(products.createdAt, sixMonthsAgo),
    ];

    if (storeId) {
      conditions.push(eq(products.storeId, storeId));
    }

    const result = await runDbQuery(() =>
      db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          priceSales: products.priceSales,
          isSales: products.isSales,
          imageUrl: products.imageUrl,
          categoryName: categories.name,
          storeId: products.storeId,
        })
        .from(products)
        .leftJoin(
          subcategories,
          eq(products.subcategoryId, subcategories.id)
        )
        .leftJoin(
          categories,
          eq(subcategories.categoryId, categories.id)
        )
        .where(and(...conditions))
        .orderBy(desc(products.createdAt))
        .limit(limit)
    );

    return result.map((product) => ({
      ...product,
      price: product.price.toString(),
      priceSales: product.priceSales?.toString() ?? null,
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

/**
 * Get all categories for filter/dropdown
 * @returns Array of all active categories
 */
export async function getAllCategories() {
  try {
    const result = await runDbQuery(() =>
      db
        .select({
          id: categories.id,
          name: categories.name,
          imageUrl: categoryLists.imageUrl,
        })
        .from(categories)
        .leftJoin(categoryLists, eq(categories.categoryListId, categoryLists.id))
        .orderBy(categories.name)
    );

    return result;
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }
}

export async function getNewArrivals(limit: number = 10) {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const result = await runDbQuery(() =>
      db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          priceSales: products.priceSales,
          isSales: products.isSales,
          imageUrl: products.imageUrl,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(
          subcategories,
          eq(products.subcategoryId, subcategories.id)
        )
        .leftJoin(
          categories,
          eq(subcategories.categoryId, categories.id)
        )
        .where(
          and(
            eq(products.isActive, 1),
            gte(products.createdAt, threeMonthsAgo)
          )
        )
        .orderBy(desc(products.createdAt))
        .limit(limit)
    );

    return result.map((product) => ({
      ...product,
      price: product.price.toString(),
      priceSales: product.priceSales?.toString() ?? null,
    }));
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

export async function getSaleProducts(limit: number = 10) {
  try {
    const result = await runDbQuery(() =>
      db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          priceSales: products.priceSales,
          isSales: products.isSales,
          imageUrl: products.imageUrl,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(
          subcategories,
          eq(products.subcategoryId, subcategories.id)
        )
        .leftJoin(
          categories,
          eq(subcategories.categoryId, categories.id)
        )
        .where(
          and(
            eq(products.isActive, 1),
            eq(products.isSales, 1)
          )
        )
        .orderBy(desc(products.createdAt))
        .limit(limit)
    );

    return result.map((product) => ({
      ...product,
      price: product.price.toString(),
      priceSales: product.priceSales?.toString() ?? null,
    }));
  } catch (error) {
    console.error("Error fetching sale products:", error);
    return [];
  }
}

/**
 * Search products by query
 * @param query Search query string
 * @returns Array of matching products
 */
export async function searchProducts(query: string) {
  try {
    const result = await runDbQuery(() =>
      db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          imageUrl: products.imageUrl,
          categoryName: categories.name,
          description: products.description,
        })
        .from(products)
        .leftJoin(
          subcategories,
          eq(products.subcategoryId, subcategories.id)
        )
        .leftJoin(
          categories,
          eq(subcategories.categoryId, categories.id)
        )
        .where(eq(products.isActive, 1))
        .orderBy(desc(products.createdAt))
    );

    // Filter results in JavaScript instead of SQL
    const filtered = result.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.map((product) => ({
      ...product,
      price: product.price.toString(),
    }));
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

/**
 * Get products by category
 * @param categoryId Category ID
 * @returns Array of products in the category
 */
export async function getProductsByCategory(categoryId: string) {
  try {
    const result = await runDbQuery(() =>
      db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          priceSales: products.priceSales,
          isSales: products.isSales,
          imageUrl: products.imageUrl,
          description: products.description,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(
          subcategories,
          eq(products.subcategoryId, subcategories.id)
        )
        .leftJoin(
          categories,
          eq(subcategories.categoryId, categories.id)
        )
        .where(
          and(
            eq(products.isActive, 1),
            eq(categories.id, categoryId as any)
          )
        )
        .orderBy(desc(products.createdAt))
    );

    return result.map((product) => ({
      ...product,
      price: product.price.toString(),
      priceSales: product.priceSales?.toString() ?? null,
    }));
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

export async function getAllProducts(limit: number = 50) {
  try {
    const result = await runDbQuery(() =>
      db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          priceSales: products.priceSales,
          isSales: products.isSales,
          imageUrl: products.imageUrl,
          description: products.description,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(
          subcategories,
          eq(products.subcategoryId, subcategories.id)
        )
        .leftJoin(
          categories,
          eq(subcategories.categoryId, categories.id)
        )
        .where(eq(products.isActive, 1))
        .orderBy(desc(products.createdAt))
        .limit(limit)
    );

    return result.map((product) => ({
      ...product,
      price: product.price.toString(),
      priceSales: product.priceSales?.toString() ?? null,
    }));
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

export async function getAllProductsPage(
  page: number = 1,
  limit: number = 15
) {
  const offset = (page - 1) * limit;

  try {
    const result = await runDbQuery(() =>
      db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          priceSales: products.priceSales,
          isSales: products.isSales,
          imageUrl: products.imageUrl,
          description: products.description,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(
          subcategories,
          eq(products.subcategoryId, subcategories.id)
        )
        .leftJoin(
          categories,
          eq(subcategories.categoryId, categories.id)
        )
        .where(eq(products.isActive, 1))
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset)
    );

    return result.map((product) => ({
      ...product,
      price: product.price.toString(),
      priceSales: product.priceSales?.toString() ?? null,
    }));
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    return [];
  }
}
