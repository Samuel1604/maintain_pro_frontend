import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardList,
  Wrench,
  ShieldAlert,
  Package,
  Settings,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { AppHeader as Navbar } from "@/components/navigation/Navbar";
import { KPICard } from "@/features/dashboard/components/StatCard";
import {
  CategoryBreakdownChart,
  WorkOrderTrendChart,
} from "@/features/dashboard/components/DashboardWidgets";
import { useRoleDashboardDateRange } from "@/features/dashboard/hooks/useRoleDashboardDateRange";
import {
  DASHBOARD_RANGE_LABELS,
  type DashboardDateRange,
} from "@/features/dashboard/utils/dashboardDateRange";
import { usePortalPath } from "@/hooks/usePortal";
import { useAuthStore } from "@/app/store";
import { useState } from "react";
import type { WorkOrder } from "@/types/common.types";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageError } from "@/components/feedback/PageError";
import { HandWaveGreeting } from "@/components/ui/HandWaveGreeting";
import { facilitiesApi } from "@/features/facilities/api/facilities.api";
import { useQuery } from "@tanstack/react-query";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  children,
  noPadding,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/80 bg-gradient-to-r from-card to-muted/20 px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className={noPadding ? "" : "px-5 py-4"}>{children}</div>
    </div>
  );
}

function CriticalIssuesPanel({
  orders,
  path,
}: {
  orders: WorkOrder[];
  path: string;
}) {
  const CRITICAL_LOCATIONS = ["Main HQ", "West Campus", "North Logistics"];
  const rows =
    orders.length > 0
      ? orders.slice(0, 3).map((o, i) => ({
          id: o.id,
          title: o.title,
          location: o.locationName ?? CRITICAL_LOCATIONS[i] ?? "—",
          time: relativeTime(o.updatedAt),
        }))
      : [];

  return (
    <SectionCard
      title="Critical Issues"
      subtitle="Unresolved safety or operations anomalies needing instant dispatch"
      noPadding
    >
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <Link
            key={row.id}
            to={`${path}/${row.id}`}
            className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors"
          >
            <span className="rounded px-2 py-0.5 text-[11px] font-bold bg-destructive/10 text-destructive">
              CRITICAL
            </span>
            <span className="flex-1 text-[13px] font-medium text-foreground truncate">
              {row.title}
            </span>
            <span className="shrink-0 text-[13px] text-muted-foreground hidden sm:block">
              {row.location}
            </span>
            <span className="shrink-0 text-[12px] text-muted-foreground">
              {row.time}
            </span>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}

function VendorSLAPanel() {
    return (
      <SectionCard
        title="Vendor SLA Compliance"
        subtitle="Contract response/resolution health"
      >
        <p className="text-sm text-muted-foreground">
          Vendor SLA performance is not available from the dashboard API.
        </p>
      </SectionCard>
    );
}

function StatusBreakdownPanel({ workOrders }: { workOrders: WorkOrder[] }) {
  const STATUS_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--warning)",
    "var(--success)",
  ];
  const STATUS_LABELS = ["Open", "In Progress", "On Hold", "Completed"];
  const STATUS_KEYS = ["open", "in_progress", "pending_completion", "completed"];

  const counts = STATUS_KEYS.map(
    (key) =>
      workOrders.filter((o) =>
        key === "completed" ? o.status === "completed" : o.status === key,
      ).length,
  );
  // Fallback to static if no data
  const displayCounts = counts;
  const total = Math.max(
    displayCounts.reduce((a, b) => a + b, 0),
    1,
  );

  return (
    <SectionCard
      title="Work Order Status Breakdown"
      subtitle="Current status of all open tickets"
    >
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {displayCounts.map((count, i) => (
          <span
            key={STATUS_LABELS[i]}
            style={{
              backgroundColor: STATUS_COLORS[i],
              width: `${(count / total) * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
        {displayCounts.map((count, i) => (
          <span
            key={STATUS_LABELS[i]}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[i] }}
            />
            {STATUS_LABELS[i]}:{" "}
            <strong className="text-foreground">{count}</strong>
          </span>
        ))}
      </div>
    </SectionCard>
  );
}

function VendorDispatchPanel() {
    return (
      <SectionCard
        title="Recent Vendor Dispatch"
        subtitle="Real-time activity log of assigned technicians"
      >
        <p className="text-sm text-muted-foreground">
          Vendor dispatch activity is not available from the dashboard API.
        </p>
      </SectionCard>
    );
}

function PendingApprovalsPanel({ approvalsPath }: { approvalsPath: string }) {
  return (
    <SectionCard
      title="Pending Approvals"
      subtitle="Financial and contract permissions waiting on Admin clearance"
    >
      <p className="text-sm text-muted-foreground">
        Pending approval records are not available from the dashboard API.
      </p>
    </SectionCard>
  );
}

function InventoryWarningsPanel() {
  return (
    <SectionCard
      title="Inventory Level Warnings"
      subtitle="Replacement items below minimal safety stock threshold"
    >
      <p className="text-sm text-muted-foreground">
        Inventory warnings are not available from the dashboard API.
      </p>
    </SectionCard>
  );
}

function RecentActivityPanel({
  orders,
  path,
}: {
  orders: WorkOrder[];
  path: string;
}) {
  const rows =
    orders.length > 0
      ? orders.slice(0, 8).map((o, i) => ({
          id: o.id,
          text: o.title,
          time: new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(o.updatedAt)),
          user: o.assigneeName?.slice(0, 2).toUpperCase() ?? "—",
          userBg: "var(--primary, #4f46e5)",
        }))
      : [];

  return (
    <SectionCard
      title="Recent Organization Activity"
      subtitle="Complete audit trail of system events across all facilities"
      noPadding
    >
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <Link
            key={row.id}
            to={`${path}/${row.id}`}
            className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors"
          >
            <span className="flex-1 text-[13px] text-foreground">
              {row.text}
            </span>
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ backgroundColor: row.userBg }}
            >
              {row.user}
            </span>
            <span className="shrink-0 text-[12px] text-muted-foreground w-14 text-right">
              {row.time}
            </span>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [_range] = useState<DashboardDateRange>("30d");
  const user = useAuthStore((state) => state.user);
  const {
    activeWorkOrders,
    workOrdersInRange,
    stats,
    reportTrends,
    isLoading,
    error,
    refetch,
  } = useRoleDashboardDateRange("30d");
  const facilitiesQuery = useQuery({
    queryKey: ["dashboard", "facility-statistics", user?.id],
    queryFn: facilitiesApi.statistics,
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    retry: false,
  });
  const workOrdersPath = usePortalPath("work-orders");
  const approvalsPath = usePortalPath("approvals");
  const pmPath = usePortalPath("preventive-maintenance");
  const facilitiesPath = usePortalPath("facilities");
  const critical = useMemo(
    () => activeWorkOrders.filter((o) => o.priority === "critical").slice(0, 3),
    [activeWorkOrders],
  );
  const highPriorityCount = useMemo(
    () =>
      activeWorkOrders.filter(
        (order) => order.priority === "high" || order.priority === "critical",
      ).length,
    [activeWorkOrders],
  );
  const displayStats = stats;
  const trendData = useMemo(() => {
    if (reportTrends.length > 0)
      return reportTrends.map((point) => ({
        month: point.period,
        created: point.created,
        completed: point.completed,
      }));
    const buckets = new Map<
      string,
      { month: string; created: number; completed: number }
    >();
    workOrdersInRange.forEach((order) => {
      const month = new Intl.DateTimeFormat(undefined, {
        month: "short",
      }).format(order.createdAt);
      const item = buckets.get(month) ?? { month, created: 0, completed: 0 };
      item.created += 1;
      if (order.status === "completed") item.completed += 1;
      buckets.set(month, item);
    });
    return [...buckets.values()];
  }, [reportTrends, workOrdersInRange]);
  const categoryData = useMemo(() => {
    const palette = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];
    const counts = new Map<string, number>();
    workOrdersInRange.forEach((order) =>
      counts.set(
        order.category || "Uncategorised",
        (counts.get(order.category || "Uncategorised") ?? 0) + 1,
      ),
    );
    return [...counts.entries()].map(([name, value], index) => ({
      name,
      value,
      fill: palette[index % palette.length],
    }));
  }, [workOrdersInRange]);

  if (isLoading) return <PageLoader label="Loading dashboard data..." />;
  if (error)
    return (
      <PageError
        title="Dashboard unavailable"
        message={
          error instanceof Error
            ? error.message
            : "Unable to load dashboard data."
        }
        onRetry={() => void refetch()}
      />
    );

  return (
    <>
      <Navbar title="Dashboard" subtitle="Overview" />

      <div className="dashboard-page min-h-full bg-background px-6 py-6 pb-12">
        <HandWaveGreeting
          userName={user?.firstName}
          subtext="A clear overview of your organization’s maintenance operations."
          className="mb-6"
        />
        {/* ── KPI Row ── */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <KPICard
            title="Open Work Orders"
            value={displayStats.openWorkOrders}
            changeLabel={`${highPriorityCount} high priority`}
            icon="work-orders"
            href={workOrdersPath}
          />
          <KPICard
            title="Critical Issues"
            value={critical.length}
            changeLabel="Requires attention"
            icon="overdue"
            variant="danger"
            href={workOrdersPath}
          />
          <KPICard
            title="PM Schedules"
            value={stats.dueToday}
            changeLabel="Scheduled this week"
            icon="calendar"
            href={pmPath}
          />
          <KPICard
            title="PM Due This Week"
            value={stats.dueToday}
            changeLabel="Preventive tasks"
            icon="calendar"
            href={pmPath}
          />
          <KPICard
            title="Active Facilities"
            value={facilitiesQuery.data?.total ?? "—"}
            changeLabel={facilitiesQuery.isLoading ? "Loading facilities" : "Live facility count"}
            icon="facilities"
            href={facilitiesPath}
          />
        </div>

        {/* ── Row 1: Critical Issues | Vendor SLA ── */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <CriticalIssuesPanel orders={critical} path={workOrdersPath} />
          </div>
          <div className="lg:col-span-5">
            <VendorSLAPanel />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <WorkOrderTrendChart data={trendData} />
          </div>
          <div className="lg:col-span-5">
            <CategoryBreakdownChart data={categoryData} />
          </div>
        </div>

        {/* ── Row 2: Status Breakdown | Vendor Dispatch ── */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <StatusBreakdownPanel workOrders={workOrdersInRange} />
          </div>
          <div className="lg:col-span-5">
            <VendorDispatchPanel />
          </div>
        </div>

        {/* ── Row 3: Pending Approvals | Inventory Warnings ── */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <PendingApprovalsPanel approvalsPath={approvalsPath} />
          </div>
          <div className="lg:col-span-5">
            <InventoryWarningsPanel />
          </div>
        </div>

        {/* ── Row 4: Full-width Recent Activity ── */}
        <RecentActivityPanel orders={workOrdersInRange} path={workOrdersPath} />
      </div>
    </>
  );
}

function relativeTime(value: Date) {
  const minutes = Math.max(
    1,
    Math.round((Date.now() - new Date(value).getTime()) / 60000),
  );
  return minutes < 60 ? `${minutes}m ago` : `${Math.round(minutes / 60)}h ago`;
}

// suppress unused lint warnings
void CheckCircle2;
void ClipboardList;
void Wrench;
void ShieldAlert;
void Package;
void Settings;
void AlertTriangle;
void BarChart3;
void DASHBOARD_RANGE_LABELS;
