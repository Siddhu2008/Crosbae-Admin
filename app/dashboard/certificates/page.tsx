"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { certificationsAPI } from "@/lib/services/certifications";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { DataTable } from "@/components/data-table";
import { CertificateForm, CertificateFormValues } from "@/components/certificate-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Certificate = {
  id: number;
  name: string;
  // maybe certificate code, issuer etc
};

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const { toast } = useToast();

  const loadCerts = async () => {
    setLoading(true);
    try {
      const resp = await certificationsAPI.getCertifications();
      const all = resp.results || resp;
      setCerts(all);
    } catch (error: any) {
      console.error("Load certs error", error);
      toast({ title: "Error", description: "Failed to load certificates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCerts();
  }, []);

  const handleCreate = async (data: CertificateFormValues) => {
    try {
      await certificationsAPI.createCertification(data);
      toast({ title: "Success", description: "Certificate added" });
      setShowForm(false);
      loadCerts();
    } catch (error: any) {
      console.error("Create error", error);
      toast({ title: "Error", description: error?.response?.data?.detail || "Failed to create certificate", variant: "destructive" });
    }
  };

  const handleUpdate = async (data: CertificateFormValues) => {
    if (!editingCert) return;
    try {
      await certificationsAPI.updateCertification(editingCert.id, data);
      toast({ title: "Success", description: "Updated certificate" });
      setEditingCert(null);
      setShowForm(false);
      loadCerts();
    } catch (error: any) {
      console.error("Update error", error);
      toast({ title: "Error", description: error?.response?.data?.detail || "Update failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this certificate?")) return;
    try {
      await certificationsAPI.deleteCertification(id);
      toast({ title: "Success", description: "Certificate deleted" });
      loadCerts();
    } catch (error: any) {
      console.error("Delete error", error);
      toast({ title: "Error", description: error?.response?.data?.detail || "Delete failed", variant: "destructive" });
    }
  };

  const columns: ColumnDef<Certificate>[] = [
    {
      accessorKey: "name",
      header: "Certificate Name",
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
                setEditingCert(rec);
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
        <DashboardHeader title="Certificates Management" description="Manage certificates" />
        <div className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Certificates</CardTitle>
                  <CardDescription>Manage certificate entries</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingCert(null);
                    setShowForm(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Certificate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={certs} searchKey="name" searchPlaceholder="Search certificates..." />
            </CardContent>
          </Card>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => {
          if (!open) setEditingCert(null);
          setShowForm(open);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingCert ? "Edit Certificate" : "Add Certificate"}</DialogTitle></DialogHeader>
            <CertificateForm
              certificate={editingCert ?? undefined}
              onSubmit={editingCert ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingCert(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
