"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  categoryName: string | null;
}

interface SearchDropdownProps {
  placeholder?: string;
  className?: string;
  products?: Product[];
}

export function SearchDropdown({ placeholder = "Search products...", className, products }: SearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search function
  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const sourceProducts = products ?? [
        {
          id: "1",
          name: "Samsung Galaxy S24",
          price: "15000000",
          imageUrl: "https://via.placeholder.com/100x100?text=S24",
          categoryName: "Smartphones",
        },
        {
          id: "2",
          name: "iPhone 15 Pro",
          price: "20000000",
          imageUrl: "https://via.placeholder.com/100x100?text=iPhone",
          categoryName: "Smartphones",
        },
        {
          id: "3",
          name: "MacBook Pro M3",
          price: "35000000",
          imageUrl: "https://via.placeholder.com/100x100?text=MacBook",
          categoryName: "Laptops",
        },
        {
          id: "4",
          name: "Nike Air Max",
          price: "2500000",
          imageUrl: "https://via.placeholder.com/100x100?text=Nike",
          categoryName: "Shoes",
        },
      ];

      // Filter results based on query
      const filtered = sourceProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.categoryName ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(filtered);
      setIsOpen(filtered.length > 0);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
      imageUrl: product.imageUrl,
      storeId: "default",
    });

    setIsOpen(false);
    setQuery("");
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg border-2">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y">
                {results.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                  >
                    <Link
                      href={`/products/${product.id}`}
                      className="flex flex-1 items-center gap-3 min-w-0"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="relative w-12 h-12 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-primary/70">
                            <span className="text-white font-bold text-xs">
                              {product.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {product.categoryName ?? "Unknown"}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>

                    {/* Add to Cart Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleAddToCart(product, e)}
                      className="flex-shrink-0 text-xs px-2 py-1 h-7"
                    >
                      Add
                    </Button>
                  </div>
                ))}

                {/* View All Results Link */}
                <div className="p-3 border-t bg-muted/30">
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className="block text-center text-sm text-primary hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    View all results for "{query}"
                  </Link>
                </div>
              </div>
            ) : query && !isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <p className="text-sm">No products found for "{query}"</p>
                <p className="text-xs mt-1">Try different keywords</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}