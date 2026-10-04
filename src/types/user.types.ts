export const USER_ROLES = {
  ADMIN: "admin",
  FACILITY_MANAGER: "facility_manager",
  TECHNICIAN: "technician",
  VENDOR_LEAD: "vendor_lead",
  VENDOR_MANAGER: "vendor_manager",
  VENDOR_TECHNICIAN: "vendor_technician",
  FINANCE: "finance",
  STAFF: "staff",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type AuthProvider = "local" | "google" | "linkedin" | "apple";

export type AccountStatus =
  | "pending_verification"
  | "active"
  | "suspended"
  | "deactivated";

export interface User {
  id: string;
  role: UserRole;
  organizationId?: string;
  organizationSlug?: string;
  vendorId?: string;
  vendorSlug?: string;
  facilityId?: string;
  detectedCountry?: string;
  displayCurrency?: string;

  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  department?: string;
  provider?: AuthProvider;
  isVerified?: boolean;
  phoneVerified?: boolean;
  status?: AccountStatus;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
