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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { MoreHorizontal, Star, MessageSquare, CheckCircle, XCircle, Plus, Eye } from "lucide-react"
import { reviewsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const testimonialSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  content: z.string().min(1, "Content is required"),
  rating: z.number().min(1).max(5),
  product_name: z.string().optional(),
  is_featured: z.boolean().default(false),
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
  const { toast } = useToast()

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      customer_name: "",
      content: "",
      rating: 5,
      product_name: "",
      is_featured: false,
    },
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [reviewsData, testimonialsData] = await Promise.all([
        reviewsAPI.getReviews().catch(() => ({ results: [] })),
        reviewsAPI.getTestimonials().catch(() => ({ results: [] })),
      ])

      setReviews(reviewsData.results || [])
      setTestimonials(testimonialsData.results || [])
    } catch (error) {
      console.error("Failed to load data:", error)
      // Mock data for demo
      setReviews([
        {
          id: 1,
          customer: { name: "Priya Sharma", email: "priya@example.com" },
          product: { name: "Gold Necklace Set", sku: "GNS001" },
          rating: 5,
          comment: "Beautiful necklace! Excellent quality and fast delivery.",
          is_approved: false,
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          customer: { name: "Rahul Kumar", email: "rahul@example.com" },
          product: { name: "Diamond Earrings", sku: "DE002" },
          rating: 4,
          comment: "Good quality diamonds, but delivery was delayed.",
          is_approved: true,
          created_at: "2024-01-14T14:20:00Z",
        },
      ])

      setTestimonials([
        {
          id: 1,
          customer_name: "Anita Desai",
          content:
            "Amazing jewelry collection! I've been a customer for 3 years and always satisfied with the quality.",
          rating: 5,
          product_name: "Gold Collection",
          is_featured: true,
          created_at: "2024-01-10T09:00:00Z",
        },
      ])
    } finally {
      setLoading(false)
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
    try {
      await reviewsAPI.createTestimonial(data)
      toast({
        title: "Success",
        description: "Testimonial created successfully",
      })
      setShowTestimonialForm(false)
      form.reset()
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create testimonial",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTestimonial = async (data: TestimonialFormData) => {
    if (!editingTestimonial) return

    try {
      await reviewsAPI.updateTestimonial(editingTestimonial.id, data)
      toast({
        title: "Success",
        description: "Testimonial updated successfully",
      })
      setEditingTestimonial(null)
      setShowTestimonialForm(false)
      form.reset()
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update testimonial",
        variant: "destructive",
      })
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
          <DataTable
            columns={activeTab === "reviews" ? reviewColumns : testimonialColumns}
            data={activeTab === "reviews" ? reviews : testimonials}
            searchKey={activeTab === "reviews" ? "customer" : "customer_name"}
            searchPlaceholder={activeTab === "reviews" ? "Search reviews..." : "Search testimonials..."}
            loading={loading}
          />
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
            leftIcon={<Plus />}
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
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(editingTestimonial ? handleUpdateTestimonial : handleCreateTestimonial)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Customer name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Testimonial content" rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={5}
                        step={1}
                        placeholder="Rating (1 to 5)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="product_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Product name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Feature this testimonial</FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 p-5">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setShowTestimonialForm(false)
                    setEditingTestimonial(null)
                    form.reset()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {editingTestimonial ? "Update" : "Create"} Testimonial
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
