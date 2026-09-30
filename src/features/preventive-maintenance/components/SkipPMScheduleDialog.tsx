import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PreventiveMaintenance } from "@/types/common.types";
import { preventiveMaintenanceService } from "../services/preventiveMaintenance.service";

interface SkipPMScheduleDialogProps {
  schedule: Pick<PreventiveMaintenance, "id" | "title"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
}

export function SkipPMScheduleDialog({
  schedule,
  open,
  onOpenChange,
  onCompleted,
}: SkipPMScheduleDialogProps) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule || !reason.trim()) return;
    setSaving(true);
    try {
      await preventiveMaintenanceService.skip(schedule.id, reason.trim());
      toast.success("Occurrence skipped");
      setReason("");
      onOpenChange(false);
      onCompleted?.();
    } catch {
      toast.error("Unable to skip this occurrence");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-border bg-card p-6">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-xl">Skip schedule occurrence?</AlertDialogTitle>
          <AlertDialogDescription>
            {schedule
              ? `Provide a reason for skipping the next occurrence of "${schedule.title}". This action will move the schedule to its next generated date.`
              : "Provide a reason before skipping this occurrence."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="skip-reason">Reason *</Label>
            <Textarea
              id="skip-reason"
              rows={5}
              placeholder="e.g. Asset temporarily offline, vendor rescheduled..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This reason will be recorded in the maintenance history.
            </p>
          </div>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel type="button" onClick={() => onOpenChange(false)}>
              Keep occurrence
            </AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={saving || !reason.trim()}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm skip
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
