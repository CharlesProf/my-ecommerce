import { db } from "@/lib/db";
import { categories, products, categoryLists, stores, subcategories } from "@/lib/db/schema";
import { eq, and, desc, count, gte } from "drizzle-orm";

/**
 * Get top categories by product count
 * @param limit Number of categories to fetch
 * @returns Array of categories with product count
 */
export async function getTopCategories(limit: number = 5) {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        imageUrl: categoryLists.imageUrl,
      })
      .from(categories)
      .leftJoin(categoryLists, eq(categories.categoryListId, categoryLists.id))
      .orderBy(desc(categories.createdAt))
      .limit(limit);

    // Fetch product count for each category separately
    const categoriesWithProducts = await Promise.all(
      result.map(async (cat) => {
        const productCount = await db
          .select({ count: count() })
          .from(products)
          .innerJoin(
            subcategories,
            eq(products.subcategoryId, subcategories.id)
          )
          .where(
            and(
              eq(subcategories.categoryId, cat.id as any),
              eq(products.isActive, 1)
            )
          );

        return {
          ...cat,
          productCount: productCount[0]?.count || 0,
        };
      })
    );

    return categoriesWithProducts;
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
export async function getFeaturedProducts(limit: number = 10) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await db
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
          gte(products.createdAt, sixMonthsAgo)
        )
      )
      .orderBy(desc(products.createdAt))
      .limit(limit);

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
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        imageUrl: categoryLists.imageUrl,
      })
      .from(categories)
      .leftJoin(categoryLists, eq(categories.categoryListId, categoryLists.id))
      .orderBy(categories.name);

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

    const result = await db
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
      .limit(limit);

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
    const result = await db
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
      .limit(limit);

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
    const result = await db
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
      .orderBy(desc(products.createdAt));

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
    const result = await db
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
      .orderBy(desc(products.createdAt));

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
    const result = await db
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
      .limit(limit);

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
