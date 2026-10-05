// ─── User ────────────────────────────────────────────────────────────────────
export type UserRole = "facility_manager" | "technician" | "vendor" | "staff" | "finance" | "admin";
export type UserStatus = "active" | "inactive" | "pending";

export interface User {
  id: string;
  name: string;
  firstName: string; // Made mandatory
  lastName: string; // Made mandatory
  email: string;
  role: UserRole;
  status?: UserStatus;
  avatar?: string;
  department?: string;
  phone?: string;
  createdAt: Date;
}

// ─── Work Orders ─────────────────────────────────────────────────────────────
export type WorkOrderStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "pending_completion"
  | "on_hold"
  | "completed"
  | "cancelled";
export type WorkOrderPriority = "critical" | "high" | "medium" | "low";
export type WorkOrderType = "reactive" | "preventive" | "emergency" | "inspection" | "project";

export interface WorkOrder {
  id: string;
  sourceType?: "manual" | "service_request" | "preventive_maintenance";
  title: string;
  description: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  category: string;
  facilityId?: string;
  locationId: string;
  locationName: string;
  assetId?: string;
  assetName?: string;
  assigneeId?: string;
  assigneeName?: string;
  requesterId: string;
  requesterName: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  estimates?: number; // legacy placeholder when estimates are available
  estimatedCost?: number;
  budgetedCost?: number;
  actualCost?: number;
  laborCost?: number;
  partsCost?: number;
  timeSpent?: number;
  images?: string[];
  comments?: Comment[];
  partsUsed?: PartUsed[];
  requiresApproval?: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  slaTarget?: number;
  slaBreached?: boolean;
  completionNotes?: string;
  /** Vendor portal: accept/reject assignment */
  vendorOfferStatus?: "pending_acceptance" | "accepted" | "rejected";
  vendorRejectReason?: string;
  proposedSchedule?: Date;
  linkedServiceRequestId?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  paymentStatus?: "pending" | "approved" | "paid";
}

export interface InvoiceAuditEntry {
  id: string;
  action: string;
  actorName: string;
  timestamp: Date;
  notes?: string;
}

export interface VendorInvoice {
  id: string;
  workOrderId: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  currency?: string;
  estimatedAmount?: number;
  status: "pending" | "approved" | "rejected" | "paid" | "disputed";
  submittedAt: Date;
  paidAt?: Date;
  invoiceNumber?: string;
  notes?: string;
  auditLog?: InvoiceAuditEntry[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}
export interface PartUsed {
  partId: string;
  partName: string;
  quantity: number;
  unitCost: number;
}

// ─── Assets ──────────────────────────────────────────────────────────────────
export type AssetStatus = "active" | "inactive" | "under_maintenance" | "retired";

export interface Asset {
  id: string;
  organizationId?: string;
  facilityId?: string;
  locationId?: string;
  locationName?: string;
  assetTag?: string;
  qrCode?: string;
  barcode?: string;
  name: string;
  description?: string;
  category: any;
  manufacturer?: string;
  model?: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate?: string;
  installationDate?: string;
  installDate?: Date | string;
  warrantyExpiry?: Date | string;
  status: any;
  criticality?: any;
  condition?: any;
  ownership?: any;
  lastMaintenanceDate?: Date | string;
  nextMaintenanceDate?: Date | string;
  purchaseCost?: number;
  currentValue?: number;
  estimatedValue?: number;
  notes?: string;
  createdBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  documents?: AssetDocument[];
  maintenanceHistory?: AssetMaintenanceRecord[];
  linkedPartIds?: string[];
}

export interface AssetDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
}
export interface AssetMaintenanceRecord {
  id: string;
  date: Date;
  type: string;
  description: string;
  cost: number;
  technician: string;
}

// ─── Locations ───────────────────────────────────────────────────────────────
export interface Location {
  id: string;
  organizationId?: string;
  facilityId?: string;
  name: string;
  type: "site" | "building" | "floor" | "room" | "zone";
  parentId?: string;
  address?: string;
  city?: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
  assetCount?: number;
  openWorkOrders?: number;
  managerId?: string;
  managerName?: string;
  floorPlanUrl?: string;
  description?: string;
  status?: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Vendors ─────────────────────────────────────────────────────────────────
export type VendorStatus = "pending" | "active" | "suspended" | "inactive" | "removed";
export interface Vendor {
  id: string;
  name: string;
  category: string;
  serviceCategories: string[];
  email: string;
  phone: string;
  address?: string;
  rating: number;
  status: VendorStatus;
  contractStart?: Date;
  contractEnd?: Date;
  contractValue?: number;
  contractDocumentUrl?: string;
  slaResponseTime?: number;
  slaResolutionTime?: number;
  slaDetails?: string;
  totalSpend?: number;
  completedJobs?: number;
  pendingJobs?: number;
  insuranceExpiry?: Date;
  certifications?: VendorCertification[];
  contactPerson?: string;
  bankDetails?: string;
  taxId?: string;
}
export interface VendorCertification {
  id: string;
  name: string;
  issuedBy: string;
  expiryDate: Date;
  documentUrl?: string;
}

// ─── Inventory ───────────────────────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  quantity: number;
  minStock: number;
  maxStock?: number;
  unitPrice: number;
  unit?: string;
  locationId: string;
  locationName: string;
  lastRestocked?: Date;
  supplier?: string;
  linkedAssetIds?: string[];
  reorderPoint?: number;
  leadTimeDays?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseRequest {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  estimatedCost: number;
  requestedBy: string;
  requestedAt: Date;
  status: "pending" | "approved" | "rejected" | "ordered";
  approvedBy?: string;
  notes?: string;
}

export interface StockReceipt {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  receivedBy: string;
  receivedAt: Date;
  supplier: string;
  invoiceNumber?: string;
}

// ─── Preventive Maintenance ───────────────────────────────────────────────────
export type PMFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
export type PMStatus = "active" | "paused" | "completed" | "cancelled";

export interface PreventiveMaintenance {
  id: string;
  title: string;
  description: string;
  assetId: string;
  assetName: string;
  locationId: string;
  locationName: string;
  frequency: PMFrequency;
  customDays?: number;
  nextDue: Date;
  lastCompleted?: Date;
  assigneeId?: string;
  assigneeName?: string;
  vendorId?: string;
  vendorName?: string;
  checklist: ChecklistItem[];
  isActive: boolean;
  status?: PMStatus;
  estimatedDuration?: number;
  estimatedCost?: number;
  isComplianceRequired?: boolean;
  regulatoryRef?: string;
  contractId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
}

// ─── Service Requests ─────────────────────────────────────────────────────────
export type ServiceRequestStatus = "pending" | "approved" | "rejected";

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ServiceRequestStatus;
  priority: WorkOrderPriority;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  locationId: string;
  locationName: string;
  images?: string[];
  createdAt: Date;
  resolvedAt?: Date;
  rating?: number;
  feedback?: string;
  // Workflow fields
  assignmentType?: "internal" | "vendor";
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  selectedVendorId?: string;
  selectedVendorName?: string;
  generatedWorkOrderId?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvedAt?: Date;
  reviewNotes?: string;
  opportunityId?: string;
  // Legacy compat
  convertedToWorkOrderId?: string;
  assignedTo?: string;
  isGuest?: boolean;
  guestContactInfo?: string;
}

// ─── Vendor Opportunities ─────────────────────────────────────────────────────
export interface VendorBid {
  id: string;
  opportunityId: string;
  vendorId: string;
  vendorName: string;
  proposedCost: number;
  estimatedDays: number;
  notes?: string;
  submittedAt: Date;
  status: "pending" | "accepted" | "rejected";
}

export interface VendorOpportunity {
  id: string;
  serviceRequestId: string;
  title: string;
  description: string;
  category: string;
  locationName: string;
  priority: WorkOrderPriority;
  estimatedBudget?: number;
  publishedAt: Date;
  deadline?: Date;
  status: "open" | "awarded" | "closed";
  bids: VendorBid[];
  awardedVendorId?: string;
  awardedVendorName?: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export type NotificationType =
  | "work_order"
  | "maintenance"
  | "inventory"
  | "approval"
  | "system"
  | "vendor"
  | "contract"
  | "escalation";
export type NotificationChannel = "in_app" | "email" | "sms" | "push";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  priority?: "normal" | "high";
  userId?: string;
}

export interface NotificationPreference {
  userId: string;
  channel: NotificationChannel;
  enabled: boolean;
  types: NotificationType[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface EscalationRule {
  id: string;
  name: string;
  triggerHours: number;
  priority: WorkOrderPriority;
  escalateTo: string;
  method: NotificationChannel[];
  isActive: boolean;
  level: number;
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  locationId?: string;
  vendorId?: string;
  category?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
}

export interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  timezone: string;
  currency: string;
  address?: string;
  phone?: string;
  email?: string;
  slaConfig: SLAConfig;
  multiSiteEnabled: boolean;
}

export interface SLAConfig {
  critical: { responseHours: number; resolutionHours: number };
  high: { responseHours: number; resolutionHours: number };
  medium: { responseHours: number; resolutionHours: number };
  low: { responseHours: number; resolutionHours: number };
  approvalThreshold: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardKPI {
  label: string;
  value: number | string;
  change?: number;
  changeType?: "increase" | "decrease";
  icon?: string;
}
