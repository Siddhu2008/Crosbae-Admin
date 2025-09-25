"use client";

import React, { useEffect, useState, useMemo } from "react";
import { categoriesAPI } from "@/lib/services/categories";
import type { Category } from "@/types/category";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [parent, setParent] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        (cat.slug && cat.slug.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);
  const clearSearch = () => setSearchQuery("");
  useEffect(() => {
    loadCategories();
  }, []);
  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesAPI.getCategories();
      setCategories(data.results ?? data);
    } catch (err) {
      console.error("Failed to load categories", err);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const openCreate = () => {
    setEditing(null);
    setName("");
    setParent("");
    setImageFile(null);
    setShowForm(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setParent(c.parent ?? "");
    setImageFile(null);
    setShowForm(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      if (parent !== "") fd.append("parent", String(parent));
      if (imageFile) fd.append("image_file", imageFile);
      if (editing) {
        await categoriesAPI.updateCategory(editing.slug, fd);
        toast({ title: "Updated", description: "Category updated" });
      } else {
        await categoriesAPI.createCategory(fd);
        toast({ title: "Created", description: "Category created" });
      }
      setShowForm(false);
      loadCategories();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err?.response?.data?.detail ?? "Operation failed",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await categoriesAPI.deleteCategory(slug);
      toast({ title: "Deleted", description: "Category deleted" });
      loadCategories();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err?.response?.data?.detail ?? "Delete failed",
        variant: "destructive",
      });
    }
  };
  return (
    <DashboardLayout>
      <div className="flex flex-col pt-15 md:pt-0">
        <DashboardHeader
          title="Categories"
          description="Manage product categories"
        />
        <div className="p-4 md:p-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Manage your product categories
                </CardDescription>
              </div>
              <Button onClick={openCreate} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </CardHeader>

            <CardContent>
              {/* Search Bar */}
              <div className="relative w-full md:w-96 mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  {searchQuery ? (
                    <div>
                      <p className="text-muted-foreground">
                        No categories found matching "{searchQuery}"
                      </p>
                      <Button
                        variant="outline"
                        onClick={clearSearch}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No categories found. Create your first category!
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] table-auto">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 px-2 md:px-4">Name</th>
                        <th className="py-2 px-2 md:px-4">Parent</th>
                        <th className="py-2 px-2 md:px-4">Image</th>
                        <th className="py-2 px-2 md:px-4">Created</th>
                        <th className="py-2 px-2 md:px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((c) => (
                        <tr key={c.id} className="border-b">
                          <td className="py-3 px-2 md:px-4">{c.name}</td>
                          <td className="py-3 px-2 md:px-4">
                            {c.parent
                              ? categories.find((p) => p.id === c.parent)?.name ?? "-"
                              : "-"}
                          </td>
                          <td className="py-3 px-2 md:px-4">
                            {c.image_url ? (
                              <img
                                src={c.image_url}
                                alt={c.name}
                                className="h-12 w-12 object-cover rounded"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                                —
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-2 md:px-4">
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 md:px-4 space-x-2 whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(c)}
                            >
                              <Edit />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(c.slug)}
                            >
                              <Trash2 className="text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal Form */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-sm sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Category" : "Add Category"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Parent Category */}
              <div>
                <Label htmlFor="parent">Parent Category</Label>
                <Select
                  value={parent === "" ? "none" : String(parent)}
                  onValueChange={(value) =>
                    setParent(value === "none" ? "" : Number(value))
                  }
                >
                  <SelectTrigger id="parent" className="w-full">
                    <SelectValue placeholder="Select parent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories
                      .filter(
                        (cat) =>
                          editing?.id !== cat.id &&
                          cat.id !== undefined &&
                          cat.id !== null &&
                          String(cat.id) !== ""
                      )
                      .map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image">Image (optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
