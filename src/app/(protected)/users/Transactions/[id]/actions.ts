"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/cache/userCache";
import {
  addTransactionItemService,
  completeTransactionService,
} from "@/lib/services/transaction.service";

export async function addTransactionItem(formData: FormData) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const dbUser = await getUser(clerkUser.id);
  const isAdmin = dbUser?.role === "admin";

  const transactionId = formData.get("transactionId");
  const productId = formData.get("productId");
  const quantityValue = formData.get("quantity");

  if (!transactionId || typeof transactionId !== "string") {
    throw new Error("Missing transaction ID.");
  }

  if (!productId || typeof productId !== "string") {
    throw new Error("Missing product ID.");
  }

  const quantity = Number(quantityValue?.toString() ?? "0");
  if (Number.isNaN(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive number.");
  }

  await addTransactionItemService(
    transactionId,
    productId,
    quantity,
    clerkUser.id,
    isAdmin
  );

  revalidatePath(`/users/Transactions/${transactionId}`);
  revalidatePath("/users/Transactions");
}

export async function completeTransaction(formData: FormData) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const dbUser = await getUser(clerkUser.id);
  const isAdmin = dbUser?.role === "admin";

  const transactionId = formData.get("transactionId");

  if (!transactionId || typeof transactionId !== "string") {
    throw new Error("Missing transaction ID.");
  }

  await completeTransactionService(transactionId, clerkUser.id, isAdmin);

  revalidatePath(`/users/Transactions/${transactionId}`);
  revalidatePath("/users/Transactions");
}
