import { useEffect, useState } from "react";
import { AppHeader } from "@/components/navigation/Navbar";
import { PageHeader } from "@/components/ui/page-header";
import { apiClient } from "@/api/client";
import { SkeletonCard } from "@/components/feedback/Skeletons";

interface Performance {
  total: number;
  completed: number;
  inProgress: number;
  assigned: number;
  completionRate: number;
}
// TODO: add a completion-rate trend chart once the API returns time-series performance data.
export function VendorPerformance() {
  const [data, setData] = useState<Performance | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void apiClient
      .get<Performance>("/vendors/me/performance")
      .then(setData)
      .catch(() => setError("Unable to load vendor performance"));
  }, []);
  return (
    <main className="page-body">
      <AppHeader title="Performance" hideQuickCreate />
      <PageHeader
        title="Performance"
        subtitle="Track vendor delivery, completion, and work-order outcomes."
      />
      <div className="px-6 py-6">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : !data ? (
          <div
            role="status"
            aria-live="polite"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <span className="sr-only">Loading performance…</span>
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Total Work Orders", data.total],
              ["Completed", data.completed],
              ["In Progress", data.inProgress],
              ["Completion Rate", `${data.completionRate}%`],
            ].map(([label, value]) => (
              <div className="rounded-lg border bg-card p-5" key={String(label)}>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
