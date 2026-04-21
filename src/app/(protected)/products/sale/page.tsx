import { ProductsListPage } from "@/components/products-list-page";
import { getSaleProducts } from "@/lib/services/home.service";

export default async function SaleProductsPage() {
  const products = await getSaleProducts(24);

  return (
    <ProductsListPage
      title="Sale Products"
      subtitle="Grab the best deals: products currently on sale with special pricing."
      products={products}
      emptyMessage="No sale items are available right now. Check back soon for new discounts."
    />
  );
}
