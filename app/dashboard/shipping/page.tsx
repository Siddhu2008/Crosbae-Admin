"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataTable } from "@/components/data-table"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { shippingAPI } from "@/lib/services/inventory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  MapPin,
  Clock,
  Plus,
  ExternalLink,
} from "lucide-react"

interface Shipment {
  id: number
  order_id: string
  shiprocket_order_id: string
  shiprocket_shipment_id: string
  awb_number?: string
  courier_name?: string
  tracking_url?: string
  status: string
  pickup_scheduled_date?: string
  created_at: string
  customer: {
    name: string
    email: string
  }
  order: {
    total: number
    items_count: number
  }
}

export default function ShippingPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [showTrackingDialog, setShowTrackingDialog] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)

  useEffect(() => {
    loadShipments()
  }, [])

  const loadShipments = async () => {
    try {
      // Get all shipping records
      const params = {}
      const shippingList = await shippingAPI.getShipping(params);
      setShipments(shippingList)

      // Mock data for demo - replace with actual API call
      setShipments([
        {
          id: 1,
          order_id: "550e8400-e29b-41d4-a716-446655440001",
          shiprocket_order_id: "SR123456",
          shiprocket_shipment_id: "SH789012",
          awb_number: "AWB123456789",
          courier_name: "FedEx",
          tracking_url: "https://fedex.com/track/AWB123456789",
          status: "shipped",
          pickup_scheduled_date: "2024-01-16T10:00:00Z",
          created_at: "2024-01-15T14:30:00Z",
          customer: {
            name: "John Doe",
            email: "john.doe@example.com",
          },
          order: {
            total: 47500,
            items_count: 2,
          },
        },
        {
          id: 2,
          order_id: "550e8400-e29b-41d4-a716-446655440002",
          shiprocket_order_id: "SR234567",
          shiprocket_shipment_id: "SH890123",
          awb_number: "AWB234567890",
          courier_name: "Blue Dart",
          tracking_url: "https://bluedart.com/track/AWB234567890",
          status: "delivered",
          pickup_scheduled_date: "2024-01-14T15:00:00Z",
          created_at: "2024-01-14T11:20:00Z",
          customer: {
            name: "Jane Smith",
            email: "jane.smith@example.com",
          },
          order: {
            total: 32000,
            items_count: 1,
          },
        },
        {
          id: 3,
          order_id: "550e8400-e29b-41d4-a716-446655440003",
          shiprocket_order_id: "SR345678",
          shiprocket_shipment_id: "SH901234",
          courier_name: "DTDC",
          status: "processing",
          pickup_scheduled_date: "2024-01-17T09:00:00Z",
          created_at: "2024-01-15T16:45:00Z",
          customer: {
            name: "Bob Wilson",
            email: "bob.wilson@example.com",
          },
          order: {
            total: 18000,
            items_count: 1,
          },
        },
      ])
    } catch (error) {
      console.error("Failed to load shipments:", error)
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnDef<Shipment>[] = [
    {
      accessorKey: "order_id",
      header: "Order ID",
      cell: ({ row }) => {
        const shipment = row.original
        return (
          <div>
            <div className="font-mono text-sm truncate" title={shipment.order_id}>
              #{shipment.order_id.slice(0, 8)}
            </div>
            <div className="text-xs text-muted-foreground truncate" title={shipment.shiprocket_order_id}>
              SR: {shipment.shiprocket_order_id}
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
            <div className="font-medium truncate" title={customer.name}>{customer.name}</div>
            <div className="text-sm text-muted-foreground truncate" title={customer.email}>
              {customer.email}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "courier_name",
      header: "Courier",
      cell: ({ row }) => {
        const courier = row.original.courier_name
        return courier ? (
          <Badge variant="outline" className="truncate max-w-[6rem] sm:max-w-xs">
            {courier}
          </Badge>
        ) : (
          <span className="text-muted-foreground">Not assigned</span>
        )
      },
    },
    {
      accessorKey: "awb_number",
      header: "AWB Number",
      cell: ({ row }) => {
        const awb = row.original.awb_number
        return awb ? (
          <div className="font-mono text-sm truncate max-w-[6rem] sm:max-w-xs" title={awb}>
            {awb}
          </div>
        ) : (
          <span className="text-muted-foreground">Pending</span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "pickup_scheduled_date",
      header: "Pickup Date",
      cell: ({ row }) => {
        const date = row.original.pickup_scheduled_date
        return date ? (
          <div className="text-sm whitespace-nowrap">{new Date(date).toLocaleDateString()}</div>
        ) : (
          <span className="text-muted-foreground">Not scheduled</span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const shipment = row.original
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
                  setSelectedShipment(shipment)
                  setShowTrackingDialog(true)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {shipment.tracking_url && (
                <DropdownMenuItem onClick={() => window.open(shipment.tracking_url, "_blank")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Track Package
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Package className="mr-2 h-4 w-4" />
                Update Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Calculate metrics
  const totalShipments = shipments.length
  const pendingShipments = shipments.filter((s) => s.status === "processing").length
  const shippedShipments = shipments.filter((s) => s.status === "shipped").length
  const deliveredShipments = shipments.filter((s) => s.status === "delivered").length

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shipments...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <DashboardHeader title="Shipping Management" description="Track and manage order shipments" />

        <div className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Shipping Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                <Package className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalShipments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <Clock className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingShipments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Shipped</CardTitle>
                <Truck className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{shippedShipments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <MapPin className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{deliveredShipments}</div>
              </CardContent>
            </Card>
          </div>

          {/* Shipments Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <CardTitle>Shipments</CardTitle>
                  <CardDescription>Track and manage order shipments</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto flex items-center justify-center sm:justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Shipment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Shipment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="order-id">Order ID</Label>
                        <Input id="order-id" placeholder="Enter order ID" />
                      </div>
                      <div>
                        <Label htmlFor="courier">Courier Partner</Label>
                        <Input id="courier" placeholder="Select courier partner" />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline">Cancel</Button>
                        <Button>Create Shipment</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={shipments}
                searchKey="order_id"
                searchPlaceholder="Search shipments..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Tracking Details Dialog */}
        <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
          <DialogContent className="max-w-lg w-full sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Shipment Details</DialogTitle>
            </DialogHeader>
            {selectedShipment && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Order ID</Label>
                    <p className="font-mono truncate" title={selectedShipment.order_id}>
                      #{selectedShipment.order_id.slice(0, 8)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">AWB Number</Label>
                    <p className="font-mono truncate" title={selectedShipment.awb_number || "Not assigned"}>
                      {selectedShipment.awb_number || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Courier</Label>
                    <p className="truncate" title={selectedShipment.courier_name || "Not assigned"}>
                      {selectedShipment.courier_name || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <OrderStatusBadge status={selectedShipment.status} />
                  </div>
                </div>
                {selectedShipment.tracking_url && (
                  <div className="pt-4">
                    <Button
                      onClick={() => window.open(selectedShipment.tracking_url, "_blank")}
                      className="w-full sm:w-auto flex items-center justify-center sm:justify-start"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Track Package
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
