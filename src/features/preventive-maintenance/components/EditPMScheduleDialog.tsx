import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PMFrequency } from "@/types/common.types";
import type { PreventiveMaintenanceRecord } from "../types/preventiveMaintenance.types";
import { preventiveMaintenanceApi } from "@/features/preventive-maintenance/api/preventiveMaintenance.api";

const FREQUENCIES: PMFrequency[] = ["daily", "weekly", "monthly", "yearly"];

interface EditPMScheduleDialogProps {
  schedule: PreventiveMaintenanceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPMScheduleDialog({ schedule, open, onOpenChange }: EditPMScheduleDialogProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    frequency: "monthly" as PMFrequency,
  });

  useEffect(() => {
    if (!schedule || !open) return;
    setForm({
      title: schedule.title,
      description: schedule.description,
      frequency: schedule.frequency as PMFrequency,
    });
  }, [schedule, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule) return;
    setSaving(true);
    try {
      await preventiveMaintenanceApi.update(schedule.id, {
        title: form.title,
        description: form.description,
        frequency: form.frequency,
      });
      toast.success(`Schedule "${schedule.title}" updated`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto border-border bg-card p-6">
        <DialogHeader>
          <DialogTitle>Edit PM schedule</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Update the schedule details. Asset, facility, and location remain fixed after creation.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Select
                value={form.frequency}
                onValueChange={(v) => setForm((p) => ({ ...p, frequency: v as PMFrequency }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f} className="capitalize">
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
