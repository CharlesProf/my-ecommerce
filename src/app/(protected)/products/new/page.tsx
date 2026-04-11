import { ProductsListPage } from "@/components/products-list-page";
import { getNewArrivals } from "@/lib/services/home.service";

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(24);

  return (
    <ProductsListPage
      title="New Arrivals"
      subtitle="Fresh products added in the last 3 months. Explore the newest arrivals first."
      products={products}
    />
  );
}
