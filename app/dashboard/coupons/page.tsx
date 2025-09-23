"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { inventoryAPI } from "@/lib/services/inventory";
import { couponsAPI } from "@/lib/services/inventory";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { DataTable } from "@/components/data-table";
import { CouponForm , CouponFormValues} from "@/components/coupon-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Ticket,
  Users,
  Calendar as CalendarIcon,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Coupon } from "@/types/coupon";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const response = await couponsAPI.getCoupons();
      // adjust depending on API (might be response.data or response.data.results)
      setCoupons(response.results || response);
    } catch (error: any) {
      console.error("Failed to load coupons:", error);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (data: CouponFormValues) => {
  try {
    // data.start_date and end_date are already strings like "2025-09-23"
    await couponsAPI.createCoupon(data);
    toast({
      title: "Success",
      description: "Coupon created successfully",
    });
    setShowForm(false);
    loadCoupons();
  } catch (error: any) {
    console.error("Create coupon error", error);
    toast({
      title: "Error",
      description: error?.response?.data?.detail || "Failed to create coupon",
      variant: "destructive",
    });
  }
};


  const handleUpdateCoupon = async (data: CouponFormValues) => {
  if (!editingCoupon) return;
  try {
    await couponsAPI.updateCoupon(editingCoupon.id, data);
    toast({
      title: "Success",
      description: "Coupon updated successfully",
    });
    setEditingCoupon(null);
    setShowForm(false);
    loadCoupons();
  } catch (error: any) {
    console.error("Update coupon error", error);
    toast({
      title: "Error",
      description: error?.response?.data?.detail || "Failed to update coupon",
      variant: "destructive",
    });
  }
};


  const handleDeleteCoupon = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await couponsAPI.deleteCoupon(id);
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
      loadCoupons();
    } catch (error: any) {
      console.error("Delete coupon error", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Coupon code copied to clipboard",
    });
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();
  const isActive = (coupon: Coupon) => coupon.is_active && !isExpired(coupon.end_date);

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "code",
      header: "Coupon Code",
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <div className="flex items-center space-x-2">
            <div>
              <div className="font-mono font-medium">{coupon.code}</div>
              <div className="text-sm text-muted-foreground">{coupon.description}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(coupon.code)}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "discount_value",
      header: "Discount",
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <div>
            <div className="font-medium">
              {coupon.discount_type === "percentage"
                ? `${coupon.discount_value}%`
                : `₹${coupon.discount_value.toLocaleString()}`}
            </div>
            {coupon.min_order_amount != null && (
              <div className="text-xs text-muted-foreground">
                Min: ₹{coupon.min_order_amount.toLocaleString()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "current_uses",
      header: "Usage",
      cell: ({ row }) => {
        const coupon = row.original;
        const usagePercentage = coupon.max_uses
          ? (coupon.current_uses / coupon.max_uses) * 100
          : 0;
        return (
          <div className="space-y-1">
            <div className="text-sm">
              {coupon.current_uses}{" "}
              {coupon.max_uses ? `/ ${coupon.max_uses}` : "uses"}
            </div>
            {coupon.max_uses && (
              <Progress value={usagePercentage} className="h-2 w-16" />
            )}
          </div>
        );
      },
    },
    {
      id: "validity",
      header: "Validity",
      cell: ({ row }) => {
        const coupon = row.original;
        const start = new Date(coupon.start_date);
        const end = new Date(coupon.end_date);
        const expired = isExpired(coupon.end_date);
        return (
          <div className="text-sm">
            <div>{start.toLocaleDateString()}</div>
            <div className={expired ? "text-red-500" : "text-muted-foreground"}>
              to {end.toLocaleDateString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const coupon = row.original;
        const active = isActive(coupon);
        const expired = isExpired(coupon.end_date);
        return (
          <Badge
            variant={active ? "default" : expired ? "destructive" : "secondary"}
          >
            {active ? "Active" : expired ? "Expired" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(coupon.code)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEditingCoupon(coupon);
                  setShowForm(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteCoupon(coupon.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col pt-15 md:pt-0">
        <DashboardHeader
          title="Coupon Management"
          description="Create and manage discount coupons"
        />

        <div className="flex-1 p-6 space-y-6">
          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle>Total Coupons</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{coupons.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle>Active Coupons</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {coupons.filter(isActive).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle>Expired Coupons</CardTitle>
                <CalendarIcon className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {coupons.filter((c) => isExpired(c.end_date)).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle>Total Uses</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {coupons.reduce((sum, c) => sum + c.current_uses, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Coupons</CardTitle>
                  <CardDescription>Manage your discount coupons</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingCoupon(null);
                    setShowForm(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Coupon
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={coupons}
                searchKey="code"
                searchPlaceholder="Search coupons..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={(open) => { if (!open) setEditingCoupon(null); setShowForm(open); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </DialogTitle>
            </DialogHeader>
            <CouponForm
              coupon={editingCoupon ?? undefined}
              onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
              onCancel={() => {
                setShowForm(false);
                setEditingCoupon(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
