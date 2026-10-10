/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/navigation/Navbar";
import { Textarea } from "@/components/ui/textarea";
import {
  serviceRequestsService,
  type ServiceRequestRecord,
} from "../services/serviceRequests.service";
import { usePortalPath } from "@/hooks/usePortal";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { PageError } from "@/components/feedback/PageError";
import { displayReference } from "@/utils/display-ids";
import { displayLabel } from "@/utils/display-ids";
import { PageIntro } from "@/components/layout/PageIntro";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { facilitiesApi } from "@/features/facilities/api/facilities.api";
import { locationsApi } from "@/features/locations/api/locations.api";
import { assetsApi } from "@/features/assets/api/assets.api";
import { apiClient } from "@/api/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ServiceRequestDetails() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const path = usePortalPath("service-requests");
  const [request, setRequest] = useState<ServiceRequestRecord | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [facilityName, setFacilityName] = useState<string | undefined>();
  const [locationName, setLocationName] = useState<string | undefined>();
  const [assetName, setAssetName] = useState<string | undefined>();
  const [technicians, setTechnicians] = useState<Array<{ id: string; name: string }>>([]);
  const [fulfillmentType, setFulfillmentType] = useState<"internal" | "marketplace">("internal");
  const [technicianId, setTechnicianId] = useState("");
  const { canApproveSR } = useRoleAccess();

  const loadRequest = async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const loaded = await serviceRequestsService.getById(id);
      setRequest(loaded);
      setFacilityName(loaded.facilityName);
      setLocationName(loaded.locationName);
      setAssetName(loaded.assetName);
      if (loaded.facilityName) setFacilityName(loaded.facilityName);
      else
        void facilitiesApi
          .get(loaded.facilityId)
          .then((facility) => setFacilityName(facility.name))
          .catch(() => undefined);
      if (loaded.locationName) setLocationName(loaded.locationName);
      else
        void locationsApi
          .get(loaded.locationId)
          .then((location) => setLocationName(location.name))
          .catch(() => undefined);
      if (loaded.assetName) setAssetName(loaded.assetName);
      else
        void assetsApi
          .list({ limit: 100 })
          .then((result) => {
            const asset = result.data.find(
              (item) => item.id === loaded.assetId || item.assetTag === loaded.assetId,
            );
            if (asset) setAssetName(asset.name);
          })
          .catch(() => undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load service request";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequest();
  }, [id]);

  useEffect(() => {
    if (!canApproveSR) return;
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
      .catch(() => setTechnicians([]));
  }, [canApproveSR]);

  const review = async (decision: "approve" | "reject") => {
    if (!request || saving) return;
    if (decision === "reject" && reason.trim().length < 3) {
      toast.error("Rejection reason must be at least 3 characters");
      return;
    }
    if (decision === "approve" && fulfillmentType === "internal" && !technicianId) {
      toast.error("Select a technician for internal fulfillment");
      return;
    }
    setSaving(true);
    try {
      const updated =
        decision === "approve"
          ? await serviceRequestsService.approve(
              request.id,
              fulfillmentType,
              fulfillmentType === "internal" ? technicianId : undefined,
            )
          : await serviceRequestsService.reject(request.id, reason.trim());
      setRequest(
        ("serviceRequest" in updated ? updated.serviceRequest : updated) as ServiceRequestRecord,
      );
      setReason("");
      toast.success(
        decision === "approve" ? "Service request approved" : "Service request rejected",
      );
    } catch {
      toast.error(`Unable to ${decision} service request`);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <>
        <AppHeader title="Service Request" hideQuickCreate />
        <main className="p-6 text-sm text-muted-foreground">Loading service request…</main>
      </>
    );
  if (loadError)
    return (
      <>
        <AppHeader title="Service Request" hideQuickCreate />
        <main className="p-6">
          <PageError
            title="Service request unavailable"
            message={loadError}
            onRetry={() => void loadRequest()}
          />
        </main>
      </>
    );
  if (!request)
    return (
      <>
        <AppHeader title="Service Request" hideQuickCreate />
        <main className="p-6">
          <p className="text-sm text-destructive">Service request not found.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate(path)}>
            Back to requests
          </Button>
        </main>
      </>
    );

  return (
    <>
      <AppHeader title={request.title} subtitle="Service Request Detail" hideQuickCreate />
      <div className="border-b border-border bg-card px-8 py-5">
        <PageIntro
          title={request.title}
          description="Review the request, operational location, and approval status."
        />
        <p className="mt-2 pl-4 font-mono text-xs text-muted-foreground">
          {displayReference("SR", request.id)}
        </p>
      </div>
      <main className="min-h-full bg-muted/30 p-8 text-foreground">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" className="gap-2" onClick={() => navigate(path)}>
              <ArrowLeft className="h-4 w-4" />
              Back to requests
            </Button>
            <span className="font-mono text-xs text-muted-foreground">
              {displayReference("SR", request.id)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
            <span className="text-sm text-muted-foreground">
              Submitted {new Date(request.createdAt).toLocaleString()}
            </span>
          </div>
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Request details</h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Category</dt>
                <dd className="mt-1">{displayLabel(request.serviceCategory)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Priority</dt>
                <dd className="mt-1 capitalize">{request.priority}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Facility</dt>
                <dd className="mt-1">
                  {facilityName ?? request.facilityName ?? "Facility unavailable"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Location</dt>
                <dd className="mt-1">
                  {locationName ?? request.locationName ?? "Location unavailable"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Asset</dt>
                <dd className="mt-1">
                  {assetName ?? request.assetName ?? displayReference("AST", request.assetId)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Requested by</dt>
                <dd className="mt-1">{request.requesterName ?? "Requester unavailable"}</dd>
              </div>
            </dl>
            <p className="mt-6 border-t border-border pt-5 text-sm leading-6 text-muted-foreground">
              {request.description}
            </p>
            {request.attachmentUploadIds && request.attachmentUploadIds.length > 0 && (
              <div className="mt-5 border-t border-border pt-5">
                <h3 className="text-sm font-medium">Attachments</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {request.attachmentUploadIds.length} attachment
                  {request.attachmentUploadIds.length === 1 ? "" : "s"} uploaded with this request.
                </p>
              </div>
            )}
          </section>
          {request.status === "pending" && canApproveSR && (
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-semibold">Review request</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="fulfillment-type">
                    Fulfillment
                  </label>
                  <Select
                    value={fulfillmentType}
                    onValueChange={(value) => {
                      setFulfillmentType(value as "internal" | "marketplace");
                      if (value === "marketplace") setTechnicianId("");
                    }}
                  >
                    <SelectTrigger id="fulfillment-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal technician</SelectItem>
                      <SelectItem value="marketplace">Vendor marketplace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {fulfillmentType === "internal" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="review-technician">
                      Technician
                    </label>
                    <Select value={technicianId} onValueChange={setTechnicianId}>
                      <SelectTrigger id="review-technician">
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((technician) => (
                          <SelectItem key={technician.id} value={technician.id}>
                            {technician.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <Textarea
                className="mt-4"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Optional approval note or required rejection reason…"
                rows={4}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <Button disabled={saving} onClick={() => void review("approve")} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  disabled={saving || reason.trim().length < 3}
                  variant="destructive"
                  onClick={() => void review("reject")}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </section>
          )}
          {request.status === "pending" && !canApproveSR && (
            <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              This request is awaiting review by a facilities manager.
            </p>
          )}
        </div>
      </main>
    </>
  );
}

export default ServiceRequestDetails;
