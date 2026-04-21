import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStoresForUser } from "@/lib/services/store.service";

export async function GET() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ stores: [] }, { status: 401 });
  }

  const stores = await getStoresForUser(clerkUser.id);

  return NextResponse.json({
    stores: stores.map((store) => ({
      id: store.id || "",
      name: store.name || "",
    })),
  });
}
