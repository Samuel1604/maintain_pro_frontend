import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { AppHeader } from "@/components/navigation/Navbar";
import { PageIntro } from "@/components/layout/PageIntro";
import { PageError } from "@/components/feedback/PageError";
import { PageLoader } from "@/components/feedback/PageLoader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { toast } from "sonner";

import {
  organizationVendorsService,
  type OrganizationVendorRecord,
} from "../services/organizationVendors.service";

type Performance = {
  total: number;
  completed: number;
  inProgress: number;
  assigned: number;
  completionRate: number;
};

export function VendorDetails() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { canManageVendors } = useRoleAccess();
  const [vendor, setVendor] = useState<OrganizationVendorRecord | null>(null);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    if (!vendorId) return;
    setLoading(true);
    setError(null);
    try {
      const [vendorData, performanceData] = await Promise.all([
        organizationVendorsService.get(vendorId),
        organizationVendorsService.performance(vendorId),
      ]);
      setVendor(vendorData);
      setPerformance(performanceData);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("Unable to load vendor details"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [vendorId]);

  const updateStatus = async (status: "active" | "inactive" | "suspended") => {
    if (!vendorId) return;
    setUpdating(true);
    try {
      const updated = await organizationVendorsService.changeStatus(vendorId, status);
      setVendor(updated);
      toast.success(`Vendor marked ${status}`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Unable to update vendor status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <PageLoader label="Loading vendor details..." />;
  if (error) return <PageError message={error.message} onRetry={() => void load()} />;
  if (!vendor) return <PageError message="Vendor not found" onRetry={() => void load()} />;

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader title="Vendor details" hideQuickCreate />
      <main className="space-y-6 p-6">
        <div className="flex items-center justify-between gap-3">
          <PageIntro
            title={vendor.name}
            description="Review the live vendor relationship and operational performance for this organization."
          />
          <Button variant="outline" onClick={() => void load()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to vendors
        </Button>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold">Vendor profile</h2>
              <StatusBadge status={vendor.status} />
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium">{vendor.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="mt-1 font-medium">{vendor.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Service categories</dt>
                <dd className="mt-1 font-medium">
                  {vendor.serviceCategories.length ? vendor.serviceCategories.join(", ") : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Average rating</dt>
                <dd className="mt-1 font-medium">{vendor.averageRating ?? "—"}</dd>
              </div>
            </dl>
            {canManageVendors && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                {vendor.status !== "active" && (
                  <Button disabled={updating} onClick={() => void updateStatus("active")}>
                    Activate
                  </Button>
                )}
                {vendor.status === "active" && (
                  <Button
                    variant="outline"
                    disabled={updating}
                    onClick={() => void updateStatus("suspended")}
                  >
                    Suspend
                  </Button>
                )}
                {vendor.status !== "inactive" && (
                  <Button
                    variant="outline"
                    disabled={updating}
                    onClick={() => void updateStatus("inactive")}
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">Performance</h2>
            {performance ? (
              <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Total work orders</dt>
                  <dd className="mt-1 text-2xl font-semibold">{performance.total}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Completed</dt>
                  <dd className="mt-1 text-2xl font-semibold">{performance.completed}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Completion rate</dt>
                  <dd className="mt-1 text-2xl font-semibold">{performance.completionRate}%</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">In progress</dt>
                  <dd className="mt-1 text-2xl font-semibold">{performance.inProgress}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Assigned</dt>
                  <dd className="mt-1 text-2xl font-semibold">{performance.assigned}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Performance data is unavailable.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
