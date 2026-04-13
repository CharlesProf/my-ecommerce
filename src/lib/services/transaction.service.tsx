import { db } from "@/lib/db";
import { eq, desc, and, gt, sql } from "drizzle-orm";
import {
  products,
  stores,
  transactions,
  transactionItems,
  userProfiles,
} from "@/lib/db/schema";
import { runDbQuery } from "@/lib/db/query-retry";

export type CheckoutCartItem = {
  productId: string;
  quantity: number;
  price: number;
};

type CreateTransactionInput = {
  userId: string;
  storeId: string;
  fullName: string;
  phone: string;
  address?: string | null;
  paymentMethod: string;
  status: string;
  items: CheckoutCartItem[];
};

const VALID_PAYMENT_METHODS = ["QRIS", "Bank Transfer", "Card"];
const VALID_TRANSACTION_STATUSES = ["pending", "completed"];

export async function createTransactionService(data: CreateTransactionInput) {
  if (!data.items || data.items.length === 0) {
    throw new Error("Cart must contain at least one item.");
  }

  if (!VALID_PAYMENT_METHODS.includes(data.paymentMethod)) {
    throw new Error("Invalid payment method.");
  }

  if (!VALID_TRANSACTION_STATUSES.includes(data.status)) {
    throw new Error("Invalid transaction status.");
  }

  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const created = await db.transaction(async (tx) => {
    const [profile] = await tx
      .insert(userProfiles)
      .values({
        userId: data.userId,
        storeId: data.storeId,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address ?? null,
      })
      .returning({ id: userProfiles.id });

    if (!profile?.id) {
      throw new Error("Failed to create customer profile.");
    }

    const [transaction] = await tx
      .insert(transactions)
      .values({
        userId: data.userId,
        storeId: data.storeId,
        userProfileId: profile.id,
        totalAmount: totalAmount.toFixed(2),
        status: data.status,
        paymentMethod: data.paymentMethod,
      })
      .returning({ id: transactions.id });

    if (!transaction?.id) {
      throw new Error("Failed to create transaction.");
    }

    const transactionItemRecords = [] as Array<{
      transactionId: string;
      productId: string;
      quantity: number;
      price: string;
    }>;

    for (const item of data.items) {
      const [product] = await tx
        .select({ stock: products.stock })
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stock === null || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }

      await tx
        .update(products)
        .set({ stock: product.stock - item.quantity })
        .where(eq(products.id, item.productId));

      transactionItemRecords.push({
        transactionId: transaction.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toFixed(2),
      });
    }

    await tx.insert(transactionItems).values(transactionItemRecords);

    return {
      transactionId: transaction.id,
      totalAmount: totalAmount.toFixed(2),
    };
  });

  return created;
}

export async function getTransactionsForUser(
  userId: string,
  isAdmin: boolean,
  storeId?: string
) {
  const conditions = [] as Array<ReturnType<typeof eq>>;

  if (storeId) {
    conditions.push(eq(transactions.storeId, storeId));
  } else if (!isAdmin) {
    conditions.push(eq(transactions.userId, userId));
  }

  const rows = await runDbQuery(() =>
    db
      .select({
        id: transactions.id,
        status: transactions.status,
        paymentMethod: transactions.paymentMethod,
        totalAmount: transactions.totalAmount,
        createdAt: transactions.createdAt,
        storeName: stores.name,
        customerName: userProfiles.fullName,
        customerPhone: userProfiles.phone,
      })
      .from(transactions)
      .leftJoin(stores, eq(transactions.storeId, stores.id))
      .leftJoin(userProfiles, eq(transactions.userProfileId, userProfiles.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(transactions.createdAt))
  );

  return rows.map((transaction) => ({
    id: transaction.id,
    status: transaction.status,
    paymentMethod: transaction.paymentMethod,
    totalAmount: transaction.totalAmount?.toString() ?? "0",
    createdAt: transaction.createdAt?.toISOString() ?? null,
    storeName: transaction.storeName ?? "-",
    customerName: transaction.customerName ?? "-",
    customerPhone: transaction.customerPhone ?? "-",
  }));
}

export async function getTransactionCountForUser(
  userId: string,
  isAdmin: boolean,
  storeId?: string
) {
  const conditions = [] as Array<ReturnType<typeof eq>>;

  if (storeId) {
    conditions.push(eq(transactions.storeId, storeId));
  } else if (!isAdmin) {
    conditions.push(eq(transactions.userId, userId));
  }

  const [countResult] = await db
    .select({ count: sql`COUNT(${transactions.id})`.as("count") })
    .from(transactions)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return Number(countResult.count ?? 0);
}

export async function getTransactionDetails(
  transactionId: string,
  userId: string,
  isAdmin: boolean
) {
  const [transaction] = await runDbQuery(() =>
    db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        storeId: transactions.storeId,
        status: transactions.status,
        paymentMethod: transactions.paymentMethod,
        totalAmount: transactions.totalAmount,
        createdAt: transactions.createdAt,
        storeName: stores.name,
        customerName: userProfiles.fullName,
        customerPhone: userProfiles.phone,
      })
      .from(transactions)
      .leftJoin(stores, eq(transactions.storeId, stores.id))
      .leftJoin(userProfiles, eq(transactions.userProfileId, userProfiles.id))
      .where(eq(transactions.id, transactionId))
      .limit(1)
  );

  if (!transaction) {
    return null;
  }

  if (!isAdmin && transaction.userId !== userId) {
    return null;
  }

  const items = await db
    .select({
      productId: transactionItems.productId,
      productName: products.name,
      quantity: transactionItems.quantity,
      price: transactionItems.price,
    })
    .from(transactionItems)
    .leftJoin(products, eq(transactionItems.productId, products.id))
    .where(eq(transactionItems.transactionId, transactionId));

  return {
    ...transaction,
    totalAmount: transaction.totalAmount?.toString() ?? "0",
    createdAt: transaction.createdAt?.toISOString() ?? null,
    storeId: transaction.storeId ?? "",
    storeName: transaction.storeName ?? "-",
    customerName: transaction.customerName ?? "-",
    customerPhone: transaction.customerPhone ?? "-",
    items: items.map((item) => ({
      productId: item.productId ?? "",
      productName: item.productName ?? "-",
      quantity: item.quantity ?? 0,
      price: item.price?.toString() ?? "0",
    })),
  };
}

export async function getAvailableProductsForStore(storeId: string) {
  const productsForStore = await runDbQuery(() =>
    db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
      })
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          eq(products.isActive, 1),
          gt(products.stock, 0)
        )
      )
      .orderBy(desc(products.createdAt))
  );

  return productsForStore.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price.toString(),
    stock: product.stock ?? 0,
  }));
}

export async function addTransactionItemService(
  transactionId: string,
  productId: string,
  quantity: number,
  currentUserId: string,
  isAdmin: boolean
) {
  if (quantity <= 0) {
    throw new Error("Quantity must be at least 1.");
  }

  await db.transaction(async (tx) => {
    const [transaction] = await tx
      .select({
        id: transactions.id,
        userId: transactions.userId,
        status: transactions.status,
        totalAmount: transactions.totalAmount,
        storeId: transactions.storeId,
      })
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (!transaction) {
      throw new Error("Transaction not found.");
    }

    if (!isAdmin && transaction.userId !== currentUserId) {
      throw new Error("Forbidden");
    }

    if (transaction.status !== "pending") {
      throw new Error("Only pending transactions can be edited.");
    }

    const [product] = await tx
      .select({
        price: products.price,
        stock: products.stock,
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      throw new Error("Product not found.");
    }

    if (product.stock === null || product.stock < quantity) {
      throw new Error("Insufficient stock for the selected product.");
    }

    const [existingItem] = await tx
      .select({
        id: transactionItems.id,
        quantity: transactionItems.quantity,
        price: transactionItems.price,
      })
      .from(transactionItems)
      .where(
        and(
          eq(transactionItems.transactionId, transactionId),
          eq(transactionItems.productId, productId)
        )
      )
      .limit(1);

    if (existingItem) {
      await tx
        .update(transactionItems)
        .set({ quantity: existingItem.quantity + quantity })
        .where(eq(transactionItems.id, existingItem.id));
    } else {
      await tx.insert(transactionItems).values({
        transactionId,
        productId,
        quantity,
        price: Number(product.price).toFixed(2),
      });
    }

    await tx
      .update(products)
      .set({ stock: product.stock - quantity })
      .where(eq(products.id, productId));

    const updatedTotal =
      parseFloat(transaction.totalAmount ?? "0") +
      Number(product.price) * quantity;

    await tx
      .update(transactions)
      .set({ totalAmount: updatedTotal.toFixed(2) })
      .where(eq(transactions.id, transactionId));
  });
}

export async function completeTransactionService(
  transactionId: string,
  currentUserId: string,
  isAdmin: boolean
) {
  const [transaction] = await db
    .select({
      id: transactions.id,
      userId: transactions.userId,
      status: transactions.status,
    })
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1);

  if (!transaction) {
    throw new Error("Transaction not found.");
  }

  if (!isAdmin && transaction.userId !== currentUserId) {
    throw new Error("Forbidden");
  }

  if (transaction.status !== "pending") {
    throw new Error("Only pending transactions can be completed.");
  }

  await db
    .update(transactions)
    .set({ status: "completed" })
    .where(eq(transactions.id, transactionId));
}

export async function cancelTransactionService(
  transactionId: string,
  currentUserId: string,
  isAdmin: boolean
) {
  const [transaction] = await db
    .select({
      id: transactions.id,
      status: transactions.status,
      userId: transactions.userId,
    })
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1);

  if (!transaction) {
    throw new Error("Transaction not found.");
  }

  if (!isAdmin && transaction.userId !== currentUserId) {
    throw new Error("Forbidden");
  }

  if (transaction.status === "cancelled") {
    return { cancelled: false };
  }

  await db.transaction(async (tx) => {
    const items = await tx
      .select({
        productId: transactionItems.productId,
        quantity: transactionItems.quantity,
      })
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId));

    for (const item of items) {
      if (!item.productId) {
        continue;
      }

      const [product] = await tx
        .select({ stock: products.stock })
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (!product || product.stock === null) {
        continue;
      }

      await tx
        .update(products)
        .set({ stock: product.stock + item.quantity })
        .where(eq(products.id, item.productId));
    }

    await tx
      .update(transactions)
      .set({ status: "cancelled" })
      .where(eq(transactions.id, transactionId));
  });

  return { cancelled: true };
}
