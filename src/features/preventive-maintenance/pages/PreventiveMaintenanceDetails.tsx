import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Archive, ArrowLeft, ClipboardList, Pencil, RefreshCw } from "lucide-react";
import { AppHeader } from "@/components/navigation/Navbar";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageError } from "@/components/feedback/PageError";
import { EmptyState } from "@/components/feedback/EmptyState";
import { apiClient } from "@/api/client";
import { displayReference } from "@/utils/display-ids";
import { facilitiesApi } from "@/features/facilities/api/facilities.api";
import { locationsApi } from "@/features/locations/api/locations.api";
import { assetsApi } from "@/features/assets/api/assets.api";
import { preventiveMaintenanceApi } from "../api/preventiveMaintenance.api";
import type {
  PMOccurrenceRecord,
  PreventiveMaintenanceRecord,
} from "../types/preventiveMaintenance.types";
import { SkipPMScheduleDialog } from "../components/SkipPMScheduleDialog";
import { EditPMScheduleDialog } from "../components/EditPMScheduleDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const reference = (id: string) => `PM-${id.slice(-6).toUpperCase()}`;
const dateLabel = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "Not scheduled";
const displayValue = (value?: string | null) => value || "Not specified";
const displayLabel = (value?: string | null) =>
  value
    ? value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Not specified";
const durationLabel = (minutes?: number) => {
  if (!minutes || minutes <= 0) return "Not specified";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return [
    hours ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "",
    remainingMinutes ? `${remainingMinutes} ${remainingMinutes === 1 ? "minute" : "minutes"}` : "",
  ]
    .filter(Boolean)
    .join(" ");
};

export function PreventiveMaintenanceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PreventiveMaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [occurrences, setOccurrences] = useState<PMOccurrenceRecord[]>([]);
  const [occurrencesLoading, setOccurrencesLoading] = useState(true);
  const [occurrencesError, setOccurrencesError] = useState<Error | null>(null);
  const [skipOpen, setSkipOpen] = useState(false);
  const [technicians, setTechnicians] = useState<Array<{ id: string; name: string }>>([]);
  const [assigningOccurrence, setAssigningOccurrence] = useState<string | null>(null);
  const [facilityName, setFacilityName] = useState<string>();
  const [locationName, setLocationName] = useState<string>();
  const [assetName, setAssetName] = useState<string>();
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const loadPlan = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setPlan(await preventiveMaintenanceApi.get(id));
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("Unable to load PM plan"));
    } finally {
      setLoading(false);
    }
  };

  const loadOccurrences = async () => {
    if (!id) return;
    setOccurrencesLoading(true);
    setOccurrencesError(null);
    try {
      setOccurrences(
        (await preventiveMaintenanceApi.planOccurrences(id, { page: 1, limit: 50 })).data ?? [],
      );
    } catch (cause) {
      setOccurrencesError(
        cause instanceof Error ? cause : new Error("Unable to load PM occurrences"),
      );
    } finally {
      setOccurrencesLoading(false);
    }
  };

  const archivePlan = async () => {
    if (!id) return;
    try {
      await preventiveMaintenanceApi.archive(id);
      toast.success("PM schedule archived");
      setArchiveOpen(false);
      navigate(-1);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Unable to archive PM schedule");
    }
  };

  useEffect(() => {
    void loadPlan();
  }, [id]);
  useEffect(() => {
    void loadOccurrences();
  }, [id]);
  useEffect(() => {
    void apiClient
      .get<
        Array<{ id: string; firstName?: string; lastName?: string; name?: string; role: string }>
      >("/users")
      .then((users) =>
        setTechnicians(
          users
            .filter((user) => user.role === "technician")
            .map((user) => ({
              id: user.id,
              name: user.name || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.id,
            })),
        ),
      )
      .catch((cause) => {
        setTechnicians([]);
        toast.error(cause instanceof Error ? cause.message : "Unable to load technicians");
      });
  }, []);

  useEffect(() => {
    if (!plan) return;
    void facilitiesApi
      .get(plan.facilityId)
      .then((facility) => setFacilityName(facility.name))
      .catch(() => setFacilityName(undefined));
    void locationsApi
      .get(plan.locationId)
      .then((location) => setLocationName(location.name))
      .catch(() => setLocationName(undefined));
    void assetsApi
      .list({ limit: 100 })
      .then((result) =>
        setAssetName(
          result.data.find((asset) => asset.id === plan.assetId || asset.assetTag === plan.assetId)
            ?.name,
        ),
      )
      .catch(() => setAssetName(undefined));
  }, [plan]);

  if (loading) return <PageLoader label="Loading preventive maintenance plan..." />;
  if (error) return <PageError message={error.message} onRetry={() => void loadPlan()} />;
  if (!plan)
    return (
      <EmptyState
        icon={ClipboardList}
        title="PM plan not found"
        description="This preventive maintenance plan may have been archived or removed."
      />
    );

  const occurrenceDates = occurrences
    .map((occurrence) => new Date(occurrence.scheduledAt))
    .filter((date) => !Number.isNaN(date.getTime()));
  const nextScheduledOccurrence = occurrenceDates
    .filter((date) => date.getTime() >= Date.now())
    .sort((a, b) => a.getTime() - b.getTime())[0];
  const calculatedNextDueDate =
    nextScheduledOccurrence?.toISOString() ?? plan.occurrenceDate ?? plan.plannedDate;
  const scheduleStart = occurrenceDates.length
    ? new Date(Math.min(...occurrenceDates.map((date) => date.getTime()))).toISOString()
    : plan.recurrence?.startDate;
  const scheduleEndLabel = plan.recurrence?.endDate
    ? dateLabel(plan.recurrence.endDate)
    : "Ongoing";
  const recurrenceFrequency = plan.recurrence?.frequency ?? plan.frequency;
  const recurrenceInterval = plan.recurrence?.interval;
  const recurrenceSummary =
    recurrenceFrequency === "monthly" && recurrenceInterval
      ? `Every ${recurrenceInterval} month${recurrenceInterval === 1 ? "" : "s"}${plan.recurrence?.monthDay ? ` on day ${plan.recurrence.monthDay}` : ""}`
      : recurrenceInterval
        ? `Every ${recurrenceInterval} ${displayLabel(recurrenceFrequency).toLowerCase()}${recurrenceInterval === 1 ? "" : "s"}`
        : displayLabel(recurrenceFrequency);
  const technicianName = (technicianId?: string) =>
    technicians.find((technician) => technician.id === technicianId)?.name ?? "Assigned technician";

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader
        title={reference(plan.id)}
        subtitle="Preventive Maintenance Detail"
        hideQuickCreate
      />
      <div className="border-b border-border bg-card px-8 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <PageIntro
              title={plan.title}
              description="Review the maintenance schedule, operational scope, and generated occurrences."
            />
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 lg:w-auto">
            <StatusBadge status={plan.status} />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={() => setSkipOpen(true)}>
                Skip schedule
              </Button>
              <Button variant="outline" onClick={() => setArchiveOpen(true)} className="gap-2">
                <Archive className="h-4 w-4" />
                Archive
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  void loadPlan();
                  void loadOccurrences();
                }}
                disabled={loading || occurrencesLoading}
                className="gap-2"
              >
                <RefreshCw
                  className={loading || occurrencesLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="min-h-full bg-muted/30 p-8">
        <div className="space-y-6">
          <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back to preventive maintenance
          </Button>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Schedule summary</h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Maintenance type</dt>
                <dd className="mt-1 font-medium">{displayLabel(plan.maintenanceType)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Schedule</dt>
                <dd className="mt-1 font-medium">{recurrenceSummary}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Priority</dt>
                <dd className="mt-1 font-medium">{displayLabel(plan.priority)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Next due</dt>
                <dd className="mt-1 font-medium">{dateLabel(calculatedNextDueDate)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Schedule starts</dt>
                <dd className="mt-1 font-medium">{dateLabel(scheduleStart)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Schedule ends</dt>
                <dd className="mt-1 font-medium">{scheduleEndLabel}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Facility</dt>
                <dd className="mt-1 font-medium">
                  {facilityName || displayValue(plan.facilityId)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Location</dt>
                <dd className="mt-1 font-medium">
                  {locationName || displayValue(plan.locationId)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Asset</dt>
                <dd className="mt-1 font-medium">{assetName || displayValue(plan.assetId)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Estimated duration</dt>
                <dd className="mt-1 font-medium">{durationLabel(plan.estimatedDurationMinutes)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Default technician</dt>
                <dd className="mt-1 font-medium">
                  {plan.defaultAssignment?.targetType === "user"
                    ? technicianName(plan.defaultAssignment.targetId)
                    : "Unassigned"}
                </dd>
              </div>
            </dl>
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
              <h2 className="text-lg font-semibold">Maintenance details</h2>
              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="text-sm font-medium">Description</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {plan.description || "No description provided."}
                  </p>
                </div>
                <div className="border-t border-border pt-5">
                  <h3 className="text-sm font-medium">Instructions</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {plan.instructions || "No maintenance instructions provided."}
                  </p>
                </div>
              </div>
            </section>
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-semibold">Checklist</h2>
              {plan.checklist.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                  No checklist items configured for this schedule.
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {plan.checklist.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-3 text-sm"
                    >
                      <span>{item.label}</span>
                      {item.required && (
                        <span className="text-xs text-muted-foreground">Required</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Occurrences</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Scheduled execution history for this maintenance plan.
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {occurrences.length} {occurrences.length === 1 ? "occurrence" : "occurrences"}
              </span>
            </div>
            {occurrencesLoading ? (
              <p className="mt-4 text-sm text-muted-foreground">Loading occurrences…</p>
            ) : occurrencesError ? (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <span>{occurrencesError.message}</span>
                <Button size="sm" variant="outline" onClick={() => void loadOccurrences()}>
                  Retry
                </Button>
              </div>
            ) : occurrences.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No occurrences have been generated for this plan.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Scheduled</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Approval</th>
                      <th className="px-3 py-2">Assigned technician</th>
                      <th className="px-3 py-2">Work order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {occurrences.map((occurrence) => (
                      <tr key={occurrence.id}>
                        <td className="px-3 py-3">
                          <p>{dateLabel(occurrence.scheduledAt)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(occurrence.scheduledAt).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={occurrence.status} />
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={occurrence.approvalState} />
                        </td>
                        <td className="px-3 py-3">
                          {occurrence.id === occurrences[0]?.id ? (
                            <span className="text-sm font-medium">
                              {occurrence.assignment?.targetId
                                ? technicianName(occurrence.assignment.targetId)
                                : "Unassigned"}
                            </span>
                          ) : technicians.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              No technicians available
                            </span>
                          ) : (
                            <Select
                              value={occurrence.assignment?.targetId ?? "unassigned"}
                              disabled={assigningOccurrence === occurrence.id}
                              onValueChange={(targetId) => {
                                if (targetId === "unassigned") return;
                                setAssigningOccurrence(occurrence.id);
                                void preventiveMaintenanceApi
                                  .assignOccurrence(occurrence.id, { targetType: "user", targetId })
                                  .then((updated) =>
                                    setOccurrences((items) =>
                                      items.map((item) =>
                                        item.id === occurrence.id ? updated : item,
                                      ),
                                    ),
                                  )
                                  .catch((cause) =>
                                    toast.error(
                                      cause instanceof Error
                                        ? cause.message
                                        : "Unable to assign technician",
                                    ),
                                  )
                                  .finally(() => setAssigningOccurrence(null));
                              }}
                            >
                              <SelectTrigger className="w-44">
                                <SelectValue
                                  placeholder={
                                    occurrence.assignment?.targetId
                                      ? technicianName(occurrence.assignment.targetId)
                                      : "Assign technician"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {technicians.map((technician) => (
                                  <SelectItem key={technician.id} value={technician.id}>
                                    {technician.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {occurrence.workOrderId
                            ? displayReference("WO", occurrence.workOrderId)
                            : "Not generated"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
      <SkipPMScheduleDialog
        schedule={{ id: plan.id, title: plan.title }}
        open={skipOpen}
        onOpenChange={setSkipOpen}
        onCompleted={() => {
          void loadPlan();
          void loadOccurrences();
        }}
      />
      <EditPMScheduleDialog
        schedule={plan}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) void loadPlan();
        }}
      />
      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive PM schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              Its maintenance history will be preserved, while future occurrences will be cancelled.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep schedule</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void archivePlan()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Archive schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PreventiveMaintenanceDetails;
