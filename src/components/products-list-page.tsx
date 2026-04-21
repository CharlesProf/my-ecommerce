import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: string;
  priceSales?: string | null;
  isSales?: number | null;
  imageUrl: string | null;
  categoryName: string | null;
};

interface ProductsListPageProps {
  title: string;
  subtitle: string;
  products: Product[];
  emptyMessage?: string;
}

export function ProductsListPage({
  title,
  subtitle,
  products,
  emptyMessage = "No products available right now.",
}: ProductsListPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col gap-4 mb-12 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-primary font-semibold">
          {title}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground">
          {subtitle}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-muted/50 bg-muted/20 p-12 text-center">
          <p className="text-lg font-semibold text-muted-foreground">
            {emptyMessage}
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/users/home">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              priceSales={product.priceSales}
              isSales={product.isSales === 1}
              imageUrl={product.imageUrl}
              categoryName={product.categoryName}
              showAddToCart={true}
            />
          ))}
        </div>
      )}

      <div className="mt-12 flex justify-center">
        <Link href="/users/home">
          <Button variant="secondary" className="gap-2">
            Back to Home
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
