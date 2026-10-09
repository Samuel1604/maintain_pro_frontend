import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useLocationApi } from "@/features/locations/hooks/useLocationsApi";
import { useFacility } from "@/features/facilities/hooks/useFacilities";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageError } from "@/components/feedback/PageError";
import { Button } from "@/components/ui/button";
import { usePortalPath } from "@/hooks/usePortal";
import { AppHeader } from "@/components/navigation/Navbar";
import { locationsApi } from "../api/locations.api";
import { PageHeader } from "@/components/ui/page-header";
import { KPICard } from "@/features/dashboard/components/StatCard";
import { EditLocationDialog } from "@/features/locations/components/EditLocationDialog";
import type { Location as CommonLocation } from "@/types/common.types";

export function LocationDetails() {
  const { id } = useParams();
  const { data: locationData, isLoading, isError, refetch } = useLocationApi(id ?? "");
  const { data: facilityData } = useFacility(locationData?.facilityId ?? "");
  const [activeTab, setActiveTab] = useState<
    "overview" | "assets" | "work-orders" | "service-requests" | "pm" | "history"
  >("overview");
  const [relationships, setRelationships] = useState<{
    assets: unknown[];
    workOrders: unknown[];
    serviceRequests: unknown[];
    preventiveMaintenance: unknown[];
  }>({ assets: [], workOrders: [], serviceRequests: [], preventiveMaintenance: [] });
  const [relationshipError, setRelationshipError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  useEffect(() => {
    if (!id) return;
    void locationsApi
      .relationships(id)
      .then((result) =>
        setRelationships({
          assets: Array.isArray(result.assets) ? result.assets : [],
          workOrders: Array.isArray(result.workOrders) ? result.workOrders : [],
          serviceRequests: Array.isArray(result.serviceRequests) ? result.serviceRequests : [],
          preventiveMaintenance: Array.isArray(result.preventiveMaintenance)
            ? result.preventiveMaintenance
            : [],
        }),
      )
      .catch((error) =>
        setRelationshipError(
          error instanceof Error ? error.message : "Unable to load location relationships",
        ),
      );
  }, [id]);
  const navigate = useNavigate();

  const assetsPath = usePortalPath("assets");
  const workOrdersPath = usePortalPath("work-orders");
  const pmPath = usePortalPath("preventive-maintenance");
  const serviceRequestsPath = usePortalPath("service-requests");

  if (isLoading) return <PageLoader label="Loading location details..." />;
  if (isError)
    return (
      <PageError
        title="Location unavailable"
        message="Unable to fetch location details. Please try again."
        onRetry={() => void refetch()}
      />
    );

  const locationName = locationData?.name || "—";
  const parentFacility = facilityData?.name || "—";
  const floor = locationData?.floor || "—";
  const description = locationData?.description || "—";
  const assetCount = relationships.assets.length;
  const openWorkOrderCount = relationships.workOrders.length;
  const serviceRequestCount = relationships.serviceRequests.length;
  const pmCount = relationships.preventiveMaintenance.length;
  const editableLocation: CommonLocation | null = locationData
    ? {
        id: locationData.id,
        organizationId: locationData.organizationId,
        facilityId: locationData.facilityId,
        parentId: locationData.parentId,
        name: locationData.name,
        address: "",
        description: locationData.description,
        createdAt: new Date(locationData.createdAt),
        updatedAt: new Date(locationData.updatedAt),
        type:
          locationData.type.toLowerCase() === "area" || locationData.type.toLowerCase() === "zone"
            ? "zone"
            : (locationData.type.toLowerCase() as CommonLocation["type"]),
        status: locationData.status,
      }
    : null;

  return (
    <div className="min-h-full bg-muted/30 text-foreground">
      <AppHeader title={locationName} subtitle="Location Detail" hideQuickCreate />
      <PageHeader
        title={locationName}
        subtitle="Review location information, operational scope, and related maintenance activity."
      />
      <div className="p-8 space-y-6">
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="h-9 rounded-lg border-border bg-card text-[13px] font-medium text-foreground hover:bg-muted/30"
            title="Edit location"
          >
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit Location
          </Button>
        </div>
        {relationshipError && (
          <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
            Some related location records are unavailable. Refresh to try again.
          </p>
        )}
        {/* ── 2 Column Spec Panels ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-foreground">General Information</h2>
            <div className="mt-4 space-y-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Facility</span>
                <span className="font-semibold text-foreground">{parentFacility}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Floor</span>
                <span className="font-semibold text-foreground">{floor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Location Type</span>
                <span className="font-semibold capitalize text-foreground">
                  {locationData?.type?.toLowerCase().replace("_", " ") || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Code</span>
                <span className="font-semibold text-foreground">{locationData?.code || "—"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-foreground">Operational Scope</h2>
            <div className="mt-4 space-y-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Description</span>
                <span className="font-semibold text-right text-foreground">{description}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Room Number</span>
                <span className="font-semibold text-foreground">
                  {locationData?.roomNumber || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold capitalize text-foreground">
                  {locationData?.status || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-semibold text-foreground">
                  {locationData?.createdAt
                    ? new Date(locationData.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sub-navigation Tabs ── */}
        <div className="border-b border-border flex items-center gap-6">
          {(
            ["overview", "assets", "work-orders", "service-requests", "pm", "history"] as const
          ).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[13px] font-semibold capitalize transition-colors border-b-2 ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.replace("-", " ")}
              </button>
            );
          })}
        </div>

        {/* ── Overview Tab Content ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Tracked Assets"
                value={assetCount}
                changeLabel="Assets assigned to this location"
                icon="assets"
                href={`${assetsPath}?location=${locationData?.id || ""}`}
              />
              <KPICard
                title="Open Work Orders"
                value={openWorkOrderCount}
                changeLabel="Active work requiring attention"
                icon="work-orders"
                href={workOrdersPath}
                variant={openWorkOrderCount > 0 ? "warning" : "default"}
              />
              <KPICard
                title="Service Requests"
                value={serviceRequestCount}
                changeLabel="Requests associated with this location"
                icon="facilities"
                href={workOrdersPath}
              />
              <KPICard
                title="PM Schedules"
                value={pmCount}
                changeLabel="Preventive maintenance schedules"
                icon="calendar"
                href={pmPath}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Allocated Assets */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-[15px] font-bold text-foreground">
                    Allocated Assets ({relationships.assets.length})
                  </h3>
                  <button
                    onClick={() => navigate(`${assetsPath}?location=${locationData?.id || ""}`)}
                    className="text-[12px] font-semibold text-primary hover:underline"
                  >
                    Manage Assets
                  </button>
                </div>

                <div className="mt-4 divide-y divide-border">
                  {relationships.assets.map((asset: any) => (
                    <div key={asset.id} className="flex items-center justify-between py-3.5">
                      <div>
                        <p className="text-[13px] font-bold text-foreground">{asset.name}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{asset.id}</p>
                      </div>
                      <span
                        className="rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{ backgroundColor: asset.bg, color: asset.text }}
                      >
                        {asset.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Maintenance Activity */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-[15px] font-bold text-foreground">
                    Recent Maintenance activity
                  </h3>
                  <button
                    onClick={() => navigate(workOrdersPath)}
                    className="text-[12px] font-semibold text-primary hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-4 divide-y divide-border">
                  {relationships.workOrders.map((act: any) => (
                    <div key={act.id} className="flex items-center justify-between py-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-foreground">{act.id}:</span>
                          <span className="text-[13px] font-semibold text-foreground">
                            {act.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{act.by}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related records */}
        {activeTab !== "overview" && (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            {(() => {
              const records: Record<string, unknown[]> = {
                assets: relationships.assets,
                "work-orders": relationships.workOrders,
                "service-requests": relationships.serviceRequests,
                pm: relationships.preventiveMaintenance,
                history: relationships.workOrders,
              };
              const items = records[activeTab] ?? [];
              return (
                <>
                  <p className="text-[14px] font-medium">
                    {items.length} {activeTab.replace("-", " ")} records for {locationName}.
                  </p>
                  <div className="mx-auto mt-5 max-w-xl space-y-2 text-left">
                    {items.slice(0, 5).map((item: any, index) => (
                      <div
                        key={item.id ?? item._id ?? index}
                        className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm"
                      >
                        <span className="font-semibold text-foreground">
                          {item.name ?? item.title ?? item.id ?? "Related record"}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          {item.status ?? item.category ?? ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
            {activeTab !== "history" && (
              <Button
                onClick={() => {
                  if (activeTab === "assets")
                    navigate(`${assetsPath}?location=${locationData?.id || ""}`);
                  if (activeTab === "work-orders") navigate(workOrdersPath);
                  if (activeTab === "service-requests") navigate(serviceRequestsPath);
                  if (activeTab === "pm") navigate(pmPath);
                }}
                className="mt-4 bg-primary text-primary-foreground text-[13px] hover:bg-primary/90"
              >
                Open Full {activeTab.replace("-", " ")} Directory
              </Button>
            )}
          </div>
        )}
      </div>
      <EditLocationDialog
        location={editableLocation}
        locations={editableLocation ? [editableLocation] : []}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
