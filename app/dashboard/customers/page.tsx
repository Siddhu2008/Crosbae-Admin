"use client"

import { useState, useEffect, useCallback } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import api from "@/lib/api";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MoreHorizontal,
  Users,
  UserCheck,
  UserX,
  Calendar,
} from "lucide-react"

import { customersAPI } from "@/lib/services/customers" // Ensure this exists and works

interface Customer {
  id: number
  username?: string
  email: string
  first_name?: string
  last_name?: string
  picture?: string | null
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const loadCustomers = useCallback(async () => {
  setLoading(true);
  try {
    const customersResponse = await customersAPI.getCustomers();
    // Flatten customers if needed
    const flattened = (customersResponse.results || customersResponse).map((item: any) => {
  const user = item.user || {};


  return {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    picture: user.image_url || user.picture || null,
    gender: user.gender,
    dob: user.dob,
    last_login: user.last_login || item.last_login,
    created_At: user.created_At || item.created_At,
    total_orders: item.total_orders ?? 0,
    total_spent: item.total_spent ?? 0,
  };
});


    setCustomers(flattened);
  } catch (error) {
    console.error("Failed to load customers:", error);
    setCustomers([]);
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "first_name",
      header: "Name",
      cell: ({ row }) => {
        const customer = row.original
        const initials = `${customer.first_name?.[0] || ""}${customer.last_name?.[0] || ""}`.toUpperCase()
        return (
          <div
            className="flex items-center space-x-3 cursor-pointer hover:text-primary"
            onClick={() => setSelectedCustomer(customer)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={customer.picture || undefined} />
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
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
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
      cell: ({ row }) => <Badge variant="outline">{row.original.total_orders}</Badge>,
    },
    {
      accessorKey: "total_spent",
      header: "Total Spent",
      cell: ({ row }) =>
        `₹${(row.original.total_spent ?? 0).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
    },
    {
      accessorKey: "last_login",
      header: "Last Login",
      cell: ({ row }) => {
        const lastLogin = row.original.last_login
        return lastLogin ? new Date(lastLogin).toLocaleDateString() : "Never"
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCustomer(customer)}
              title="View"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (
                  window.confirm(`Are you sure you want to delete ${customer.email}?`)
                ) {
                  try {
                    await customersAPI.deleteCustomer(customer.id)
                    setSelectedCustomer(null)
                    loadCustomers()
                  } catch (err) {
                    alert("Failed to delete customer.")
                  }
                }
              }}
              title="Delete"
            >
              <UserX className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  // Metrics calculations
  const totalCustomers = customers.length
  const recentCustomers = customers.filter((c) => {
    if (!c.last_login) return false
    const lastLoginDate = new Date(c.last_login)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return lastLoginDate >= thirtyDaysAgo
  }).length
  const newCustomersThisMonth = customers.filter((c) => {
    if (!c.created_At) return false
    const createdDate = new Date(c.created_At)
    const now = new Date()
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
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
        <DashboardHeader title="Customer Management" description="Manage your customer base and relationships" />

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
                <p className="text-xs text-muted-foreground">This month</p>
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
              <CardDescription>View and manage your customer database</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="overflow-auto">
                <DataTable
                  columns={columns}
                  data={customers}
                  searchKey="email"
                  searchPlaceholder="Search customers..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Profile Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>Customer Profile</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col items-center text-center space-y-4 mt-2">
                <div className="relative w-24 h-24">
                  <Image
                    src={selectedCustomer.picture || "https://via.placeholder.com/150?text=No+Image"}
                    alt={selectedCustomer.first_name || "User"}
                    fill
                    className="rounded-full object-cover border border-border"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h3>
                                    <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>

                  {selectedCustomer.gender && <p className="text-sm text-muted-foreground">Gender: {selectedCustomer.gender}</p>}
                  {selectedCustomer.dob && (
                    <p className="text-sm text-muted-foreground">
                      Date of Birth: {new Date(selectedCustomer.dob).toLocaleDateString()}
                    </p>
                  )}
                  {selectedCustomer.last_login && (
                    <p className="text-sm text-muted-foreground">
                      Last Login: {new Date(selectedCustomer.last_login).toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Total Orders: {selectedCustomer.total_orders}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Spent: ₹{selectedCustomer.total_spent.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Joined: {new Date(selectedCustomer.created_At).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete ${selectedCustomer.email}?`)) {
                        try {
                          await customersAPI.deleteCustomer(selectedCustomer.id)
                          setSelectedCustomer(null)
                          loadCustomers()
                        } catch (err) {
                          alert("Failed to delete customer.")
                        }
                      }
                    }}
                  >
                    Delete Customer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

