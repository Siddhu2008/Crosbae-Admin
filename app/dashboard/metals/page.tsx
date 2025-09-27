"use client";
// createMetalType
import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { metalTypesAPI } from "@/lib/services/Metal";  // you’ll need to create this
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { DataTable } from "@/components/data-table";
import { MetalForm, MetalFormValues } from "@/components/metal-form"; // form component you’ll build
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
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Metal = {
  id: number;
  metal_name: string;
  purity: string;
  // any other fields
};

export default function MetalsPage() {
  const [metals, setMetals] = useState<Metal[]>([]);
  const [purities, setPurities] = useState<{ id: number; name: string; description?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMetal, setEditingMetal] = useState<Metal | null>(null);
  const { toast } = useToast();

  const loadMetals = async () => {
    setLoading(true);
    try {
      const resp = await metalTypesAPI.getMetalTypes();
      const all = resp.results || resp;
      setMetals(all);
    } catch (error: any) {
      console.error("Failed to load metals:", error);
      toast({
        title: "Error",
        description: "Failed to load metals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPurities = async () => {
    try {
      const resp = await import("@/lib/services/Purities");
      const puritiesAPI = resp.puritiesAPI;
      const purityResp = await puritiesAPI.getPurities();
      setPurities(purityResp.results || purityResp);
    } catch (error) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    loadMetals();
    loadPurities();
  }, []);

  const handleCreate = async (data: MetalFormValues) => {
    try {
      await metalTypesAPI.createMetalType(data);
      toast({ title: "Success", description: "Metal added successfully" });
      setShowForm(false);
      loadMetals();
    } catch (error: any) {
      console.error("Create error", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to create metal",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (data: MetalFormValues) => {
    if (!editingMetal) return;
    try {
      await metalTypesAPI.updateMetalType(editingMetal.id, data);
      toast({ title: "Success", description: "Metal updated successfully" });
      setEditingMetal(null);
      setShowForm(false);
      loadMetals();
    } catch (error: any) {
      console.error("Update error", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update metal",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this metal?")) return;
    try {
      await metalTypesAPI.deleteMetalType(id);
      toast({ title: "Success", description: "Metal deleted" });
      loadMetals();
    } catch (error: any) {
      console.error("Delete error", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to delete metal",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Metal>[] = [
    {
      accessorKey: "name",
      header: "Metal Name",
      cell: ({ row }) => <span>{row.original.metal_name}</span>,
    },
    {
      accessorKey: "purity",
      header: "Purity",
      cell: ({ row }) => <span>{row.original.purity}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const rec = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingMetal(rec);
                setShowForm(true);
              }}
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(rec.id)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col pt-15 md:pt-0">
        <DashboardHeader
          title="Metals Management"
          description="Manage metal types, purity, etc."
        />

        <div className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Metals</CardTitle>
                  <CardDescription>Manage metal types</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingMetal(null);
                    setShowForm(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Metal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={metals} searchKey="name" searchPlaceholder="Search metals..." />
            </CardContent>
          </Card>
        </div>

        <Dialog open={showForm} onOpenChange={(open) => {
          if (!open) setEditingMetal(null);
          setShowForm(open);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMetal ? "Edit Metal" : "Add New Metal"}
              </DialogTitle>
            </DialogHeader>
            <MetalForm
              metal={editingMetal ? {
                ...editingMetal,
                name: editingMetal.metal_name,
                purity: purities.find(p => p.name === editingMetal.purity)?.id?.toString() || ""
              } : undefined}
              purities={purities}
              onSubmit={editingMetal ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingMetal(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
