"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataTable } from "@/components/data-table"
import { CouponForm } from "@/components/coupon-form"
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
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Ticket,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react"
import { couponsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Coupon {
  id: number
  code: string
  description?: string
  discount_type: "percentage" | "fixed_amount"
  discount_value: number
  min_order_amount?: number
  max_discount_amount?: number
  start_date: string
  end_date: string
  max_uses?: number
  current_uses: number
  is_active: boolean
  created_at: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      const response = await couponsAPI.getCoupons()
      setCoupons(response.results || [])
    } catch (error) {
      console.error("Failed to load coupons:", error)
      // Mock data for demo
      setCoupons([
        {
          id: 1,
          code: "SAVE20",
          description: "20% off on all jewelry items",
          discount_type: "percentage",
          discount_value: 20,
          min_order_amount: 5000,
          max_discount_amount: 10000,
          start_date: "2024-01-01T00:00:00Z",
          end_date: "2024-03-31T23:59:59Z",
          max_uses: 100,
          current_uses: 45,
          is_active: true,
          created_at: "2024-01-01T10:00:00Z",
        },
        {
          id: 2,
          code: "FLAT1000",
          description: "Flat ₹1000 off on orders above ₹10000",
          discount_type: "fixed_amount",
          discount_value: 1000,
          min_order_amount: 10000,
          start_date: "2024-01-15T00:00:00Z",
          end_date: "2024-02-15T23:59:59Z",
          max_uses: 50,
          current_uses: 12,
          is_active: true,
          created_at: "2024-01-15T09:30:00Z",
        },
        {
          id: 3,
          code: "WELCOME15",
          description: "Welcome offer for new customers",
          discount_type: "percentage",
          discount_value: 15,
          min_order_amount: 2000,
          max_discount_amount: 5000,
          start_date: "2024-01-01T00:00:00Z",
          end_date: "2024-12-31T23:59:59Z",
          current_uses: 234,
          is_active: true,
          created_at: "2024-01-01T08:00:00Z",
        },
        {
          id: 4,
          code: "EXPIRED10",
          description: "Expired 10% discount",
          discount_type: "percentage",
          discount_value: 10,
          min_order_amount: 1000,
          max_discount_amount: 2000,
          start_date: "2023-12-01T00:00:00Z",
          end_date: "2023-12-31T23:59:59Z",
          max_uses: 200,
          current_uses: 156,
          is_active: false,
          created_at: "2023-12-01T10:00:00Z",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCoupon = async (data: any) => {
    try {
      await couponsAPI.createCoupon(data)
      toast({
        title: "Success",
        description: "Coupon created successfully",
      })
      setShowForm(false)
      loadCoupons()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create coupon",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCoupon = async (data: any) => {
    if (!editingCoupon) return

    try {
      await couponsAPI.updateCoupon(editingCoupon.id, data)
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      })
      setEditingCoupon(null)
      setShowForm(false)
      loadCoupons()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCoupon = async (id: number) => {
    try {
      await couponsAPI.deleteCoupon(id)
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      })
      loadCoupons()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Coupon code copied to clipboard",
    })
  }

  const isExpired = (endDate: string) => new Date(endDate) < new Date()
  const isActive = (coupon: Coupon) => coupon.is_active && !isExpired(coupon.end_date)

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "code",
      header: "Coupon Code",
      cell: ({ row }) => {
        const coupon = row.original
        return (
          <div className="flex items-center space-x-2">
            <div>
              <div className="font-mono font-medium">{coupon.code}</div>
              <div className="text-sm text-muted-foreground">{coupon.description}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(coupon.code)}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) => {
        const coupon = row.original
        return (
          <div>
            <div className="font-medium">
              {coupon.discount_type === "percentage"
                ? `${coupon.discount_value}%`
                : `₹${coupon.discount_value.toLocaleString()}`}
            </div>
            {coupon.min_order_amount && (
              <div className="text-xs text-muted-foreground">
                Min: ₹{coupon.min_order_amount.toLocaleString()}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "usage",
      header: "Usage",
      cell: ({ row }) => {
        const coupon = row.original
        const usagePercentage = coupon.max_uses
          ? (coupon.current_uses / coupon.max_uses) * 100
          : 0
        return (
          <div className="space-y-1">
            <div className="text-sm">
              {coupon.current_uses} {coupon.max_uses ? `/ ${coupon.max_uses}` : "uses"}
            </div>
            {coupon.max_uses && <Progress value={usagePercentage} className="h-2 w-16" />}
          </div>
        )
      },
    },
    {
      accessorKey: "validity",
      header: "Validity",
      cell: ({ row }) => {
        const coupon = row.original
        const startDate = new Date(coupon.start_date)
        const endDate = new Date(coupon.end_date)
        const expired = isExpired(coupon.end_date)

        return (
          <div className="text-sm">
            <div>{startDate.toLocaleDateString()}</div>
            <div className={expired ? "text-red-500" : "text-muted-foreground"}>
              to {endDate.toLocaleDateString()}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const coupon = row.original
        const active = isActive(coupon)
        const expired = isExpired(coupon.end_date)

        return (
          <Badge variant={active ? "default" : expired ? "destructive" : "secondary"}>
            {active ? "Active" : expired ? "Expired" : "Inactive"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const coupon = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(coupon.code)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEditingCoupon(coupon)
                  setShowForm(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteCoupon(coupon.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Calculate metrics
  const totalCoupons = coupons.length
  const activeCoupons = coupons.filter(isActive).length
  const expiredCoupons = coupons.filter((c) => isExpired(c.end_date)).length
  const totalUses = coupons.reduce((sum, coupon) => sum + coupon.current_uses, 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading coupons...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col pt-15 md:pt-0">
        <DashboardHeader
          title="Coupon Management"
          description="Create and manage discount coupons"
        />

        <div className="flex-1 p-6 space-y-6">
          {/* Coupon Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCoupons}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeCoupons}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expired Coupons</CardTitle>
                <Calendar className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{expiredCoupons}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalUses}</div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Coupons */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Coupons</CardTitle>
              <CardDescription>Most used coupons this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coupons
                  .sort((a, b) => b.current_uses - a.current_uses)
                  .slice(0, 3)
                  .map((coupon) => {
                    const usagePercentage = coupon.max_uses
                      ? (coupon.current_uses / coupon.max_uses) * 100
                      : 0
                    return (
                      <div key={coupon.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{coupon.code}</p>
                            <p className="text-sm text-muted-foreground">{coupon.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{coupon.current_uses} uses</p>
                          {coupon.max_uses && (
                            <div className="flex items-center space-x-2">
                              <Progress value={usagePercentage} className="h-2 w-20" />
                              <span className="text-xs text-muted-foreground">
                                {usagePercentage.toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Coupons Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Coupons</CardTitle>
                  <CardDescription>Manage your discount coupons</CardDescription>
                </div>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Coupon
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={coupons}
                searchKey="code"
                searchPlaceholder="Search coupons..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Coupon Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
            </DialogHeader>
            <CouponForm
              coupon={editingCoupon}
              onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
              onCancel={() => {
                setShowForm(false)
                setEditingCoupon(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
