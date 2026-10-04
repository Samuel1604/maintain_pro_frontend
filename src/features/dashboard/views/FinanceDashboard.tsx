import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  FileText,
  ScrollText,
  DollarSign,
  AlertTriangle,
  Target,
  Clock,
  ReceiptText,
} from "lucide-react";
import { AppHeader as Navbar } from "@/components/navigation/Navbar";
import { KPICard } from "@/features/dashboard/components/StatCard";
import { CostTrendChart } from "@/features/dashboard/components/DashboardWidgets";
import { useRoleDashboardDateRange } from "@/features/dashboard/hooks/useRoleDashboardDateRange";
import { computeFinanceDashboardStats } from "@/features/dashboard/utils/roleScope";
import { usePortalPath } from "@/hooks/usePortal";
import { useAuthStore } from "@/app/store";
import type { WorkOrder } from "@/types/common.types";
import { invoicesService } from "@/features/finance/services/invoices.service";
import { HandWaveGreeting } from "@/components/ui/HandWaveGreeting";

const FINANCIAL_EVENTS = [
  {
    id: "1",
    event: "Invoice processed: Elevator PM contract",
    detail: "Logged under: Apex Elevator",
    time: "1h ago",
  },
  {
    id: "2",
    event: "Quotation updated: Thermostat repair",
    detail: "Logged under: Pro HVAC Solutions",
    time: "3h ago",
  },
  {
    id: "3",
    event: "Approval rejected: Luxury office decor plan",
    detail: "Logged under: Dave Miller",
    time: "1d ago",
  },
  {
    id: "4",
    event: "Contract finalized: West Warehouses",
    detail: "Logged under: Reliable Plumbing",
    time: "2d ago",
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
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-[13px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className={noPadding ? "" : "px-5 py-4"}>{children}</div>
    </div>
  );
}

function ApprovalRows() {
  return (
    <p className="px-5 py-4 text-sm text-muted-foreground">
      No pending approval records are available yet.
    </p>
  );
}

function SLAVendorRows() {
  return (
    <p className="px-5 py-4 text-sm text-muted-foreground">
      SLA performance data is not available yet.
    </p>
  );
}

function QuotationRows() {
  return (
    <p className="px-5 py-4 text-sm text-muted-foreground">
      No quotation records are available yet.
    </p>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function FinanceDashboard() {
  const user = useAuthStore((state) => state.user);
  const approvalsPath = usePortalPath("approvals");
  const quotationsPath = usePortalPath("vendors/quotations");
  const contractsPath = usePortalPath("vendors/contracts");
  const invoicesPath = usePortalPath("invoices");
  const { workOrdersInRange } = useRoleDashboardDateRange("30d");
  const invoicesQuery = useQuery({
    queryKey: ["dashboard", "invoices", user?.id],
    queryFn: invoicesService.list,
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    retry: false,
  });
  const stats = useMemo(
    () =>
      computeFinanceDashboardStats(
        workOrdersInRange,
        invoicesQuery.data ?? [],
      ),
    [workOrdersInRange, invoicesQuery.data],
  );
  const costTrendData = useMemo(() => {
    const buckets = new Map<string, number>();
    workOrdersInRange.forEach((order) => {
      const month = new Intl.DateTimeFormat(undefined, {
        month: "short",
      }).format(order.createdAt);
      const cost = order.actualCost ?? order.estimatedCost ?? 0;
      buckets.set(month, (buckets.get(month) ?? 0) + cost);
    });
    return [...buckets.entries()].map(([month, cost]) => ({ month, cost }));
  }, [workOrdersInRange]);

  return (
    <>
      <Navbar title="Dashboard" subtitle="Finance" />

      <div className="dashboard-page min-h-full bg-background px-6 py-6 pb-12">
        <HandWaveGreeting
          userName={user?.firstName}
          subtext="Review approvals, invoices, contracts, and financial performance."
          className="mb-6"
        />
        {/* ── KPI Row ── */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <KPICard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            changeLabel="Awaiting signature"
            icon="overdue"
            variant="warning"
            href={approvalsPath}
          />
          {/* TODO: these financial metrics await dedicated quotation, contract, and billing data sources. */}
          <KPICard
            title="Open Quotations"
            value="—"
            changeLabel="Quotation API pending"
            icon="compliance"
            href={quotationsPath}
          />
          <KPICard
            title="Active Contracts"
            value="—"
            changeLabel="Contract API pending"
            icon="completed"
            variant="success"
            href={contractsPath}
          />
          <KPICard
            title="Monthly Obligations"
            value="—"
            changeLabel="Billing summary API pending"
            icon="cost"
            href={contractsPath}
          />
          <KPICard
            title="Outstanding Invoices"
            value={stats.pendingInvoices}
            changeLabel="Critical attention required"
            icon="overdue"
            variant="danger"
            href={invoicesPath}
          />
        </div>

        {/* ── Row 1: Pending Approvals | Contract SLA ── */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <SectionCard
              title="Pending Financial Approvals"
              subtitle="Review and audit operational expenses before confirming authorization"
              noPadding
            >
              <ApprovalRows />
            </SectionCard>
          </div>

          <div className="lg:col-span-5">
            <SectionCard
              title="Contract SLA Status"
              subtitle="Overview of monthly values and target compliance"
              noPadding
            >
              <SLAVendorRows />
            </SectionCard>
          </div>
        </div>

        {/* ── Row: Maintenance Cost Trend ── */}
        <div className="mb-6">
          <CostTrendChart data={costTrendData} />
        </div>

        {/* ── Row 2: Recent Quotations | Billing + Event History ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <SectionCard
              title="Recent Quotations"
              subtitle="Sourced vendor offers currently under pricing assessment"
              noPadding
            >
              <QuotationRows />
            </SectionCard>
          </div>

          <div className="flex flex-col gap-6">
            {/* Subscription & Billing */}
            <SectionCard
              title="Subscription & Billing"
              subtitle="Enterprise system plan details"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Current Plan</span>
                  <span className="font-semibold text-primary">
                    "—"
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Active Licenses</span>
                  <span className="font-semibold text-foreground">
                    "—"
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">
                    Next Invoice Date
                  </span>
                  <span className="font-semibold text-foreground">
                    "—"
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* Financial Event History */}
            <SectionCard
              title="Financial Event History"
              subtitle="Audit records of recent ledger changes"
            >
              <div className="space-y-3">
                {([] as typeof FINANCIAL_EVENTS).map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-foreground leading-snug">
                        {ev.event}
                      </p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {ev.detail}
                      </p>
                    </div>
                    <span className="shrink-0 text-[12px] text-muted-foreground">
                      {ev.time}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}

// suppress unused icon lint warnings
void ClipboardList;
void FileText;
void ScrollText;
void DollarSign;
void AlertTriangle;
void Target;
void Clock;
void ReceiptText;
