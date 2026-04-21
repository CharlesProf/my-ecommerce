"use client";

import { useState, useEffect, useRef } from "react";
import { SearchDropdown } from "@/components/search-dropdown";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { CategoryCard } from "@/components/category-card";
import { ChevronRight, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

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
  priceSales?: string | null;
  isSales?: number | null;
  imageUrl: string | null;
  categoryName: string | null;
  storeId?: string | null;
};

type StoreOption = {
  id: string;
  name: string;
};

interface HomePageClientProps {
  topCategories: Category[];
  featuredProducts: Product[];
  stores: StoreOption[];
  initialStoreId?: string;
}

export function HomePageClient({
  topCategories,
  featuredProducts,
  stores,
  initialStoreId,
}: HomePageClientProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedStoreId, setSelectedStoreId] = useState(
    initialStoreId || ""
  );

  const heroRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  // Setup intersection observer for animations
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

    [categoriesRef.current, productsRef.current].forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Filter products by selected categories and selected store
  const filteredProducts = featuredProducts.filter((product) => {
    const matchesCategory =
      selectedCategories.size === 0 ||
      (product.categoryName && selectedCategories.has(product.categoryName));
    const matchesStore =
      !selectedStoreId || product.storeId === selectedStoreId;

    return matchesCategory && matchesStore;
  });

  // Toggle category selection
  const toggleCategory = (categoryName: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryName)) {
      newSelected.delete(categoryName);
    } else {
      newSelected.add(categoryName);
    }
    setSelectedCategories(newSelected);
  };

  // Get unique category names from products
  const productCategories = Array.from(
    new Set(featuredProducts.map((p) => p.categoryName).filter(Boolean))
  ).sort() as string[];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <section
        ref={heroRef}
        className="relative min-h-[70vh] flex items-center justify-center px-4 py-20 overflow-hidden bg-gradient-to-br from-background via-background to-muted"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground">
                Discover
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary">
                Amazing Products
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Shop from our extensive collection of quality products
            </p>
          </div>

          {/* Search Bar */}
          <div
            className="max-w-2xl mx-auto animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
              <div className="relative">
                <SearchDropdown
                  placeholder="Search products..."
                  className="w-full"
                  products={filteredProducts}
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Top Categories Section */}
      <section
        ref={categoriesRef}
        className="max-w-7xl mx-auto px-4 py-20 opacity-0 translate-y-10 transition-all duration-1000"
      >
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Top Categories
            </h2>
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {topCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                imageUrl={category.imageUrl}
                productCount={category.productCount}
                isAnimated={mounted}
                animationDelay={`${index * 0.1}s`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section
        ref={productsRef}
        className="max-w-7xl mx-auto px-4 py-20 opacity-0 translate-y-10 transition-all duration-1000"
      >
        <div className="space-y-8">
          {/* Header with Category Filter */}
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Featured Products
              </h2>
              <div className="w-24 h-1.5 bg-primary mx-auto rounded-full" />
            </div>

            {/* Category Filter Dropdown (Tokopedia Style) */}
            {productCategories.length > 0 && (
              <div className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 rounded-full px-6 py-6 border-2 font-semibold hover:border-primary"
                    >
                      <span>
                        {selectedCategories.size > 0
                          ? `${selectedCategories.size} selected`
                          : "Filter by Category"}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-64">
                    <DropdownMenuLabel className="font-bold">
                      Filter Categories
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {productCategories.map((category) => (
                      <DropdownMenuCheckboxItem
                        key={category}
                        checked={selectedCategories.has(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      >
                        {category}
                      </DropdownMenuCheckboxItem>
                    ))}
                    {selectedCategories.size > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCategories(new Set())}
                          className="w-full justify-center text-xs mt-2"
                        >
                          Clear Filters
                        </Button>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  style={{
                    animation: mounted
                      ? `slide-up 0.6s ease-out ${index * 0.05}s both`
                      : "none",
                  }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    priceSales={product.priceSales}
                    isSales={product.isSales === 1}
                    imageUrl={product.imageUrl}
                    categoryName={product.categoryName}
                    showAddToCart={true}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center py-20">
                <div className="text-center space-y-4">
                  <p className="text-lg text-muted-foreground font-medium">
                    No products found in selected categories
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategories(new Set())}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* View All Products Link */}
          <div className="flex justify-center pt-8">
            <Link href="/products">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                View All Products
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="relative rounded-3xl overflow-hidden border-2 border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/90" />
          <div className="relative p-8 md:p-12 text-center text-primary-foreground space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Start Shopping?
            </h2>
            <p className="text-lg md:text-xl opacity-90">
              Explore our full collection of amazing products
            </p>
            <Link href="/products">
              <Button
                size="lg"
                variant="secondary"
                className="text-base md:text-lg px-6 md:px-8 py-6 rounded-xl font-semibold"
              >
                Explore All Products
              </Button>
            </Link>
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
