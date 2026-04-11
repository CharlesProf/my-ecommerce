import { ProductsListPage } from "@/components/products-list-page";
import { getFeaturedProducts } from "@/lib/services/home.service";

export default async function FeaturedProductsPage() {
  const products = await getFeaturedProducts(24);

  return (
    <ProductsListPage
      title="Featured Products"
      subtitle="Top items launched in the last 6 months with high customer interest."
      products={products}
    />
  );
}
