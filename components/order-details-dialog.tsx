"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "./order-status-badge"
import { Package, User, MapPin, CreditCard } from "lucide-react"
import { ordersAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface OrderDetailsDialogProps {
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate?: () => void
}

interface OrderDetails {
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
  shipping_address: {
    title: string
    AddressLine1: string
    AddressLine2?: string
    City: string
    State: string
    Pincode: string
  }
  items: Array<{
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
    status: string
    method: string
    amount: number
    rayzorpay_payment_id: string
  }
}

export function OrderDetailsDialog({ orderId, open, onOpenChange, onStatusUpdate }: OrderDetailsDialogProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
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
      setOrder(orderData)
    } catch (error) {
      console.error("Failed to load order details:", error)
      // Mock data for demo
      setOrder({
        uuid: orderId,
        customer: {
          id: 1,
          email: "john.doe@example.com",
          first_name: "John",
          last_name: "Doe",
        },
        status: "processing",
        order_on: "2024-01-15T10:30:00Z",
        last_update: "2024-01-15T14:20:00Z",
        total: 47500,
        shipping_charge: 500,
        shipping_address: {
          title: "Home",
          AddressLine1: "123 Main Street",
          AddressLine2: "Apartment 4B",
          City: "Mumbai",
          State: "Maharashtra",
          Pincode: "400001",
        },
        items: [
          {
            id: 1,
            product: {
              id: 1,
              name: "Gold Necklace Set",
              sku: "GNS001",
            },
            quantity: 1,
            price: 45000,
          },
          {
            id: 2,
            product: {
              id: 4,
              name: "Pearl Ring",
              sku: "PR004",
            },
            quantity: 1,
            price: 2000,
          },
        ],
        payment: {
          id: 1,
          status: "completed",
          method: "credit_card",
          amount: 47500,
          rayzorpay_payment_id: "pay_123456789",
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return

    setUpdatingStatus(true)
    try {
      await ordersAPI.updateOrderStatus(order.uuid, newStatus)
      setOrder({ ...order, status: newStatus })
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

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details - #{order.uuid.slice(0, 8)}</span>
            <OrderStatusBadge status={order.status} />
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
                  <span className="font-mono">#{order.uuid.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span>{new Date(order.order_on).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Update:</span>
                  <span>{new Date(order.last_update).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">₹{order.total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>Change the order status</CardDescription>
              </CardHeader>
              <CardContent>
                <Select onValueChange={handleStatusUpdate} disabled={updatingStatus}>
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
                    {order.customer.first_name} {order.customer.last_name}
                  </p>
                  <p className="text-muted-foreground">{order.customer.email}</p>
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
                <p className="font-medium">{order.shipping_address.title}</p>
                <p>{order.shipping_address.AddressLine1}</p>
                {order.shipping_address.AddressLine2 && <p>{order.shipping_address.AddressLine2}</p>}
                <p>
                  {order.shipping_address.City}, {order.shipping_address.State} - {order.shipping_address.Pincode}
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
                {order.items.map((item) => (
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
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{order.shipping_charge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>₹{order.total.toLocaleString()}</span>
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
                        {order.payment.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="capitalize">{order.payment.method.replace("_", " ")}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span>₹{order.payment.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment ID:</span>
                      <span className="font-mono text-sm">{order.payment.rayzorpay_payment_id}</span>
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
