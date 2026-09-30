import { BarChart3, ClipboardList, ShieldCheck, Users } from "lucide-react";
import { useParams } from "react-router-dom";

import { AppHeader } from "@/components/navigation/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState, PageError, PageLoader } from "@/components/feedback";
import {
  useReports,
  useSlaComplianceReport,
  useVendorPerformanceReport,
} from "../hooks/useReports";
import type { WorkOrderReportRow } from "../api/reports.api";

const REPORTS = {
  "work-order-analysis": {
    title: "Work Order Analysis",
    subtitle: "Backlog, completion volume, priority and status analysis.",
    icon: BarChart3,
    supported: true,
  },
  "sla-compliance": {
    title: "SLA Compliance Report",
    subtitle: "Vendor response and resolution compliance against active agreements.",
    icon: ShieldCheck,
    supported: false,
  },
  "pm-compliance": {
    title: "PM Schedule Report",
    subtitle:
      "Preventive maintenance schedules, approvals, generated work, and completion performance.",
    icon: ClipboardList,
    supported: true,
  },
  "vendor-performance": {
    title: "Vendor Performance Report",
    subtitle: "Vendor dispatch volume, service quality and invoice accuracy.",
    icon: Users,
    supported: false,
  },
} as const;

type ReportSlug = keyof typeof REPORTS;

function defaultQuery() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return { startDate: start.toISOString(), endDate: end.toISOString(), page: 1, pageSize: 25 };
}

export function ReportDetailPage() {
  const { reportType } = useParams<{ reportType: ReportSlug }>();
  const report = reportType ? REPORTS[reportType] : undefined;
  const query = defaultQuery();
  const data = useReports(query);

  if (!report)
    return <PageError title="Report not found" message="This report type is not available." />;

  return (
    <div className="min-h-full bg-background">
      <AppHeader title={report.title} subtitle="Reports" hideQuickCreate />
      <main className="page-body space-y-6">
        {report.supported && data.loading ? (
          <PageLoader label={`Loading ${report.title.toLowerCase()}…`} />
        ) : null}
        {report.supported && data.error ? <PageError message={data.error} /> : null}
        {reportType === "work-order-analysis" && !data.loading && !data.error ? (
          <WorkOrderAnalysis data={data} />
        ) : null}
        {reportType === "pm-compliance" && !data.loading && !data.error ? (
          <PmScheduleReport data={data} />
        ) : null}
        {reportType === "sla-compliance" ? <SlaCompliance query={query} /> : null}
        {reportType === "vendor-performance" ? <VendorPerformance query={query} /> : null}
      </main>
    </div>
  );
}

function SlaCompliance({ query }: { query: ReturnType<typeof defaultQuery> }) {
  const report = useSlaComplianceReport(query);
  if (report.isLoading) return <PageLoader label="Loading SLA compliance…" />;
  if (report.error) return <PageError message="We could not load SLA compliance data." />;
  const data = report.data;
  if (!data?.totalAgreements)
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No SLA agreements in this period"
        description="SLA compliance appears once agreements and their work orders are recorded."
      />
    );
  return (
    <div className="space-y-6">
      <div className="responsive-grid lg:grid-cols-4">
        <Metric label="SLA agreements" value={data.totalAgreements} />
        <Metric label="Active agreements" value={data.activeAgreements} />
        <Metric label="Compliant completions" value={data.compliantWorkOrders} />
        <Metric label="Compliance rate" value={`${data.complianceRate}%`} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vendor SLA performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="data-table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Agreements</th>
                  <th>Completed</th>
                  <th>Compliant</th>
                  <th>Breaches</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.vendors.map(
                  (vendor: {
                    vendorId: string;
                    vendorName: string;
                    agreements: number;
                    completed: number;
                    compliant: number;
                    breaches: number;
                    complianceRate: number;
                  }) => (
                    <tr key={vendor.vendorId}>
                      <td className="font-medium">{vendor.vendorName}</td>
                      <td>{vendor.agreements}</td>
                      <td>{vendor.completed}</td>
                      <td>{vendor.compliant}</td>
                      <td>{vendor.breaches}</td>
                      <td>{vendor.complianceRate}%</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VendorPerformance({ query }: { query: ReturnType<typeof defaultQuery> }) {
  const report = useVendorPerformanceReport(query);
  if (report.isLoading) return <PageLoader label="Loading vendor performance…" />;
  if (report.error) return <PageError message="We could not load vendor performance data." />;
  const data = report.data;
  if (!data?.totalVendors)
    return (
      <EmptyState
        icon={Users}
        title="No vendor work orders in this period"
        description="Vendor performance appears after vendor-assigned work orders are recorded."
      />
    );
  return (
    <div className="space-y-6">
      <div className="responsive-grid lg:grid-cols-4">
        <Metric label="Active vendors" value={data.totalVendors} />
        <Metric label="Assigned work orders" value={data.assignedWorkOrders} />
        <Metric label="Completed" value={data.completedWorkOrders} />
        <Metric label="Completion rate" value={`${data.completionRate}%`} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vendor performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="data-table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Rating</th>
                  <th>Assigned</th>
                  <th>Completed</th>
                  <th>On time</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {data.vendors.map(
                  (vendor: {
                    vendorId: string;
                    vendorName: string;
                    averageRating: number;
                    assignedWorkOrders: number;
                    completedWorkOrders: number;
                    onTimeRate: number;
                    completionRate: number;
                  }) => (
                    <tr key={vendor.vendorId}>
                      <td className="font-medium">{vendor.vendorName}</td>
                      <td>{vendor.averageRating.toFixed(1)}</td>
                      <td>{vendor.assignedWorkOrders}</td>
                      <td>{vendor.completedWorkOrders}</td>
                      <td>{vendor.onTimeRate}%</td>
                      <td>{vendor.completionRate}%</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WorkOrderAnalysis({ data }: { data: ReturnType<typeof useReports> }) {
  const summary = data.summary;
  if (!summary)
    return (
      <EmptyState
        icon={BarChart3}
        title="No work-order data in this period"
        description="Change the report period or create work orders to populate this analysis."
      />
    );
  return (
    <div className="space-y-6">
      <div className="responsive-grid lg:grid-cols-4">
        <Metric label="Total work orders" value={summary.totalWorkOrders} />
        <Metric label="Completed" value={summary.completedWorkOrders} />
        <Metric label="Open backlog" value={summary.openWorkOrders} />
        <Metric label="Completion rate" value={`${summary.completionRate}%`} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Work order records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="data-table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Work order</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Category</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.workOrders?.items.map((item: WorkOrderReportRow) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.title}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="capitalize">{item.priority}</td>
                    <td>{item.serviceCategory}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PmScheduleReport({ data }: { data: ReturnType<typeof useReports> }) {
  const pm = data.preventiveMaintenance;
  if (!pm)
    return (
      <EmptyState icon={ClipboardList} title="No preventive-maintenance data in this period" />
    );
  return (
    <div className="responsive-grid lg:grid-cols-4">
      <Metric label="PM schedules" value={pm.total} />
      <Metric label="Approved" value={pm.approved} />
      <Metric label="Generated work orders" value={pm.generatedWorkOrders} />
      <Metric label="Completion rate" value={`${pm.completionRate}%`} />
      <Card className="sm:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Schedule breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Metric label="Pending approval" value={pm.pendingApproval} />
          <Metric label="Rejected" value={pm.rejected} />
          <Metric label="Completed" value={pm.completed} />
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
