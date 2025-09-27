"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { puritiesAPI } from "@/lib/services/Purities";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { DataTable } from "@/components/data-table";
import { PurityForm, PurityFormValues } from "@/components/purity-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Purity = {
  id: number;
  name: string;  // e.g. "18K", "22K"
};

export default function PurityPage() {
  const [purities, setPurities] = useState<Purity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPurity, setEditingPurity] = useState<Purity | null>(null);
  const { toast } = useToast();

  const loadPurities = async () => {
    setLoading(true);
    try {
      const resp = await puritiesAPI.getPurities();
      const all = resp.results || resp;
      setPurities(all);
    } catch (error: any) {
      console.error("Load purity error", error);
      toast({ title: "Error", description: "Failed to load purities", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurities();
  }, []);

  const handleCreate = async (data: PurityFormValues) => {
    try {
      await puritiesAPI.createPurity(data);
      toast({ title: "Success", description: "Purity added" });
      setShowForm(false);
      loadPurities();
    } catch (error: any) {
      console.error("Create error", error);
      toast({ title: "Error", description: error?.response?.data?.detail || "Failed to create purity", variant: "destructive" });
    }
  };

  const handleUpdate = async (data: PurityFormValues) => {
    if (!editingPurity) return;
    try {
      await puritiesAPI.updatePurity(editingPurity.id, data);
      toast({ title: "Success", description: "Purity updated" });
      setEditingPurity(null);
      setShowForm(false);
      loadPurities();
    } catch (error: any) {
      console.error("Update error", error);
      toast({ title: "Error", description: error?.response?.data?.detail || "Update failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this purity?")) return;
    try {
      await puritiesAPI.deletePurity(id);
      toast({ title: "Success", description: "Purity deleted" });
      loadPurities();
    } catch (error: any) {
      console.error("Delete error", error);
      toast({ title: "Error", description: error?.response?.data?.detail || "Delete failed", variant: "destructive" });
    }
  };

  const columns: ColumnDef<Purity>[] = [
    {
      accessorKey: "name",
      header: "Purity Name",
      cell: ({ row }) => <span>{row.original.name}</span>,
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
                setEditingPurity(rec);
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
        <DashboardHeader title="Purities Management" description="Manage purity values" />
        <div className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Purities</CardTitle>
                  <CardDescription>Manage purity values</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingPurity(null);
                    setShowForm(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Purity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={purities} searchKey="name" searchPlaceholder="Search purities..." />
            </CardContent>
          </Card>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => {
          if (!open) setEditingPurity(null);
          setShowForm(open);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingPurity ? "Edit Purity" : "Add Purity"}</DialogTitle></DialogHeader>
            <PurityForm
              purity={editingPurity ? { ...editingPurity } : undefined}
              onSubmit={editingPurity ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingPurity(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
