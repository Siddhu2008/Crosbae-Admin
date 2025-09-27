"use client"

import { useState, useEffect, useCallback } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataTable } from "@/components/data-table"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  Users,
  UserCheck,
  UserX,
  Calendar,
} from "lucide-react"
import { customersAPI } from "@/lib/services/customers"

interface Customer {
  id: number
  email: string
  first_name?: string
  last_name?: string
  Picture?: string | null
  gender?: string
  dob?: string
  last_login?: string
  created_At: string
  phone?: string
  total_orders: number
  total_spent: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await customersAPI.getCustomers()
      console.log("Customers",response)
      setCustomers(response.results || response)
    } catch (error) {
      console.error("Failed to load customers:", error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original
        const initials = `${customer.first_name?.[0] || ""}${customer.last_name?.[0] || ""}`.toUpperCase()
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={customer.Picture || undefined} />
              <AvatarFallback>{initials || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium truncate">
                {customer.first_name} {customer.last_name}
              </div>
              <div className="text-sm text-muted-foreground">{customer.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "N/A",
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => {
        const gender = row.original.gender
        return gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "N/A"
      },
    },
    {
      accessorKey: "total_orders",
      header: "Orders",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.total_orders}</Badge>
      ),
    },
    {
      accessorKey: "total_spent",
      header: "Total Spent",
      cell: ({ row }) =>
        `₹${row.original.total_spent.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
    },
    {
      accessorKey: "last_login",
      header: "Last Login",
      cell: ({ row }) => {
        const lastLogin = row.original.last_login
        return lastLogin
          ? new Date(lastLogin).toLocaleDateString()
          : "Never"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original
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
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="mr-2 h-4 w-4" />
                Call Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Customer metrics
  const totalCustomers = customers.length
  const recentCustomers = customers.filter((c) => {
    const lastLogin = c.last_login ? new Date(c.last_login) : null
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return lastLogin && lastLogin > thirtyDaysAgo
  }).length
  const newCustomersThisMonth = customers.filter((c) => {
    const createdDate = new Date(c.created_At)
    const now = new Date()
    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    )
  }).length
  const highValueCustomers = customers.filter((c) => c.total_spent > 50000).length

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col pt-15 md:pt-0">
        <DashboardHeader
          title="Customer Management"
          description="Manage your customer base and relationships"
        />

        <div className="flex-1 p-4 md:p-6 space-y-6">
          {/* Customer Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCustomers}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recently Active</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentCustomers}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{newCustomersThisMonth}</div>
                <p className="text-xs text-muted-foreground">September</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Value</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{highValueCustomers}</div>
                <p className="text-xs text-muted-foreground">Spent over ₹50K</p>
              </CardContent>
            </Card>
          </div>

          {/* Customer Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
              <CardDescription>
                View and manage your customer database
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="overflow-auto">
                <DataTable
                  columns={columns}
                  data={customers}
                  searchKey="email"
                  searchPlaceholder="Search customers..."
                  className="min-w-[900px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
