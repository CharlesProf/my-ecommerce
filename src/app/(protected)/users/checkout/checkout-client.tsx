"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserRoundCheck } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  const customerSearchRef = useRef<HTMLDivElement>(null);
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [customerMessage, setCustomerMessage] = useState<string | null>(null);
  const [customerResults, setCustomerResults] = useState<
    Array<{ id: string; fullName: string; phone: string; address: string }>
  >([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  const totalAmount = useMemo(() => getTotalPrice(), [getTotalPrice]);
  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(totalAmount);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerSearchRef.current &&
        !customerSearchRef.current.contains(event.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const normalizedPhone = phone.replace(/\D/g, "");

    if (normalizedPhone.length < 8) {
      setIsLookingUpCustomer(false);
      setIsExistingCustomer((current) => {
        if (current) {
          setFullName("");
          setAddress("");
        }
        return false;
      });
      setCustomerMessage(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLookingUpCustomer(true);

      try {
        const response = await fetch(
          `/api/customers/lookup?phone=${encodeURIComponent(normalizedPhone)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to lookup customer.");
        }

        const result = (await response.json()) as {
          customer: null | {
            fullName: string;
            phone: string;
            address: string;
          };
        };

        if (result.customer) {
          setFullName(result.customer.fullName);
          setAddress(result.customer.address ?? "");
          setIsExistingCustomer(true);
          setCustomerMessage("Existing customer found by phone number.");
        } else {
          if (isExistingCustomer) {
            setFullName("");
            setAddress("");
          }
          setIsExistingCustomer(false);
          setCustomerMessage("Phone number not found. A new customer will be created.");
        }
      } catch (lookupError) {
        if ((lookupError as Error).name !== "AbortError") {
          setIsExistingCustomer(false);
          setCustomerMessage(null);
        }
      } finally {
        setIsLookingUpCustomer(false);
      }
    }, 400);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [phone, isExistingCustomer]);

  useEffect(() => {
    if (!storeId || !fullName.trim()) {
      setCustomerResults([]);
      setIsCustomerDropdownOpen(false);
      setIsSearchingCustomers(false);
      return;
    }

    if (isExistingCustomer) {
      setCustomerResults([]);
      setIsCustomerDropdownOpen(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingCustomers(true);

      try {
        const response = await fetch(
          `/api/customers/search?storeId=${encodeURIComponent(
            storeId
          )}&query=${encodeURIComponent(fullName)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to search customer list.");
        }

        const result = (await response.json()) as {
          customers: Array<{
            id: string;
            fullName: string;
            phone: string;
            address: string;
          }>;
        };

        setCustomerResults(result.customers);
        setIsCustomerDropdownOpen(result.customers.length > 0);
      } catch (searchError) {
        if ((searchError as Error).name !== "AbortError") {
          setCustomerResults([]);
          setIsCustomerDropdownOpen(false);
        }
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [fullName, storeId, isExistingCustomer, customerMessage]);

  const handleCustomerSelection = (customer: {
    id: string;
    fullName: string;
    phone: string;
    address: string;
  }) => {
    setFullName(customer.fullName);
    setPhone(customer.phone);
    setAddress(customer.address ?? "");
    setIsExistingCustomer(true);
    setCustomerMessage("Existing customer selected from dropdown.");
    setCustomerResults([]);
    setIsCustomerDropdownOpen(false);
  };

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
                <div ref={customerSearchRef} className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="w-full rounded-lg border border-input bg-background px-10 py-2 text-sm shadow-sm outline-none transition focus:border-primary"
                    type="text"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      setIsExistingCustomer(false);
                      setCustomerMessage(null);
                    }}
                    onFocus={() => {
                      if (customerResults.length > 0) {
                        setIsCustomerDropdownOpen(true);
                      }
                    }}
                    placeholder="Search or type customer name"
                  />

                  {isCustomerDropdownOpen ? (
                    <Card className="absolute left-0 right-0 top-full z-50 mt-2 border-2 shadow-lg">
                      <CardContent className="p-0">
                        {isSearchingCustomers ? (
                          <div className="p-4 text-sm text-muted-foreground">
                            Searching customer list...
                          </div>
                        ) : (
                          <div className="max-h-72 overflow-y-auto">
                            {customerResults.map((customer) => (
                              <button
                                key={customer.id}
                                type="button"
                                className="flex w-full items-start justify-between gap-3 border-b px-4 py-3 text-left transition hover:bg-muted/50"
                                onClick={() => handleCustomerSelection(customer)}
                              >
                                <div className="space-y-1">
                                  <p className="font-medium">{customer.fullName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {customer.phone}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {customer.address || "No address"}
                                  </p>
                                </div>
                                <UserRoundCheck className="mt-1 h-4 w-4 text-primary" />
                              </button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  Select an existing customer from the dropdown, or type manually to create a new one.
                </span>
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
                <span className="text-xs text-muted-foreground">
                  {isLookingUpCustomer
                    ? "Checking customer by phone number..."
                    : customerMessage ?? "Use phone number as the unique customer key."}
                </span>
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
