"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProduct } from "../../../api/product/actions";

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
  subcategoryId: string | null;
};

type Store = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
  storeId: string | null;
};

type Subcategory = {
  id: string;
  name: string;
  categoryId: string | null;
};

export function EditProductDialog({
  product,
  stores,
  categories,
  subcategories,
  open,
  onOpenChange,
}: {
  product: Product | null;
  stores: Store[];
  categories: Category[];
  subcategories: Subcategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    productionCost: "",
    stock: "",
    imageUrl: "",
    sku: "",
    storeId: "",
    subcategoryId: "",
  });

  // Update form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        productionCost: product.productionCost || "",
        stock: product.stock?.toString() || "",
        imageUrl: product.imageUrl || "",
        sku: product.sku || "",
        storeId: product.storeId || "",
        subcategoryId: product.subcategoryId || "",
      });
    }
  }, [product]);

  // Filter categories based on selected store
  const filteredCategories = formData.storeId
    ? categories.filter((cat) => cat.storeId === formData.storeId)
    : [];

  // Filter subcategories based on selected category
  const selectedCategory = filteredCategories.find(
    (cat) => cat.id === subcategories.find((sub) => sub.id === formData.subcategoryId)?.categoryId
  );

  const filteredSubcategories = selectedCategory
    ? subcategories.filter((sub) => sub.categoryId === selectedCategory.id)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsLoading(true);

    try {
      await updateProduct({
        productId: product.id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        productionCost: formData.productionCost,
        stock: formData.stock ? parseInt(formData.stock) : null,
        imageUrl: formData.imageUrl,
        sku: formData.sku,
        storeId: formData.storeId,
        subcategoryId: formData.subcategoryId,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to your product details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Product Name */}
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                placeholder="Product name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Product description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Store Selection */}
            <div className="grid gap-2">
              <Label htmlFor="edit-store">Store *</Label>
              <Select
                value={formData.storeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, storeId: value, subcategoryId: "" })
                }
              >
                <SelectTrigger id="edit-store">
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

            {/* Subcategory Selection */}
            <div className="grid gap-2">
              <Label htmlFor="edit-subcategory">Subcategory</Label>
              <Select
                value={formData.subcategoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, subcategoryId: value })
                }
                disabled={!formData.storeId || filteredSubcategories.length === 0}
              >
                <SelectTrigger id="edit-subcategory">
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price and Production Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price (IDR) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-production-cost">Production Cost (IDR)</Label>
                <Input
                  id="edit-production-cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.productionCost}
                  onChange={(e) =>
                    setFormData({ ...formData, productionCost: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Stock and SKU */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  placeholder="SKU-001"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="grid gap-2">
              <Label htmlFor="edit-image-url">Image URL</Label>
              <Input
                id="edit-image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
