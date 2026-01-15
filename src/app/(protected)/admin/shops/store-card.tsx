"use client";

import { MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteStore } from "../../../api/store/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditStoreDialog } from "./edit-store-dialog";

type Store = {
  id: string;
  name: string;
  address: string | null;
  adminId: string | null;
  createdAt: string | null;
};

export function StoreCard({ store }: { store: Store }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${store.name}"?`)) {
      setIsDeleting(true);
      try {
        await deleteStore(store.id);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete store:", error);
        alert("Failed to delete store. Please try again.");
        setIsDeleting(false);
      }
    }
  };

  const formattedDate = store.createdAt
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(store.createdAt))
    : 'Unknown';

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>{store.name}</CardTitle>
              {store.address && (
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {store.address}
                </CardDescription>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Created {formattedDate}
          </p>
        </CardContent>
      </Card>

      <EditStoreDialog
        store={store}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
