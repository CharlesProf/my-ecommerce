"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTransactionItem } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toast } from "@/components/ui/toast";

interface AvailableProduct {
  id: string;
  name: string;
  price: string;
  stock: number;
}

interface AddTransactionItemFormProps {
  transactionId: string;
  storeId: string;
  status: string;
  availableProducts: AvailableProduct[];
}

export function AddTransactionItemForm({
  transactionId,
  status,
  availableProducts,
}: AddTransactionItemFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(
    availableProducts[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    if (quantity <= 0) {
      setError("Quantity must be at least 1.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("transactionId", transactionId);
      formData.append("productId", productId);
      formData.append("quantity", quantity.toString());

      await addTransactionItem(formData);
      setQuantity(1);
      setSuccessMessage("Item successfully added to transaction.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status !== "pending") {
    return null;
  }

  if (availableProducts.length === 0) {
    return (
      <div className="rounded-xl border border-muted p-6 bg-card">
        <p className="text-sm text-muted-foreground">
          No available products with stock in this store to add to the transaction.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-muted p-6 bg-card">
      <div className="mb-4 space-y-3">
        <div className="text-lg font-semibold">Add Transaction Item</div>
        <p className="text-sm text-muted-foreground">
          Pick a product and quantity to add it to this pending transaction.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="product">Product</Label>
          <select
            id="product"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary"
            value={productId}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setProductId(event.target.value)}
          >
            {availableProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.stock} in stock)
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            step={1}
            value={quantity}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setQuantity(Number(event.target.value))
            }
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding..." : "Add Item"}
          </Button>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      {successMessage ? (
        <Toast
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      ) : null}
    </form>
  );
}
