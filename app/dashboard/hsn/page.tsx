"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { hsncodesAPI } from "@/lib/services/HSN";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { DataTable } from "@/components/data-table";
import { HsnForm, HsnFormValues } from "@/components/hsn-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type HSN = {
  id: number;
  hsn_code: string;
  description?: string;
};

export default function HsnPage() {
  const [hsnList, setHsnList] = useState<HSN[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHsn, setEditingHsn] = useState<HSN | null>(null);
  const { toast } = useToast();

  const loadHsn = async () => {
    setLoading(true);
    try {
      const resp = await hsncodesAPI.getHSNCodes();
      const all = resp.results || resp;
      setHsnList(all);
    } catch (error: any) {
      console.error("Load hsn error", error);
      toast({ title: "Error", description: "Failed to load HSN codes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHsn();
  }, []);

  const handleCreate = async (data: HsnFormValues) => {
    try {
      await hsncodesAPI.createHSNCode(data);
      toast({ title: "Success", description: "HSN added" });
      setShowForm(false);
      loadHsn();
    } catch (error: any) {
      console.error("Create error", error);
      toast({ title: "Error", description: error?.response?.data?.detail || "HSN create failed", variant: "destructive" });
    }
  };

  const handleUpdate = async (data: HsnFormValues) => {
    if (!editingHsn) return;
    try {
      await hsncodesAPI.updateHSNCode(editingHsn.id, data);
      toast({ title: "Success", description: "HSN updated" });
      setEditingHsn(null);
      setShowForm(false);
      loadHsn();
    } catch (error: any) {
      console.error("Update error", error);
      toast({ title: "Error", description: error?.response?.data?.detail || "HSN update failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this HSN code?")) return;
    try {
      await hsncodesAPI.deleteHSNCode(id);
      toast({ title: "Success", description: "HSN deleted" });
      loadHsn();
    } catch (error: any) {
      console.error("Delete error", error);
      toast({ title: "Error", description: error?.response?.data?.detail || "HSN delete failed", variant: "destructive" });
    }
  };

  const columns: ColumnDef<HSN>[] = [
    {
      accessorKey: "Id",
      header: "HSN Id",
      cell: ({ row }) => <span>{row.original.id}</span>,
    },
    {
      accessorKey: "code",
      header: "HSN Code",
      cell: ({ row }) => <span>{row.original.hsn_code || "-"}</span>,
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
                setEditingHsn(rec);
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
        <DashboardHeader title="HSN Codes Management" description="Manage HSN codes" />
        <div className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>HSN Codes</CardTitle>
                  <CardDescription>Manage HSN codes</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingHsn(null);
                    setShowForm(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add HSN
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={hsnList} searchKey="code" searchPlaceholder="Search HSN codes..." />
            </CardContent>
          </Card>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => {
          if (!open) setEditingHsn(null);
          setShowForm(open);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingHsn ? "Edit HSN" : "Add HSN"}</DialogTitle></DialogHeader>
            <HsnForm
              hsn={editingHsn ?? undefined}
              onSubmit={editingHsn ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingHsn(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
