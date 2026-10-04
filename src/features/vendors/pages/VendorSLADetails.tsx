import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge, PriorityBadge } from "@/components/ui/badge";
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
};
const hours = (value?: number) =>
  value == null
    ? "Not configured"
    : value < 1
    ? `${Math.round(value * 60)} min`
    : `${value} hr${value === 1 ? "" : "s"}`;
const label =
  "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

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
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${tone}`}
        >
          TARGET
        </span>
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
  const [sla, setSla] = useState<Sla | null>(
    (location.state as { sla?: Sla } | null)?.sla ?? null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  const workOrders: string[][] = [];
  useEffect(() => {
    if (!sla && slaId)
      void apiClient
        .get<Sla[]>("/sla-agreements/mine")
        .then((items) =>
          setSla(items.find((item) => item._id === slaId) ?? null),
        )
        .catch((error) =>
          toast.error(
            error instanceof Error ? error.message : "Unable to load SLA",
          ),
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
          subtitle="Define and monitor service-level expectations for Lagos HVAC Services."
          breadcrumbs={
            <Button
              variant="ghost"
              className="px-0"
              onClick={() => navigate(`${base}/slas`)}
            >
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
                  <b>{sla.vendorName ?? "Vendor information unavailable"}</b>
                </div>
                <div>
                  <p className={label}>Contract ID</p>
                  <b className="text-orange-500">
                    {sla.contractId ?? "Not linked"}
                  </b>
                </div>
                <div>
                  <p className={label}>Effective date</p>
                  <b>
                    {sla.effectiveAt
                      ? new Date(sla.effectiveAt).toLocaleDateString()
                      : "Not configured"}
                  </b>
                </div>
                <div>
                  <p className={label}>Expiration date</p>
                  <b>
                    {sla.expiresAt
                      ? new Date(sla.expiresAt).toLocaleDateString()
                      : "Not configured"}
                  </b>
                </div>
              </div>
            </section>
            <section>
              <h2 className="mb-3 text-lg font-bold">
                Service Response &amp; Resolution Targets
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TargetCard
                  name="Configured target"
                  response={hours(sla.responseTimeHours)}
                  resolution={hours(sla.resolutionTimeHours)}
                  tone="bg-red-50 text-red-500"
                />
                {false ? (
                  <>
                    <TargetCard
                      name="High"
                      response="1 hr"
                      resolution="8 hrs"
                      tone="bg-orange-50 text-orange-500"
                    />
                    <TargetCard
                      name="Medium"
                      response="4 hrs"
                      resolution="24 hrs"
                      tone="bg-orange-50 text-orange-500"
                    />
                    <TargetCard
                      name="Low"
                      response="1 bus. day"
                      resolution="3 bus. days"
                      tone="bg-slate-100 text-slate-600"
                    />
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground sm:col-span-1 lg:col-span-3">
                    Priority-specific targets are not provided by the live SLA
                    endpoint.
                  </div>
                )}
              </div>
            </section>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="space-y-6 lg:col-span-3">
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="text-lg font-bold">
                    SLA Coverage Rules &amp; Parameters
                  </h2>
                  {false ? (
                    <>
                      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <p className={label}>Service category</p>
                          <p>HVAC &amp; Climate Control</p>
                        </div>
                        <div>
                          <p className={label}>Operating hours</p>
                          <p>
                            24/7 (Critical/High) • Business hrs (Medium/Low)
                          </p>
                        </div>
                        <div>
                          <p className={label}>Covered facilities</p>
                          <p>Lagos HQ, Ikeja Branch, Lekki Data Center</p>
                        </div>
                        <div>
                          <p className={label}>Business calendar exceptions</p>
                          <p>Nigerian public holidays excluded</p>
                        </div>
                      </div>
                      <div className="mt-5 border-t border-border pt-4">
                        <p className={label}>Explicit SLA exclusions</p>
                        <p className="text-sm text-muted-foreground">
                          {sla.notes ??
                            "Full unit replacement requests, duct modifications exceeding 10 meters, and works subcontracted out to third parties without prior authorization."}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Coverage rules are not included in the live SLA response.
                    </p>
                  )}
                </section>
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Related Work Orders</h2>
                    <Button variant="outline" size="sm">
                      Search WO...
                    </Button>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="p-3">ID</th>
                          <th className="p-3">Title</th>
                          <th className="p-3">Priority</th>
                          <th className="hidden p-3 sm:table-cell">
                            Resp. (Act)
                          </th>
                          <th className="hidden p-3 sm:table-cell">Actual</th>
                          <th className="p-3">SLA Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workOrders.map((row) => (
                          <tr key={row[0]} className="border-b last:border-0">
                            <td className="p-3 font-semibold text-orange-500">
                              {row[0]}
                            </td>
                            <td className="max-w-[220px] truncate p-3">
                              {row[1]}
                            </td>
                            <td className="p-3">
                              <PriorityBadge priority={row[2]} />
                            </td>
                            <td className="hidden p-3 sm:table-cell">
                              {row[3]}
                            </td>
                            <td className="hidden p-3 sm:table-cell">
                              {row[4]}
                            </td>
                            <td className="p-3">
                              <span className="text-xs font-medium text-muted-foreground">
                                {row[5]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
              <div className="space-y-6 lg:col-span-2">
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="text-lg font-bold">SLA Escalation Policy</h2>
                  {false ? (
                    <div className="mt-5 space-y-5 text-sm">
                      <p className="flex gap-3">
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        <span>
                          <b>75% Target Elapsed</b>
                          <br />
                          <span className="text-muted-foreground">
                            Vendor Manager Alert
                          </span>
                          <br />
                          <small className="text-muted-foreground">
                            Automated trigger notifying Lagos HVAC Dispatcher.
                          </small>
                        </span>
                      </p>
                      <p className="flex gap-3">
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        <span>
                          <b>90% Target Elapsed</b>
                          <br />
                          <span className="text-muted-foreground">
                            Facility Manager Alert
                          </span>
                          <br />
                          <small className="text-muted-foreground">
                            SLA approaching breach. High-priority dispatch
                            trigger.
                          </small>
                        </span>
                      </p>
                      <p className="flex gap-3">
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        <span>
                          <b>SLA Target Breached</b>
                          <br />
                          <span className="text-muted-foreground">
                            Organization Admin Alert
                          </span>
                          <br />
                          <small className="text-muted-foreground">
                            Breach logged automatically. Requires admin contract
                            review.
                          </small>
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Escalation rules are not included in the live SLA
                      response.
                    </p>
                  )}
                </section>
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="text-lg font-bold">SLA Performance Metrics</h2>
                  <div className="mt-5 grid grid-cols-2 gap-5">
                    <div>
                      <p className={label}>SLA compliance</p>
                      <p className="text-2xl font-bold text-emerald-500">
                        {"—"}
                      </p>
                    </div>
                    <div>
                      <p className={label}>Avg response time</p>
                      <p className="text-2xl font-bold">
                        {"—"}
                      </p>
                    </div>
                    <div>
                      <p className={label}>Breached WOs</p>
                      <p className="text-2xl font-bold text-red-500">
                        {"—"}
                      </p>
                    </div>
                    <div>
                      <p className={label}>Approaching breach</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {"—"}
                      </p>
                    </div>
                  </div>
                </section>
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="text-lg font-bold">
                    SLA Timeline &amp; History
                  </h2>
                  {false ? (
                    <div className="mt-5 space-y-5 text-sm">
                      <p className="flex gap-3">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>
                          <b>SLA reviewed by admin</b>
                          <br />
                          <span className="text-muted-foreground">
                            Samuel Dane completed bi-weekly SLA validation.
                          </span>
                        </span>
                      </p>
                      <p className="flex gap-3">
                        <Clock3 className="h-4 w-4 shrink-0 text-red-400" />
                        <span>
                          <b>SLA breached on WO-4135</b>
                          <br />
                          <span className="text-muted-foreground">
                            High Vibration diagnostics resolution target elapsed
                            limit.
                          </span>
                        </span>
                      </p>
                      <p className="flex gap-3">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>
                          <b>SLA modified</b>
                          <br />
                          <span className="text-muted-foreground">
                            Medium target response adjusted from 2h to 4h.
                          </span>
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      SLA history is not available from the live endpoint.
                    </p>
                  )}
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
                Status changes are recorded in the SLA history and may affect
                contract operations.
              </p>
              <Select value={nextStatus} onValueChange={setNextStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "draft",
                    "proposed",
                    "accepted",
                    "active",
                    "expired",
                    "terminated",
                    "rejected",
                  ].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status
                        .replace("_", " ")
                        .replace(/^./, (value) => value.toUpperCase())}
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
                      error instanceof Error
                        ? error.message
                        : "Unable to update SLA status",
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
