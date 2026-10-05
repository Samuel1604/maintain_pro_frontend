import { PORTALS, type Portal } from "@/app/portal.config";
import { USER_ROLES, type User, type UserRole } from "@/types/user.types";
import type { Asset, ServiceRequest, WorkOrder } from "@/types/common.types";

// These statuses still represent work that is active or awaiting a final decision.
const ACTIVE_WO_STATUSES = new Set([
  "open",
  "assigned",
  "in_progress",
  "pending_completion",
  "on_hold",
]);

export function scopeWorkOrdersForUser(
  user: User | null | undefined,
  portal: Portal,
  workOrders: WorkOrder[],
): WorkOrder[] {
  if (!user) return [];

  if (portal === PORTALS.VENDOR) {
    return workOrders.filter((wo) => wo.assigneeId === user.id);
  }

  switch (user.role) {
    case USER_ROLES.TECHNICIAN:
      return workOrders.filter((wo) => wo.assigneeId === user.id);
    case USER_ROLES.STAFF:
      return workOrders.filter((wo) => wo.requesterId === user.id);
    case USER_ROLES.FINANCE:
    case USER_ROLES.ADMIN:
    case USER_ROLES.FACILITY_MANAGER:
      return workOrders;
    default:
      return workOrders;
  }
}

export function getTechnicianAssetIds(userId: string, workOrders: WorkOrder[]): string[] {
  const sourceWorkOrders = workOrders;
  const fromWorkOrders = sourceWorkOrders
    .filter((wo) => wo.assigneeId === userId && wo.assetId && ACTIVE_WO_STATUSES.has(wo.status))
    .map((wo) => wo.assetId!);

  return [...new Set(fromWorkOrders)];
}

export function scopeAssetsForUser(
  user: User | null | undefined,
  portal: Portal,
  assets: Asset[],
  workOrders: WorkOrder[] = [],
): Asset[] {
  if (!user || user.role !== USER_ROLES.TECHNICIAN) return assets;

  const allowedIds = new Set(getTechnicianAssetIds(user.id, workOrders));
  return assets.filter((asset) => allowedIds.has(asset.id));
}

export function canAccessAsset(
  user: User | null | undefined,
  portal: Portal,
  assetId: string,
  workOrders: WorkOrder[] = [],
): boolean {
  if (!user) return false;
  if (user.role !== USER_ROLES.TECHNICIAN) return true;
  return getTechnicianAssetIds(user.id, workOrders).includes(assetId);
}

export function scopeServiceRequestsForUser(
  user: User | null | undefined,
  requests: ServiceRequest[] = [],
): ServiceRequest[] {
  if (!user) return [];
  if (user.role === USER_ROLES.STAFF) {
    return requests.filter((sr) => sr.requesterId === user.id);
  }
  return requests;
}

export function filterServiceRequestsByRange(
  requests: ServiceRequest[],
  range: "7d" | "30d" | "90d",
  referenceDate: Date,
): ServiceRequest[] {
  const rangeDays = { "7d": 7, "30d": 30, "90d": 90 }[range];
  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - rangeDays + 1);
  start.setHours(0, 0, 0, 0);

  return requests.filter((sr) => {
    const created = new Date(sr.createdAt).getTime();
    return created >= start.getTime() && created <= end.getTime();
  });
}

export function getServiceRequestReferenceDate(requests: ServiceRequest[]): Date {
  if (requests.length === 0) return new Date();
  const latest = Math.max(...requests.map((sr) => new Date(sr.createdAt).getTime()));
  return new Date(latest);
}

export function computeFinanceDashboardStats(
  workOrders: WorkOrder[],
  invoices: Array<{ status: string }> = [],
) {
  const pendingApproval = workOrders.filter((wo) => wo.requiresApproval && !wo.approvedAt).length;
  const pendingInvoices = invoices.filter((inv) => inv.status === "pending").length;
  const approvedInvoices = invoices.filter(
    (inv) => inv.status === "approved" || inv.status === "paid",
  ).length;
  const monthlySpend = workOrders.reduce(
    (sum, wo) => sum + (wo.actualCost ?? wo.estimatedCost ?? 0),
    0,
  );
  // Real planned/budgeted spend per job (same source used in Reports), not an
  // invented organization-wide cap — there is no such field in the data model.
  const plannedSpend = workOrders.reduce(
    (sum, wo) => sum + (wo.budgetedCost ?? wo.estimatedCost ?? 0),
    0,
  );

  return {
    monthlySpend,
    pendingApprovals: pendingApproval,
    pendingInvoices,
    approvedInvoices,
    plannedSpend,
    budgetVariance: plannedSpend - monthlySpend,
  };
}

export function computeVendorDashboardStats(workOrders: WorkOrder[]) {
  const completed = workOrders.filter((wo) => wo.status === "completed").length;
  const active = workOrders.filter((wo) => ACTIVE_WO_STATUSES.has(wo.status)).length;
  const onTime = workOrders.filter(
    (wo) => wo.status === "completed" && (!wo.dueDate || wo.updatedAt <= wo.dueDate),
  ).length;
  // Only fall back when there's genuinely no data to compute from — a real
  // 0% compliance rate must never be silently replaced with a fake number.
  const slaCompliance =
    workOrders.length === 0 ? null : Math.round((onTime / workOrders.length) * 100);

  return {
    assignedJobs: workOrders.length,
    pendingInvoices: workOrders.filter((wo) => wo.status === "completed" && !wo.approvedAt).length,
    completedJobs: completed,
    slaCompliance,
    activeJobs: active,
  };
}

export function computeStaffDashboardStats(requests: ServiceRequest[]) {
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };
}

export function computeTechnicianDashboardStats(workOrders: WorkOrder[]) {
  const completedToday = workOrders.filter((wo) => wo.status === "completed").length;
  return {
    assigned: workOrders.length,
    inProgress: workOrders.filter((wo) => wo.status === "in_progress").length,
    completedToday,
    overdue: workOrders.filter(
      (wo) =>
        wo.dueDate &&
        wo.dueDate < new Date() &&
        wo.status !== "completed" &&
        wo.status !== "cancelled",
    ).length,
  };
}

export function roleDashboardTitle(role: UserRole | undefined): string {
  switch (role) {
    case USER_ROLES.ADMIN:
      return "Admin Dashboard";
    case USER_ROLES.FACILITY_MANAGER:
      return "Dashboard";
    case USER_ROLES.TECHNICIAN:
      return "Technician Dashboard";
    case USER_ROLES.STAFF:
      return "Staff Portal";
    case USER_ROLES.FINANCE:
      return "Finance Dashboard";
    case USER_ROLES.VENDOR_LEAD:
    case USER_ROLES.VENDOR_MANAGER:
    case USER_ROLES.VENDOR_TECHNICIAN:
      return "Vendor Portal";
    default:
      return "Dashboard";
  }
}

export function roleDashboardSubtitle(role: UserRole | undefined): string {
  switch (role) {
    case USER_ROLES.ADMIN:
      return "System administration overview";
    case USER_ROLES.FACILITY_MANAGER:
      return "Facility operations overview";
    case USER_ROLES.TECHNICIAN:
      return "Your assigned maintenance tasks";
    case USER_ROLES.STAFF:
      return "Track your service requests";
    case USER_ROLES.FINANCE:
      return "Maintenance spend & approvals";
    case USER_ROLES.VENDOR_LEAD:
    case USER_ROLES.VENDOR_MANAGER:
      return "Manage your team & service jobs";
    case USER_ROLES.VENDOR_TECHNICIAN:
      return "Your assigned vendor jobs";
    default:
      return "Overview";
  }
}
