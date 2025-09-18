"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataTable } from "@/components/data-table"
import { ProductForm } from "@/components/product-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  Upload,
  Download,
  Filter,
} from "lucide-react"
import { inventoryAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number
  name: string
  sku: string
  category: { id: number; name: string }
  brand?: { id: number; name: string }
  price: number
  quantity: number
  weight: number
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  created_at: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkUploading, setBulkUploading] = useState(false)

  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    status: "",
    stockLevel: "",
    priceRange: "",
  })

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
    loadFilterData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [products, filters])

  const loadProducts = async () => {
    try {
      const response = await inventoryAPI.getProducts()
      setProducts(response.results || [])
    } catch (error) {
      console.error("Failed to load products:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
      // Mock data for demo
      setProducts([
        {
          id: 1,
          name: "Gold Necklace Set",
          sku: "GNS001",
          category: { id: 1, name: "Necklaces" },
          brand: { id: 1, name: "Tanishq" },
          price: 45000,
          quantity: 12,
          weight: 25.5,
          stock: 12,
          status: "active",
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          name: "Diamond Earrings",
          sku: "DE002",
          category: { id: 2, name: "Earrings" },
          brand: { id: 2, name: "Kalyan Jewellers" },
          price: 32000,
          quantity: 5,
          weight: 8.2,
          stock: 5,
          status: "active",
          created_at: "2024-01-14T14:20:00Z",
        },
        {
          id: 3,
          name: "Silver Bracelet",
          sku: "SB003",
          category: { id: 4, name: "Bracelets" },
          price: 2500,
          quantity: 0,
          weight: 15.0,
          stock: 0,
          status: "out_of_stock",
          created_at: "2024-01-13T09:15:00Z",
        },
        {
          id: 4,
          name: "Pearl Ring",
          sku: "PR004",
          category: { id: 3, name: "Rings" },
          brand: { id: 3, name: "Malabar Gold" },
          price: 18000,
          quantity: 8,
          weight: 5.8,
          stock: 8,
          status: "active",
          created_at: "2024-01-12T16:45:00Z",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadFilterData = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        inventoryAPI.getCategories().catch(() => ({ results: [] })),
        inventoryAPI.getBrands().catch(() => ({ results: [] })),
      ])
      setCategories(categoriesData.results || [])
      setBrands(brandsData.results || [])
    } catch (error) {
      console.error("Failed to load filter data:", error)
    }
  }

  const applyFilters = () => {
    let filtered = [...products]

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((p) => p.category.id.toString() === filters.category)
    }

    if (filters.brand && filters.brand !== "all") {
      filtered = filtered.filter((p) => p.brand?.id.toString() === filters.brand)
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((p) => p.status === filters.status)
    }

    if (filters.stockLevel && filters.stockLevel !== "all") {
      switch (filters.stockLevel) {
        case "in_stock":
          filtered = filtered.filter((p) => p.quantity > 5)
          break
        case "low_stock":
          filtered = filtered.filter((p) => p.quantity > 0 && p.quantity <= 5)
          break
        case "out_of_stock":
          filtered = filtered.filter((p) => p.quantity === 0)
          break
      }
    }

    if (filters.priceRange && filters.priceRange !== "all") {
      switch (filters.priceRange) {
        case "under_10k":
          filtered = filtered.filter((p) => p.price < 10000)
          break
        case "10k_50k":
          filtered = filtered.filter((p) => p.price >= 10000 && p.price < 50000)
          break
        case "above_50k":
          filtered = filtered.filter((p) => p.price >= 50000)
          break
      }
    }

    setFilteredProducts(filtered)
  }

  const clearFilters = () => {
    setFilters({
      category: "all",
      brand: "all",
      status: "all",
      stockLevel: "all",
      priceRange: "all",
    })
  }

  const handleCreateProduct = async (data: any) => {
    try {
      await inventoryAPI.createProduct(data)
      toast({
        title: "Success",
        description: "Product created successfully",
      })
      setShowForm(false)
      loadProducts()
    } catch (error: any) {
      console.error("Create product error:", error)
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create product",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProduct = async (data: any) => {
    if (!editingProduct) return

    try {
      await inventoryAPI.updateProduct(editingProduct.id, data)
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      setEditingProduct(null)
      setShowForm(false)
      loadProducts()
    } catch (error: any) {
      console.error("Update product error:", error)
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await inventoryAPI.deleteProduct(id)
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
      loadProducts()
    } catch (error: any) {
      console.error("Delete product error:", error)
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const handleBulkUpload = async () => {
    if (!bulkFile) return

    setBulkUploading(true)
    try {
      await inventoryAPI.bulkUploadProducts(bulkFile)
      toast({
        title: "Success",
        description: "Products uploaded successfully",
      })
      setShowBulkUpload(false)
      setBulkFile(null)
      loadProducts()
    } catch (error: any) {
      console.error("Bulk upload error:", error)
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to upload products",
        variant: "destructive",
      })
    } finally {
      setBulkUploading(false)
    }
  }

  const handleExport = async () => {
    try {
      await inventoryAPI.exportProducts(filters)
      toast({
        title: "Success",
        description: "Products exported successfully",
      })
    } catch (error: any) {
      console.error("Export error:", error)
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to export products",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="truncate">
              <div className="font-medium truncate">{product.name}</div>
              <div className="text-sm text-muted-foreground truncate">SKU: {product.sku}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category.name,
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => row.original.brand?.name || "N/A",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => `₹${row.original.price.toLocaleString()}`,
    },
    {
      accessorKey: "weight",
      header: "Weight",
      cell: ({ row }) => `${row.original.weight}g`,
    },
    {
      accessorKey: "quantity",
      header: "Stock",
      cell: ({ row }) => {
        const quantity = row.original.quantity
        return (
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                quantity === 0
                  ? "bg-red-100 text-red-800"
                  : quantity <= 5
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {quantity}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge
            variant={
              status === "active"
                ? "success"
                : status === "inactive"
                ? "secondary"
                : "destructive"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Added On",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="Actions"
                size="sm"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <DropdownMenuItem
                onClick={() => {
                  setEditingProduct(product)
                  setShowForm(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteProduct(product.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => alert(`Viewing details for ${product.name}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const lowStockProducts = products.filter((p) => p.quantity > 0 && p.quantity <= 5)
  const outOfStockProducts = products.filter((p) => p.quantity === 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col pt-15 md:pt-0">
        <DashboardHeader
          title="Inventory Management"
          description="Manage your product catalog and stock levels"
        />

        <div className="flex-1 p-4 space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                {/* Category */}
                <div>
                  <Label>Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters({ ...filters, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div>
                  <Label>Brand</Label>
                  <Select
                    value={filters.brand}
                    onValueChange={(value) => setFilters({ ...filters, brand: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands.map((brand: any) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div>
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock Level */}
                <div>
                  <Label>Stock Level</Label>
                  <Select
                    value={filters.stockLevel}
                    onValueChange={(value) => setFilters({ ...filters, stockLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock</SelectItem>
                      <SelectItem value="in_stock">In Stock &gt;5</SelectItem>
                      <SelectItem value="low_stock">Low Stock 1-5</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock 0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label>Price Range</Label>
                  <Select
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under_10k">Under ₹10,000</SelectItem>
                      <SelectItem value="10k_50k">₹10,000 - ₹50,000</SelectItem>
                      <SelectItem value="above_50k">Above ₹50,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    Showing {filteredProducts.length} of {products.length} products
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload
                  </Button>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <DataTable
                  columns={columns}
                  data={filteredProducts}
                  searchKey="name"
                  searchPlaceholder="Search products..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-full max-h-[90vh] sm:max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editingProduct}
              onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
              onCancel={() => {
                setShowForm(false)
                setEditingProduct(null)
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
          <DialogContent className="max-w-md max-h-[70vh]">
            <DialogHeader>
              <DialogTitle>Bulk Upload Products</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowBulkUpload(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!bulkFile || bulkUploading}
                  onClick={handleBulkUpload}
                >
                  {bulkUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
