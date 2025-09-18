"use client";

import React, { useEffect, useState } from "react";
import { inventoryAPI } from "@/lib/services/inventory";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus } from "lucide-react";
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

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [parent, setParent] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await inventoryAPI.getCategories();
      setCategories(data.results ?? data);
    } catch (err) {
      console.error("Failed load categories", err);
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
        await inventoryAPI.updateCategory(editing.slug, fd);
        toast({ title: "Updated", description: "Category updated" });
      } else {
        await inventoryAPI.createCategory(fd);
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
      await inventoryAPI.deleteCategory(slug);
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
        <div className="p-4 md:p-6"> {/* Responsive padding */}
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Mobile stacks title and button */}
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
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] table-auto"> {/* min-width ensures horizontal scroll on small */}
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
                      {categories.map((c) => (
                        <tr key={c.id} className="border-b">
                          <td className="py-3 px-2 md:px-4">{c.name}</td>
                          <td className="py-3 px-2 md:px-4">{c.parent ?? "-"}</td>
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
          <DialogContent className="max-w-sm sm:max-w-md"> {/* narrower max width for mobile */}
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

              {/* Parent (ID) */}
              <div>
                <Label htmlFor="parent">Parent (ID)</Label>
                <Select
                  value={parent === "" ? "none" : String(parent)}
                  onValueChange={(value) => {
                    setParent(value === "none" ? "" : Number(value));
                  }}
                >
                  <SelectTrigger id="parent" className="w-full">
                    <SelectValue placeholder="Select parent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((cat) =>
                      editing?.id !== cat.id ? (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.id}
                        </SelectItem>
                      ) : null
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground my-2">
                  Select a parent category by ID (optional).
                </p>
              </div>

              {/* Image */}
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
