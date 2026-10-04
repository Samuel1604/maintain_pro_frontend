import { useEffect, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocationsApi } from "@/features/locations/hooks/useLocationsApi";
import type { WorkOrderPriority } from "@/types/common.types";

const SERVICE_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "HVAC",
  "Cleaning",
  "Pest Control",
  "Fire Safety",
  "Elevators",
  "Security",
  "Gas",
  "Sewage",
  "General Repairs",
];

export type ServiceRequestAdvancedFilters = {
  priority?: WorkOrderPriority;
  category?: string;
  locationId?: string;
};

type AdvancedDraft = {
  priority: "all" | WorkOrderPriority;
  category: string;
  locationId?: string;
};

const emptyDraft: AdvancedDraft = {
  priority: "all",
  category: "all",
  locationId: undefined,
};

interface ServiceRequestAdvancedFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ServiceRequestAdvancedFilters;
  onApply: (patch: ServiceRequestAdvancedFilters) => void;
}

export function ServiceRequestAdvancedFiltersDialog({
  open,
  onOpenChange,
  filters,
  onApply,
}: ServiceRequestAdvancedFiltersDialogProps) {
  const [draft, setDraft] = useState<AdvancedDraft>(emptyDraft);
  const locationsQuery = useLocationsApi();

  useEffect(() => {
    if (!open) return;
    setDraft({
      priority: filters.priority ?? "all",
      category: filters.category ?? "all",
      locationId: filters.locationId,
    });
  }, [open, filters]);

  const apply = () => {
    onApply({
      priority: draft.priority === "all" ? undefined : draft.priority,
      category: draft.category === "all" ? undefined : draft.category,
      locationId: draft.locationId || undefined,
    });
    onOpenChange(false);
  };

  const reset = () => {
    setDraft(emptyDraft);
    onApply({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] !max-w-lg gap-0 overflow-hidden border-border bg-card p-0 sm:!max-w-lg">
        <DialogHeader className="space-y-2 px-6 pt-6 text-left">
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Advanced filters
          </DialogTitle>
          <DialogDescription>
            Filter service requests by priority, category, and location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-4">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={draft.priority}
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  priority: v as AdvancedDraft["priority"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={draft.category}
              onValueChange={(v) => setDraft((d) => ({ ...d, category: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {SERVICE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={draft.locationId ?? "all"}
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  locationId: v === "all" ? undefined : v,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {(locationsQuery.data ?? []).map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 border-t border-border px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={reset}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button type="button" className="flex-1 sm:flex-none" onClick={apply}>
            Apply filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
