import type { WorkOrder } from '@/types/common.types'

import {
  buildCategoryBreakdown,
  buildCostTrend,
  filterWorkOrdersByRange,
  getDashboardReferenceDate,
  type DashboardDateRange,
} from '@/features/dashboard/utils/dashboardDateRange'

export type ReportDateRange = '30d' | '90d' | '6m' | '1y'

const RANGE_MAP: Record<ReportDateRange, DashboardDateRange> = {
  '30d': '30d',
  '90d': '90d',
  '6m': '90d',
  '1y': '90d',
}

export function filterWorkOrdersForReport(
  workOrders: WorkOrder[],
  range: ReportDateRange,
): WorkOrder[] {
  const dashboardRange = RANGE_MAP[range]
  const ref = getDashboardReferenceDate(workOrders)
  return filterWorkOrdersByRange(workOrders, dashboardRange, ref)
}

export function buildMonthlyWoTrend(workOrders: WorkOrder[]) {
  const buckets = new Map<string, { reactive: number; preventive: number; emergency: number }>()
  workOrders.forEach((wo) => {
    const key = new Date(wo.createdAt).toLocaleString('en-US', { month: 'short' })
    const row = buckets.get(key) ?? { reactive: 0, preventive: 0, emergency: 0 }
    if (wo.type === 'inspection' || wo.category.toLowerCase().includes('pm')) row.preventive += 1
    else if (wo.priority === 'critical' || wo.type === 'emergency') row.emergency += 1
    else row.reactive += 1
    buckets.set(key, row)
  })
  return [...buckets.entries()].map(([month, counts]) => ({ month, ...counts }))
}

export function buildMonthlyCostBreakdown(workOrders: WorkOrder[]) {
  const buckets = new Map<string, { labor: number; parts: number; vendor: number }>()
  workOrders.forEach((wo) => {
    const key = new Date(wo.createdAt).toLocaleString('en-US', { month: 'short' })
    const cost = wo.actualCost ?? wo.estimatedCost ?? 0
    const row = buckets.get(key) ?? { labor: 0, parts: 0, vendor: 0 }
    if (wo.assigneeId?.startsWith('vendor')) row.vendor += cost
    else if (wo.partsCost) row.parts += wo.partsCost
    else row.labor += cost * 0.6
    row.parts += cost * 0.15
    buckets.set(key, row)
  })
  return [...buckets.entries()].map(([month, costs]) => ({ month, ...costs }))
}

export function buildCategorySpend(workOrders: WorkOrder[]) {
  return buildCategoryBreakdown(workOrders).map((c) => ({
    name: c.name,
    value: c.value * 1200,
  }))
}

export function buildPmScheduleSummaryFromWorkOrders(workOrders: WorkOrder[]) {
  const byCategory = new Map<string, { scheduled: number; completed: number }>()
  workOrders.forEach((wo) => {
    const row = byCategory.get(wo.category) ?? { scheduled: 0, completed: 0 }
    row.scheduled += 1
    if (wo.status === 'completed') row.completed += 1
    byCategory.set(wo.category, row)
  })
  return [...byCategory.entries()].map(([category, { scheduled, completed }]) => ({
    category,
    scheduled,
    completed,
    rate: scheduled === 0 ? 0 : Math.round((completed / scheduled) * 1000) / 10,
  }))
}

export function buildPlannedVsActualCost(workOrders: WorkOrder[]) {
  const buckets = new Map<string, { planned: number; actual: number }>()
  workOrders.forEach((wo) => {
    const key = new Date(wo.createdAt).toLocaleString('en-US', { month: 'short' })
    const row = buckets.get(key) ?? { planned: 0, actual: 0 }
    row.planned += wo.budgetedCost ?? wo.estimatedCost ?? 0
    row.actual += wo.actualCost ?? 0
    buckets.set(key, row)
  })
  return [...buckets.entries()].map(([month, costs]) => ({ month, ...costs }))
}

export { buildCostTrend }
