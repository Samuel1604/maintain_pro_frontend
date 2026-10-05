export type PMStatus = "pending_approval" | "approved" | "rejected" | "cancelled";
export type PMOccurrenceStatus = "scheduled" | "generated" | "completed" | "cancelled";
export interface PMChecklistItem {
  label: string;
  required: boolean;
}
export type PMAssignmentTargetType = "user" | "vendor" | "team";
export interface PMAssignment {
  targetType: PMAssignmentTargetType;
  targetId: string;
  assignedAt: string;
  assignedBy: string;
}
export interface PMAssignmentChange {
  action: "assigned" | "reassigned" | "cleared";
  previousTargetType?: PMAssignmentTargetType;
  previousTargetId?: string;
  targetType?: PMAssignmentTargetType;
  targetId?: string;
  actorId: string;
  occurredAt: string;
}
export type PMRecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly" | "interval";
export interface PMRecurrenceConfig {
  frequency: PMRecurrenceFrequency;
  interval: number;
  startDate: string;
  endDate?: string;
  weekdays?: number[];
  monthDay?: number;
}
export interface PMOccurrenceRecord {
  id: string;
  organizationId: string;
  preventiveMaintenanceId: string;
  facilityId: string;
  locationId: string;
  assetId: string;
  scheduledAt: string;
  status: PMOccurrenceStatus;
  approvalState: PMStatus | "approved";
  assignment?: PMAssignment;
  assignmentHistory: PMAssignmentChange[];
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  workOrderId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface PreventiveMaintenanceRecord {
  id: string;
  organizationId: string;
  facilityId: string;
  locationId: string;
  assetId: string;
  title: string;
  description: string;
  maintenanceType: string;
  frequency?: string;
  recurrence?: PMRecurrenceConfig;
  defaultAssignment?: PMAssignment;
  assignmentHistory: PMAssignmentChange[];
  isActive: boolean;
  plannedDate: string;
  occurrenceDate: string;
  priority: "low" | "medium" | "high" | "critical";
  checklist: PMChecklistItem[];
  instructions?: string;
  estimatedDurationMinutes?: number;
  status: PMStatus;
  occurrenceStatus: PMOccurrenceStatus;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  workOrderId?: string;
}
export interface CreatePreventiveMaintenancePayload {
  organizationId: string;
  facilityId: string;
  locationId: string;
  assetId: string;
  title: string;
  description: string;
  maintenanceType: string;
  frequency?: string;
  recurrence?: PMRecurrenceConfig;
  plannedDate: string;
  occurrenceDate?: string;
  priority?: PreventiveMaintenanceRecord["priority"];
  checklist: PMChecklistItem[];
  instructions?: string;
  estimatedDurationMinutes?: number;
}
