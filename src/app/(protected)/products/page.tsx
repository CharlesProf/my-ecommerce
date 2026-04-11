import { ProductsListPage } from "@/components/products-list-page";
import { getAllProducts } from "@/lib/services/home.service";

export default async function ProductsPage() {
  const products = await getAllProducts(24);

  return (
    <ProductsListPage
      title="All Products"
      subtitle="Browse all active products from our store collection."
      products={products}
    />
  );
}
