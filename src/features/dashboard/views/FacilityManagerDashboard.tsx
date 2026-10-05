import { CalendarDays, Hammer } from "lucide-react";
import { AppHeader as Navbar } from "@/components/navigation/Navbar";
import { KPICard } from "@/features/dashboard/components/StatCard";
import { useAuthStore } from "@/app/store";
import { usePortalPath } from "@/hooks/usePortal";
import { useLocationsApi } from "@/features/locations/hooks/useLocationsApi";
import { useFacility } from "@/features/facilities/hooks/useFacilities";
import { useRoleDashboardDateRange } from "@/features/dashboard/hooks/useRoleDashboardDateRange";
import type { WorkOrder } from "@/types/common.types";
import { HandWaveGreeting } from "@/components/ui/HandWaveGreeting";

const PRIORITY_LEVELS = [
  { label: "Critical", color: "var(--destructive)" },
  { label: "High", color: "var(--warning)" },
  { label: "Medium", color: "var(--chart-3)" },
  { label: "Low", color: "var(--muted-foreground)" },
];

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
      <div className="border-b border-border/80 bg-gradient-to-r from-card to-muted/20 px-5 py-4">
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className={noPadding ? "" : "px-5 py-4"}>{children}</div>
    </div>
  );
}

function PriorityBar({ orders }: { orders: WorkOrder[] }) {
  const liveTotals = PRIORITY_LEVELS.map((p) => ({
    ...p,
    value:
      orders.length > 0 ? orders.filter((o) => o.priority === p.label.toLowerCase()).length : 0,
  }));
  const total = Math.max(
    liveTotals.reduce((n, p) => n + p.value, 0),
    1,
  );
  return (
    <SectionCard title="Work Orders by Priority" subtitle="Total open tasks grouped by severity">
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {liveTotals.map((p) => (
          <span
            key={p.label}
            style={{
              backgroundColor: p.color,
              width: `${(p.value / total) * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
        {liveTotals.map((p) => (
          <span
            key={p.label}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            {p.label}: <strong className="text-foreground">{p.value}</strong>
          </span>
        ))}
      </div>
    </SectionCard>
  );
}

function SchedulePanel({ orders }: { orders: WorkOrder[] }) {
  const rows =
    orders.length > 0
      ? orders.slice(0, 5).map((o) => ({
          time: new Intl.DateTimeFormat(undefined, {
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(o.createdAt)),
          icon: o.type === "preventive" ? "calendar" : "wrench",
          title: o.title,
          location: o.locationName ?? "—",
          tech: o.assigneeName ?? "Unassigned",
          techColor: "#4f46e5",
        }))
      : [];

  return (
    <SectionCard
      title="Today's Maintenance Schedule"
      subtitle="Planned dispatch and recurring task check-offs"
      noPadding
    >
      <div className="divide-y divide-[#f1f5f9]">
        {rows.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            No scheduled work orders in this period.
          </p>
        ) : (
          rows.map((row, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3">
              <span className="w-20 shrink-0 text-[12px] font-semibold text-muted-foreground">
                {row.time}
              </span>
              {row.icon === "calendar" ? (
                <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <Hammer className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground leading-snug">
                  {row.title}
                </p>
                <p className="text-[12px] text-muted-foreground">{row.location}</p>
              </div>
              <span
                className="text-[12px] font-medium whitespace-nowrap"
                style={{ color: row.techColor }}
              >
                ● {row.tech}
              </span>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function ActivityPanel({ orders }: { orders: WorkOrder[] }) {
  const rows =
    orders.length > 0
      ? orders.slice(0, 6).map((o) => ({
          id: o.id,
          text: o.title,
          sub: `Updated by: ${o.assigneeName ?? "system"}`,
          time: new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
          }).format(new Date(o.createdAt)),
        }))
      : [];

  return (
    <SectionCard
      title="Recent Maintenance Activity"
      subtitle="Updates and actions completed within your purview"
      noPadding
    >
      <div className="divide-y divide-[#f1f5f9]">
        {rows.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            No recent maintenance activity is available.
          </p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="flex items-start justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground leading-snug">{row.text}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{row.sub}</p>
              </div>
              <span className="shrink-0 text-[12px] text-muted-foreground">{row.time}</span>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function FacilityScopePanel({
  facilityName,
  locations,
}: {
  facilityName?: string;
  locations: { id: string; name: string }[];
}) {
  return (
    <SectionCard
      title="Facility Scope"
      subtitle="Your assigned facility and operational locations"
      noPadding
    >
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Facility
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {facilityName ?? "Facility context unavailable"}
          </p>
        </div>
        <div className="border-t border-border pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Locations
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{locations.length}</p>
          <p className="text-xs text-muted-foreground">Operational locations in scope</p>
        </div>
      </div>
    </SectionCard>
  );
}

function StatusBreakdownPanel({ orders }: { orders: WorkOrder[] }) {
  const statuses = [
    { key: "open", label: "Open", color: "var(--chart-1)" },
    { key: "in_progress", label: "In Progress", color: "var(--chart-2)" },
    { key: "on_hold", label: "On Hold", color: "var(--warning)" },
    { key: "completed", label: "Completed", color: "var(--success)" },
  ].map((status) => ({
    ...status,
    count: orders.filter((order) => order.status === status.key).length,
  }));
  const total = Math.max(
    statuses.reduce((sum, status) => sum + status.count, 0),
    1,
  );

  return (
    <SectionCard title="Work Order Status" subtitle="Current status of work in your facility">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {statuses.map((status) => (
          <span
            key={status.key}
            style={{ backgroundColor: status.color, width: `${(status.count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {statuses.map((status) => (
          <span
            key={status.key}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
            {status.label}: <strong className="text-foreground">{status.count}</strong>
          </span>
        ))}
      </div>
    </SectionCard>
  );
}

function CriticalIssuesPanel({ orders, path }: { orders: WorkOrder[]; path: string }) {
  const criticalOrders = orders.filter(
    (order) => order.priority === "critical" || order.priority === "high",
  );
  return (
    <SectionCard
      title="Critical Issues"
      subtitle="High-priority work requiring attention"
      noPadding
    >
      {criticalOrders.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground">
          No critical or high-priority work orders are currently in scope.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {criticalOrders.slice(0, 5).map((order) => (
            <a
              key={order.id}
              href={`${path}/${order.id}`}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
            >
              <span className="rounded bg-destructive/10 px-2 py-0.5 text-[11px] font-bold uppercase text-destructive">
                {order.priority}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                {order.title}
              </span>
              <span className="hidden shrink-0 text-[12px] text-muted-foreground sm:block">
                {order.locationName ?? "Location unavailable"}
              </span>
            </a>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function UnavailablePanel({
  title,
  subtitle,
  message,
}: {
  title: string;
  subtitle: string;
  message: string;
}) {
  return (
    <SectionCard title={title} subtitle={subtitle}>
      <p className="text-sm text-muted-foreground">{message}</p>
    </SectionCard>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function FacilityManagerDashboard() {
  const user = useAuthStore((s) => s.user);
  const { workOrdersInRange, stats, activeWorkOrders, hasData } = useRoleDashboardDateRange("30d");
  const locations = useLocationsApi().data ?? [];
  const facility = useFacility(user?.facilityId ?? "");
  const workOrdersPath = usePortalPath("work-orders");
  const pmPath = usePortalPath("preventive-maintenance");
  const locationsPath = usePortalPath("locations");

  const urgent = activeWorkOrders.filter(
    (o) => o.priority === "critical" || o.priority === "high",
  ).length;
  const overdue = activeWorkOrders.filter(
    (o) => o.dueDate && new Date(o.dueDate) < new Date(),
  ).length;

  return (
    <>
      <Navbar title="Dashboard" subtitle="Facilities" />

      <div className="dashboard-page min-h-full bg-background px-6 py-6 pb-12">
        <HandWaveGreeting
          userName={user?.firstName}
          subtext="Monitor maintenance activity across your facilities."
          className="mb-6"
        />

        {/* ── KPI Row ── */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <KPICard
            title="Open Work Orders"
            value={stats.openWorkOrders}
            changeLabel={hasData ? "Current reporting period" : "No work orders in this period"}
            icon="work-orders"
            href={workOrdersPath}
          />
          <KPICard
            title="Urgent Issues"
            value={urgent}
            changeLabel="Requires action"
            icon="overdue"
            variant="warning"
            href={workOrdersPath}
          />
          <KPICard
            title="Critical Issues"
            value={urgent}
            changeLabel="Requires attention"
            icon="overdue"
            variant="warning"
            href={workOrdersPath}
          />
          <KPICard
            title="PM Overdue"
            value={overdue}
            changeLabel="Preventive actions"
            icon="calendar"
            variant="danger"
            href={pmPath}
          />
          <KPICard
            title="Active Locations"
            value={locations.length}
            changeLabel="In assigned facility"
            icon="facilities"
            href={locationsPath}
          />
          <KPICard
            title="Avg Resolution Time"
            value="—"
            changeLabel="Live resolution data pending API"
            icon="clock"
            href={workOrdersPath}
          />
        </div>

        {/* ── Main 2-col layout ── */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <CriticalIssuesPanel orders={activeWorkOrders} path={workOrdersPath} />
          </div>
          <div className="lg:col-span-5">
            <UnavailablePanel
              title="Vendor SLA Compliance"
              subtitle="Contract response and resolution health"
              message="Vendor SLA performance is not available from the dashboard API yet."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <PriorityBar orders={workOrdersInRange} />
            <StatusBreakdownPanel orders={workOrdersInRange} />
            <SchedulePanel orders={workOrdersInRange} />
          </div>
          <div className="lg:col-span-5">
            <FacilityScopePanel facilityName={facility.data?.name} locations={locations} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ActivityPanel orders={workOrdersInRange} />
          </div>
          <div className="lg:col-span-5">
            <UnavailablePanel
              title="Technician Workload"
              subtitle="Assigned ticket volume and active indicators"
              message="Live technician workload data is not available from the dashboard API yet."
            />
          </div>
        </div>
      </div>
    </>
  );
}
