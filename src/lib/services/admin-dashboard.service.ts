import { and, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  categories,
  products,
  stores,
  transactionItems,
  transactions,
  userProfiles,
} from "@/lib/db/schema";
import { runDbQuery } from "@/lib/db/query-retry";

type AdminDashboardInput = {
  adminId: string;
  storeId?: string;
  salesFrom: Date;
  salesTo: Date;
  ordersFrom: Date;
  ordersTo: Date;
  overviewFrom: Date;
  overviewTo: Date;
};

export async function getAdminDashboardData({
  adminId,
  storeId,
  salesFrom,
  salesTo,
  ordersFrom,
  ordersTo,
  overviewFrom,
  overviewTo,
}: AdminDashboardInput) {
  const storeFilter = storeId ? [eq(stores.id, storeId)] : [];
  const completedOverviewFilters = [
    eq(stores.adminId, adminId),
    ...storeFilter,
    eq(transactions.status, "completed"),
    gte(transactions.createdAt, overviewFrom),
    lte(transactions.createdAt, overviewTo),
  ];
  const salesFilters = [
    eq(stores.adminId, adminId),
    ...storeFilter,
    eq(transactions.status, "completed"),
    gte(transactions.createdAt, salesFrom),
    lte(transactions.createdAt, salesTo),
  ];
  const ordersFilters = [
    eq(stores.adminId, adminId),
    ...storeFilter,
    gte(transactions.createdAt, ordersFrom),
    lte(transactions.createdAt, ordersTo),
  ];

  const salesDateSql = sql<string>`DATE(${transactions.createdAt})`;
  const ordersDateSql = sql<string>`DATE(${transactions.createdAt})`;

  const [
    totalProductsRows,
    totalCategoriesRows,
    totalCustomersRows,
    overviewOrdersRows,
    overviewRevenueRows,
    overviewProfitRows,
    salesRows,
    orderRows,
  ] = await Promise.all([
    runDbQuery(() =>
      db
        .select({
          count: sql<number>`COUNT(${products.id})`.as("count"),
        })
        .from(products)
        .leftJoin(stores, eq(products.storeId, stores.id))
        .where(and(eq(stores.adminId, adminId), ...storeFilter))
    ),
    runDbQuery(() =>
      db
        .select({
          count: sql<number>`COUNT(${categories.id})`.as("count"),
        })
        .from(categories)
        .leftJoin(stores, eq(categories.storeId, stores.id))
        .where(and(eq(stores.adminId, adminId), ...storeFilter))
    ),
    runDbQuery(() =>
      db
        .select({
          count: sql<number>`COUNT(DISTINCT COALESCE(NULLIF(${userProfiles.phone}, ''), LOWER(${userProfiles.fullName}), CAST(${transactions.id} AS TEXT)))`.as(
            "count"
          ),
        })
        .from(transactions)
        .leftJoin(stores, eq(transactions.storeId, stores.id))
        .leftJoin(userProfiles, eq(transactions.userProfileId, userProfiles.id))
        .where(and(eq(stores.adminId, adminId), ...storeFilter))
    ),
    runDbQuery(() =>
      db
        .select({
          count: sql<number>`COUNT(${transactions.id})`.as("count"),
        })
        .from(transactions)
        .leftJoin(stores, eq(transactions.storeId, stores.id))
        .where(
          and(
            eq(stores.adminId, adminId),
            ...storeFilter,
            gte(transactions.createdAt, overviewFrom),
            lte(transactions.createdAt, overviewTo)
          )
        )
    ),
    runDbQuery(() =>
      db
        .select({
          revenue:
            sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)`.as(
              "revenue"
            ),
        })
        .from(transactions)
        .leftJoin(stores, eq(transactions.storeId, stores.id))
        .where(and(...completedOverviewFilters))
    ),
    runDbQuery(() =>
      db
        .select({
          profit:
            sql<string>`COALESCE(SUM((${transactionItems.price} - COALESCE(${products.productionCost}, 0)) * ${transactionItems.quantity}), 0)`.as(
              "profit"
            ),
        })
        .from(transactionItems)
        .leftJoin(products, eq(transactionItems.productId, products.id))
        .leftJoin(transactions, eq(transactionItems.transactionId, transactions.id))
        .leftJoin(stores, eq(transactions.storeId, stores.id))
        .where(and(...completedOverviewFilters))
    ),
    runDbQuery(() =>
      db
        .select({
          day: salesDateSql.as("day"),
          revenue:
            sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)`.as(
              "revenue"
            ),
        })
        .from(transactions)
        .leftJoin(stores, eq(transactions.storeId, stores.id))
        .where(and(...salesFilters))
        .groupBy(salesDateSql)
        .orderBy(salesDateSql)
    ),
    runDbQuery(() =>
      db
        .select({
          day: ordersDateSql.as("day"),
          count: sql<number>`COUNT(${transactions.id})`.as("count"),
        })
        .from(transactions)
        .leftJoin(stores, eq(transactions.storeId, stores.id))
        .where(and(...ordersFilters))
        .groupBy(ordersDateSql)
        .orderBy(ordersDateSql)
    ),
  ]);

  return {
    overview: {
      totalProducts: Number(totalProductsRows[0]?.count ?? 0),
      totalCategories: Number(totalCategoriesRows[0]?.count ?? 0),
      totalCustomers: Number(totalCustomersRows[0]?.count ?? 0),
      totalOrdersLast30Days: Number(overviewOrdersRows[0]?.count ?? 0),
      totalRevenueLast30Days: overviewRevenueRows[0]?.revenue?.toString() ?? "0",
      totalProfitLast30Days: overviewProfitRows[0]?.profit?.toString() ?? "0",
    },
    salesSeries: salesRows.map((row) => ({
      day: row.day,
      revenue: row.revenue?.toString() ?? "0",
    })),
    orderSeries: orderRows.map((row) => ({
      day: row.day,
      count: Number(row.count ?? 0),
    })),
  };
}
