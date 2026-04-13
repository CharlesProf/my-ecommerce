import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomePageClient } from "./home-page-client";
import { getTopCategories, getFeaturedProducts } from "@/lib/services/home.service";
import { getStoresForUser } from "@/lib/services/store.service";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string }> | { storeId?: string };
}) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = await searchParams;
  const storeId = resolvedSearchParams?.storeId ?? "";

  const [topCategories, featuredProducts, stores] = await Promise.all([
    getTopCategories(5),
    getFeaturedProducts(5, storeId),
    getStoresForUser(clerkUser.id),
  ]);

  const serializedStores = stores.map((store) => ({
    id: store.id || "",
    name: store.name || "",
  }));

  return (
    <HomePageClient
      topCategories={topCategories}
      featuredProducts={featuredProducts}
      stores={serializedStores}
      initialStoreId={storeId || serializedStores[0]?.id || ""}
    />
  );
}
