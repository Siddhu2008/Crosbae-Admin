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
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [metricsData, salesChartData, topProductsData, recentActivityData] = await Promise.all([
          dashboardAPI.getMetrics(),
          dashboardAPI.getSalesChart("30d"),
          dashboardAPI.getTopProducts(),
          dashboardAPI.getRecentActivity ? dashboardAPI.getRecentActivity() : Promise.resolve([]),
        ])
        setMetrics(metricsData)
        setSalesData(salesChartData)
        setTopProducts(topProductsData)
        setRecentActivity(recentActivityData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

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
                {recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No recent activity found.</p>
                ) : (
                  recentActivity.map((activity: any, index: number) => (
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  )
}
