import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { stores, transactions, userProfiles } from "@/lib/db/schema";
import { runDbQuery } from "@/lib/db/query-retry";

type AdminCustomersInput = {
  adminId: string;
  storeId?: string;
  search?: string;
  page: number;
  pageSize: number;
};

function getLeadStatus(totalOrders: number, lastPurchaseAt: string | null) {
  if (!lastPurchaseAt) {
    return "new";
  }

  const lastPurchase = new Date(lastPurchaseAt);
  const daysSincePurchase = Math.floor(
    (Date.now() - lastPurchase.getTime()) / 86_400_000
  );

  if (totalOrders >= 3 && daysSincePurchase <= 30) {
    return "vip";
  }

  if (totalOrders > 1 && daysSincePurchase <= 45) {
    return "repeat";
  }

  if (daysSincePurchase > 60) {
    return "dormant";
  }

  return "active";
}

export async function getAdminCustomersPageData({
  adminId,
  storeId,
  search,
  page,
  pageSize,
}: AdminCustomersInput) {
  const normalizedPhoneSql =
    sql<string>`regexp_replace(COALESCE(${userProfiles.phone}, ''), '\D', '', 'g')`;

  const rows = await runDbQuery(() =>
    db
      .select({
        normalizedPhone: normalizedPhoneSql.as("normalized_phone"),
        fullName:
          sql<string>`MAX(${userProfiles.fullName})`.as("full_name"),
        phone: sql<string>`MAX(${userProfiles.phone})`.as("phone"),
        address:
          sql<string>`MAX(COALESCE(${userProfiles.address}, ''))`.as("address"),
        totalOrders:
          sql<number>`COUNT(DISTINCT ${transactions.id})`.as("total_orders"),
        completedOrders:
          sql<number>`COUNT(DISTINCT CASE WHEN ${transactions.status} = 'completed' THEN ${transactions.id} END)`.as(
            "completed_orders"
          ),
        totalSpent:
          sql<string>`COALESCE(SUM(CASE WHEN ${transactions.status} = 'completed' THEN ${transactions.totalAmount} ELSE 0 END), 0)`.as(
            "total_spent"
          ),
        lastPurchaseAt:
          sql<string | null>`MAX(${transactions.createdAt})`.as(
            "last_purchase_at"
          ),
        storeCount:
          sql<number>`COUNT(DISTINCT ${userProfiles.storeId})`.as("store_count"),
      })
      .from(userProfiles)
      .leftJoin(stores, eq(userProfiles.storeId, stores.id))
      .leftJoin(transactions, eq(transactions.userProfileId, userProfiles.id))
      .where(
        and(
          eq(stores.adminId, adminId),
          ...(storeId ? [eq(stores.id, storeId)] : [])
        )
      )
      .groupBy(normalizedPhoneSql)
  );

  const normalizedSearch = search?.trim().toLowerCase() ?? "";
  const filteredRows = rows
    .filter((row) => row.normalizedPhone)
    .filter((row) => {
      if (!normalizedSearch) {
        return true;
      }

      return [
        row.fullName,
        row.phone,
        row.address,
        row.normalizedPhone,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    })
    .sort((left, right) => {
      const rightTime = right.lastPurchaseAt
        ? new Date(right.lastPurchaseAt).getTime()
        : 0;
      const leftTime = left.lastPurchaseAt
        ? new Date(left.lastPurchaseAt).getTime()
        : 0;

      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }

      return Number(right.totalOrders ?? 0) - Number(left.totalOrders ?? 0);
    });

  const customers = filteredRows.map((row) => ({
    id: row.normalizedPhone,
    fullName: row.fullName ?? "Unknown Customer",
    phone: row.phone ?? row.normalizedPhone,
    address: row.address ?? "",
    totalOrders: Number(row.totalOrders ?? 0),
    completedOrders: Number(row.completedOrders ?? 0),
    totalSpent: row.totalSpent?.toString() ?? "0",
    lastPurchaseAt: row.lastPurchaseAt ?? null,
    storeCount: Number(row.storeCount ?? 0),
    leadStatus: getLeadStatus(
      Number(row.totalOrders ?? 0),
      row.lastPurchaseAt ?? null
    ),
  }));

  const totalCount = customers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paginatedCustomers = customers.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  return {
    customers: paginatedCustomers,
    summary: {
      totalCustomers: totalCount,
      repeatCustomers: customers.filter((customer) => customer.totalOrders > 1)
        .length,
      reachableCustomers: customers.filter((customer) => customer.phone.trim())
        .length,
      customersWithAddress: customers.filter((customer) => customer.address.trim())
        .length,
    },
    pagination: {
      page: safePage,
      pageSize,
      totalCount,
      totalPages,
    },
  };
}
