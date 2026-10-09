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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Location } from "@/types/common.types";
import { useLocationMutations } from "@/features/locations/hooks/useLocationsApi";

interface EditLocationDialogProps {
  location: Location | null;
  locations: Location[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLocationDialog({
  location,
  locations,
  open,
  onOpenChange,
}: EditLocationDialogProps) {
  const { update } = useLocationMutations();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "building" as Location["type"],
    description: "",
    parentId: "",
  });

  useEffect(() => {
    if (!location || !open) return;
    setForm({
      name: location.name,
      type: location.type,
      description: location.description ?? "",
      parentId: location.parentId ?? "",
    });
  }, [location, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    setSaving(true);
    try {
      const typeMap: Record<
        string,
        import("@/features/locations/types/location.types").LocationType
      > = {
        site: "OTHER",
        building: "BUILDING",
        floor: "FLOOR",
        room: "ROOM",
        zone: "AREA",
      };
      const apiType = typeMap[form.type] ?? "OTHER";
      await update.mutateAsync({
        id: location.id,
        payload: {
          name: form.name,
          type: apiType,
          description: form.description || undefined,
          parentId: form.parentId || null,
        },
      });
      toast.success(`${location.name} updated`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update location");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl w-[calc(100vw-2rem)] !h-[calc(100dvh-2rem)] !max-h-[calc(100dvh-2rem)] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit location</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Update the location details used for maintenance and work assignment.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((p) => ({ ...p, type: v as Location["type"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["site", "building", "floor", "room", "zone"] as const).map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Parent</Label>
              <Input
                list="edit-parent-location-options"
                placeholder="e.g. Main Building (optional)"
                value={locations.find((item) => item.id === form.parentId)?.name ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    parentId:
                      locations.find(
                        (item) =>
                          item.id !== location?.id &&
                          item.name.toLowerCase() === e.target.value.trim().toLowerCase(),
                      )?.id ?? "",
                  }))
                }
              />
              <datalist id="edit-parent-location-options">
                {locations
                  .filter((item) => item.id !== location?.id)
                  .map((item) => (
                    <option key={item.id} value={item.name} />
                  ))}
              </datalist>
              <p className="text-[11px] text-muted-foreground">
                Leave blank if this location has no parent.
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
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
