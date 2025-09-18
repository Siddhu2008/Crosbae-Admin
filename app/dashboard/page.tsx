"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricCard } from "@/components/metric-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Eye,
} from "lucide-react"
import { dashboardAPI } from "@/lib/api"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface DashboardMetrics {
  totalRevenue: number
  totalOrders: number
  activeCustomers: number
  totalProducts: number
  revenueChange: string
  ordersChange: string
  customersChange: string
  productsChange: string
}

interface SalesData {
  date: string
  sales: number
  orders: number
}

interface TopProduct {
  id: number
  name: string
  sales: number
  revenue: number
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [metricsData, salesChartData, topProductsData] = await Promise.all([
        dashboardAPI.getMetrics(),
        dashboardAPI.getSalesChart("30d"),
        dashboardAPI.getTopProducts(),
      ])

      setMetrics(metricsData)
      setSalesData(salesChartData)
      setTopProducts(topProductsData)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      // Mock fallback data
      setMetrics({
        totalRevenue: 125430,
        totalOrders: 1247,
        activeCustomers: 892,
        totalProducts: 156,
        revenueChange: "+12.5% from last month",
        ordersChange: "+8.2% from last month",
        customersChange: "+15.3% from last month",
        productsChange: "+3 new products",
      })

      setSalesData([
        { date: "2024-01-01", sales: 12000, orders: 45 },
        { date: "2024-01-02", sales: 15000, orders: 52 },
        { date: "2024-01-03", sales: 18000, orders: 61 },
        { date: "2024-01-04", sales: 14000, orders: 48 },
        { date: "2024-01-05", sales: 22000, orders: 73 },
        { date: "2024-01-06", sales: 19000, orders: 65 },
        { date: "2024-01-07", sales: 25000, orders: 82 },
      ])

      setTopProducts([
        { id: 1, name: "Gold Necklace Set", sales: 45, revenue: 67500 },
        { id: 2, name: "Diamond Earrings", sales: 32, revenue: 48000 },
        { id: 3, name: "Silver Bracelet", sales: 28, revenue: 14000 },
        { id: 4, name: "Pearl Ring", sales: 24, revenue: 36000 },
        { id: 5, name: "Platinum Chain", sales: 19, revenue: 57000 },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen pt-15 md:pt-0">
        <DashboardHeader
          title="Dashboard"
          description="Welcome to your e-commerce admin panel"
        />

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Metrics Cards: stacked on mobile, grid on larger screens */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={`$${metrics?.totalRevenue.toLocaleString()}`}
              change={metrics?.revenueChange}
              changeType="positive"
              icon={DollarSign}
            />
            <MetricCard
              title="Total Orders"
              value={metrics?.totalOrders.toLocaleString() || "0"}
              change={metrics?.ordersChange}
              changeType="positive"
              icon={ShoppingCart}
            />
            <MetricCard
              title="Active Customers"
              value={metrics?.activeCustomers.toLocaleString() || "0"}
              change={metrics?.customersChange}
              changeType="positive"
              icon={Users}
            />
            <MetricCard
              title="Total Products"
              value={metrics?.totalProducts.toLocaleString() || "0"}
              change={metrics?.productsChange}
              changeType="neutral"
              icon={Package}
            />
          </div>

          {/* Charts Section: stacked on mobile, side-by-side on sm+ */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Sales Chart */}
            <Card className="min-h-[320px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp className="w-5 h-5" />
                  Sales Overview
                </CardTitle>
                <CardDescription>
                  Daily sales and orders for the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 h-[280px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Sales ($)"
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Package className="w-5 h-5" />
                  Top Products
                </CardTitle>
                <CardDescription>
                  Best performing products this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.sales} sales
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 text-right flex items-center space-x-2 sm:space-x-4 justify-end">
                        <p className="font-medium text-sm">
                          ${product.revenue.toLocaleString()}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-xs flex items-center gap-1 cursor-pointer select-none"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest orders and customer activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "order",
                    message: "New order #1247 received from John Doe",
                    time: "2 minutes ago",
                    status: "pending",
                  },
                  {
                    type: "payment",
                    message: "Payment of $450 confirmed for order #1246",
                    time: "5 minutes ago",
                    status: "completed",
                  },
                  {
                    type: "customer",
                    message: "New customer registration: jane@example.com",
                    time: "10 minutes ago",
                    status: "new",
                  },
                  {
                    type: "inventory",
                    message: "Low stock alert: Gold Necklace Set (5 remaining)",
                    time: "15 minutes ago",
                    status: "warning",
                  },
                  {
                    type: "order",
                    message: "Order #1245 shipped via FedEx",
                    time: "20 minutes ago",
                    status: "shipped",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : activity.status === "pending"
                          ? "secondary"
                          : activity.status === "warning"
                          ? "destructive"
                          : "outline"
                      }
                      className="mt-2 sm:mt-0"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  )
}
