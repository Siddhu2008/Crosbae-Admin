"use client"

import type React from "react"

import { AdminSidebar } from "./admin-sidebar"
import { AuthGuard } from "./auth-guard"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard requireAdmin>
      <div className="flex flex-col sm:flex-row h-screen bg-background">
        <AdminSidebar className="sm:h-full" />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </AuthGuard>
  )
}
