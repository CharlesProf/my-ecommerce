"use client";

import { useState } from "react";
import { Tags, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { AddCategoryDialog } from "./add-category-dialog";
import { AddSubcategoryDialog } from "./add-subcategory-dialog";
import { deleteCategory, deleteSubcategory } from "../../../api/category/actions";
import { useRouter } from "next/navigation";
import { EditCategoryDialog } from "./edit-category-dialog";
import { EditSubcategoryDialog } from "./edit-subcategory-dialog";

type Store = {
  id: string;
  name: string;
  address: string | null;
};

type Category = {
  id: string;
  name: string;
  storeId: string | null;
  storeName: string | null;
  createdAt: string | null;
};

type Subcategory = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string | null;
};

export function CategoriesClient({
  stores,
  categories,
  subcategories,
}: {
  stores: Store[];
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const router = useRouter();
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

  // Get selected store name
  const selectedStoreName = selectedStore === "all" 
    ? "All Stores" 
    : stores.find(s => s.id === selectedStore)?.name || "All Stores";

  // Filter categories by selected store
  const filteredCategories = selectedStore === "all"
    ? categories
    : categories.filter((cat) => cat.storeId === selectedStore);

  // Filter subcategories by categories in selected store
  const categoryIdsInStore = filteredCategories.map((cat) => cat.id);
  const filteredSubcategories = selectedStore === "all"
    ? subcategories
    : subcategories.filter((sub) => categoryIdsInStore.includes(sub.categoryId || ""));

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (confirm(`Are you sure you want to delete "${categoryName}"? This will also delete all subcategories under it.`)) {
      setDeletingId(categoryId);
      try {
        await deleteCategory(categoryId);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete category:", error);
        alert("Failed to delete category. Please try again.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string, subcategoryName: string) => {
    if (confirm(`Are you sure you want to delete "${subcategoryName}"?`)) {
      setDeletingId(subcategoryId);
      try {
        await deleteSubcategory(subcategoryId);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete subcategory:", error);
        alert("Failed to delete subcategory. Please try again.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories & Subcategories</h1>
          <p className="text-muted-foreground">
            Organize your products with categories
          </p>
        </div>
      </div>

      {/* Store Selector */}
      {stores.length > 0 ? (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Store:</label>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
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
              You need to create a store first before adding categories.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button onClick={() => window.location.href = '/admin/shops'}>
              Go to Shops
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Categories and Subcategories */}
      {stores.length > 0 && (
        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">
              Categories ({filteredCategories.length})
            </TabsTrigger>
            <TabsTrigger value="subcategories">
              Subcategories ({filteredSubcategories.length})
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Categories in {selectedStoreName}</CardTitle>
                    <CardDescription>
                      Manage product categories for your store
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsCategoryDialogOpen(true)}>
                    <Tags className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Tags className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedStore !== "all"
                        ? "No categories found for this store."
                        : "Get started by adding your first category."}
                    </p>
                    <Button onClick={() => setIsCategoryDialogOpen(true)}>
                      <Tags className="mr-2 h-4 w-4" />
                      Add First Category
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category Name</TableHead>
                        <TableHead>Store</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell>{category.storeName}</TableCell>
                          <TableCell>{formatDate(category.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingCategory(category)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCategory(category.id, category.name)}
                                disabled={deletingId === category.id}
                              >
                                {deletingId === category.id ? (
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
          </TabsContent>

          {/* Subcategories Tab */}
          <TabsContent value="subcategories" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subcategories in {selectedStoreName}</CardTitle>
                    <CardDescription>
                      Manage product subcategories for your store
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsSubcategoryDialogOpen(true)}>
                    <Tags className="mr-2 h-4 w-4" />
                    Add Subcategory
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredSubcategories.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Tags className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No subcategories yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedStore !== "all"
                        ? "No subcategories found for this store."
                        : "Get started by adding your first subcategory."}
                    </p>
                    <Button onClick={() => setIsSubcategoryDialogOpen(true)}>
                      <Tags className="mr-2 h-4 w-4" />
                      Add First Subcategory
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subcategory Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubcategories.map((subcategory) => (
                        <TableRow key={subcategory.id}>
                          <TableCell className="font-medium">
                            {subcategory.name}
                          </TableCell>
                          <TableCell>{subcategory.categoryName}</TableCell>
                          <TableCell>{formatDate(subcategory.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingSubcategory(subcategory)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSubcategory(subcategory.id, subcategory.name)}
                                disabled={deletingId === subcategory.id}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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
          </TabsContent>
        </Tabs>
      )}

      {/* Dialogs */}
      <AddCategoryDialog
        stores={stores}
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      />
      <AddSubcategoryDialog
        categories={categories}
        open={isSubcategoryDialogOpen}
        onOpenChange={setIsSubcategoryDialogOpen}
      />
      <EditCategoryDialog
        category={editingCategory}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      />

      <EditSubcategoryDialog
        subcategory={editingSubcategory}
        categories={categories}
        open={!!editingSubcategory}
        onOpenChange={(open) => !open && setEditingSubcategory(null)}
      />
    </div>
  );
}
