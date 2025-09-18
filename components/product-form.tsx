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
import { inventoryAPI } from "@/lib/api"

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

function QuickAddDialog({
  title,
  placeholder,
  onAdd,
}: {
  title: string
  placeholder: string
  onAdd: (name: string) => Promise<void>
}) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) return

    setLoading(true)
    try {
      await onAdd(name.trim())
      setName("")
      setOpen(false)
    } catch (error) {
      console.error(`Failed to add ${title.toLowerCase()}:`, error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add {title}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {title}</DialogTitle>
          <DialogDescription>Create a new {title.toLowerCase()} to use in your products.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder={placeholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={loading || !name.trim()}>
            {loading ? "Adding..." : `Add ${title}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [metalTypes, setMetalTypes] = useState([])
  const [stoneTypes, setStoneTypes] = useState([])
  const [certifications, setCertifications] = useState([])
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

      setCategories(categoriesData.results || [])
      setBrands(brandsData.results || [])
      setMetalTypes(metalTypesData.results || [])
      setStoneTypes(stoneTypesData.results || [])
      setCertifications(certificationsData.results || [])
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
    const newCategory = await inventoryAPI.createCategory({ name })
    setCategories([...categories, newCategory])
    form.setValue("category", newCategory.id.toString())
  }

  const addBrand = async (name: string) => {
    const newBrand = await inventoryAPI.createBrand({ name })
    setBrands([...brands, newBrand])
    form.setValue("brand", newBrand.id.toString())
  }

  const addMetalType = async (name: string) => {
    const newMetalType = await inventoryAPI.createMetalType({ name })
    setMetalTypes([...metalTypes, newMetalType])
    form.setValue("metalType", newMetalType.id.toString())
  }

  const addStoneType = async (name: string) => {
    const newStoneType = await inventoryAPI.createStoneType({ name })
    setStoneTypes([...stoneTypes, newStoneType])
    form.setValue("stoneType", newStoneType.id.toString())
  }

  const addCertification = async (name: string) => {
    const newCertification = await inventoryAPI.createCertification({ name })
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
                        <QuickAddDialog title="Category" placeholder="Enter category name" onAdd={addCategory} />
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
                        <QuickAddDialog title="Brand" placeholder="Enter brand name" onAdd={addBrand} />
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
                              {metal.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <QuickAddDialog title="Metal Type" placeholder="Enter metal type" onAdd={addMetalType} />
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
                              {stone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <QuickAddDialog title="Stone Type" placeholder="Enter stone type" onAdd={addStoneType} />
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
                      <QuickAddDialog
                        title="Certification"
                        placeholder="Enter certification name"
                        onAdd={addCertification}
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
