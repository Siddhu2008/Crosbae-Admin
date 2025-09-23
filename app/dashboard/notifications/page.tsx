"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Bell, Plus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: number
  title: string
  message: string
  type: string
  createdAt: string
  read: boolean
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [form, setForm] = useState({ title: "", message: "", type: "info" })
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // @ts-ignore
        const { notificationsAPI } = await import("@/lib/api")
        const data = await notificationsAPI.getNotifications()
        setNotifications(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [toast])

  const handleDelete = async (id: number) => {
    try {
      // @ts-ignore
      const { notificationsAPI } = await import("@/lib/api")
      await notificationsAPI.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      toast({ title: "Deleted", description: "Notification deleted" })
    } catch {
      toast({ title: "Error", description: "Failed to delete notification", variant: "destructive" })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // @ts-ignore
      const { notificationsAPI } = await import("@/lib/api")
      const newNotification = await notificationsAPI.createNotification(form)
      setNotifications((prev) => [newNotification, ...prev])
      setForm({ title: "", message: "", type: "info" })
      toast({ title: "Created", description: "Notification sent" })
    } catch {
      toast({ title: "Error", description: "Failed to create notification", variant: "destructive" })
    }
  }

  const filteredNotifications = notifications.filter((n) =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const total = notifications.length
  const unread = notifications.filter((n) => !n.read).length
  const infoCount = notifications.filter((n) => n.type === "info").length
  const warningCount = notifications.filter((n) => n.type === "warning").length
  const errorCount = notifications.filter((n) => n.type === "error").length

  return (
    <DashboardLayout>
      <div className="flex flex-col pt-15 md:pt-0">
        <DashboardHeader title="Notifications" description="Manage system notifications" />
        <div className="flex-1 p-4 md:p-6 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Unread</CardTitle>
                <Badge variant="secondary">{unread}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{unread}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Info</CardTitle>
                <Badge variant="outline">{infoCount}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{infoCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Warning</CardTitle>
                <Badge variant="outline">{warningCount}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{warningCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Error</CardTitle>
                <Badge variant="destructive">{errorCount}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Create Notification */}
          <Card>
            <CardHeader>
              <CardTitle>Create Notification</CardTitle>
              <CardDescription>Send a new notification to users</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4 md:flex-row md:items-end" onSubmit={handleCreate}>
                <Input
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="md:w-1/4"
                />
                <Input
                  placeholder="Message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  className="md:w-2/4"
                />
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="border rounded px-2 py-2 md:w-1/6"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
                <Button type="submit" className="md:w-1/6">
                  <Plus className="h-4 w-4 mr-2" /> Send
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <CardTitle>Notification List</CardTitle>
                  <CardDescription>All system notifications</CardDescription>
                </div>
                <div className="w-full sm:w-64 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground text-sm">Loading...</p>
                ) : filteredNotifications.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No notifications found.</p>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" title={n.title}>{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate" title={n.message}>{n.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={n.type === "error" ? "destructive" : n.type === "warning" ? "outline" : "secondary"}>{n.type}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                          {!n.read && <Badge variant="secondary">Unread</Badge>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="mt-2 sm:mt-0 text-destructive" onClick={() => handleDelete(n.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
