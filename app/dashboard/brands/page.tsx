"use client";

import React, { useEffect, useState, useMemo } from "react";
import { brandsAPI } from "@/lib/services/brands";
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
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



const BRAND_TYPES = [
  { value: "luxury", label: "Luxury" },
  { value: "premium", label: "Premium" },
  { value: "budget", label: "Budget" },
  { value: "designer", label: "Designer" },
  { value: "artisan", label: "Artisan" },
];

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [types, setTypes] = useState("");
  const [origin, setOrigin] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Date validation function
  const validateSinceDate = (dateString: string): string | null => {
    if (!dateString) return null;

    const inputDate = new Date(dateString);
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);

    if (inputDate > currentDate) {
      return "Establishment date cannot be in the future";
    }

    const minDate = new Date("1800-01-01");
    if (inputDate < minDate) {
      return "Establishment date seems too far in the past";
    }

    return null;
  };

  const handleSinceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSince(value);

    const error = validateSinceDate(value);
    setSinceError(error);
  };

  // Filter brands based on search query
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) {
      return brands;
    }
    const query = searchQuery.toLowerCase().trim();
    return brands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(query) ||
        (brand.tagline && brand.tagline.toLowerCase().includes(query)) ||
        (brand.origin && brand.origin.toLowerCase().includes(query)) ||
        (brand.types && brand.types.toLowerCase().includes(query)) ||
        (brand.description && brand.description.toLowerCase().includes(query))
    );
  }, [brands, searchQuery]);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await brandsAPI.getBrands();
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

  const clearSearch = () => {
    setSearchQuery("");
  };

  // ADD THE MISSING FUNCTIONS HERE:
  const openCreate = () => {
    setEditing(null);
    setName("");
    setTagline("");
    setTypes("");
    setOrigin("");
    setDescription("");
    setLogoFile(null);
    setShowForm(true);
  };

  const openEdit = (b: Brand) => {
    setEditing(b);
    setName(b.name);
    setTagline(b.tagline ?? "");
    setTypes(b.types ?? "");
    setOrigin(b.origin ?? "");
    setDescription(b.description ?? "");
    setLogoFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("tagline", tagline);
      if (types) fd.append("types", types);
      fd.append("origin", origin);
      fd.append("description", description);
      if (logoFile) fd.append("logo_file", logoFile);
      if (editing) {
        await brandsAPI.updateBrand(editing.slug, fd);
        toast({ title: "Updated", description: "Brand updated" });
      } else {
        await brandsAPI.createBrand(fd);
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

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this brand?")) return;
    try {
      await brandsAPI.deleteBrand(slug);
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
        <DashboardHeader
          title="Brands"
          description="Manage product brands"
        />
        <div className="p-4 md:p-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle>Brands</CardTitle>
                <CardDescription>
                  Manage your product brands
                </CardDescription>
              </div>
              <Button onClick={openCreate} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Brand
              </Button>
            </CardHeader>

            <CardContent>
              {/* Search Bar */}
              <div className="relative w-full md:w-96 mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, types, tagline, origin, or description..."
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
              ) : filteredBrands.length === 0 ? (
                <div className="text-center py-12">
                  {searchQuery ? (
                    <div>
                      <p className="text-muted-foreground">
                        No brands found matching "{searchQuery}"
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
                      No brands found. Create your first brand!
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] table-auto">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 px-2 md:px-4">Logo</th>
                        <th className="py-2 px-2 md:px-4">Name</th>
                        <th className="py-2 px-2 md:px-4">Tagline</th>
                        <th className="py-2 px-2 md:px-4">Type</th>
                        <th className="py-2 px-2 md:px-4">Origin</th>
                        <th className="py-2 px-2 md:px-4">Description</th>
                        <th className="py-2 px-2 md:px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBrands.map((b) => (
                        <tr key={b.id} className="border-b">
                          <td className="py-3 px-2 md:px-4">
                            {b.logo_url ? (
                              <img
                                src={b.logo_url}
                                alt={b.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                —
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-2 md:px-4">{b.name}</td>
                          <td className="py-3 px-2 md:px-4">{b.tagline || "-"}</td>
                          <td className="py-3 px-2 md:px-4">{b.types || "-"}</td>
                          <td className="py-3 px-2 md:px-4">{b.origin || "-"}</td>
                          <td className="py-3 px-2 md:px-4">{b.description || "-"}</td>
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
                              onClick={() => handleDelete(b.slug)}
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
                {editing ? "Edit Brand" : "Add Brand"}
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

              {/* Tagline */}
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Brand tagline or slogan"
                />
              </div>

              {/* Type */}
              <div>
                <Label htmlFor="types">Brand Type</Label>
                <Select
                  value={types === "" ? "none" : types}
                  onValueChange={(value) => setTypes(value === "none" ? "" : value)}
                >
                  <SelectTrigger id="types" className="w-full">
                    <SelectValue placeholder="Select type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {BRAND_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Origin */}
              <div>
                <Label htmlFor="origin">Country of Origin</Label>
                <Input
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g., United States, Italy, Japan"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brand description and story"
                  rows={3}
                />
              </div>

              {/* Logo Upload */}
              <div>
                <Label htmlFor="logo">Logo (optional)</Label>
                {editing?.logo_url && !logoFile && (
                  <img
                    src={editing.logo_url}
                    alt={editing.name}
                    className="h-12 w-12 object-cover rounded mb-2"
                  />
                )}
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
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