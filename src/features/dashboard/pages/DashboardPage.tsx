import { useAuthStore } from "@/app/store";

import { USER_ROLES } from "@/types/user.types";

import { PageLoader } from "@/components/feedback/PageLoader";

import { FacilityManagerDashboard } from "../views/FacilityManagerDashboard";
import { TechnicianDashboard } from "../views/TechnicianDashboard";
import {
  VendorLeadDashboard,
  VendorManagerDashboard,
  VendorTechnicianDashboard,
} from "../views/VendorDashboard";
import { FinanceDashboard } from "../views/FinanceDashboard";
import { AdminDashboard } from "../views/AdminDashboard";
import { StaffDashboard } from "../views/StaffDashboard";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  switch (user?.role) {
    case USER_ROLES.FACILITY_MANAGER:
      return <FacilityManagerDashboard />;

    case USER_ROLES.TECHNICIAN:
      return <TechnicianDashboard />;

    case USER_ROLES.STAFF:
      return <StaffDashboard />;

    case USER_ROLES.VENDOR_LEAD:
      return <VendorLeadDashboard />;
    case USER_ROLES.VENDOR_MANAGER:
      return <VendorManagerDashboard />;
    case USER_ROLES.VENDOR_TECHNICIAN:
      return <VendorTechnicianDashboard />;

    case USER_ROLES.FINANCE:
      return <FinanceDashboard />;

    case USER_ROLES.ADMIN:
      return <AdminDashboard />;

    default:
      // Reachable only if `user` hasn't hydrated yet, or a future role is
      // added here without a matching case — never render a silent blank
      // screen for either.
      return <PageLoader label={user ? "Loading your dashboard…" : "Loading your session…"} />;
  }
}
