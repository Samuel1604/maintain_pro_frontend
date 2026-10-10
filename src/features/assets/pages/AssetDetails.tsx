/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, FileText, History, Pencil, QrCode, Wrench } from "lucide-react";
import { AppHeader } from "@/components/navigation/Navbar";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageError } from "@/components/feedback/PageError";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/features/dashboard/components/StatCard";
import { usePortalPath } from "@/hooks/usePortal";
import { assetsApi } from "@/features/assets/api/assets.api";
import type { AssetHistoryEntry } from "@/features/assets/api/assets.api";
import type { BackendAsset } from "@/features/assets/api/assets.contract";
import { EditAssetDialog } from "../components/EditAssetDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { facilitiesApi } from "@/features/facilities/api/facilities.api";
import { locationsApi } from "@/features/locations/api/locations.api";
import type { Facility } from "@/features/facilities/types/facility.types";
import type { Location } from "@/features/locations/types/location.types";
import { displayLabel, displayReference } from "@/utils/display-ids";
import { formatMoney } from "@/lib/money";
import { useRoleAccess } from "@/hooks/useRoleAccess";

const displayValue = (value: unknown) =>
  value === undefined || value === null || value === "" ? "—" : String(value);
const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

export function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const assetsPath = usePortalPath("assets");
  const workOrdersPath = usePortalPath("work-orders");
  const pmPath = usePortalPath("preventive-maintenance");
  const { canManageAssets } = useRoleAccess();
  const [asset, setAsset] = useState<BackendAsset | null>(null);
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [facilityName, setFacilityName] = useState<string | undefined>();
  const [locationName, setLocationName] = useState<string | undefined>();

  const loadAsset = async () => {
    if (!id) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await assetsApi.get(id);
      setAsset(data);
      const result = await assetsApi.history(data.assetTag);
      setHistory(Array.isArray(result) ? result : (result.data ?? []));
      if (data.facilityId)
        void facilitiesApi
          .get(data.facilityId)
          .then((facility: Facility) => setFacilityName(facility.name))
          .catch(() => undefined);
      if (data.locationId)
        void locationsApi
          .get(data.locationId)
          .then((location: Location) => setLocationName(location.name))
          .catch(() => undefined);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load asset details");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    void loadAsset();
  }, [id]);

  const showQr = async () => {
    setQrOpen(true);
    setQrLoading(true);
    setQrError(null);
    try {
      const blob = await assetsApi.qrImage(asset?.assetTag ?? "");
      if (!blob.size) throw new Error("The QR image response was empty");
      if (qrImageUrl) URL.revokeObjectURL(qrImageUrl);
      setQrImageUrl(URL.createObjectURL(blob));
    } catch (error) {
      setQrError(error instanceof Error ? error.message : "Unable to generate the QR code");
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(
    () => () => {
      if (qrImageUrl) URL.revokeObjectURL(qrImageUrl);
    },
    [qrImageUrl],
  );

  if (isLoading) return <PageLoader label="Loading asset details..." />;
  if (loadError)
    return (
      <main className="p-8">
        <PageError title="Asset unavailable" message={loadError} onRetry={() => void loadAsset()} />
      </main>
    );
  if (!asset)
    return (
      <main className="p-8">
        <p className="font-semibold">Asset not found</p>
        <Button className="mt-4" onClick={() => navigate(assetsPath)}>
          Back to assets
        </Button>
      </main>
    );

  const openWorkOrders = (asset as BackendAsset & { openWorkOrderCount?: number })
    .openWorkOrderCount;
  const assetStatus = String(asset.status ?? "unknown").replaceAll("_", " ");
  const information = [
    ["Asset ID", displayReference("AST", asset.assetTag)],
    ["Name", asset.name],
    ["Category", displayLabel(asset.category)],
    ["Manufacturer", asset.manufacturer],
    ["Model Number", asset.modelNumber],
    ["Serial Number", asset.serialNumber],
    ["Status", displayLabel(asset.status)],
    ["Criticality", displayLabel(asset.criticality)],
    ["Condition", displayLabel(asset.condition)],
    ["Ownership", displayLabel(asset.ownership)],
  ];
  const scope = [
    ["Description", asset.description],
    ["Facility", facilityName ?? asset.facilityId],
    ["Location", locationName ?? asset.locationId],
    ["Installation Date", formatDate(asset.installationDate)],
    ["Warranty Expiry", formatDate(asset.warrantyExpiry)],
    ["Last Maintenance", formatDate(asset.lastMaintenanceDate)],
    ["Next Maintenance", formatDate(asset.nextMaintenanceDate)],
  ];

  return (
    <div className="min-h-full bg-muted/30 text-foreground">
      <AppHeader title={asset.name} subtitle="Asset Detail" hideQuickCreate />
      <PageHeader
        title={asset.name}
        subtitle="Review asset information, operational scope, maintenance activity, and history."
      />
      <div className="space-y-6 p-8">
        <div className="flex justify-end gap-3">
          <StatusBadge status={String(asset.status ?? "unknown")} />
          {canManageAssets && (
            <Button
              variant="outline"
              onClick={() => setEditOpen(true)}
              className="h-9 rounded-lg border-border bg-card text-[13px] font-medium"
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit Asset
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            ["General Information", information],
            ["Operational Scope", scope],
          ].map(([title, rows]) => (
            <section
              key={String(title)}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 className="text-[15px] font-bold">{String(title)}</h2>
              <div className="mt-4 space-y-3 text-[13px]">
                {(rows as string[][]).map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-6">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="max-w-[65%] text-right font-semibold capitalize">
                      {displayValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Maintenance Events"
            value={history.length}
            changeLabel={history.length ? "Recorded events" : "No events recorded"}
            icon="calendar"
          />
          <KPICard
            title="Open Work Orders"
            value={openWorkOrders ?? 0}
            changeLabel={openWorkOrders === undefined ? "No count available" : "Currently open"}
            icon="work-orders"
            href={workOrdersPath}
          />
          <KPICard
            title="Asset Age"
            value={
              asset.installationDate
                ? `${Math.max(0, new Date().getFullYear() - new Date(asset.installationDate).getFullYear())} yrs`
                : "—"
            }
            changeLabel="Since installation"
            icon="clock"
          />
          <KPICard
            title="Estimated Value"
            value={
              asset.estimatedValueMinor === undefined && asset.estimatedValue === undefined
                ? "—"
                : formatMoney(
                    asset.estimatedValueMinor ?? Math.round((asset.estimatedValue ?? 0) * 100),
                    asset.currency ?? "NGN",
                  )
            }
            changeLabel={
              asset.estimatedValueMinor === undefined && asset.estimatedValue === undefined
                ? "—"
                : "Recorded value"
            }
            icon="cost"
          />
        </div>
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-[15px] font-bold">Asset Life History</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                A record of activity associated with this asset.
              </p>
            </div>
            <span className="text-[12px] font-semibold text-muted-foreground">
              {history.length} {history.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <div className="mt-4">
            {history.length === 0 ? (
              <EmptyState
                compact
                icon={History}
                title="No maintenance history"
                description="Maintenance events will appear here when activity is recorded for this asset."
              />
            ) : (
              <div className="space-y-4">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex gap-3 border-b border-border pb-4 last:border-0"
                  >
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="font-semibold text-primary">{entry.event}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {entry.description || "Asset activity recorded"} ·{" "}
                        {new Date(entry.occurredAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate(`${workOrdersPath}/new`)}>
            <Wrench className="mr-2 h-4 w-4" />
            Create Work Order
          </Button>
          <Button variant="outline" onClick={() => void showQr()}>
            <QrCode className="mr-2 h-4 w-4" />
            View QR Code
          </Button>
          <Button variant="outline" onClick={() => void assetsApi.downloadPdf(asset.assetTag)}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => navigate(pmPath)}>
            <Wrench className="mr-2 h-4 w-4" />
            Schedule PM
          </Button>
        </div>
      </div>
      <EditAssetDialog
        asset={asset}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => void loadAsset()}
      />
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="!max-w-2xl w-[calc(100vw-2rem)] !min-h-[32rem] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Asset QR Code</DialogTitle>
            <DialogDescription>Scan this code to identify {asset.name}.</DialogDescription>
          </DialogHeader>
          <div className="flex min-h-[24rem] flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-border bg-white p-8">
            {qrLoading ? (
              <p className="text-sm text-muted-foreground">Generating QR code…</p>
            ) : qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt={`QR code for ${asset.name}`}
                className="h-80 w-80 object-contain"
              />
            ) : (
              <>
                <p className="text-sm text-danger">
                  {qrError ?? "The QR code has not been generated yet."}
                </p>
                <Button onClick={() => void showQr()}>Generate QR Code</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
