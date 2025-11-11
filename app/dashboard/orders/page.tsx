"use client"

import React, { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataTable } from "@/components/data-table"
import { OrderDetailsDialog } from "@/components/order-details-dialog"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Eye,
  Truck,
  Package,
  DollarSign,
  Clock,
  Filter,
} from "lucide-react"
import { ordersAPI } from "@/lib/services/orders";
import { customersAPI } from "@/lib/services/customers";
import { useToast } from "@/hooks/use-toast"

interface Order {
  uuid: string
  // customer can be either an id (number) or an object with details
  customer: number | {
    id: number
    email: string
    first_name?: string
    last_name?: string
  }
  status: string
  status_display?: string
  order_on: string
  last_update: string
  subtotal?: number
  total: number
  shipping_charge?: string | number
  items_count?: number
  shipping_address?: { id: number; title?: string }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [customersMap, setCustomersMap] = useState<Record<number, string>>({})
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [filters, setFilters] = useState({ status: "all", dateRange: "all", customer: "" })
  const { toast } = useToast()

  useEffect(() => {
    // Load customers once and orders when filters change
    loadCustomers()
    loadOrders()
  }, [filters])

  const loadCustomers = async () => {
    try {
      const data = await customersAPI.getCustomers()
      const list = Array.isArray(data) ? data : data.results || data
      const map: Record<number, string> = {}
      list.forEach((c: any) => {
        const name = c.first_name || c.name || `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.email || `#${c.id}`
        map[c.id] = name
      })
      setCustomersMap(map)
    } catch (error) {
      console.warn("Failed to load customers for orders page", error)
    }
  }

  const loadOrders = async () => {
    try {
      const params: Record<string, any> = {}
      if (filters.status && filters.status !== "all") params.status = filters.status
      // dateRange can be mapped to from/to params if backend supports; here we send date_range
      if (filters.dateRange && filters.dateRange !== "all") params.date_range = filters.dateRange
      if (filters.customer) params.customer = filters.customer

      const response = await ordersAPI.getOrders(params)
      // 👇 Log the entire response for debugging
      console.log("Fetched Orders:", response)
      const fetched = response.results || response
      setOrders(fetched)
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      loadOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  }

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "uuid",
      header: "Order ID",
      cell: ({ row }) => {
        const order = row.original
        return (
          <div>
            <div className="font-mono text-sm">#{order.uuid.slice(0, 8)}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(order.order_on).toLocaleDateString()}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const cust = row.original.customer
        let name = "Unknown"
        let email = ""
        if (typeof cust === "number") {
          name = customersMap[cust] || `#${cust}`
        } else if (cust && typeof cust === "object") {
          name = `${cust.first_name ?? ""} ${cust.last_name ?? ""}`.trim() || customersMap[cust.id] || cust.email || `#${cust.id}`
          email = cust.email || ""
        }
        return (
          <div>
            <div className="font-medium">{name}</div>
            {email && <div className="text-sm text-muted-foreground">{email}</div>}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} label={row.original.status_display} />,
    },
    {
      accessorKey: "subtotal",
      header: "Subtotal",
      cell: ({ row }) => <div>₹{Number(row.original.subtotal ?? 0).toLocaleString()}</div>,
    },
    {
      accessorKey: "shipping_address",
      header: "Shipping",
      cell: ({ row }) => <div className="text-sm">{row.original.shipping_address?.title ?? "-"}</div>,
    },
    {
      accessorKey: "items_count",
      header: "Items",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span>{row.original.items_count}</span>
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const order = row.original
        const ship = order.shipping_charge ?? "0"
        return (
          <div>
            <div className="font-medium">₹{Number(order.total ?? 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">+₹{Number(ship).toLocaleString()} shipping</div>
          </div>
        )
      },
    },
    {
      accessorKey: "last_update",
      header: "Last Update",
      cell: ({ row }) => {
        const date = new Date(row.original.last_update)
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-muted-foreground">{date.toLocaleTimeString()}</div>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="relative">
            {/* Replaced DropdownMenu with a simple edit button */}
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setSelectedOrderId(order.uuid)} // Opens the dialog
            >
              <Eye className="h-4 w-4" /> {/* You can replace Eye with Edit icon */}
            </Button>
          </div>
        );
      },
    }

  ]

  // Calculate metrics
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const processingOrders = orders.filter((o) => o.status === "processing").length
  const shippedOrders = orders.filter((o) => o.status === "shipped").length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col pt-15 md:pt-0">
        <DashboardHeader
          title="Order Management"
          description="Track and manage customer orders"
        />

        <div className="flex-1 p-4 space-y-6 sm:p-6">
          {/* Order Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{processingOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{totalRevenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                
                {/* Filters card (status, date range, customer) - similar to Inventory filters UI */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Orders" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Orders</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Date Range</Label>
                      <Select value={filters.dateRange} onValueChange={(v) => setFilters({ ...filters, dateRange: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="All time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All time</SelectItem>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="this_month">This month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Customer</Label>
                      <Input
                        placeholder="Customer email or id"
                        value={filters.customer}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, customer: e.target.value })}
                      />
                    </div>

                    <div className="flex items-end space-x-2">
                      <Button variant="outline" onClick={() => setFilters({ status: "all", dateRange: "all", customer: "" })}>
                        Clear Filters
                      </Button>
                      <Button onClick={() => loadOrders()}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={orders}
                searchKey="uuid"
                searchPlaceholder="Search orders..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Details Dialog */}
        <OrderDetailsDialog
          orderId={selectedOrderId}
          open={!!selectedOrderId}
          onOpenChange={(open) => !open && setSelectedOrderId(null)}
          onStatusUpdate={loadOrders}
        />

      </div>
    </DashboardLayout>
  )
}