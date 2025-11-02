"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "./order-status-badge"
import { Package, User, MapPin, CreditCard } from "lucide-react"
import { ordersAPI } from "@/lib/services/orders"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface OrderDetailsDialogProps {
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate?: () => void
}

interface OrderDetails {
  uuid: string
  customer?: {
    id: number
    email?: string
    first_name?: string
    last_name?: string
  }
  status?: string
  order_on?: string
  last_update?: string
  total?: number
  shipping_charge?: number
  shipping_address?: {
    title?: string
    AddressLine1?: string
    AddressLine2?: string
    City?: string
    State?: string
    Pincode?: string
  }
  items?: Array<{
    id: number
    product: {
      id: number
      name: string
      sku: string
    }
    quantity: number
    price: number
  }>
  payment?: {
    id: number
    status?: string
    method?: string
    amount?: number
    rayzorpay_payment_id?: string
  }
}

export function OrderDetailsDialog({ orderId, open, onOpenChange, onStatusUpdate }: OrderDetailsDialogProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("pending")
  const { toast } = useToast()

  useEffect(() => {
    if (orderId && open) {
      loadOrderDetails()
    }
  }, [orderId, open])

  const loadOrderDetails = async () => {
    if (!orderId) return

    setLoading(true)
    try {
      const orderData = await ordersAPI.getOrder(orderId)
      setOrder({
        ...orderData,
        items: orderData.items || [],
        customer: orderData.customer || {},
        shipping_address: orderData.shipping_address || {},
        payment: orderData.payment || undefined,
      })
      setSelectedStatus(orderData.status || "pending")
    } catch (error) {
      console.error("Failed to load order details:", error)
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!order) return

    setUpdatingStatus(true)
    try {
      await ordersAPI.updateOrderStatus(order.uuid!, selectedStatus)
      setOrder({ ...order, status: selectedStatus })
      toast({
        title: "Success",
        description: "Order status updated successfully",
      })
      onStatusUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!order) return null

  const subtotal = order.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details - #{order.uuid?.slice(0, 8)}</span>
            <OrderStatusBadge status={order.status || "pending"} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info & Status Update */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono">#{order.uuid?.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span>{order.order_on ? new Date(order.order_on).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Update:</span>
                  <span>{order.last_update ? new Date(order.last_update).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">₹{(order.total || 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>Change the order status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  onValueChange={(value) => setSelectedStatus(value)}
                  value={selectedStatus}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || selectedStatus === order.status}
                >
                  {updatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">
                    {order.customer?.first_name || ""} {order.customer?.last_name || ""}
                  </p>
                  <p className="text-muted-foreground">{order.customer?.email || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.shipping_address?.title || "N/A"}</p>
                <p>{order.shipping_address?.AddressLine1 || ""}</p>
                {order.shipping_address?.AddressLine2 && <p>{order.shipping_address.AddressLine2}</p>}
                <p>
                  {order.shipping_address?.City || ""}, {order.shipping_address?.State || ""} -{" "}
                  {order.shipping_address?.Pincode || ""}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString()} each</p>
                    </div>
                  </div>
                )) || <p>No items in this order.</p>}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{(order.shipping_charge || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>₹{(order.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {order.payment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <Badge variant={order.payment.status === "completed" ? "default" : "secondary"}>
                        {order.payment.status || "N/A"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="capitalize">{order.payment.method?.replace("_", " ") || "N/A"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span>₹{(order.payment.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment ID:</span>
                      <span className="font-mono text-sm">{order.payment.rayzorpay_payment_id || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
