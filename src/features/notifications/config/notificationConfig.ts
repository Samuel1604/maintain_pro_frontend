import {
  AlertTriangle,
  Bell,
  Clock,
  DollarSign,
  FileText,
  Package,
  Settings2,
  Shield,
  UserPlus,
  Wrench,
} from "lucide-react";

import type { NotificationType } from "@/types/common.types";
import type { UserRole } from "@/types/user.types";
import { USER_ROLES } from "@/types/user.types";

export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; label: string }
> = {
  work_order: { icon: Wrench, color: "text-blue-400 bg-blue-400/10", label: "Work Orders" },
  maintenance: { icon: Clock, color: "text-purple-400 bg-purple-400/10", label: "Maintenance" },
  inventory: { icon: Package, color: "text-amber-400 bg-amber-400/10", label: "Inventory" },
  approval: { icon: DollarSign, color: "text-emerald-400 bg-emerald-400/10", label: "Approvals" },
  system: { icon: Settings2, color: "text-muted-foreground bg-muted", label: "System" },
  vendor: { icon: FileText, color: "text-cyan-400 bg-cyan-400/10", label: "Vendors" },
  contract: { icon: Shield, color: "text-orange-400 bg-orange-400/10", label: "Contracts" },
  escalation: { icon: AlertTriangle, color: "text-red-400 bg-red-400/10", label: "Escalations" },
  invitation: { icon: UserPlus, color: "text-indigo-400 bg-indigo-400/10", label: "Invitations" },
};

export const DEFAULT_NOTIFICATION_PREFS: Record<
  NotificationType,
  { inApp: boolean; email: boolean; sms: boolean; push: boolean }
> = {
  work_order: { inApp: true, email: true, sms: false, push: true },
  maintenance: { inApp: true, email: true, sms: false, push: true },
  inventory: { inApp: true, email: false, sms: false, push: false },
  approval: { inApp: true, email: true, sms: true, push: true },
  system: { inApp: true, email: false, sms: false, push: false },
  vendor: { inApp: true, email: true, sms: false, push: false },
  contract: { inApp: true, email: true, sms: true, push: true },
  escalation: { inApp: true, email: true, sms: true, push: true },
  invitation: { inApp: true, email: true, sms: false, push: true },
};

export const NOTIFICATION_TYPES_BY_ROLE: Record<UserRole, NotificationType[]> = {
  [USER_ROLES.ADMIN]: [
    "work_order",
    "maintenance",
    "inventory",
    "approval",
    "system",
    "vendor",
    "contract",
    "escalation",
    "invitation",
  ],
  [USER_ROLES.FACILITY_MANAGER]: [
    "work_order",
    "maintenance",
    "inventory",
    "approval",
    "system",
    "vendor",
    "contract",
    "escalation",
    "invitation",
  ],
  [USER_ROLES.TECHNICIAN]: ["work_order", "maintenance", "system"],
  [USER_ROLES.VENDOR_LEAD]: ["work_order", "vendor", "contract", "approval", "invitation"],
  [USER_ROLES.VENDOR_MANAGER]: ["work_order", "vendor", "contract", "approval", "invitation"],
  [USER_ROLES.VENDOR_TECHNICIAN]: ["work_order", "vendor", "system"],
  [USER_ROLES.STAFF]: ["work_order", "maintenance"],
  [USER_ROLES.FINANCE]: ["approval", "vendor", "contract", "work_order", "inventory"],
};

export function getNotificationTypesForRole(role: UserRole): NotificationType[] {
  return NOTIFICATION_TYPES_BY_ROLE[role] ?? NOTIFICATION_TYPES_BY_ROLE[USER_ROLES.STAFF];
}

export function canManageEscalationRules(role: UserRole): boolean {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.FACILITY_MANAGER;
}

export function getNotificationsPageSubtitle(role: UserRole): string {
  if (canManageEscalationRules(role)) {
    return "Your alerts, channel preferences & escalation rules";
  }
  return "Your alerts and notification preferences";
}
