/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Send, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/helpers";
import { Textarea } from "@/components/ui/textarea";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { PageIntro } from "@/components/layout/PageIntro";
import { AppHeader } from "@/components/navigation/Navbar";
import { SkeletonCard } from "@/components/feedback/Skeletons";
import { usePortalPath } from "@/hooks/usePortal";
import { workOrdersService } from "../services/workOrders.service";
import type { WorkOrder } from "@/types/common.types";
import { WorkOrderRolePanel } from "@/features/work-orders/components/WorkOrderRolePanel";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { AssignWorkOrderDialog } from "@/features/work-orders/components/AssignWorkOrderDialog";
import { displayReference } from "@/utils/display-ids";
import { displayLabel } from "@/utils/display-ids";
import { locationsApi } from "@/features/locations/api/locations.api";
import { assetsApi } from "@/features/assets/api/assets.api";
import { facilitiesApi } from "@/features/facilities/api/facilities.api";
import { USER_ROLES } from "@/types/user.types";

export function WorkOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workOrdersPath = usePortalPath("work-orders");

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [comments, setComments] = useState<
    Array<{ _id: string; authorId: string; content: string; createdAt: string }>
  >([]);
  const [activity, setActivity] = useState<
    Array<{ _id: string; action: string; outcome: string; createdAt: string }>
  >([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [resolvedLocationName, setResolvedLocationName] = useState<string | undefined>();
  const [resolvedAssetName, setResolvedAssetName] = useState<string | undefined>();
  const [resolvedFacilityName, setResolvedFacilityName] = useState<string | undefined>();
  const [resolvedAssigneeName, setResolvedAssigneeName] = useState<string | undefined>();

  const { canAssignWorkOrder, role } = useRoleAccess();
  const canPostComment =
    role === USER_ROLES.ADMIN ||
    role === USER_ROLES.FACILITY_MANAGER ||
    role === USER_ROLES.TECHNICIAN ||
    role === USER_ROLES.VENDOR_TECHNICIAN;

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const item = await workOrdersService.getById(id);
      setWorkOrder(item);
      setResolvedLocationName(item.locationName || undefined);
      setResolvedAssetName(item.assetName || undefined);
      setResolvedFacilityName(undefined);
      setResolvedAssigneeName(item.assigneeName || undefined);
      if (item.locationId)
        void locationsApi
          .get(item.locationId)
          .then((location) => setResolvedLocationName(location.name))
          .catch(() => undefined);
      if (item.facilityId)
        void facilitiesApi
          .get(item.facilityId)
          .then((facility) => setResolvedFacilityName(facility.name))
          .catch(() => undefined);
      if (item.assetId)
        void assetsApi
          .list({ limit: 100 })
          .then((result) =>
            setResolvedAssetName(
              result.data.find(
                (asset) => asset.id === item.assetId || asset.assetTag === item.assetId,
              )?.name,
            ),
          )
          .catch(() => undefined);
      if (item.assigneeId)
        void workOrdersService
          .technicianCandidates(id)
          .then((result) =>
            setResolvedAssigneeName(
              result.data.find((technician) => technician.id === item.assigneeId)?.name,
            ),
          )
          .catch(() => undefined);
      const result = await workOrdersService.comments(id);
      setComments(result);
      const events = await workOrdersService.activity(id);
      setActivity(events);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load this work order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const addComment = async () => {
    if (!id || !comment.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const result = await workOrdersService.addComment(id, comment.trim());
      setComments((current) => [...current, result]);
      setComment("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to add comment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader
        title={workOrder ? displayReference("WO", workOrder.id) : "Work Orders"}
        subtitle="Work Order Detail"
        hideQuickCreate
      />
      <div className="border-b border-border bg-card px-8 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <PageIntro
              title={workOrder?.title ?? "Work Order"}
              description="Review work order details, assignment, progress, and activity."
            />
          </div>
          {workOrder ? (
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={workOrder.priority} />
              <StatusBadge status={workOrder.status} />
              {canAssignWorkOrder && (
                <Button variant="outline" onClick={() => setAssignOpen(true)} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Assign technician
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => void load()}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <main className="space-y-6 p-8">
        {/* Back navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => navigate(workOrdersPath)}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Loading */}
        {loading ? (
          <div role="status" aria-live="polite" className="space-y-4">
            <span className="sr-only">Loading work order…</span>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error && !workOrder ? (
          <div className="flex items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        ) : !workOrder ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="font-semibold">Work order not found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate(workOrdersPath)}>
              Back to Work Orders
            </Button>
          </div>
        ) : (
          <>
            {/* Inline error (after initial load) */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main content column */}
              <div className="space-y-6 lg:col-span-2">
                {/* Summary */}
                <section className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-lg font-semibold">Work Order Summary</h2>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {workOrder.description || "No description provided."}
                  </p>
                  <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">Category</dt>
                      <dd className="mt-1 font-medium">{displayLabel(workOrder.category)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">Origin</dt>
                      <dd className="mt-1 font-medium capitalize">
                        {workOrder.sourceType?.replace("_", " ") || "Manual"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">Facility</dt>
                      <dd className="mt-1 font-medium">
                        {resolvedFacilityName || workOrder.facilityId || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">Location</dt>
                      <dd className="mt-1 font-medium">
                        {resolvedLocationName ||
                          workOrder.locationName ||
                          workOrder.locationId ||
                          "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">Asset</dt>
                      <dd className="mt-1 font-medium">
                        {resolvedAssetName || workOrder.assetName || workOrder.assetId || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">Assigned</dt>
                      <dd className="mt-1 font-medium">
                        {resolvedAssigneeName || workOrder.assigneeName || "Unassigned"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">Due date</dt>
                      <dd className="mt-1 font-medium">
                        {workOrder.dueDate?.toLocaleDateString() || "—"}
                      </dd>
                    </div>
                  </dl>
                </section>

                {/* Comments */}
                <section className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-lg font-semibold">Comments</h2>
                  <div className="mt-4 space-y-3">
                    {comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No comments yet.</p>
                    ) : (
                      comments.map((item) => (
                        <div key={item._id} className="rounded-lg bg-muted/40 p-3">
                          <p className="text-sm">{item.content}</p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  {canPostComment && (
                    <div className="mt-4 space-y-2">
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add an operational comment…"
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button
                          disabled={saving || !comment.trim()}
                          onClick={() => void addComment()}
                          className="gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Post comment
                        </Button>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar column */}
              <aside className="space-y-6">
                <WorkOrderRolePanel
                  workOrder={workOrder}
                  onWorkOrderUpdated={(updated) => {
                    setWorkOrder(updated);
                  }}
                />

                <AssignWorkOrderDialog
                  workOrder={workOrder}
                  open={assignOpen}
                  onOpenChange={setAssignOpen}
                  onAssigned={(updated) => {
                    setWorkOrder(updated);
                    setAssignOpen(false);
                    toast.success("Work order assignment updated");
                  }}
                />

                {/* Activity log */}
                <section className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-lg font-semibold">Activity</h2>
                  <div className="mt-3 space-y-3">
                    {activity.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No audit activity recorded.</p>
                    ) : (
                      activity.map((event) => (
                        <div
                          key={event._id}
                          className="border-b border-border pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium capitalize">
                              {event.action.replace(/[._]/g, " ")}
                            </p>
                            <time className="shrink-0 text-xs text-muted-foreground">
                              {new Date(event.createdAt).toLocaleString()}
                            </time>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Outcome: {event.outcome}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
