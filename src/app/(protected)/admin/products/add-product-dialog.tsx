"use client";

import { useState } from "react";
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
import { createProduct } from "../../../api/product/actions";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { formatIDR, unformatIDR } from "@/lib/utils/currency";

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

export function AddProductDialog({
  stores,
  categories,
  subcategories,
  selectedStore,
  open,
  onOpenChange,
}: {
  stores: Store[];
  categories: Category[];
  subcategories: Subcategory[];
  selectedStore: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    productionCost: "",
    stock: "",
    sku: "",
    storeId: selectedStore,
    categoryId: "",
    subcategoryId: "",
    image: null as File | null,
  });

  // Filter categories by selected store
  const filteredCategories = categories.filter(
    (cat) => cat.storeId === formData.storeId
  );

  // Filter subcategories by selected category
  const filteredSubcategories = subcategories.filter(
    (sub) => sub.categoryId === formData.categoryId
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.storeId) {
      alert("Please select a store");
      return;
    }

    if (!formData.subcategoryId) {
      alert("Please select a subcategory");
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("productionCost", formData.productionCost);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("sku", formData.sku);
      formDataToSend.append("storeId", formData.storeId);
      formDataToSend.append("subcategoryId", formData.subcategoryId);
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      await createProduct(formDataToSend);
      
      setFormData({
        name: "",
        description: "",
        price: "",
        productionCost: "",
        stock: "",
        sku: "",
        storeId: selectedStore,
        categoryId: "",
        subcategoryId: "",
        image: null,
      });
      setImagePreview(null);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to create product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product with all the details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Store Selection */}
            <div className="grid gap-2">
              <Label htmlFor="store">Store *</Label>
              <Select
                value={formData.storeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, storeId: value, categoryId: "", subcategoryId: "" })
                }
              >
                <SelectTrigger id="store">
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

            {/* Product Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="iPhone 15 Pro"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div className="grid gap-2">
            <Label htmlFor="image">Product Image</Label>

            <Label
            htmlFor="image"
            className="
                border-2 border-dashed rounded-md
                p-6
                cursor-pointer
                flex flex-col items-center justify-center
                gap-2
                text-center
                hover:border-primary
                transition
            "
            >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
                Click to upload image
            </span>

            <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
            />
            </Label>
            </div>


            {/* Category Selection */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value, subcategoryId: "" })
                }
                disabled={!formData.storeId}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory Selection */}
            <div className="grid gap-2">
              <Label htmlFor="subcategory">Subcategory *</Label>
              <Select
                value={formData.subcategoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, subcategoryId: value })
                }
                disabled={!formData.categoryId}
              >
                <SelectTrigger id="subcategory">
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

            {/* Price and Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                id="price"
                type="text"
                placeholder="Rp 0"
                value={formatIDR(formData.price)}
                onChange={(e) =>
                    setFormData({
                    ...formData,
                    price: unformatIDR(e.target.value),
                    })
                }
                required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cost">Production Cost</Label>
                <Input
                id="cost"
                type="text"
                placeholder="Rp 0"
                value={formatIDR(formData.productionCost)}
                onChange={(e) =>
                    setFormData({
                    ...formData,
                    productionCost: unformatIDR(e.target.value),
                    })
                }
                />
              </div>
            </div>

            {/* Stock and SKU */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="100"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="PROD-001"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div>
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
              {isLoading ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
