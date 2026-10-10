/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Loader2,
  MapPin,
  Star,
  User,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/utils/helpers";
import {
  getAssignmentOptions,
  getVendorTechniciansSorted,
} from "@/features/work-orders/services/assignmentCandidates.service";
import type {
  AssignmentPath,
  AssignmentSort,
  IndependentTechnicianOption,
  VendorAssignmentOption,
} from "@/features/work-orders/types/assignment.types";
import { workOrdersService } from "@/features/work-orders/services/workOrders.service";
import type { WorkOrder } from "@/types/common.types";
import { displayReference } from "@/utils/display-ids";
import { displayLabel } from "@/utils/display-ids";

function displayRelation(value: unknown) {
  if (!value) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const relation = value as { name?: string; title?: string; _id?: string };
    return relation.name ?? relation.title ?? relation._id ?? "—";
  }
  return String(value);
}

interface AssignWorkOrderDialogProps {
  workOrder: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: (workOrder: WorkOrder) => void;
}

function RatingStars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      <Star className="h-3.5 w-3.5 fill-amber-400" />
      <span className="text-xs font-medium">{value.toFixed(1)}</span>
    </span>
  );
}

function SortTabs({
  value,
  onChange,
}: {
  value: AssignmentSort;
  onChange: (v: AssignmentSort) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as AssignmentSort)}>
      <TabsList className="grid w-full grid-cols-3 h-9">
        <TabsTrigger value="proximity" className="text-xs">
          Nearest
        </TabsTrigger>
        <TabsTrigger value="rating" className="text-xs">
          Top rated
        </TabsTrigger>
        <TabsTrigger value="experience" className="text-xs">
          Most experience
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function MetricPills({
  distanceKm,
  rating,
  experienceLabel,
}: {
  distanceKm?: number | null;
  rating: number;
  experienceLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <Badge variant="outline" className="text-[10px] gap-1 font-normal">
        <MapPin className="h-3 w-3" />
        {typeof distanceKm === "number" && Number.isFinite(distanceKm)
          ? `${distanceKm.toFixed(1)} km`
          : "Distance unavailable"}
      </Badge>
      <Badge variant="outline" className="text-[10px] gap-1 font-normal">
        <Star className="h-3 w-3" />
        {rating.toFixed(1)}
      </Badge>
      <Badge variant="outline" className="text-[10px] gap-1 font-normal">
        <Briefcase className="h-3 w-3" />
        {experienceLabel}
      </Badge>
    </div>
  );
}

export function AssignWorkOrderDialog({
  workOrder,
  open,
  onOpenChange,
  onAssigned,
}: AssignWorkOrderDialogProps) {
  const [saving, setSaving] = useState(false);
  const [sort, setSort] = useState<AssignmentSort>("proximity");
  const [path, setPath] = useState<AssignmentPath>("internal");
  const [internalTechnicians, setInternalTechnicians] = useState<
    Array<{ id: string; name: string; department?: string }>
  >([]);
  useEffect(() => {
    if (!workOrder || !open) return;
    void workOrdersService
      .technicianCandidates(workOrder.id)
      .then((result) =>
        setInternalTechnicians(
          result.data as Array<{ id: string; name: string; department?: string }>,
        ),
      )
      .catch(() => setInternalTechnicians([]));
  }, [workOrder?.id, open]);
  const [selectedInternalId, setSelectedInternalId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendorTechId, setSelectedVendorTechId] = useState<string | null>(null);
  const [selectedIndependentId, setSelectedIndependentId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const options = useMemo(
    () => (workOrder ? getAssignmentOptions(workOrder, sort) : { vendors: [], independents: [] }),
    [workOrder, sort],
  );

  const selectedVendor = useMemo(
    () => options.vendors.find((v) => v.vendorId === selectedVendorId) ?? null,
    [options.vendors, selectedVendorId],
  );

  const vendorTechnicians = useMemo(() => {
    if (!selectedVendor) return [];
    return getVendorTechniciansSorted(selectedVendor, sort);
  }, [selectedVendor, sort]);

  const selectedIndependent = useMemo(
    () => options.independents.find((t) => t.id === selectedIndependentId) ?? null,
    [options.independents, selectedIndependentId],
  );

  useEffect(() => {
    if (!workOrder || !open) return;
    setSort("proximity");
    setPath("vendor");
    setSelectedVendorId(null);
    setSelectedVendorTechId(null);
    setSelectedIndependentId(null);
    setNotes("");
  }, [workOrder, open]);

  useEffect(() => {
    setSelectedVendorTechId(null);
  }, [selectedVendorId]);

  const selectedInternal = internalTechnicians.find((t) => t.id === selectedInternalId);

  const canSubmit =
    path === "internal"
      ? Boolean(selectedInternalId)
      : path === "vendor"
        ? Boolean(selectedVendorId && selectedVendorTechId)
        : Boolean(selectedIndependentId && selectedIndependent?.availability === "available");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workOrder || !canSubmit) return;

    setSaving(true);
    if (path !== "internal") {
      toast.error(
        "Vendor assignment must be completed through the marketplace application workflow",
      );
      setSaving(false);
      return;
    }

    let assigneeId: string;
    let assigneeName: string;
    let status = workOrder.status;

    if (path === "internal" && selectedInternal) {
      assigneeId = selectedInternal.id;
      assigneeName = selectedInternal.name;
      status = workOrder.status === "open" ? "assigned" : workOrder.status;
      toast.success(`${displayReference("WO", workOrder.id)} assigned to ${selectedInternal.name}`);
    } else {
      setSaving(false);
      return;
    }

    try {
      const updated = await workOrdersService.assign(workOrder.id, assigneeId);
      toast.success(`${displayReference("WO", workOrder.id)} assigned to ${assigneeName}`);
      onAssigned?.(updated);
      onOpenChange(false);
    } catch {
      toast.error("Unable to assign work order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex !h-[calc(100dvh-2rem)] !max-h-[calc(100dvh-2rem)] !max-w-4xl w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden bg-card border-border p-0">
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-6 py-5">
          <DialogTitle>Assign work order</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 pt-0.5">
              <p className="text-sm leading-relaxed">
                {workOrder
                  ? `Select a vendor company or independent technician for ${displayReference("WO", workOrder.id)}`
                  : "Choose who will perform this work"}
              </p>
              {workOrder && (
                <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {displayRelation(workOrder.locationName)}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{displayLabel(workOrder.category)}</span>
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 space-y-4 border-b border-border bg-muted/20 px-6 py-4">
            <SortTabs value={sort} onChange={setSort} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setPath("internal")}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  path === "internal"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:bg-muted/50",
                )}
              >
                <User className="mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Internal staff</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Assign to your organization&apos;s maintenance technicians
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPath("vendor")}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  path === "vendor"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:bg-muted/50",
                )}
              >
                <Building2 className="mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Vendor company</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Manager account + field technician from their team
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPath("independent")}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  path === "independent"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:bg-muted/50",
                )}
              >
                <User className="mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Independent technician</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Sends offer — tech accepts or rejects with reason
                </p>
              </button>
            </div>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-6 py-6"
            role="region"
            aria-label="Assignment options"
          >
            <div className="space-y-8">
              {path === "internal" ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Maintenance team</h3>
                  {internalTechnicians.map((tech) => (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => setSelectedInternalId(tech.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                        selectedInternalId === tech.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {tech.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{tech.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tech.department ?? "Maintenance"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : path === "vendor" ? (
                <VendorAssignmentPanel
                  vendors={options.vendors}
                  selectedVendorId={selectedVendorId}
                  onSelectVendor={setSelectedVendorId}
                  selectedVendor={selectedVendor}
                  vendorTechnicians={vendorTechnicians}
                  selectedVendorTechId={selectedVendorTechId}
                  onSelectTech={setSelectedVendorTechId}
                />
              ) : (
                <IndependentAssignmentPanel
                  technicians={options.independents}
                  selectedId={selectedIndependentId}
                  onSelect={setSelectedIndependentId}
                />
              )}

              <section className="space-y-2 border-t border-border pt-8">
                <Label htmlFor="assign-notes">Instructions (optional)</Label>
                <Textarea
                  id="assign-notes"
                  rows={3}
                  className="resize-none"
                  placeholder="Access details, scope notes, preferred schedule..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </section>
            </div>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-border bg-card px-6 py-4 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !canSubmit}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {path === "independent" ? "Send job offer" : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VendorAssignmentPanel({
  vendors,
  selectedVendorId,
  onSelectVendor,
  selectedVendor,
  vendorTechnicians,
  selectedVendorTechId,
  onSelectTech,
}: {
  vendors: VendorAssignmentOption[];
  selectedVendorId: string | null;
  onSelectVendor: (id: string) => void;
  selectedVendor: VendorAssignmentOption | null;
  vendorTechnicians: VendorAssignmentOption["technicians"];
  selectedVendorTechId: string | null;
  onSelectTech: (id: string) => void;
}) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Step 1 — Choose vendor</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Sorted by your selection above: proximity, rating, or experience
          </p>
        </div>
        <div className="space-y-3">
          {vendors.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              No active vendors match.
            </p>
          ) : (
            vendors.map((v) => (
              <button
                key={v.vendorId}
                type="button"
                onClick={() => onSelectVendor(v.vendorId)}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-colors",
                  selectedVendorId === v.vendorId
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{v.vendorName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {v.serviceCategories.slice(0, 2).join(" · ")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <RatingStars value={v.rating} />
                    {v.categoryMatch && <Badge className="text-[10px] h-5">Category match</Badge>}
                  </div>
                </div>
                <MetricPills
                  distanceKm={v.distanceKm}
                  rating={v.rating}
                  experienceLabel={`${v.completedJobs} jobs`}
                />
              </button>
            ))
          )}
        </div>
      </section>

      {selectedVendor && (
        <>
          <section className="space-y-4 border-t border-border pt-8">
            <div>
              <h3 className="text-sm font-medium text-foreground">Step 2 — Vendor manager</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Vendor signup uses the <strong className="text-foreground">vendor</strong> role.
                This account owner coordinates assignments for the company.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs">
                    {selectedVendor.manager.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{selectedVendor.manager.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedVendor.manager.email}
                  </p>
                  {selectedVendor.manager.phone && (
                    <p className="text-xs text-muted-foreground">{selectedVendor.manager.phone}</p>
                  )}
                </div>
                <Badge variant="secondary" className="ml-auto shrink-0 capitalize">
                  vendor
                </Badge>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-border pt-8">
            <div>
              <h3 className="text-sm font-medium text-foreground">Step 3 — Field technician</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Select who from {selectedVendor.vendorName} will perform the work
              </p>
            </div>
            <div className="space-y-3">
              {vendorTechnicians.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No available technicians for this vendor right now.
                </p>
              ) : (
                vendorTechnicians.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => onSelectTech(tech.id)}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left transition-colors",
                      selectedVendorTechId === tech.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-card hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{tech.name}</p>
                      <RatingStars value={tech.rating} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tech.specialties.join(" · ")}
                    </p>
                    <MetricPills
                      distanceKm={tech.distanceKm}
                      rating={tech.rating}
                      experienceLabel={`${tech.yearsExperience} yrs · ${tech.completedJobs} jobs`}
                    />
                  </button>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function IndependentAssignmentPanel({
  technicians,
  selectedId,
  onSelect,
}: {
  technicians: IndependentTechnicianOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm leading-relaxed">
        <p className="flex items-start gap-3 text-amber-200/90">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>
            Independent technicians receive a <strong>job offer</strong>. They must{" "}
            <strong>accept or reject</strong> with a reason before the work order is fully assigned.
            Status stays <strong>pending</strong> until they respond.
          </span>
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Available technicians</h3>
          <p className="mt-1 text-xs text-muted-foreground">Near this work order location</p>
        </div>

        <div className="space-y-3">
          {technicians.map((tech) => {
            const isBusy = tech.availability === "busy";
            return (
              <button
                key={tech.id}
                type="button"
                disabled={isBusy}
                onClick={() => onSelect(tech.id)}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-colors",
                  isBusy && "opacity-50 cursor-not-allowed",
                  selectedId === tech.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-secondary">
                        {tech.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">Independent · {tech.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <RatingStars value={tech.rating} />
                    {isBusy ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-amber-400 border-amber-400/30"
                      >
                        <Clock className="h-3 w-3 mr-0.5" />
                        Busy
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-emerald-400 border-emerald-400/30"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-0.5" />
                        Available
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground pl-10">
                  {tech.specialties.join(" · ")}
                </p>
                <div className="mt-1 pl-10">
                  <MetricPills
                    distanceKm={tech.distanceKm}
                    rating={tech.rating}
                    experienceLabel={`${tech.yearsExperience} yrs · ${tech.completedJobs} jobs`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
