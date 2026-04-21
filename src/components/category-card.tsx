"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  productCount: number;
  isAnimated?: boolean;
  animationDelay?: string;
}

export function CategoryCard({
  id,
  name,
  imageUrl,
  productCount,
  isAnimated = false,
  animationDelay = "0s",
}: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${id}`}
      className="group"
      style={{
        animation: isAnimated ? `slide-up 0.6s ease-out ${animationDelay} both` : "none",
      }}
    >
      <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full">
        <CardContent className="p-0">
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
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {name.charAt(0)}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content Container */}
          <div className="p-4 bg-card">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {productCount} {productCount === 1 ? "product" : "products"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
