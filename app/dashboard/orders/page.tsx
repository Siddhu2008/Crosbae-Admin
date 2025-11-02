"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"

interface Order {
  uuid: string
  customer: {
    id: number
    email: string
    first_name?: string
    last_name?: string
  }
  status: string
  order_on: string
  last_update: string
  total: number
  shipping_charge: number
  items_count: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  const loadOrders = async () => {
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const response = await ordersAPI.getOrders(params);

      // 👇 Log the entire response for debugging
      console.log("Fetched Orders:", response);

      setOrders(response.results || response);
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
        const customer = row.original.customer
        return (
          <div>
            <div className="font-medium">
              {customer.first_name} {customer.last_name}
            </div>
            <div className="text-sm text-muted-foreground">{customer.email}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
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
        return (
          <div>
            <div className="font-medium">₹{order.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              +₹{order.shipping_charge} shipping
            </div>
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
                <div>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>
                    Manage customer orders and track their status
                  </CardDescription>
                </div>
                <div className="w-full sm:w-40">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
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