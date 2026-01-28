"use client";

import { useState } from "react";
import { Package, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddProductDialog } from "./add-product-dialog";
import { deleteProduct, toggleProductStatus } from "../../../api/product/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { EditProductDialog } from "./edit-product-dialog";

type Store = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  productionCost: string | null;
  stock: number | null;
  imageUrl: string | null;
  sku: string | null;
  isActive: number | null;
  storeId: string | null;
  storeName: string | null;
  subcategoryId: string | null;
  subcategoryName: string | null;
  categoryName: string | null;
  createdAt: string | null;
};

type Category = {
  id: string;
  name: string;
  storeId: string | null;
  storeName: string | null;
};

type Subcategory = {
  id: string;
  name: string;
  categoryId: string | null;
};

export function ProductsClient({
  stores,
  products,
  categories,
  subcategories,
}: {
  stores: Store[];
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const router = useRouter();
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const selectedStoreName = selectedStore
    ? stores.find(s => s.id === selectedStore)?.name || "Select a Store"
    : "Select a Store";

  // Filter products by selected store
  const filteredProducts = selectedStore
    ? products.filter((product) => product.storeId === selectedStore)
    : [];

  
  const handleDelete = async (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      setDeletingId(productId);
      try {
        await deleteProduct(productId);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("Failed to delete product. Please try again.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleStatus = async (productId: string) => {
    setTogglingId(productId);
    try {
      await toggleProductStatus(productId);
      router.refresh();
    } finally {
      setTogglingId(null);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };


  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IDR',
    }).format(parseFloat(price));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory
          </p>
        </div>
      </div>

      {/* Store Selector */}
      {stores.length > 0 ? (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Select Store: *</label>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardHeader className="text-center py-8">
            <CardTitle>No stores yet</CardTitle>
            <CardDescription>
              You need to create a store first before adding products.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button onClick={() => window.location.href = '/admin/shops'}>
              Go to Shops
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      {selectedStore && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Products in {selectedStoreName}</CardTitle>
                <CardDescription>
                  Manage products for this store
                </CardDescription>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started by adding your first product.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Package className="mr-2 h-4 w-4" />
                  Add First Product
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={50}
                            height={50}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-[50px] h-[50px] bg-muted rounded flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.sku && (
                            <p className="text-xs text-muted-foreground">
                              SKU: {product.sku}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {product.categoryName && (
                            <p className="font-medium">{product.categoryName}</p>
                          )}
                          {product.subcategoryName && (
                            <p className="text-muted-foreground">{product.subcategoryName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          (product.stock || 0) > 10 ? "default" :
                          (product.stock || 0) > 0 ? "secondary" : "destructive"
                        }>
                          {product.stock || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(product.id)}
                        >
                          {product.isActive === 1 ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deletingId === product.id}
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Product Dialog */}
      <AddProductDialog
        stores={stores}
        categories={categories}
        subcategories={subcategories}
        selectedStore={selectedStore}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

       {/* Edit Product Dialog */}
      <EditProductDialog
        product={selectedProduct}
        stores={stores}
        categories={categories}
        subcategories={subcategories}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

    </div>
  );
}
