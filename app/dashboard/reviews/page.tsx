"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { MoreHorizontal, Star, MessageSquare, CheckCircle, XCircle, Plus, Eye } from "lucide-react"
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
  content: z.string().min(1, "Content is required"),
  rating: z.number().min(1).max(5),
  product_id: z.string().min(1, "Product is required"),
  is_featured: z.boolean(),
  image_url: z.string().optional(),
  video_url: z.string().optional(),
})

type TestimonialFormData = z.infer<typeof testimonialSchema>

interface Review {
  id: number
  customer: { name: string; email: string }
  product: { name: string; sku: string }
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
}

interface Testimonial {
  id: number
  customer_name: string
  content: string
  rating: number
  product_name?: string
  is_featured: boolean
  created_at: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
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

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      customer_id: "",
      content: "",
      rating: 5,
      product_id: "",
      is_featured: false,
      image_url: undefined,
      video_url: undefined,
    },
    mode: "onChange",
  })

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
      setTestimonials(testimonialsData.results || []);
      // Debug: log all reviews and testimonials
      
    } catch (error) {
      console.error("Failed to load data:", error);
      setReviews([]);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }  

  const handleApproveReview = async (id: number) => {
    try {
      await reviewsAPI.approveReview(id)
      toast({
        title: "Success",
        description: "Review approved successfully",
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve review",
        variant: "destructive",
      })
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

  const handleCreateTestimonial = async (data: TestimonialFormData) => {
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
      await reviewsAPI.createTestimonial(payload)
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
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create testimonial",
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
      await reviewsAPI.updateTestimonial(editingTestimonial.id, payload)
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
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update testimonial",
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
        return (
          <div>
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-xs" title={customer.email}>
              {customer.email}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original.product
        return (
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
          </div>
        )
      },
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
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.comment}>
          {row.original.comment}
        </div>
      ),
    },
    {
      accessorKey: "is_approved",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_approved ? "default" : "secondary"}>
          {row.original.is_approved ? "Approved" : "Pending"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const review = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>
                <Eye className="mr-2 h-4 w-4" />
                View Full Review
              </DropdownMenuItem>
              {!review.is_approved && (
                <DropdownMenuItem onClick={() => handleApproveReview(review.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleDeleteReview(review.id)}>
                <XCircle className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const testimonialColumns: ColumnDef<Testimonial>[] = [
    {
      accessorKey: "customer_name",
      header: "Customer",
      cell: ({ row }) => <div>{row.original.customer_name}</div>,
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.content}>
          {row.original.content}
        </div>
      ),
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
      accessorKey: "product_name",
      header: "Product",
      cell: ({ row }) => <div>{row.original.product_name || "-"}</div>,
    },
    {
      accessorKey: "is_featured",
      header: "Featured",
      cell: ({ row }) =>
        row.original.is_featured ? (
          <Badge variant="default">Featured</Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const testimonial = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditingTestimonial(testimonial)
                  setShowTestimonialForm(true)
                  form.reset(testimonial)
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {/* Add delete testimonial action if needed */}
            </DropdownMenuContent>
          </DropdownMenu>
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
              searchKey="customer_name"
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
        <DialogContent className="sm:max-w-lg w-full" description="Fill out the testimonial details and submit.">
          <DialogHeader>
            <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            
              <form
                onSubmit={form.handleSubmit((data: TestimonialFormData) => {
                  if (editingTestimonial) {
                    handleUpdateTestimonial(data)
                  } else {
                    handleCreateTestimonial(data)
                  }
                })}
                className="flex flex-col gap-4 w-full max-w-full sm:max-w-lg mx-auto px-2 sm:px-0"
              >
  {/* Customer & Product in one row */}
  <div className="flex flex-col sm:flex-row gap-4 w-full">
    <div className="flex-1">
      <FormLabel htmlFor="customer_id">Customer</FormLabel>
      <Select value={form.watch("customer_id")} onValueChange={val => form.setValue("customer_id", val)}>
        <SelectTrigger id="customer_id" className="w-full">
          <SelectValue placeholder="Select customer" />
        </SelectTrigger>
        <SelectContent className="max-h-48 w-full">
          {customers.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>{c.name || c.email || c.id}</SelectItem>
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
      <Input value={new Date(editingTestimonial.created_at).toLocaleString()} readOnly disabled />
    </div>
  )}
  {uploadError && <div className="text-red-500 text-sm mb-2">{uploadError}</div>}
  <div className="flex justify-end space-x-2">
    <Button type="button" variant="outline" onClick={() => { setShowTestimonialForm(false); setEditingTestimonial(null); form.reset(); setImagePreview(""); setVideoPreview(""); setImageFile(null); setVideoFile(null); }}>Cancel</Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Submitting..." : editingTestimonial ? "Update" : "Create"} Testimonial
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
