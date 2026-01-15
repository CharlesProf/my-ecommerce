"use client";

import { useState } from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddStoreDialog } from "./add-store-dialog";
import { StoreCard } from "./store-card";
import { useRouter } from "next/navigation";

type Store = {
  id: string;
  name: string;
  address: string | null;
  adminId: string | null;
  createdAt: string | null;
};

export function ShopsClient({ stores }: { stores: Store[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams();
    if (value) {
      params.set("search", value);
    }
    router.push(`/admin/shops?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shops</h1>
          <p className="text-muted-foreground">
            Manage your store locations
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Store className="mr-2 h-4 w-4" />
          Add Shop
        </Button>
      </div>

      {/* Search Bar - Always visible */}
      <div className="flex gap-4">
        <Input
          placeholder="Search shops by name or address..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Stores Grid or Empty State */}
      {stores.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Store className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>No shops yet</CardTitle>
            <CardDescription>
              {searchTerm
                ? `No shops found matching "${searchTerm}"`
                : "There are no stores to be displayed. Get started by adding your first shop."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-12">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Store className="mr-2 h-4 w-4" />
              Add First Shop
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}

      {/* Add Store Dialog */}
      <AddStoreDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
