import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { searchCustomersForCheckout } from "@/lib/services/transaction.service";

export async function GET(request: Request) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId") ?? "";
  const query = searchParams.get("query") ?? "";

  if (!storeId || !query.trim()) {
    return NextResponse.json({ customers: [] });
  }

  try {
    const customers = await searchCustomersForCheckout(
      clerkUser.id,
      storeId,
      query
    );

    return NextResponse.json({ customers });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to search customers" },
      { status: 400 }
    );
  }
}
