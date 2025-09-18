"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataTable } from "@/components/data-table"
import { PaymentStatusBadge } from "@/components/payment-status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Eye,
  Download,
  RefreshCw,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Filter,
} from "lucide-react"
import { paymentsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Payment {
  id: number
  customer: {
    id: number
    email: string
    first_name?: string
    last_name?: string
  }
  rayzorpay_payment_id: string
  rayzorpay_order_id: string
  payment_signature: string
  amount: number
  status: string
  method: string
  order: {
    uuid: string
    order_on: string
  }
  created_at: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadPayments()
  }, [statusFilter])

  const loadPayments = async () => {
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {}
      const response = await paymentsAPI.getPayments(params)
      setPayments(response.results || [])
    } catch (error) {
      console.error("Failed to load payments:", error)
      // Mock data for demo
      setPayments([
        {
          id: 1,
          customer: {
            id: 1,
            email: "john.doe@example.com",
            first_name: "John",
            last_name: "Doe",
          },
          rayzorpay_payment_id: "pay_123456789",
          rayzorpay_order_id: "order_987654321",
          payment_signature: "signature_abc123",
          amount: 47500,
          status: "completed",
          method: "credit_card",
          order: {
            uuid: "550e8400-e29b-41d4-a716-446655440001",
            order_on: "2024-01-15T10:30:00Z",
          },
          created_at: "2024-01-15T10:35:00Z",
        },
        {
          id: 2,
          customer: {
            id: 2,
            email: "jane.smith@example.com",
            first_name: "Jane",
            last_name: "Smith",
          },
          rayzorpay_payment_id: "pay_234567890",
          rayzorpay_order_id: "order_876543210",
          payment_signature: "signature_def456",
          amount: 32000,
          status: "completed",
          method: "upi",
          order: {
            uuid: "550e8400-e29b-41d4-a716-446655440002",
            order_on: "2024-01-14T09:15:00Z",
          },
          created_at: "2024-01-14T09:20:00Z",
        },
        {
          id: 3,
          customer: {
            id: 3,
            email: "bob.wilson@example.com",
            first_name: "Bob",
            last_name: "Wilson",
          },
          rayzorpay_payment_id: "pay_345678901",
          rayzorpay_order_id: "order_765432109",
          payment_signature: "signature_ghi789",
          amount: 18000,
          status: "completed",
          method: "net_banking",
          order: {
            uuid: "550e8400-e29b-41d4-a716-446655440003",
            order_on: "2024-01-13T16:45:00Z",
          },
          created_at: "2024-01-13T16:50:00Z",
        },
        {
          id: 4,
          customer: {
            id: 4,
            email: "alice.brown@example.com",
            first_name: "Alice",
            last_name: "Brown",
          },
          rayzorpay_payment_id: "pay_456789012",
          rayzorpay_order_id: "order_654321098",
          payment_signature: "",
          amount: 25000,
          status: "pending",
          method: "credit_card",
          order: {
            uuid: "550e8400-e29b-41d4-a716-446655440004",
            order_on: "2024-01-15T18:20:00Z",
          },
          created_at: "2024-01-15T18:25:00Z",
        },
        {
          id: 5,
          customer: {
            id: 5,
            email: "charlie.davis@example.com",
            first_name: "Charlie",
            last_name: "Davis",
          },
          rayzorpay_payment_id: "pay_567890123",
          rayzorpay_order_id: "order_543210987",
          payment_signature: "",
          amount: 15000,
          status: "failed",
          method: "debit_card",
          order: {
            uuid: "550e8400-e29b-41d4-a716-446655440005",
            order_on: "2024-01-12T14:10:00Z",
          },
          created_at: "2024-01-12T14:15:00Z",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleExportPayments = async () => {
    setExporting(true)
    try {
      const blob = await paymentsAPI.exportPayments({ status: statusFilter !== "all" ? statusFilter : undefined })

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `payments-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Payments exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export payments",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "rayzorpay_payment_id",
      header: "Payment ID",
      cell: ({ row }) => {
        const payment = row.original
        return (
          <div>
            <div className="font-mono text-sm">{payment.rayzorpay_payment_id}</div>
            <div className="text-xs text-muted-foreground">Order: #{payment.order.uuid.slice(0, 8)}</div>
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
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => <div className="font-medium">₹{row.original.amount.toLocaleString()}</div>,
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => {
        const method = row.original.method
        const methodLabels: Record<string, string> = {
          credit_card: "Credit Card",
          debit_card: "Debit Card",
          net_banking: "Net Banking",
          upi: "UPI",
          wallet: "Wallet",
        }
        return (
          <Badge variant="outline" className="capitalize">
            {methodLabels[method] || method}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at)
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
        const payment = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </DropdownMenuItem>
              {payment.status === "completed" && (
                <DropdownMenuItem className="text-orange-600">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Initiate Refund
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Calculate metrics
  const totalPayments = payments.length
  const completedPayments = payments.filter((p) => p.status === "completed")
  const pendingPayments = payments.filter((p) => p.status === "pending")
  const failedPayments = payments.filter((p) => p.status === "failed")
  const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const successRate = totalPayments > 0 ? (completedPayments.length / totalPayments) * 100 : 0

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payments...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // ... previous code

return (
  <DashboardLayout>
    <div className="flex flex-col pt-15 md:pt-0">
      <DashboardHeader
        title="Payment Management"
        description="Track and manage payment transactions"
      />

      <div className="flex-1 p-4 md:p-6 space-y-6">
        {/* Payment Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                From {completedPayments.length} completed payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {completedPayments.length} of {totalPayments} payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{failedPayments.length}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods & Recent Transactions */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-6">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Distribution of payment methods used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  payments.reduce(
                    (acc, payment) => {
                      acc[payment.method] = (acc[payment.method] || 0) + 1
                      return acc
                    },
                    {} as Record<string, number>
                  )
                ).map(([method, count]) => {
                  const percentage = (count / payments.length) * 100
                  const methodLabels: Record<string, string> = {
                    credit_card: "Credit Card",
                    debit_card: "Debit Card",
                    net_banking: "Net Banking",
                    upi: "UPI",
                    wallet: "Wallet",
                  }
                  return (
                    <div key={method} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-sm">{methodLabels[method] || method}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{count}</span>
                        <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest payment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {payment.customer.first_name} {payment.customer.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{payment.amount.toLocaleString()}</p>
                      <PaymentStatusBadge status={payment.status} className="text-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
              <div>
                <CardTitle>Payment Transactions</CardTitle>
                <CardDescription>View and manage all payment transactions</CardDescription>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:gap-2 w-full md:w-auto">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  className="w-full md:w-40"
                >
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleExportPayments}
                  disabled={exporting}
                  className="w-full md:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {exporting ? "Exporting..." : "Export CSV"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={payments}
              searchKey="rayzorpay_payment_id"
              searchPlaceholder="Search payments..."
              className="min-w-[600px]" // force min width for table on small devices to scroll horizontally
            />
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
)
}
