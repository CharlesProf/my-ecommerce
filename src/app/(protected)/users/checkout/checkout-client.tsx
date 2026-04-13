"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";

export type StoreOption = {
  id: string;
  name: string;
};

type CheckoutClientProps = {
  stores: StoreOption[];
};

export default function CheckoutClient({ stores }: CheckoutClientProps) {
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCart();
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = useMemo(() => getTotalPrice(), [getTotalPrice]);
  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(totalAmount);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Please add items to the cart before checkout.");
      return;
    }

    if (!storeId) {
      setError("Please choose a store.");
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      setError("Customer name and phone number are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          fullName,
          phone,
          address,
          paymentMethod,
          status,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result?.error || "Unable to complete checkout.");
      }

      clearCart();
      router.push("/users/Transactions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="rounded-xl border p-6 bg-card">
            <h1 className="text-2xl font-bold mb-4">Proceed to Checkout</h1>
            <p className="text-sm text-muted-foreground">
              Fill customer details and review the total amount before creating the transaction.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border p-6 bg-card">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">Store</span>
                <select
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary"
                  value={storeId}
                  onChange={(event) => setStoreId(event.target.value)}
                >
                  <option value="">Select store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">Payment Method</span>
                <select
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  <option value="QRIS">QRIS</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">Customer Name</span>
                <input
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="John Doe"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">Phone Number</span>
                <input
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="0812xxxxxxx"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium">Address (optional)</span>
              <textarea
                className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Customer address"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Status</span>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </label>

            <div className="rounded-lg border border-muted p-4 bg-muted/50">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Transaction total</span>
                <span className="font-semibold">{formattedTotal}</span>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isSubmitting || items.length === 0} className="w-full">
              {isSubmitting ? "Submitting..." : "Create Transaction"}
            </Button>
          </form>
        </div>

        <div className="rounded-xl border p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Cart Summary</h2>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-muted p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between border-t pt-4 text-base font-semibold">
                <span>Total</span>
                <span>{formattedTotal}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
