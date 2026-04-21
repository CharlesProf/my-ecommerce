import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createTransactionService } from "@/lib/services/transaction.service";

export async function POST(request: Request) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();

  try {
    await createTransactionService({
      userId: clerkUser.id,
      storeId: payload.storeId,
      fullName: payload.fullName,
      phone: payload.phone,
      address: payload.address ?? null,
      paymentMethod: payload.paymentMethod,
      status: payload.status,
      items: payload.items,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create transaction" },
      { status: 400 }
    );
  }
}
