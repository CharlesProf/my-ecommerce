import { HomePageClient } from "./home-page-client";
import { getTopCategories, getFeaturedProducts } from "@/lib/services/home.service";

export default async function HomePage() {
  const [topCategories, featuredProducts] = await Promise.all([
    getTopCategories(5),
    getFeaturedProducts(5),
  ]);

  return (
    <HomePageClient
      topCategories={topCategories}
      featuredProducts={featuredProducts}
    />
  );
}
