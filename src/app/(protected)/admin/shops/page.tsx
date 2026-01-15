import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { stores, users } from "@/lib/db/schema";
import { eq, and, like, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ShopsClient } from "./shops-client";
import { getAdminUser } from "@/lib/cache/userCache";
import { findStoreService } from "@/lib/services/store.service";

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>; // Changed type to Promise
}) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await getAdminUser(clerkUser.id);

  if (!dbUser || dbUser.role !== "admin") {
    redirect("/");
  }

  // Await searchParams before accessing properties
  const params = await searchParams;
  const searchTerm = params.search || "";
  

  let userStores = await findStoreService(
  clerkUser.id,
  searchTerm
);

  // Convert dates to ISO strings to prevent hydration mismatch
  const serializedStores = userStores.map(store => ({
    ...store,
    createdAt: store.createdAt ? store.createdAt.toISOString() : null,
  }));

  return <ShopsClient stores={serializedStores} />;
}
