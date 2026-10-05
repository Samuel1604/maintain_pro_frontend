import type { WorkOrder } from "@/types/common.types";
import type { DashboardStats } from "../types/dashboard.types";

export type DashboardDateRange = "7d" | "30d" | "90d";

const RANGE_DAYS: Record<DashboardDateRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const DASHBOARD_RANGE_LABELS: Record<DashboardDateRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

/** Use today so 7d / 30d / 90d filters produce different KPIs and charts. */
export function getDashboardReferenceDate(_workOrders?: WorkOrder[]): Date {
  return new Date();
}

export function getRangeBounds(range: DashboardDateRange, referenceDate: Date) {
  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - RANGE_DAYS[range] + 1);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function filterWorkOrdersByRange(
  workOrders: WorkOrder[],
  range: DashboardDateRange,
  referenceDate?: Date,
): WorkOrder[] {
  const ref = referenceDate ?? getDashboardReferenceDate(workOrders);
  const { start, end } = getRangeBounds(range, ref);
  return workOrders.filter((wo) => isWithinRange(new Date(wo.createdAt), start, end));
}

export function computeDashboardStats(
  workOrders: WorkOrder[],
  range: DashboardDateRange,
  referenceDate?: Date,
): DashboardStats {
  const ref = referenceDate ?? getDashboardReferenceDate(workOrders);
  const inRange = filterWorkOrdersByRange(workOrders, range, ref);
  const now = ref;

  const openStatuses = new Set(["open", "assigned", "in_progress", "pending"]);
  const openWorkOrders = inRange.filter((wo) => openStatuses.has(wo.status)).length;
  const completedThisMonth = inRange.filter((wo) => wo.status === "completed").length;

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const dueToday = workOrders.filter(
    (wo) =>
      wo.dueDate &&
      wo.dueDate >= startOfToday &&
      wo.dueDate <= endOfToday &&
      wo.status !== "completed" &&
      wo.status !== "cancelled",
  ).length;

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const completedThisWeek = workOrders.filter(
    (wo) => wo.status === "completed" && new Date(wo.updatedAt) >= weekStart,
  ).length;

  const overdueWorkOrders = inRange.filter(
    (wo) =>
      wo.dueDate && wo.dueDate < now && wo.status !== "completed" && wo.status !== "cancelled",
  ).length;

  const monthlySpend = inRange.reduce(
    (sum, wo) => sum + (wo.actualCost ?? wo.estimatedCost ?? 0),
    0,
  );

  const pmScheduleCompletionRate =
    inRange.length === 0
      ? 0
      : Math.round(
          (inRange.filter((wo) => wo.status === "completed").length / inRange.length) * 100,
        );

  return {
    totalWorkOrders: inRange.length,
    openWorkOrders,
    completedThisMonth,
    dueToday,
    completedThisWeek,
    overdueWorkOrders,
    pmScheduleCompletionRate,
    avgResponseTime: "2.3 hrs",
    totalAssets: 245,
    assetsNeedingMaintenance: 12,
    monthlySpend,
    budgetUtilization: 72,
    vendorCount: 18,
    avgVendorRating: 4.5,
  };
}

export function buildCategoryBreakdown(workOrders: WorkOrder[]) {
  const counts = new Map<string, number>();
  workOrders.forEach((wo) => counts.set(wo.category, (counts.get(wo.category) ?? 0) + 1));
  const palette = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];
  return [...counts.entries()].map(([name, value], i) => ({
    name,
    value,
    fill: palette[i % palette.length],
  }));
}

export function buildWorkOrderTrend(workOrders: WorkOrder[]) {
  const buckets = new Map<string, { created: number; completed: number }>();
  workOrders.forEach((wo) => {
    const d = new Date(wo.createdAt);
    const key = d.toLocaleString("en-US", { month: "short", day: "numeric" });
    const row = buckets.get(key) ?? { created: 0, completed: 0 };
    row.created += 1;
    if (wo.status === "completed") row.completed += 1;
    buckets.set(key, row);
  });
  return [...buckets.entries()].map(([month, counts]) => ({ month, ...counts }));
}

export function buildCostTrend(workOrders: WorkOrder[]) {
  const buckets = new Map<string, number>();
  workOrders.forEach((wo) => {
    const d = new Date(wo.createdAt);
    const key = d.toLocaleString("en-US", { month: "short", day: "numeric" });
    buckets.set(key, (buckets.get(key) ?? 0) + (wo.actualCost ?? wo.estimatedCost ?? 0));
  });
  return [...buckets.entries()].map(([month, cost]) => ({ month, cost }));
}
