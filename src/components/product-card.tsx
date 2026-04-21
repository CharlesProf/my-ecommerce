"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { useCart } from "@/context/cart-context";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  priceSales?: string | null;
  isSales?: boolean;
  imageUrl: string | null;
  categoryName?: string | null;
  description?: string;
  showAddToCart?: boolean;
  storeId?: string;
}

export function ProductCard({
  id,
  name,
  price,
  priceSales = null,
  isSales = false,
  imageUrl,
  categoryName,
  showAddToCart = true,
  storeId = "default",
}: ProductCardProps) {
  const { addItem } = useCart();
  const displayPrice = isSales && priceSales ? parseFloat(priceSales) : parseFloat(price);
  const originalPrice = parseFloat(price);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id,
      name,
      price: displayPrice,
      quantity: 1,
      imageUrl,
      storeId,
    });
  };

  return (
    <Link href={`/products/${id}`} className="group h-full">
      <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl h-full flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-3xl font-bold">
                  {name.charAt(0)}
                </div>
              </div>
            )}
            {categoryName && (
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                <span className="px-3 py-1 bg-background/90 backdrop-blur-sm border rounded-full text-xs font-semibold">
                  {categoryName}
                </span>
                {isSales && priceSales && (
                  <span className="px-2 py-1 bg-red-600 text-white text-[11px] font-semibold uppercase rounded-full">
                    Sale
                  </span>
                )}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content Container */}
          <div className="p-4 bg-card flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {name}
              </h3>
              <div className="mt-2">
                {isSales && priceSales ? (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground line-through">
                      {formatPrice(originalPrice)}
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatPrice(displayPrice)}
                    </p>
                  </div>
                ) : (
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(displayPrice)}
                  </p>
                )}
              </div>
            </div>

            {showAddToCart && (
              <Button
                onClick={handleAddToCart}
                className="w-full mt-4 rounded-lg gap-2"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
