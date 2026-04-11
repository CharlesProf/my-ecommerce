"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
  imageUrl: string | null;
  productCount: number;
};

type Product = {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  categoryName: string;
};

export function HomePageClient({
  topCategories,
  featuredProducts,
}: {
  topCategories: Category[];
  featuredProducts: Product[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (categoriesRef.current) observer.observe(categoriesRef.current);
    if (carouselRef.current) observer.observe(carouselRef.current);

    return () => observer.disconnect();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <section
        ref={heroRef}
        className="relative min-h-[70vh] flex items-center justify-center px-4 py-20 overflow-hidden bg-gradient-to-br from-background via-background to-muted"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground">
                Discover
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary">
                Amazing Products
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Search through thousands of products and categories
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
              <div className="relative flex items-center bg-background border-2 border-border rounded-2xl shadow-lg overflow-hidden group-hover:border-primary/50 transition-colors">
                <Input
                  type="text"
                  placeholder="Search for products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0 text-lg px-6 py-7 bg-transparent"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="m-2 rounded-xl"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Top Categories Section */}
      <section
        ref={categoriesRef}
        className="max-w-7xl mx-auto px-4 py-20 opacity-0 translate-y-10 transition-all duration-1000"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Top Categories
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {topCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="group"
              style={{
                animation: mounted ? `slide-up 0.6s ease-out ${index * 0.1}s both` : "none",
              }}
            >
              <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-2xl font-bold">
                          {category.name.charAt(0)}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4 bg-card">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.productCount} products
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section
        ref={carouselRef}
        className="max-w-7xl mx-auto px-4 py-20 opacity-0 translate-y-10 transition-all duration-1000"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured Products
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full" />
        </div>

        {/* Auto-scrolling Carousel */}
        <div className="relative overflow-hidden py-4">
          <div className="flex gap-6 animate-scroll-left hover:pause">
            {/* Duplicate products for seamless loop */}
            {[...featuredProducts, ...featuredProducts].map((product, index) => (
              <Link
                key={`${product.id}-${index}`}
                href={`/products/${product.id}`}
                className="flex-shrink-0 w-[300px] group"
              >
                <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl">
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-3xl font-bold">
                            {product.name.charAt(0)}
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-background/90 backdrop-blur-sm border rounded-full text-xs font-semibold">
                          {product.categoryName}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-card space-y-2">
                      <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-primary">
                          {formatPrice(product.price)}
                        </p>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="relative rounded-3xl overflow-hidden border-2 border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/90" />
          <div className="relative p-12 text-center text-primary-foreground space-y-6">
            <h2 className="text-4xl font-bold">Ready to Start Shopping?</h2>
            <p className="text-xl opacity-90">
              Browse our full collection of amazing products
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 rounded-xl font-semibold"
              onClick={() => (window.location.href = "/products")}
            >
              Explore All Products
            </Button>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out both;
        }

        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }

        .animate-scroll-left:hover {
          animation-play-state: paused;
        }

        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
