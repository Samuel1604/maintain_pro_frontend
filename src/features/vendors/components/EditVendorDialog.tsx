import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Vendor, VendorStatus } from "@/types/common.types";

interface EditVendorDialogProps {
  vendor: Vendor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (updated: Vendor) => void;
}

export function EditVendorDialog({ vendor, open, onOpenChange, onSaved }: EditVendorDialogProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    contactPerson: "",
    status: "active" as VendorStatus,
    slaResponseTime: "",
    slaResolutionTime: "",
    contractDocumentUrl: "",
  });

  useEffect(() => {
    if (!vendor || !open) return;
    setForm({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      contactPerson: vendor.contactPerson ?? "",
      status: vendor.status,
      slaResponseTime: String(vendor.slaResponseTime ?? ""),
      slaResolutionTime: String(vendor.slaResolutionTime ?? ""),
      contractDocumentUrl: vendor.contractDocumentUrl ?? "",
    });
  }, [vendor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const updated: Vendor = {
      ...vendor,
      name: form.name,
      email: form.email,
      phone: form.phone,
      contactPerson: form.contactPerson,
      status: form.status,
      slaResponseTime: form.slaResponseTime ? Number(form.slaResponseTime) : undefined,
      slaResolutionTime: form.slaResolutionTime ? Number(form.slaResolutionTime) : undefined,
      contractDocumentUrl: form.contractDocumentUrl || undefined,
    };
    setSaving(false);
    toast.success(`${updated.name} updated`);
    onSaved?.(updated);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Company name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Contact person</Label>
            <Input
              value={form.contactPerson}
              onChange={(e) => setForm((p) => ({ ...p, contactPerson: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>SLA Response (hrs)</Label>
              <Input
                type="number"
                value={form.slaResponseTime}
                onChange={(e) => setForm((p) => ({ ...p, slaResponseTime: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>SLA Resolution (hrs)</Label>
              <Input
                type="number"
                value={form.slaResolutionTime}
                onChange={(e) => setForm((p) => ({ ...p, slaResolutionTime: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Upload Contract (PDF)</Label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setForm((p) => ({ ...p, contractDocumentUrl: reader.result as string }));
                    toast.success("Contract PDF loaded");
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {form.contractDocumentUrl && (
              <p className="text-xs text-emerald-400">✓ Contract PDF uploaded successfully</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((p) => ({ ...p, status: v as VendorStatus }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
