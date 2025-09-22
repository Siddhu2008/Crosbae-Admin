"use client";

import React, { useEffect, useState } from "react";
import { inventoryAPI } from "@/lib/services/inventory";
import type { Brand } from "@/types/brand";
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

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await inventoryAPI.getBrands();
      setBrands(data.results ?? data);
    } catch (err) {
      console.error("Failed to load brands", err);
      toast({
        title: "Error",
        description: "Failed to load brands",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setWebsite("");
    setIsActive(true);
    setLogoFile(null);
    setShowForm(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setName(brand.name);
    setDescription(brand.description ?? "");
    setWebsite(brand.website ?? "");
    setIsActive(brand.is_active);
    setLogoFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("description", description);
      fd.append("website", website);
      fd.append("is_active", isActive.toString());

      if (logoFile) fd.append("logo", logoFile);

      if (editing) {
        await inventoryAPI.updateBrand(editing.id, fd);
        toast({ title: "Updated", description: "Brand updated" });
      } else {
        await inventoryAPI.createBrand(fd);
        toast({ title: "Created", description: "Brand created" });
      }

      setShowForm(false);
      loadBrands();
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

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this brand?")) return;

    try {
      await inventoryAPI.deleteBrand(id);
      toast({ title: "Deleted", description: "Brand deleted" });
      loadBrands();
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
        <DashboardHeader title="Brands" description="Manage product brands" />
        <div className="p-4 md:p-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle>Brands</CardTitle>
                <CardDescription>Manage your product brands</CardDescription>
              </div>
              <Button onClick={openCreate} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Brand
              </Button>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] table-auto">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 px-2 md:px-4">Name</th>
                        <th className="py-2 px-2 md:px-4">Website</th>
                        <th className="py-2 px-2 md:px-4">Status</th>
                        <th className="py-2 px-2 md:px-4">Created</th>
                        <th className="py-2 px-2 md:px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brands.map((b) => (
                        <tr key={b.id} className="border-b">
                          <td className="py-3 px-2 md:px-4 flex items-center space-x-3">
                            {b.logo ? (
                              <img
                                src={b.logo}
                                alt={b.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {b.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{b.name}</div>
                              {b.description && (
                                <div className="text-sm text-muted-foreground line-clamp-2 max-w-[150px] md:max-w-none">
                                  {b.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 md:px-4 break-all">
                            {b.website ? (
                              <a
                                href={b.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {b.website}
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="py-3 px-2 md:px-4">
                            <span
                              className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
                                b.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {b.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 px-2 md:px-4">
                            {new Date(b.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 md:px-4 space-x-2 whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(b)}
                            >
                              <Edit />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(b.id)}
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
              <DialogTitle>{editing ? "Edit Brand" : "Add Brand"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="logo">Brand Logo (Optional)</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this brand
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked)}
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
                  {submitting
                    ? "Saving..."
                    : editing
                    ? "Update"
                    : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}