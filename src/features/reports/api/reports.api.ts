import { apiClient } from "@/api/client";

export interface ReportQuery {
  startDate: string;
  endDate: string;
  facilityId?: string;
  status?: string;
  priority?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
export interface MaintenanceSummary {
  startDate: string;
  endDate: string;
  totalWorkOrders: number;
  completedWorkOrders: number;
  openWorkOrders: number;
  overdueWorkOrders: number | null;
  completionRate: number;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
}
export interface TrendPoint {
  period: string;
  created: number;
  completed: number;
}
export interface RoleDashboardSummary {
  totalWorkOrders?: number;
  completedWorkOrders?: number;
  openWorkOrders?: number;
  totalServiceRequests?: number;
  pendingServiceRequests?: number;
  approvedServiceRequests?: number;
}
export interface DashboardReport {
  summary: MaintenanceSummary & RoleDashboardSummary;
  trends: TrendPoint[];
}
export interface WorkOrderReportRow {
  id: string;
  title: string;
  status: string;
  priority: string;
  serviceCategory: string;
  facilityId: string;
  locationId?: string;
  assetId?: string;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
}
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
export interface PreventiveMaintenanceReport {
  total: number;
  approved: number;
  pendingApproval: number;
  rejected: number;
  generatedWorkOrders: number;
  completed: number;
  completionRate: number;
  overdue: null;
}
export interface SlaComplianceVendor {
  vendorId: string;
  vendorName: string;
  agreements: number;
  completed: number;
  compliant: number;
  breaches: number;
  complianceRate: number;
}
export interface SlaComplianceReport {
  totalAgreements: number;
  activeAgreements: number;
  completedWorkOrders: number;
  compliantWorkOrders: number;
  breaches: number;
  complianceRate: number;
  vendors: SlaComplianceVendor[];
}
export interface VendorPerformanceRow {
  vendorId: string;
  vendorName: string;
  averageRating: number;
  assignedWorkOrders: number;
  completedWorkOrders: number;
  onTimeWorkOrders: number;
  completionRate: number;
  onTimeRate: number;
}
export interface VendorPerformanceReport {
  totalVendors: number;
  assignedWorkOrders: number;
  completedWorkOrders: number;
  completionRate: number;
  vendors: VendorPerformanceRow[];
}
function params(query: ReportQuery): URLSearchParams {
  const result = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") result.set(key, String(value));
  });
  return result;
}
export const reportsApi = {
  dashboard: (query: ReportQuery) =>
    apiClient.get<DashboardReport>(`/reports/dashboard?${params(query)}`),
  summary: (query: ReportQuery) =>
    apiClient.get<MaintenanceSummary>(`/reports/maintenance/summary?${params(query)}`),
  trends: (query: ReportQuery) =>
    apiClient.get<TrendPoint[]>(`/reports/maintenance/trends?${params(query)}`),
  workOrders: (query: ReportQuery) =>
    apiClient.get<Paginated<WorkOrderReportRow>>(`/reports/work-orders?${params(query)}`),
  preventiveMaintenance: (query: ReportQuery) =>
    apiClient.get<PreventiveMaintenanceReport>(`/reports/preventive-maintenance?${params(query)}`),
  slaCompliance: (query: ReportQuery) =>
    apiClient.get<SlaComplianceReport>(`/reports/sla-compliance?${params(query)}`),
  vendorPerformance: (query: ReportQuery) =>
    apiClient.get<VendorPerformanceReport>(`/reports/vendor-performance?${params(query)}`),
};
