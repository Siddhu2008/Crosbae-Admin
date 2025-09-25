"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { X, Upload, Plus } from "lucide-react"
import { inventoryAPI } from "@/lib/services/inventory"
import { categoriesAPI } from "@/lib/services/categories"
import { brandsAPI } from "@/lib/services/brands"
import { metalTypesAPI } from "@/lib/services/Metal"
import { stoneTypesAPI } from "@/lib/services/Stone"
import { certificationsAPI } from "@/lib/services/certifications"


const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  quantity: z.number().min(0, "Quantity must be positive"),
  weight: z.number().min(0, "Weight must be positive"),
  making_charge: z.number().min(0, "Making charge must be positive"),
  gst_rate: z.number().min(0).max(100, "GST rate must be between 0-100"),
  metalType: z.string().min(1, "Metal type is required"),
  stoneType: z.string().min(1, "Stone type is required"),
  certification: z.string().min(1, "Certification is required"),
  hsn_code: z.string().min(1, "HSN code is required"),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: any
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
}

// ...existing code...

// Extended QuickAddDialog for Category, Brand, Metal Type, Stone Type, Certification
function QuickAddCategoryDialog({
  categories,
  onAdd,
}: {
  categories: any[]
  onAdd: (data: { name: string; description?: string; parent?: string; image?: File | null }) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [parent, setParent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await onAdd({ name: name.trim(), description, parent, image })
      setName("")
      setDescription("")
      setParent("")
      setImage(null)
      setOpen(false)
    } catch (error) {
      console.error("Failed to add category:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>Enter complete category information.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              placeholder="Category description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cat-parent">Parent Category</Label>
            <Select value={parent === "" ? "none" : parent} onValueChange={(value) => setParent(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cat-image">Image</Label>
            <Input
              id="cat-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={loading || !name.trim()}>
            {loading ? "Adding..." : "Add Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuickAddBrandDialog({
  onAdd,
}: {
  onAdd: (data: { name: string; description?: string; image?: File | null }) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await onAdd({ name: name.trim(), description, image })
      setName("")
      setDescription("")
      setImage(null)
      setOpen(false)
    } catch (error) {
      console.error("Failed to add brand:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Brand
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
          <DialogDescription>Enter complete brand information.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="brand-name">Name</Label>
            <Input
              id="brand-name"
              placeholder="Brand name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="brand-desc">Description</Label>
            <Textarea
              id="brand-desc"
              placeholder="Brand description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="brand-image">Image</Label>
            <Input
              id="brand-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={loading || !name.trim()}>
            {loading ? "Adding..." : "Add Brand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuickAddMetalTypeDialog({
  onAdd,
}: {
  onAdd: (data: { name: string; description?: string; image?: File | null }) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [metalName, setMetalName] = useState("")
  const [purity, setPurity] = useState("")
  const [purityName, setPurityName] = useState("")
  const [loading, setLoading] = useState(false)

  // Example purity options, replace with your actual purity list if needed
  const purityOptions = [
    { id: 1, name: "steel" },
    { id: 2, name: "gold" },
    { id: 3, name: "silver" },
    // ...add more as needed
  ]

  const handleAdd = async () => {
    if (!metalName.trim() || !purity || !purityName.trim()) return
    setLoading(true)
    try {
      await onAdd({ metal_name: metalName.trim(), purity: Number(purity), purity_name: purityName.trim() })
      setMetalName("")
      setPurity("")
      setPurityName("")
      setOpen(false)
    } catch (error) {
      console.error("Failed to add metal type:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Metal Type
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Metal Type</DialogTitle>
          <DialogDescription>Enter complete metal type information.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="metal-name">Metal Name</Label>
            <Input
              id="metal-name"
              placeholder="Metal type name"
              value={metalName}
              onChange={(e) => setMetalName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="purity">Purity</Label>
            <Select value={purity} onValueChange={(value) => {
              setPurity(value)
              const selected = purityOptions.find((p) => p.id.toString() === value)
              setPurityName(selected ? selected.name : "")
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select purity" />
              </SelectTrigger>
              <SelectContent>
                {purityOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={loading || !metalName.trim() || !purity || !purityName.trim()}>
            {loading ? "Adding..." : "Add Metal Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuickAddStoneTypeDialog({
  onAdd,
}: {
  onAdd: (data: { name: string; description?: string; image?: File | null }) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [stoneName, setStoneName] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!stoneName.trim()) return
    setLoading(true)
    try {
      await onAdd({ stone_name: stoneName.trim(), image })
      setStoneName("")
      setImage(null)
      setOpen(false)
    } catch (error) {
      console.error("Failed to add stone type:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Stone Type
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Stone Type</DialogTitle>
          <DialogDescription>Enter complete stone type information.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="stone-name">Stone Name</Label>
            <Input
              id="stone-name"
              placeholder="Stone type name"
              value={stoneName}
              onChange={(e) => setStoneName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="stone-image">Image</Label>
            <Input
              id="stone-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={loading || !stoneName.trim()}>
            {loading ? "Adding..." : "Add Stone Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuickAddCertificationDialog({
  onAdd,
}: {
  onAdd: (data: { name: string; description?: string; image?: File | null }) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await onAdd({ name: name.trim(), description, image })
      setName("")
      setDescription("")
      setImage(null)
      setOpen(false)
    } catch (error) {
      console.error("Failed to add certification:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Certification
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Certification</DialogTitle>
          <DialogDescription>Enter complete certification information.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cert-name">Name</Label>
            <Input
              id="cert-name"
              placeholder="Certification name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cert-desc">Description</Label>
            <Textarea
              id="cert-desc"
              placeholder="Certification description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cert-image">Image</Label>
            <Input
              id="cert-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={loading || !name.trim()}>
            {loading ? "Adding..." : "Add Certification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [metalTypes, setMetalTypes] = useState<any[]>([])
  const [stoneTypes, setStoneTypes] = useState<any[]>([])
  const [certifications, setCertifications] = useState<any[]>([])
  const [tags, setTags] = useState<string[]>(product?.tags?.split(",") || [])
  const [newTag, setNewTag] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      sku: product?.sku || "",
      category: product?.category?.toString() || "",
      brand: product?.brand?.toString() || "",
      description: product?.description || "",
      price: product?.price || undefined,
      quantity: product?.quantity || undefined,
      weight: product?.weight || undefined,
      making_charge: product?.making_charge || undefined,
      gst_rate: product?.gst_rate || 18,
      metalType: product?.metalType?.toString() || "",
      stoneType: product?.stoneType?.toString() || "",
      certification: product?.certification?.toString() || "",
      hsn_code: product?.hsn_code?.toString() || "",
    },
  })

  useEffect(() => {
    loadFormData()
  }, [])

  const loadFormData = async () => {
    setLoadingData(true)
    try {
      const [categoriesData, brandsData, metalTypesData, stoneTypesData, certificationsData] = await Promise.all([
        inventoryAPI.getCategories().catch(() => ({ results: [] })),
        inventoryAPI.getBrands().catch(() => ({ results: [] })),
        inventoryAPI.getMetalTypes().catch(() => ({ results: [] })),
        inventoryAPI.getStoneTypes().catch(() => ({ results: [] })),
        inventoryAPI.getCertifications().catch(() => ({ results: [] })),
      ])


      // Improved normalization: handle array, results, or direct object
      const normalize = (d: any) => {
        if (!d) return []
        if (Array.isArray(d)) return d
        if (d.results && Array.isArray(d.results)) return d.results
        if (d.data && Array.isArray(d.data)) return d.data
        return []
      }

      setCategories(normalize(categoriesData))
      setBrands(normalize(brandsData))
      setMetalTypes(normalize(metalTypesData))
      setStoneTypes(normalize(stoneTypesData))
      setCertifications(normalize(certificationsData))
    } catch (error) {
      console.error("Failed to load form data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const formData = {
        ...data,
        tags: tags.join(","),
        features: JSON.stringify({}),
        size: JSON.stringify({}),
      }
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages([...images, ...files])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const addCategory = async (name: string) => {
    const newCategory = await categoriesAPI.createCategory({ name })
    setCategories([...categories, newCategory])
    form.setValue("category", newCategory.id.toString())
  }

  const addBrand = async (name: string) => {
    const newBrand = await brandsAPI.createBrand({ name })
    setBrands([...brands, newBrand])
    form.setValue("brand", newBrand.id.toString())
  }

  const addMetalType = async (name: string) => {
    const newMetalType = await metalTypesAPI.createMetalType({ name })
    setMetalTypes([...metalTypes, newMetalType])
    form.setValue("metalType", newMetalType.id.toString())
  }

  const addStoneType = async (name: string) => {
    const newStoneType = await stoneTypesAPI.createStoneType({ name })
    setStoneTypes([...stoneTypes, newStoneType])
    form.setValue("stoneType", newStoneType.id.toString())
  }

  const addCertification = async (name: string) => {
    const newCertification = await certificationsAPI.createCertification({ name })
    setCertifications([...certifications, newCertification])
    form.setValue("certification", newCertification.id.toString())
  }

  if (loadingData) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">Loading form data...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
        <CardDescription>
          {product ? "Update product information" : "Create a new product in your inventory"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SKU" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Category</FormLabel>
      <div className="flex gap-2">
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {categories.map((category: any) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <QuickAddCategoryDialog
          categories={categories}
          onAdd={async (data) => {
            // You may need to adjust this API call to send all fields
            const newCategory = await categoriesAPI.createCategory(data)
            setCategories([...categories, newCategory])
            form.setValue("category", newCategory.id.toString())
          }}
        />
      </div>
      <FormMessage />
    </FormItem>
  )}
/>

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <div className="flex gap-2">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map((brand: any) => (
                              <SelectItem key={brand.id} value={brand.id.toString()}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <QuickAddBrandDialog
                          onAdd={async (data) => {
                            const newBrand = await brandsAPI.createBrand(data)
                            setBrands([...brands, newBrand])
                            form.setValue("brand", newBrand.id.toString())
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing & Stock</h3>

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            field.onChange(value === "" ? undefined : Number.parseFloat(value))
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            field.onChange(value === "" ? undefined : Number.parseInt(value))
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (grams)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            field.onChange(value === "" ? undefined : Number.parseFloat(value))
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="making_charge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Making Charge</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            field.onChange(value === "" ? undefined : Number.parseFloat(value))
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gst_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="18"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            field.onChange(value === "" ? undefined : Number.parseFloat(value))
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter product description" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Material Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="metalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metal Type</FormLabel>
                    <div className="space-y-2">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select metal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {metalTypes.map((metal: any) => (
                            <SelectItem key={metal.id} value={metal.id.toString()}>
                              {metal.metal_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <QuickAddMetalTypeDialog
                        onAdd={async (data) => {
                          const newMetalType = await metalTypesAPI.createMetalType(data)
                          setMetalTypes([...metalTypes, newMetalType])
                          form.setValue("metalType", newMetalType.id.toString())
                        }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stoneType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stone Type</FormLabel>
                    <div className="space-y-2">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stoneTypes.map((stone: any) => (
                            <SelectItem key={stone.id} value={stone.id.toString()}>
                              {stone.stone_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <QuickAddStoneTypeDialog
                        onAdd={async (data) => {
                          const newStoneType = await stoneTypesAPI.createStoneType(data)
                          setStoneTypes([...stoneTypes, newStoneType])
                          form.setValue("stoneType", newStoneType.id.toString())
                        }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="certification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certification</FormLabel>
                    <div className="space-y-2">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select certification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {certifications.map((cert: any) => (
                            <SelectItem key={cert.id} value={cert.id.toString()}>
                              {cert.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <QuickAddCertificationDialog
                        onAdd={async (data) => {
                          const newCertification = await certificationsAPI.createCertification(data)
                          setCertifications([...certifications, newCertification])
                          form.setValue("certification", newCertification.id.toString())
                        }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* HSN Code */}
            <FormField
              control={form.control}
              name="hsn_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HSN Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter HSN code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Images</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Label htmlFor="images" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-foreground">
                        Click to upload or drag and drop
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
                    </Label>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
