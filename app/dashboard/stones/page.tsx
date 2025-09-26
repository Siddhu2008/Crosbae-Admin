"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { stoneTypesAPI } from "@/lib/services/Stone";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { DataTable } from "@/components/data-table";
import { StoneForm, StoneFormValues } from "@/components/stone-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Stone = {
  id: number;
  stone_name: string;
  // other fields
};

export default function StonesPage() {
  const [stones, setStones] = useState<Stone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStone, setEditingStone] = useState<Stone | null>(null);
  const { toast } = useToast();

  const loadStones = async () => {
    setLoading(true);
    try {
      const resp = await stoneTypesAPI.getStoneTypes();
      const all = resp.results || resp;
      setStones(all);
    } catch (error: any) {
      console.error("Failed load stones:", error);
      toast({ title: "Error", description: "Failed to load stones", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStones();
  }, []);

  const handleCreate = async (data: StoneFormValues) => {
    try {
      await stoneTypesAPI.createStoneType(data);
      toast({ title: "Success", description: "Stone added" });
      setShowForm(false);
      loadStones();
    } catch (error: any) {
      console.error("Create error", error);
      toast({ title: "Error", description: error?.response?.data?.detail || "Failed to create stone", variant: "destructive" });
    }
  };

  const handleUpdate = async (data: StoneFormValues) => {
    if (!editingStone) return;
    try {
      await stoneTypesAPI.updateStoneType(editingStone.id, data);
      toast({ title: "Success", description: "Stone updated" });
      setEditingStone(null);
      setShowForm(false);
      loadStones();
    } catch (error: any) {
      console.error("Update error", error);
      toast({ title: "Error", description: error?.response?.data?.detail || "Failed to update stone", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this stone?")) return;
    try {
      await stoneTypesAPI.deleteStoneType(id);
      toast({ title: "Success", description: "Stone deleted" });
      loadStones();
    } catch (error: any) {
      console.error("Delete error", error);
      toast({ title: "Error", description: error?.response?.data?.detail || "Delete failed", variant: "destructive" });
    }
  };

  const columns: ColumnDef<Stone>[] = [
    {
      accessorKey: "name",
      header: "Stone Name",
      cell: ({ row }) => <span>{row.original.stone_name}</span>,
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
                setEditingStone(rec);
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
        <DashboardHeader title="Stones Management" description="Manage stone types" />
        <div className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Stones</CardTitle>
                  <CardDescription>Manage stone types</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingStone(null);
                    setShowForm(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stone
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={stones} searchKey="name" searchPlaceholder="Search stones..." />
            </CardContent>
          </Card>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => {
          if (!open) setEditingStone(null);
          setShowForm(open);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingStone ? "Edit Stone" : "Add Stone"}</DialogTitle></DialogHeader>
            <StoneForm
              stone={editingStone ?? undefined}
              onSubmit={editingStone ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingStone(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
