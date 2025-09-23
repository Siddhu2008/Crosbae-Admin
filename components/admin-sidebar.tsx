"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Truck,
  Ticket,
  Upload,
  Star,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Tag,
  Layers,
  Menu,
  X,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Categories", href: "/dashboard/categories", icon: Layers },
  { name: "Brands", href: "/dashboard/brands", icon: Tag },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Shipping", href: "/dashboard/shipping", icon: Truck },
  { name: "Coupons", href: "/dashboard/coupons", icon: Ticket },
  { name: "Media", href: "/dashboard/media", icon: Upload },
  { name: "Reviews", href: "/dashboard/reviews", icon: Star },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const pathname = usePathname()
  const { user_data, logout } = useAuth()

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between sm:hidden">
        <div className="flex items-center gap-2">
          {/* Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Title */}
        <div className="text-sidebar-foreground font-bold text-lg select-none">Admin Panel</div>

        {/* Notification Icon */}
        <Link href="/dashboard/notifications">
          <Button variant="ghost" size="sm" className="relative text-sidebar-foreground hover:bg-sidebar-accent" aria-label="Notifications">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">3</span>
          </Button>
        </Link>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-12 left-0 h-[calc(100vh-3rem)] bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col z-40",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "sm:translate-x-0 sm:static sm:w-64",
          collapsed && "sm:w-16",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-sidebar-foreground select-none">Admin Panel</span>
            </div>
          )}
          {/* Collapse toggle only on desktop */}
          <div className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                      collapsed && "px-2",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                    onClick={() => setMobileOpen(false)} // Close sidebar on mobile nav click
                  >
                    <item.icon className={cn("w-5 h-5", !collapsed && "mr-3")} />
                    {!collapsed && <span>{item.name}</span>}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-sidebar-border">
          {!collapsed && user_data && (
            <div className="mb-3">
              <p className="text-sm font-medium text-sidebar-foreground">
                {user_data.first_name} {user_data.last_name}
              </p>
              <p className="text-xs text-muted-foreground">{user_data.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={logout}
            className={cn(
              "w-full text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed ? "px-2" : "justify-start",
            )}
          >
            <LogOut className={cn("w-5 h-5", !collapsed && "mr-3")} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
