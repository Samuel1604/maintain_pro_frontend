import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Users,
  Wrench,
  Plus,
  Building2,
  Calendar,
  Hammer,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getTimeGreeting } from "@/utils/timeGreeting";
import { AppHeader as Navbar } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/features/dashboard/components/StatCard";
import { useAuthStore } from "@/app/store";
import { usePortalPath } from "@/hooks/usePortal";
import { useLocationsApi } from "@/features/locations/hooks/useLocationsApi";
import { useRoleDashboardDateRange } from "@/features/dashboard/hooks/useRoleDashboardDateRange";
import type { WorkOrder } from "@/types/common.types";

const PRIORITY_LEVELS = [
  { label: "Critical", color: "var(--destructive)" },
  { label: "High", color: "var(--warning)" },
  { label: "Medium", color: "var(--chart-3)" },
  { label: "Low", color: "var(--muted-foreground)" },
];

const SCHEDULE_STATIC = [
  {
    time: "08:00 AM",
    icon: "calendar",
    title: "Chiller PM Audit",
    location: "Suite 410",
    tech: "Mike Ross",
    techColor: "var(--primary)",
  },
  {
    time: "10:30 AM",
    icon: "wrench",
    title: "Thermostat Swap-out",
    location: "Server Room B",
    tech: "Pro HVAC Solutions",
    techColor: "var(--primary)",
  },
  {
    time: "01:00 PM",
    icon: "calendar",
    title: "Roller Door Inspection",
    location: "Loading Dock 2",
    tech: "John Doe",
    techColor: "var(--primary)",
  },
  {
    time: "02:30 PM",
    icon: "wrench",
    title: "Exhaust Fan Rebelt",
    location: "Roof Access A",
    tech: "Sarah Jenkins",
    techColor: "var(--primary)",
  },
  {
    time: "04:00 PM",
    icon: "calendar",
    title: "Emergency Light Inspection",
    location: "Lobby East",
    tech: "Mike Ross",
    techColor: "var(--primary)",
  },
];

const FACILITY_HEALTH = [
  {
    name: "HQ Office Tower",
    openCount: 12,
    openColor: "var(--success)",
    openBg: "var(--success-muted)",
    sla: "96.4%",
    pm: "100%",
  },
  {
    name: "North Logistics Hub",
    openCount: 8,
    openColor: "var(--warning)",
    openBg: "var(--warning-muted)",
    sla: "89.2%",
    pm: "92%",
  },
  {
    name: "West Mfg Annex",
    openCount: 3,
    openColor: "var(--success)",
    openBg: "var(--success-muted)",
    sla: "94.0%",
    pm: "85%",
  },
];

const TECHNICIAN_WORKLOAD = [
  {
    name: "Mike Ross",
    status: "On site (Lobby)",
    dotColor: "var(--success)",
    wos: 4,
  },
  {
    name: "Dave Miller",
    status: "In transit",
    dotColor: "var(--warning)",
    wos: 3,
  },
  {
    name: "John Doe",
    status: "Off duty",
    dotColor: "var(--muted-foreground)",
    wos: 2,
  },
  {
    name: "Sarah Jenkins",
    status: "On site (HQ)",
    dotColor: "var(--success)",
    wos: 1,
  },
];

const PREFERRED_VENDORS = [
  {
    name: "Apex Elevator Co.",
    discipline: "Vertical Transport",
    pct: 98,
    color: "var(--success)",
    bg: "var(--success-muted)",
  },
  {
    name: "Pro HVAC Solutions",
    discipline: "Climate Systems",
    pct: 91,
    color: "var(--warning)",
    bg: "var(--warning-muted)",
  },
  {
    name: "Reliable Plumbing",
    discipline: "Water/Waste Mgmt",
    pct: 86,
    color: "var(--destructive)",
    bg: "var(--destructive-muted)",
  },
];

const RECENT_ACTIVITY_STATIC = [
  {
    id: "1",
    text: "WO-4122 (Lobby light repair) marked as Complete",
    sub: "Updated by: Mike Ross",
    time: "10m ago",
  },
  {
    id: "2",
    text: "Sarah Jenkins approved parts order for pump replacement",
    sub: "Updated by: Sarah Jenkins",
    time: "30m ago",
  },
  {
    id: "3",
    text: "Emergency WO generated: Plumbing leak in restroom 3B",
    sub: "Updated by: Reliable Plumbing",
    time: "1h ago",
  },
  {
    id: "4",
    text: "Technician checked in at West Warehouse dock",
    sub: "Updated by: Dave Miller",
    time: "2h ago",
  },
  {
    id: "5",
    text: "Elevator Annual PM checklist signed off",
    sub: "Updated by: Apex Tech",
    time: "3h ago",
  },
  {
    id: "6",
    text: "Vendor invoice submitted for lobby gate fix",
    sub: "Updated by: GateMasters",
    time: "5h ago",
  },
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
    <div className="rounded-xl border border-border bg-card shadow-none">
      <div className="border-b border-border px-5 py-4">
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
      orders.length > 0
        ? orders.filter((o) => o.priority === p.label.toLowerCase()).length
        : 0,
  }));
  const total = Math.max(
    liveTotals.reduce((n, p) => n + p.value, 0),
    1,
  );
  return (
    <SectionCard
      title="Work Orders by Priority"
      subtitle="Total open tasks grouped by severity"
    >
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
      ? orders.slice(0, 5).map((o, i) => ({
          time: new Intl.DateTimeFormat(undefined, {
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(o.createdAt)),
          icon: SCHEDULE_STATIC[i]?.icon ?? "calendar",
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
                <p className="text-[12px] text-muted-foreground">
                  {row.location}
                </p>
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
      ? orders.slice(0, 6).map((o, i) => ({
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
            <div
              key={row.id}
              className="flex items-start justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground leading-snug">
                  {row.text}
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {row.sub}
                </p>
              </div>
              <span className="shrink-0 text-[12px] text-muted-foreground">
                {row.time}
              </span>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function FacilityHealthPanel({
  locations,
}: {
  locations: { id: string; name: string }[];
}) {
  if (true) {
    return (
      <SectionCard
        title="Facility Health Summary"
        subtitle="Performance overview of managed sites"
        noPadding
      >
        <p className="px-5 py-6 text-sm text-muted-foreground">
          Facility health metrics are not exposed by the reporting API yet.
        </p>
      </SectionCard>
    );
  }
  const rows =
    locations.length > 0
      ? locations.slice(0, 3).map((loc, i) => ({
          ...(FACILITY_HEALTH[i] ?? FACILITY_HEALTH[0]),
          name: loc.name,
        }))
      : [];

  return (
    <SectionCard
      title="Facility Health Summary"
      subtitle="Performance overview of managed sites"
      noPadding
    >
      <div className="divide-y divide-[#f1f5f9]">
        {rows.map((f) => (
          <div
            key={f.name}
            className="flex items-start justify-between gap-3 px-5 py-3"
          >
            <div>
              <p className="text-[13px] font-semibold text-foreground">
                {f.name}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                SLA:{" "}
                <span className="font-medium text-foreground">{f.sla}</span>
                {"  "}PM Schedule:{" "}
                <span className="font-medium text-foreground">{f.pm}</span>
              </p>
            </div>
            <span
              className="rounded px-2 py-0.5 text-[11px] font-bold whitespace-nowrap"
              style={{ backgroundColor: f.openBg, color: f.openColor }}
            >
              {f.openCount} OPEN
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function TechnicianWorkloadPanel() {
  if (true) {
    return (
      <SectionCard
        title="Technician Dispatch Workload"
        subtitle="Assigned ticket volume and active indicators"
        noPadding
      >
        <p className="px-5 py-6 text-sm text-muted-foreground">
          Live technician workload data is not available yet.
        </p>
      </SectionCard>
    );
  }
  return (
    <SectionCard
      title="Technician Dispatch Workload"
      subtitle="Assigned ticket volume and active indicators"
      noPadding
    >
      <div className="divide-y divide-[#f1f5f9]">
        {TECHNICIAN_WORKLOAD.map((t) => (
          <div key={t.name} className="flex items-center gap-3 px-5 py-3">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: t.dotColor }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground">
                {t.name}
              </p>
              <p className="text-[12px] text-muted-foreground">{t.status}</p>
            </div>
            <span className="text-[13px] font-semibold text-foreground">
              {t.wos} WOs
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function PreferredVendorsPanel() {
  if (true) {
    return (
      <SectionCard
        title="Preferred Vendors"
        subtitle="Contract SLA status for major disciplines"
        noPadding
      >
        <p className="px-5 py-6 text-sm text-muted-foreground">
          Live vendor compliance data is not available yet.
        </p>
      </SectionCard>
    );
  }
  return (
    <SectionCard
      title="Preferred Vendors"
      subtitle="Contract SLA status for major disciplines"
      noPadding
    >
      <div className="divide-y divide-[#f1f5f9]">
        {PREFERRED_VENDORS.map((v) => (
          <div
            key={v.name}
            className="flex items-center justify-between gap-3 px-5 py-3"
          >
            <div>
              <p className="text-[13px] font-semibold text-foreground">
                {v.name}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {v.discipline}
              </p>
            </div>
            <span
              className="rounded px-2 py-0.5 text-[11px] font-bold whitespace-nowrap"
              style={{ backgroundColor: v.bg, color: v.color }}
            >
              {v.pct}% COMPLIANCE
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function FacilityManagerDashboard() {
  const user = useAuthStore((s) => s.user);
  const { workOrdersInRange, stats, activeWorkOrders, hasData } =
    useRoleDashboardDateRange("30d");
  const locations = useLocationsApi().data ?? [];
  const createPath = usePortalPath("work-orders/new");
  const workOrdersPath = usePortalPath("work-orders");
  const pmPath = usePortalPath("preventive-maintenance");
  const organizationPath = usePortalPath("organization");

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
        {/* ── Header ── */}
        <PageHeader
          className="mb-6 rounded-xl border border-border/80"
          title={getTimeGreeting(user?.firstName || "Samuel").greeting}
          subtitle="Monitor maintenance activity across your facilities."
          actions={
            <>
              <span className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground">
                <Building2 className="h-4 w-4" />
                All Managed Facilities
                <svg
                  className="h-4 w-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
              <Link
                to={createPath}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Work Order
              </Link>
            </>
          }
        />

        {/* ── KPI Row ── */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <KPICard
            title="Open Work Orders"
            value={stats.openWorkOrders}
            changeLabel={
              hasData
                ? "Current reporting period"
                : "No work orders in this period"
            }
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
            title="PM Overdue"
            value={overdue}
            changeLabel="Preventive actions"
            icon="calendar"
            variant="danger"
            href={pmPath}
          />
          <KPICard
            title="Active Technicians"
            value="—"
            changeLabel="Live staffing data pending API"
            icon="users"
            href={organizationPath}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <PriorityBar orders={workOrdersInRange} />
            <SchedulePanel orders={workOrdersInRange} />
            <ActivityPanel orders={workOrdersInRange} />
          </div>

          {/* Right column (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <FacilityHealthPanel locations={locations} />
            <TechnicianWorkloadPanel />
            <PreferredVendorsPanel />
          </div>
        </div>
      </div>
    </>
  );
}

// suppress unused lint warnings
void AlertCircle;
void Clock3;
void Users;
void Wrench;
void Calendar;
