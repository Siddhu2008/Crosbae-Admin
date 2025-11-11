"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { MoreHorizontal, Star, MessageSquare, XCircle, Plus, Eye } from "lucide-react"
import { reviewsAPI } from "@/lib/services/reviews"
import { customersAPI } from "@/lib/services/customers"
import { productsAPI } from "@/lib/services/Product"
import { mediaAPI } from "@/lib/services/media"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
const testimonialSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  name: z.string().min(1, "Content is required"),
  content: z.string().min(1, "Content is required"),
  rating: z.preprocess((val) => Number(val), z.number().min(1).max(5)),
  product_id: z.string().min(1, "Product is required"),
  is_featured: z.boolean(),
  image_url: z.string().optional(),
  video_url: z.string().optional(),
})
type TestimonialFormData = z.infer<typeof testimonialSchema>
interface Review {
  id: number
  // API may return customer as a string (username) or an object with name/email
  customer: string | { name: string; email?: string }
  // product may be an id or an object
  product: number | { id?: number; name?: string; sku?: string }
  rating: number
  // some APIs call the field `review` instead of `comment`
  comment?: string
  review?: string
  title?: string
  is_approved?: boolean
  created_at?: string
  updated_at?: string
}
interface Testimonial {
  id: number
  // backend may return customer as id or object
  customer?: number | { name?: string }
  // testimonial title/name
  name?: string
  content?: string
  image_url?: string | null
  video_url?: string | null
  is_approved?: boolean
  organization?: string | null
  created_at?: string
  // optional additional fields
  rating?: number
  product_name?: string
  is_featured?: boolean
}
export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"reviews" | "testimonials">("reviews")
  const [showTestimonialForm, setShowTestimonialForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [videoPreview, setVideoPreview] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState<string>("")
  const { toast } = useToast()
  // useForm typed as any to avoid resolver signature mismatch between zod and react-hook-form types
  const form = useForm<any>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      customer_id: "",
      name: "",
      content: "",
      rating: 5,
      product_id: "",
      is_featured: false,
      image_url: undefined,
      video_url: undefined,
    },
    mode: "onChange",
  })
const onSubmit = async (data: TestimonialFormData) => {
  try {
    setIsSubmitting(true);

    if (editingTestimonial) {
      await reviewsAPI.updateTestimonial(editingTestimonial.id, data);
    } else {
      await reviewsAPI.createTestimonial(data);
    }

    // Refetch all testimonials
    const updatedTestimonials = await reviewsAPI.getTestimonials();
    setTestimonials(updatedTestimonials.results);

    // Reset form
    setShowTestimonialForm(false);
    setEditingTestimonial(null);
    setImageFile(null);
    setVideoFile(null);
    setImagePreview("");
    setVideoPreview("");
    form.reset();

  } catch (error) {
    console.error(error);
  } finally {
    setIsSubmitting(false);
  }
};

  useEffect(() => {
    loadData()
    customersAPI.getCustomers().then(setCustomers)
    productsAPI.getProducts().then(setProducts)
  }, [])

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviewsData, testimonialsData] = await Promise.all([
        reviewsAPI.getReviews().catch(() => ({ results: [] })),
        reviewsAPI.getTestimonials().catch(() => ({ results: [] })),
      ]);
      setReviews(reviewsData.results || []);
      // Merge server-provided testimonials with any locally-created ones we persisted
      let results = testimonialsData.results || []
      try {
        const key = "local_testimonials"
        const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null
        const cached: Testimonial[] = raw ? JSON.parse(raw) : []
        if (cached.length > 0) {
          // prepend any cached testimonials not already returned by the server
          const presentIds = new Set(results.map((r: any) => r.id))
          const missing = cached.filter((t) => !presentIds.has(t.id))
          if (missing.length > 0) results = [...missing, ...results]

          // remove cached items that are now present on the server
          const remaining = cached.filter((t) => !results.some((r: any) => r.id === t.id && r.is_approved))
          try { localStorage.setItem(key, JSON.stringify(remaining)) } catch (_) {}
        }
      } catch (e) {
        // ignore localStorage or parse errors
      }
      setTestimonials(results);
      // Debug: log all reviews and testimonials
      console.log("Loaded reviews:", reviewsData);
      console.log("Loaded testimonials:", testimonialsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      setReviews([]);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }

  

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      await reviewsAPI.deleteReview(id)
      toast({
        title: "Success",
        description: "Review deleted successfully",
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
    }
  }



  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return
    try {
      await reviewsAPI.deleteTestimonial(id)
      toast({ title: "Success", description: "Testimonial deleted" })
      // remove from local cache if present
      try {
        const key = "local_testimonials"
        const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null
        const arr: Testimonial[] = raw ? JSON.parse(raw) : []
        const filtered = arr.filter((t) => t.id !== id)
        try { localStorage.setItem(key, JSON.stringify(filtered)) } catch (_) {}
      } catch (e) {}
      loadData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete testimonial", variant: "destructive" })
    }
  }

  const handleCreateTestimonial = async (data: TestimonialFormData) => {
    console.log("Submitting testimonial data:", data);
    setIsSubmitting(true)
    setUploadError("")
    try {
      let image_url = ""
      let video_url = ""
      if (imageFile) {
        try {
          const imgRes = await mediaAPI.uploadFile(imageFile)
          image_url = imgRes.url || imgRes.file_url || ""
        } catch (e) {
          setUploadError("Failed to upload image.")
          setIsSubmitting(false)
          return
        }
      }
      if (videoFile) {
        try {
          const vidRes = await mediaAPI.uploadFile(videoFile)
          video_url = vidRes.url || vidRes.file_url || ""
        } catch (e) {
          setUploadError("Failed to upload video.")
          setIsSubmitting(false)
          return
        }
      }
      const payload = {
        ...data,
        image_url: image_url || undefined,
        video_url: video_url || undefined,
      }
      const resp = await reviewsAPI.createTestimonial(payload)
      console.log("createTestimonial response:", resp)
      // Optimistically add created testimonial to local state in case the GET/list endpoint
      // doesn't immediately return the new item (some backends filter testimonials by featured/approved)
      setTestimonials((prev) => [resp, ...prev])
      try {
        const key = "local_testimonials"
        const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null
        const arr: Testimonial[] = raw ? JSON.parse(raw) : []
        if (!arr.find((t) => t.id === resp.id)) {
          arr.unshift(resp)
          try { localStorage.setItem(key, JSON.stringify(arr)) } catch (_) {}
        }
      } catch (e) {
        // ignore localStorage errors
      }
      toast({
        title: "Success",
        description: "Testimonial created successfully",
      })
      setShowTestimonialForm(false)
      setImageFile(null)
      setVideoFile(null)
      setImagePreview("")
      setVideoPreview("")
      form.reset()
    } catch (error: any) {
      console.error("createTestimonial error:", error)
      const serverMessage = error?.response?.data || error?.message || "Failed to create testimonial"
      toast({
        title: "Error",
        description: String(serverMessage),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleUpdateTestimonial = async (data: TestimonialFormData) => {
    if (!editingTestimonial) return
    setIsSubmitting(true)
    setUploadError("")
    try {
      let image_url = data.image_url || ""
      let video_url = data.video_url || ""
      if (imageFile) {
        try {
          const imgRes = await mediaAPI.uploadFile(imageFile)
          image_url = imgRes.url || imgRes.file_url || ""
        } catch (e) {
          setUploadError("Failed to upload image.")
          setIsSubmitting(false)
          return
        }
      }
      if (videoFile) {
        try {
          const vidRes = await mediaAPI.uploadFile(videoFile)
          video_url = vidRes.url || vidRes.file_url || ""
        } catch (e) {
          setUploadError("Failed to upload video.")
          setIsSubmitting(false)
          return
        }
      }
      const payload = {
        ...data,
        image_url: image_url || undefined,
        video_url: video_url || undefined,
      }
      const resp = await reviewsAPI.updateTestimonial(editingTestimonial.id, payload)
      console.log("updateTestimonial response:", resp)
      // Update local testimonials list with the updated item
      setTestimonials((prev) => prev.map((t) => (t.id === resp.id ? resp : t)))
      try {
        if (resp.is_approved) {
          const key = "local_testimonials"
          const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null
          const arr: Testimonial[] = raw ? JSON.parse(raw) : []
          const filtered = arr.filter((t) => t.id !== resp.id)
          try { localStorage.setItem(key, JSON.stringify(filtered)) } catch (_) {}
        }
      } catch (e) {
        // ignore localStorage errors
      }
      toast({
        title: "Success",
        description: "Testimonial updated successfully",
      })
      setEditingTestimonial(null)
      setShowTestimonialForm(false)
      setImageFile(null)
      setVideoFile(null)
      setImagePreview("")
      setVideoPreview("")
      form.reset()
    } catch (error: any) {
      console.error("updateTestimonial error:", error)
      const serverMessage = error?.response?.data || error?.message || "Failed to update testimonial"
      toast({
        title: "Error",
        description: String(serverMessage),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const reviewColumns: ColumnDef<Review>[] = [
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original.customer
        if (!customer) return <div>-</div>
        if (typeof customer === "string") {
          return <div className="font-medium">{customer}</div>
        }
        return (
          <div>
            <div className="font-medium">{customer.name || customer.email || "-"}</div>
            {customer.email && <div className="text-sm text-muted-foreground">{customer.email}</div>}
          </div>
        )
      },
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original.product
        if (!product) return <div>-</div>
        if (typeof product === "number") {
          return <div>Product ID: {product}</div>
        }
        return (
          <div>
            <div className="font-medium">{product.name || `ID: ${product?.id ?? "-"}`}</div>
            <div className="text-sm text-muted-foreground">SKU: {product.sku || "-"}</div>
          </div>
        )
      },
    },

    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div className="font-medium">{row.original.title || "-"}</div>,
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => {
        const rating = row.original.rating
        return (
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
              />
            ))}
            <span className="ml-2 text-sm">{rating}/5</span>
          </div>
        )
      },
    },
    {
      accessorKey: "comment",
      header: "Comment",
      cell: ({ row }) => {
        const text = row.original.review || row.original.comment || "-"
        return (
          <div className="max-w-xs truncate" title={String(text)}>
            {text}
          </div>
        )
      },
    },

    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <div>
          {row.original.created_at ? new Date(row.original.created_at).toLocaleString() : "-"}
        </div>
      ),
    },

    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ row }) => (
        <div>
          {row.original.updated_at ? new Date(row.original.updated_at).toLocaleString() : "-"}
        </div>
      ),
    },
    
    {
      id: "actions",
        cell: ({ row }) => {
          const review = row.original
          return (
            <div className="flex items-center gap-2">
                          
              <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDeleteReview(review.id)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )
        },
    },
  ]
  const testimonialColumns: ColumnDef<Testimonial>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name || row.original.product_name || "-"}</div>,
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.content}>
          {row.original.content || "-"}
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const c = row.original.customer
        if (!c) return <div>-</div>
        // If backend returned an id, try to resolve the customer's display name from loaded customers
        if (typeof c === "number") {
          const cust = customers.find((x) => {
            // some customer objects are nested under `user` with an id
            const id = x?.user?.id ?? x?.id
            return id === c
          })
          if (cust) return <div className="font-medium">{cust.user?.first_name || cust.user?.email || `ID: ${c}`}</div>
          return <div>Customer ID: {c}</div>
        }
        return <div className="text-sm text-muted-foreground">{c.name || "-"}</div>
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => <div>{row.original.created_at ? new Date(row.original.created_at).toLocaleString() : "-"}</div>,
    },
    {
      header: "Status",
      accessorKey: "is_approved",
      cell: ({ row }) => (row.original.is_approved ? <Badge variant="outline">Approved</Badge> : <Badge variant="destructive">Pending</Badge>),
    },
    {
      header: "Media",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.image_url ? (
            <a href={row.original.image_url} target="_blank" rel="noreferrer" title="View image">
              <img src={row.original.image_url} alt="img" className="h-8 w-8 rounded object-cover" />
            </a>
          ) : null}
          {row.original.video_url ? (
            <a href={row.original.video_url} target="_blank" rel="noreferrer" title="View video">
              <Eye className="h-5 w-5" />
            </a>
          ) : null}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const testimonial = row.original
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" title="Edit" onClick={() => { setEditingTestimonial(testimonial); setShowTestimonialForm(true); form.reset(testimonial) }}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDeleteTestimonial(testimonial.id)}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]
  return (
    <DashboardLayout>
      <div className="pt-15 md:pt-0 ">
        <DashboardHeader title="Reviews and Testimonials" description="Manage all customer reviews and testimonials here." />
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 mb-6 p-5">
          <Card>
            <CardHeader>
              <CardTitle>Total Reviews</CardTitle>
              <CardDescription className="text-2xl font-bold">{reviews.length}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Approved Reviews</CardTitle>
              <CardDescription className="text-2xl font-bold">{reviews.filter(r => r.is_approved).length}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription className="text-2xl font-bold">{reviews.filter(r => !r.is_approved).length}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Testimonials</CardTitle>
              <CardDescription className="text-2xl font-bold">{testimonials.length}</CardDescription>
            </CardHeader>
          </Card>
        </div>
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-muted p-1 rounded-lg w-full sm:w-fit mb-4 p-5">
          <Button
            variant={activeTab === "reviews" ? "default" : "ghost"}
            onClick={() => setActiveTab("reviews")}
            className="rounded-md"
          >
            Reviews
          </Button>
          <Button
            variant={activeTab === "testimonials" ? "default" : "ghost"}
            onClick={() => setActiveTab("testimonials")}
            className="rounded-md"
          >
            Testimonials
          </Button>
        </div>
        {/* Data Table */}
        <Card>
          <CardContent className="overflow-x-auto">
            {activeTab === "reviews" ? (
              <DataTable
                columns={reviewColumns}
                data={reviews}
                searchKey="customer"
                searchPlaceholder="Search reviews..."
              // loading={loading}
              />
            ) : (
              <DataTable
                columns={testimonialColumns}
                data={testimonials}
                searchKey="name"
                searchPlaceholder="Search testimonials..."
              // loading={loading}
              />
            )}
          </CardContent>
        </Card>
        {/* Add Testimonial Button */}
        {activeTab === "testimonials" && (
          <div className="mt-6 flex justify-end p-5">
            <Button
              onClick={() => {
                setShowTestimonialForm(true)
                setEditingTestimonial(null)
                form.reset()
              }}
            >
              Add Testimonial
            </Button>
          </div>
        )}
        {/* Testimonial Form Dialog */}
        <Dialog open={showTestimonialForm} onOpenChange={setShowTestimonialForm}>
          <DialogContent className="sm:max-w-lg w-full">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
              <DialogDescription>
                Fill out the testimonial details and submit.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data: TestimonialFormData) => {
                  console.log("✅ FORM SUBMITTED!", data)
                  if (editingTestimonial) handleUpdateTestimonial(data)
                  else handleCreateTestimonial(data)
                })}

                className="flex flex-col gap-4 w-full max-w-full sm:max-w-lg mx-auto px-2 sm:px-0"
              >
                {/* Customer & Product in one row */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="flex-1">
                    <FormLabel htmlFor="customer_id">Customer</FormLabel>
                    <Select
                      value={form.watch("customer_id")}
                      onValueChange={(val) => form.setValue("customer_id", val)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.user.id} value={String(c.user.id)}>
                            {c.user.first_name || c.user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <FormLabel htmlFor="product_id">Product</FormLabel>
                    <Select value={form.watch("product_id")} onValueChange={val => form.setValue("product_id", val)}>
                      <SelectTrigger id="product_id" className="w-full">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 w-full">
                        {products.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.name || p.title || p.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Name */}
                <div>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input
                    id="name"
                    placeholder="Enter name"
                    {...form.register("name", { required: true })}
                    required
                  />
                </div>
                {/* Content */}
                <div>
                  <FormLabel htmlFor="content">Content</FormLabel>
                  <Textarea id="content" {...form.register("content", { required: true })} placeholder="Testimonial content" rows={4} required />
                </div>
                {/* Product & Rating in one row */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">

                  <div className="flex-1">
                    <FormLabel htmlFor="rating">Rating</FormLabel>
                    <Input id="rating" type="number" min={1} max={5} {...form.register("rating", { valueAsNumber: true, required: true })} placeholder="Rating (1-5)" required className="w-full" />
                  </div>
                </div>
                {/* Image & Video in one row */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="flex-1">
                    <FormLabel htmlFor="image">Image (optional)</FormLabel>
                    <Input id="image" type="file" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0] || null
                      setImageFile(file)
                      setImagePreview(file ? URL.createObjectURL(file) : "")
                    }} className="w-full" />
                    {imagePreview && (
                      <div className="mt-2 flex justify-center"><img src={imagePreview} alt="Preview" className="max-h-32 rounded border w-auto max-w-full" /></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <FormLabel htmlFor="video">Video (optional)</FormLabel>
                    <Input id="video" type="file" accept="video/*" onChange={e => {
                      const file = e.target.files?.[0] || null
                      setVideoFile(file)
                      setVideoPreview(file ? URL.createObjectURL(file) : "")
                    }} className="w-full" />
                    {videoPreview && (
                      <div className="mt-2 flex justify-center">
                        <video src={videoPreview} controls className="max-h-32 rounded border w-auto max-w-full" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Is Featured */}
                <div className="flex items-center space-x-2">
                  <input id="is_featured" type="checkbox" checked={form.watch("is_featured")} onChange={e => form.setValue("is_featured", e.target.checked)} className="h-4 w-4 rounded border" />
                  <FormLabel htmlFor="is_featured" className="font-normal">Featured</FormLabel>
                </div>
                {/* Created At (read-only, only on edit) */}
                {editingTestimonial && (
                  <div>
            <FormLabel>Created At</FormLabel>
              <Input value={editingTestimonial.created_at ? new Date(editingTestimonial.created_at).toLocaleString() : ""} readOnly disabled />
                  </div>
                )}
                {uploadError && <div className="text-red-500 text-sm mb-2">{uploadError}</div>}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowTestimonialForm(false)
                      setEditingTestimonial(null)
                      setImageFile(null)
                      setVideoFile(null)
                      setImagePreview("")
                      setVideoPreview("")
                      form.reset()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editingTestimonial ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
