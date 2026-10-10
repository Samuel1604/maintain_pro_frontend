import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/api/client";

type Sla = {
  _id: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
  status: string;
  workOrderId: string;
  vendorApplicationId: string;
  notes?: string;
  vendorName?: string;
  contractId?: string;
  effectiveAt?: string;
  expiresAt?: string;
  workOrder?: {
    title?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    slaBreached?: boolean;
  };
  performance?: { breached: boolean; workOrderStatus?: string };
};
const hours = (value?: number) =>
  value == null
    ? "—"
    : value < 1
      ? `${Math.round(value * 60)} min`
      : `${value} hr${value === 1 ? "" : "s"}`;
const label = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";
const allowedTransitions: Record<string, string[]> = {
  draft: ["proposed"],
  proposed: ["accepted", "rejected"],
  accepted: ["active"],
  active: ["terminated"],
};

function TargetCard({
  name,
  response,
  resolution,
  tone,
}: {
  name: string;
  response: string;
  resolution: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{name}</h3>
        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${tone}`}>TARGET</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className={label}>Response</p>
          <p className="font-semibold">{response}</p>
        </div>
        <div>
          <p className={label}>Resolution</p>
          <p className="font-semibold">{resolution}</p>
        </div>
      </div>
    </div>
  );
}

export function VendorSLADetails() {
  const { slaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [sla, setSla] = useState<Sla | null>((location.state as { sla?: Sla } | null)?.sla ?? null);
  const [editOpen, setEditOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  useEffect(() => {
    if (!sla && slaId)
      void apiClient
        .get<Sla[]>("/sla-agreements/mine")
        .then((items) => setSla(items.find((item) => item._id === slaId) ?? null))
        .catch((error) =>
          toast.error(error instanceof Error ? error.message : "Unable to load SLA"),
        );
  }, [sla, slaId]);
  const base = location.pathname.split("/").slice(0, 3).join("/");
  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader title={`SLA ${slaId ?? ""}`} subtitle="SLAs" hideQuickCreate />
      <main className="space-y-6 px-4 py-5 sm:px-8 lg:px-10">
        <PageHeader
          className="rounded-xl border border-border"
          title={`Vendor SLA: ${slaId ?? ""}`}
          subtitle="Review and manage the response and resolution targets attached to this agreement."
          breadcrumbs={
            <Button variant="ghost" className="px-0" onClick={() => navigate(`${base}/slas`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to SLAs
            </Button>
          }
          actions={
            <>
              {sla && <StatusBadge status={sla.status} />}
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => navigate(`${base}/slas`)}
              >
                Back
              </Button>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                disabled={!sla}
                onClick={() => {
                  setNextStatus(sla?.status ?? "");
                  setEditOpen(true);
                }}
              >
                Update status
              </Button>
            </>
          }
        />
        {sla ? (
          <>
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <h2 className="text-lg font-bold">SLA Overview</h2>
              <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-5">
                <div>
                  <p className={label}>SLA ID</p>
                  <b>{sla._id}</b>
                </div>
                <div>
                  <p className={label}>Vendor</p>
                  <b>{sla.vendorName ?? "—"}</b>
                </div>
                <div>
                  <p className={label}>Contract ID</p>
                  <b className="text-orange-500">{sla.contractId ?? "—"}</b>
                </div>
                <div>
                  <p className={label}>Effective date</p>
                  <b>{sla.effectiveAt ? new Date(sla.effectiveAt).toLocaleDateString() : "—"}</b>
                </div>
                <div>
                  <p className={label}>Expiration date</p>
                  <b>{sla.expiresAt ? new Date(sla.expiresAt).toLocaleDateString() : "—"}</b>
                </div>
              </div>
            </section>
            <section>
              <h2 className="mb-3 text-lg font-bold">Service Response &amp; Resolution Targets</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TargetCard
                  name="Configured target"
                  response={hours(sla.responseTimeHours)}
                  resolution={hours(sla.resolutionTimeHours)}
                  tone="bg-red-50 text-red-500"
                />
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground sm:col-span-1 lg:col-span-3">
                  Priority-specific targets are not configured for this agreement.
                </div>
              </div>
            </section>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="space-y-6 lg:col-span-3">
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="text-lg font-bold">SLA Coverage Rules &amp; Parameters</h2>
                  <p className="mt-4 text-sm text-muted-foreground">
                    No coverage rules are recorded for this agreement.
                  </p>
                </section>
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Related Work Orders</h2>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="p-3">ID</th>
                          <th className="p-3">Title</th>
                          <th className="p-3">Priority</th>
                          <th className="hidden p-3 sm:table-cell">Resp. (Act)</th>
                          <th className="hidden p-3 sm:table-cell">Actual</th>
                          <th className="p-3">SLA Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                            {sla.workOrder
                              ? `${sla.workOrder.title || `Work order ${sla.workOrderId.slice(0, 8)}`} · ${sla.workOrder.status?.replaceAll("_", " ") || "status unavailable"}`
                              : "No work order is linked to this SLA yet."}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
              <div className="space-y-6 lg:col-span-2">
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="text-lg font-bold">SLA Escalation Policy</h2>
                  {false ? (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Escalation rules are configured by the organization.
                    </p>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Escalation rules are not included in the live SLA response.
                    </p>
                  )}
                </section>
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="text-lg font-bold">SLA Performance Metrics</h2>
                  <div className="mt-5 grid grid-cols-2 gap-5">
                    <div>
                      <p className={label}>SLA compliance</p>
                      <p className="text-2xl font-bold text-emerald-500">
                        {sla.performance ? (sla.performance.breached ? "0%" : "100%") : "—"}
                      </p>
                    </div>
                    <div>
                      <p className={label}>Avg response time</p>
                      <p className="text-2xl font-bold">—</p>
                    </div>
                    <div>
                      <p className={label}>Breached WOs</p>
                      <p className="text-2xl font-bold text-red-500">
                        {sla.performance ? (sla.performance.breached ? 1 : 0) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className={label}>Approaching breach</p>
                      <p className="text-2xl font-bold text-orange-500">{"—"}</p>
                    </div>
                  </div>
                </section>
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="text-lg font-bold">SLA Timeline &amp; History</h2>
                  <p className="mt-4 text-sm text-muted-foreground">
                    No SLA history is recorded for this agreement.
                  </p>
                </section>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            SLA agreement not found.
          </div>
        )}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update SLA status</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-3">
              <p className="text-sm text-muted-foreground">
                Status changes are recorded in the SLA history and may affect contract operations.
              </p>
              <Select value={nextStatus} onValueChange={setNextStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {(sla ? (allowedTransitions[sla.status] ?? []) : []).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace("_", " ").replace(/^./, (value) => value.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={!sla || !nextStatus}
                onClick={async () => {
                  if (!sla || !nextStatus) return;
                  try {
                    const updated = await apiClient.patch<Sla>(
                      `/sla-agreements/${sla._id}/status`,
                      { status: nextStatus },
                    );
                    setSla(updated);
                    setEditOpen(false);
                    toast.success("SLA status updated");
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Unable to update SLA status",
                    );
                  }
                }}
              >
                Save status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
