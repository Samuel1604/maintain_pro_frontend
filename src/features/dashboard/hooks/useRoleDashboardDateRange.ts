import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/app/store";
import { usePortal } from "@/hooks/usePortal";

import { useDashboardDateRange } from "./useDashboardDateRange";
import type { DashboardDateRange } from "../utils/dashboardDateRange";
import { workOrdersService } from "@/features/work-orders/services/workOrders.service";
import {
  reportsApi,
  type MaintenanceSummary,
  type TrendPoint,
} from "@/features/reports/api/reports.api";
import { getRangeBounds } from "../utils/dashboardDateRange";

export function useRoleDashboardDateRange(range: DashboardDateRange) {
  const user = useAuthStore((state) => state.user);
  const portal = usePortal();
  const { start, end } = getRangeBounds(range, new Date());
  const reportQuery = {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    page: 1,
    pageSize: 25,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
  };

  const report = useQuery({
    queryKey: [
      "dashboard",
      "report",
      portal,
      user?.id,
      range,
      reportQuery.startDate,
      reportQuery.endDate,
    ],
    queryFn: () => reportsApi.dashboard(reportQuery),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    retry: false,
  });

  const query = useQuery({
    queryKey: ["dashboard", "work-orders", portal, user?.id],
    queryFn: () =>
      portal === "vendor"
        ? workOrdersService.listForVendor({ limit: 100 })
        : workOrdersService.list({ limit: 100 }),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    retry: false,
  });
  const scopedWorkOrders = query.data?.data ?? [];

  const local = useDashboardDateRange(range, scopedWorkOrders);
  const summary = report.data?.summary as MaintenanceSummary | undefined;
  const trends = report.data?.trends as TrendPoint[] | undefined;
  const stats = summary
    ? {
        ...local.stats,
        totalWorkOrders: summary.totalWorkOrders,
        openWorkOrders: summary.openWorkOrders,
        completedThisMonth: summary.completedWorkOrders,
        overdueWorkOrders: summary.overdueWorkOrders,
        pmScheduleCompletionRate: summary.completionRate,
      }
    : local.stats;
  const refetch = async () => {
    await Promise.all([query.refetch(), report.refetch()]);
  };
  return {
    ...local,
    stats,
    reportTrends: trends ?? [],
    isLoading: query.isLoading || report.isLoading,
    hasData: Boolean(report.data),
    error: query.error ?? report.error,
    refetch,
  };
}
