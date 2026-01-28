"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSubcategory } from "../../../api/category/actions";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Subcategory = {
  id: string;
  name: string;
  categoryId: string | null;
};

export function EditSubcategoryDialog({
  subcategory,
  categories,
  open,
  onOpenChange,
}: {
  subcategory: Subcategory | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subcategory) {
      setName(subcategory.name);
      setCategoryId(subcategory.categoryId ?? "");
    }
  }, [subcategory]);

  const canSubmit = Boolean(name.trim() && categoryId);

  const handleSubmit = async () => {
    if (!subcategory || !canSubmit) return;

    setLoading(true);
    try {
      await updateSubcategory(
        categoryId,
        subcategory.id,
        name.trim()
      );
      router.refresh();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subcategory</DialogTitle>
          <DialogDescription>
            Update subcategory details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Subcategory Name */}
          <div className="space-y-2">
            <Label>Subcategory Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Subcategory name"
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
