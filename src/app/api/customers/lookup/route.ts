import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { findCustomerByPhone } from "@/lib/services/transaction.service";

export async function GET(request: Request) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone") ?? "";

  if (!phone.trim()) {
    return NextResponse.json({ customer: null });
  }

  const customer = await findCustomerByPhone(phone);

  return NextResponse.json({ customer });
}
