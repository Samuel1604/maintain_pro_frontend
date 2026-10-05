import { useMemo } from "react";

import type { WorkOrder } from "@/types/common.types";
import {
  buildCategoryBreakdown,
  buildCostTrend,
  buildWorkOrderTrend,
  computeDashboardStats,
  filterWorkOrdersByRange,
  getDashboardReferenceDate,
  type DashboardDateRange,
} from "../utils/dashboardDateRange";

export function useDashboardDateRange(range: DashboardDateRange, workOrders: WorkOrder[]) {
  const referenceDate = useMemo(() => getDashboardReferenceDate(workOrders), [workOrders]);

  const workOrdersInRange = useMemo(
    () => filterWorkOrdersByRange(workOrders, range, referenceDate),
    [range, referenceDate, workOrders],
  );

  const stats = useMemo(
    () => computeDashboardStats(workOrders, range, referenceDate),
    [range, referenceDate, workOrders],
  );

  const activeWorkOrders = useMemo(
    () => workOrdersInRange.filter((wo) => wo.status !== "completed" && wo.status !== "cancelled"),
    [workOrdersInRange],
  );

  const categoryBreakdown = useMemo(
    () => buildCategoryBreakdown(workOrdersInRange),
    [workOrdersInRange],
  );

  const workOrderTrend = useMemo(() => buildWorkOrderTrend(workOrdersInRange), [workOrdersInRange]);

  const costTrend = useMemo(() => buildCostTrend(workOrdersInRange), [workOrdersInRange]);

  return {
    referenceDate,
    workOrdersInRange,
    activeWorkOrders,
    stats,
    categoryBreakdown,
    workOrderTrend,
    costTrend,
  };
}
