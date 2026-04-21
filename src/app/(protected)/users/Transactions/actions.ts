"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cancelTransactionService } from "@/lib/services/transaction.service";
import { revalidatePath } from "next/cache";

export async function cancelTransaction(formData: FormData) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkUser.id))
    .limit(1);

  if (!dbUser) {
    throw new Error("Unauthorized");
  }

  const transactionId = formData.get("transactionId");

  if (!transactionId || typeof transactionId !== "string") {
    throw new Error("Missing transaction ID.");
  }

  await cancelTransactionService(
    transactionId,
    clerkUser.id,
    dbUser.role === "admin"
  );

  revalidatePath("/users/Transactions");
}
