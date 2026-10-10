import { useEffect, useMemo, useState } from "react";
import { Search, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PageError } from "@/components/feedback/PageError";
import { AppHeader } from "@/components/navigation/Navbar";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/api/client";
import { useActionConfirm } from "@/hooks/useActionConfirm";
import { usePortalPath } from "@/hooks/usePortal";
import { displayReference } from "@/utils/display-ids";

type ApplicationStatus = "submitted" | "under_review" | "withdrawn" | "rejected" | "awarded";
interface VendorApplication {
  id: string;
  organizationId: string;
  workOrderId: string;
  status: ApplicationStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
  organizationName?: string;
  workOrderTitle?: string;
  quotation?: {
    number: string;
    currency: string;
    totalMinor: number;
    estimatedDurationHours: number;
    status: string;
  };
}
const statusLabel: Record<ApplicationStatus, string> = {
  submitted: "SUBMITTED",
  under_review: "UNDER REVIEW",
  withdrawn: "WITHDRAWN",
  rejected: "REJECTED",
  awarded: "ACCEPTED",
};

export function VendorApplications() {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { requestConfirm, ActionConfirmDialog } = useActionConfirm();
  const workOrdersPath = usePortalPath("work-orders");
  const loadApplications = async () => {
    setLoadError(null);
    setLoading(true);
    try {
      setApplications(await apiClient.get<VendorApplication[]>("/vendor-applications/mine"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load applications";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadApplications();
  }, []);
  const filtered = useMemo(
    () =>
      applications.filter((item) =>
        `${item.id} ${item.workOrderId} ${item.status}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [applications, search],
  );
  const selected = applications.find((item) => item.id === selectedId) ?? filtered[0];
  const withdraw = async () => {
    if (!selected || !["submitted", "under_review"].includes(selected.status)) return;
    try {
      const updated = await apiClient.post<VendorApplication>(
        `/vendor-applications/${selected.id}/withdraw`,
      );
      setApplications((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("Application withdrawn");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to withdraw application");
    }
  };
  const confirmWithdraw = () =>
    requestConfirm({
      title: "Withdraw application?",
      description: "This will remove your active bid from the organization review queue.",
      warning: "You may need to submit a new application if the opportunity is still open.",
      confirmLabel: "Withdraw application",
      destructive: true,
      onConfirm: () => void withdraw(),
    });
  return (
    <div className="min-h-full bg-background text-foreground">
      {ActionConfirmDialog}
      <AppHeader title="Applications" hideQuickCreate />
      <div className="border-b border-border bg-card px-8 py-5">
        <PageIntro
          title="Applications"
          description="Track submitted bids, negotiations, and application outcomes."
        />
      </div>
      <div className="px-8 py-6 space-y-6">
        {loadError ? (
          <PageError
            title="Applications unavailable"
            message={loadError}
            onRetry={() => void loadApplications()}
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search applications..."
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-muted/40 text-[11px] uppercase text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">ID</th>
                      <th className="px-5 py-3">Opportunity / Org</th>
                      <th className="px-5 py-3">Submitted Date</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          Loading applications…
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          className={`cursor-pointer hover:bg-muted/20 ${selected?.id === item.id ? "bg-indigo-500/10" : ""}`}
                        >
                          <td className="px-5 py-4 font-bold text-indigo-500">
                            {displayReference("APP", item.id)}
                          </td>
                          <td className="px-5 py-4">
                            <Link
                              to={`${workOrdersPath}/${item.workOrderId}`}
                              className="font-semibold text-primary hover:underline"
                              onClick={(event) => event.stopPropagation()}
                            >
                              {item.workOrderTitle ||
                                `Work order ${displayReference("WO", item.workOrderId)}`}
                            </Link>
                            <p className="text-[11px] text-muted-foreground">
                              {item.organizationName || "Organization account"}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant="secondary">{statusLabel[item.status]}</Badge>
                          </td>
                        </tr>
                      ))
                    )}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-muted-foreground">
                          No applications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-5 min-h-[420px]">
              {selected ? (
                <>
                  <div className="flex items-start justify-between border-b border-border pb-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-indigo-500">
                        Application details
                      </p>
                      <h2 className="mt-1 text-lg font-bold">
                        <Link
                          to={`${workOrdersPath}/${selected.workOrderId}`}
                          className="text-primary hover:underline"
                        >
                          {selected.workOrderTitle ||
                            `Work order ${displayReference("WO", selected.workOrderId)}`}
                        </Link>
                      </h2>
                      <p className="text-[13px] text-muted-foreground">
                        {selected.organizationName || "Organization account"}
                      </p>
                    </div>
                    <Badge>{statusLabel[selected.status]}</Badge>
                  </div>
                  <div className="space-y-4 text-[13px]">
                    <div className="flex gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Application submitted</p>
                        <p className="text-muted-foreground">
                          {new Date(selected.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Last updated</p>
                        <p className="text-muted-foreground">
                          {new Date(selected.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="font-semibold">Status</p>
                        <p className="text-muted-foreground">{statusLabel[selected.status]}</p>
                      </div>
                    </div>
                    {selected.note && (
                      <div>
                        <p className="font-semibold">Submitted note</p>
                        <p className="mt-1 text-muted-foreground">{selected.note}</p>
                      </div>
                    )}
                    {selected.quotation && (
                      <div>
                        <p className="font-semibold">Submitted quotation</p>
                        <p className="mt-1 text-muted-foreground">
                          {selected.quotation.number} · {selected.quotation.currency}{" "}
                          {selected.quotation.totalMinor / 100} ·{" "}
                          {selected.quotation.estimatedDurationHours} hours ·{" "}
                          {selected.quotation.status.replaceAll("_", " ")}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={!["submitted", "under_review"].includes(selected.status)}
                      onClick={confirmWithdraw}
                    >
                      Withdraw application
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Select an application to view details.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
