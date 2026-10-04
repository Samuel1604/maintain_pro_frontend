export interface DashboardStats {
  totalWorkOrders: number
  openWorkOrders: number
  completedThisMonth: number
  dueToday: number
  completedThisWeek: number
  overdueWorkOrders: number
  pmScheduleCompletionRate: number
  avgResponseTime: string
  totalAssets: number
  assetsNeedingMaintenance: number
  monthlySpend: number
  budgetUtilization: number
  vendorCount: number
  avgVendorRating: number
}

export interface ChartDataPoint {
  month: string
  [key: string]: string | number
}
