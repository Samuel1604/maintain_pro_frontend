import { useMemo } from "react";

import { PORTALS } from "@/app/portal.config";
import { canAccessOrgSegment } from "@/app/navigation/routeAccess";
import { useAuthStore } from "@/app/store";
import { USER_ROLES } from "@/types/user.types";

import { usePortal } from "./usePortal";

/**
 * Single source of truth for what each role can DO (not just see).
 *
 * Access (can the route render?) lives in routeAccess.ts.
 * This hook controls action-level permissions: which buttons show,
 * which forms are editable, which mutations are allowed.
 *
 * Every flag is traceable to a PRD user story acceptance criterion.
 */
export function useRoleAccess() {
  const role = useAuthStore((state) => state.user?.role);
  const portal = usePortal();

  return useMemo(() => {
    const isAdmin = role === USER_ROLES.ADMIN;
    const isFM = role === USER_ROLES.FACILITY_MANAGER;
    const isTech = role === USER_ROLES.TECHNICIAN;
    const isStaff = role === USER_ROLES.STAFF;
    const isFinance = role === USER_ROLES.FINANCE;
    const isVendor = portal === PORTALS.VENDOR;
    const isOrgPortal = portal === PORTALS.ORG;

    // ─────────────────────────────────────────────────────────────────────────
    // US-01 (FM) — Schedule Preventive Maintenance
    // "Assign to internal team or external vendor; Work orders auto-generated"
    // Only FM and Admin create/edit/delete/skip/generate PM schedules.
    // ─────────────────────────────────────────────────────────────────────────
    const canManagePm = isOrgPortal && (isAdmin || isFM);

    // ─────────────────────────────────────────────────────────────────────────
    // US-02 (FM) — Monitor Dashboard
    // All roles see their own role-scoped dashboard (no permission gate needed).
    // FM-specific: filter by location, click-through to WO details — allowed for FM/Admin.
    // ─────────────────────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────────────────────
    // US-03 (FM) — Manage Vendor Contracts
    // "Store contract, set SLAs, auto-alert, view performance, track spend"
    // FM and Admin manage vendors. Finance can VIEW vendor data (spend vs contract — US-11).
    // ─────────────────────────────────────────────────────────────────────────
    const canManageVendors = isOrgPortal && (isAdmin || isFM);
    const canViewVendors = isOrgPortal && (isAdmin || isFM || isFinance);

    // ─────────────────────────────────────────────────────────────────────────
    // US-04 (Technician) — View and Complete Work Orders
    // "Update status: Start → In Progress → Complete; Log time; Add notes"
    // Technician completes WOs via WorkOrderRolePanel — update status only.
    // Cannot create new WOs, edit metadata, assign, or delete.
    // US-05 (Technician) — Report New Issue
    // "Report Issue button on work order screen; Manager notified"
    // Technician can report an issue from within a WO (WorkOrderRolePanel).
    // ─────────────────────────────────────────────────────────────────────────
    const canReportIssue = isOrgPortal && isTech;

    // ─────────────────────────────────────────────────────────────────────────
    // Work Orders — management flags
    // US-01 implies FM can create WOs (from PM auto-generate).
    // US-04 Technician updates status only (no create/edit/delete/assign).
    // US-06 Vendor accepts/rejects/proposes via WorkOrderRolePanel (vendor portal only).
    // ─────────────────────────────────────────────────────────────────────────
    const canCreateWorkOrder =
      isOrgPortal && Boolean(role && canAccessOrgSegment(role, "work-orders/new"));
    const canManageWorkOrders = isOrgPortal && (isAdmin || isFM);
    const canEditWorkOrder = canManageWorkOrders;
    const canDeleteWorkOrder = canManageWorkOrders;
    const canAssignWorkOrder = canManageWorkOrders;

    // ─────────────────────────────────────────────────────────────────────────
    // US-06 / US-07 (Vendor) — Accept WO; Submit completion + invoice
    // Vendor actions are handled entirely in the vendor portal via WorkOrderRolePanel.
    // These flags drive which action panel the technician or vendor sees.
    // ─────────────────────────────────────────────────────────────────────────
    const canAcceptRejectWorkOrder = isVendor; // vendor accepts/rejects assigned WOs
    const canCompleteAsVendor = isVendor; // vendor submits completion + invoice

    // ─────────────────────────────────────────────────────────────────────────
    // US-08 (Staff) — Submit Maintenance Request
    // "Simple form; select location; attach photo; receive confirmation"
    // Staff is the primary submitter. FM/Admin can also submit (operational need).
    // Technician and Finance do NOT submit service requests.
    // ─────────────────────────────────────────────────────────────────────────
    const canSubmitServiceRequest = isOrgPortal && (isStaff || isAdmin || isFM);

    // US-09 (Staff) — Rate Completed Service
    // Staff rates their own completed SRs. FM/Admin can rate too.
    const canRateServiceRequest = isOrgPortal && (isStaff || isAdmin || isFM);

    // FM/Admin can convert SRs to work orders
    const canConvertServiceRequest = isOrgPortal && (isAdmin || isFM);
    const canManageServiceRequests = isOrgPortal && (isAdmin || isFM);

    // Expanded SR workflow flags
    const canApproveSR = isOrgPortal && (isAdmin || isFM);
    const canAssignTechnician = isOrgPortal && (isAdmin || isFM);
    const canPublishToVendors = isOrgPortal && (isAdmin || isFM);
    const canSelectVendor = isOrgPortal && (isAdmin || isFM);
    const canBidOnOpportunity =
      role === USER_ROLES.VENDOR_LEAD || role === USER_ROLES.VENDOR_MANAGER;
    const canAcceptAwardedWork =
      role === USER_ROLES.VENDOR_LEAD || role === USER_ROLES.VENDOR_MANAGER;

    // ─────────────────────────────────────────────────────────────────────────
    // US-10 (Finance) — Approve High-Value Work Orders
    // "Approve, reject, OR REQUEST MORE INFO; Add approval notes"
    // "Work order proceeds only after approval" — gate enforced in WO detail view.
    // Finance and Admin can approve. FM cannot — this is a Finance control.
    // ─────────────────────────────────────────────────────────────────────────
    const canApproveWorkOrders = isOrgPortal && (isFinance || isAdmin);
    const canRequestMoreInfo = isOrgPortal && (isFinance || isAdmin); // US-10 third action
    const isWorkOrderGatedOnApproval = isOrgPortal && (isTech || isFM); // WO blocks until Finance approves

    // ─────────────────────────────────────────────────────────────────────────
    // US-11 (Finance) — View Maintenance Cost Report
    // "Breakdown by category, location, vendor; compare planned vs actual; export"
    // Finance, FM, and Admin access reports.
    // ─────────────────────────────────────────────────────────────────────────
    const canAccessReports = isOrgPortal && Boolean(role && canAccessOrgSegment(role, "reports"));
    const canExportReports = isOrgPortal && (isFinance || isAdmin || isFM);

    // ─────────────────────────────────────────────────────────────────────────
    // US-12 (Finance) — Verify and Process Vendor Invoice
    // "Approve, reject, dispute invoice; mark as paid; audit trail"
    // Finance and Admin only. FM is not involved in invoice processing.
    // ─────────────────────────────────────────────────────────────────────────
    const canManageInvoices = isOrgPortal && (isFinance || isAdmin);

    // ─────────────────────────────────────────────────────────────────────────
    // US-13 (Admin) — Set Up New Facility Location
    // "Create site; add buildings; define floors/rooms; assign managers"
    // Admin is the primary owner. FM can also manage their facility structure.
    // ─────────────────────────────────────────────────────────────────────────
    const canManageLocations = isOrgPortal && (isAdmin || isFM);

    // ─────────────────────────────────────────────────────────────────────────
    // US-14 (Admin) — Configure Escalation Rules
    // "Define triggers; set rules by priority; select recipients; test rules"
    // Admin only — this is system configuration, not day-to-day operations.
    // FM can VIEW escalation rules but cannot create or modify them.
    // ─────────────────────────────────────────────────────────────────────────
    const canConfigureEscalation = isOrgPortal && isAdmin;
    const canViewEscalationRules = isOrgPortal && (isAdmin || isFM);

    // ─────────────────────────────────────────────────────────────────────────
    // Assets — US-04 Technician accesses asset history from WO (read-only in TECH portal)
    // US-13 Admin/FM manage the asset registry itself
    // ─────────────────────────────────────────────────────────────────────────
    const canAccessAssets = isOrgPortal
      ? Boolean(role && canAccessOrgSegment(role, "assets"))
      : isOrgPortal; // Technician reads assets assigned to their WOs
    const canManageAssets = isOrgPortal && (isAdmin || isFM);

    // Inventory — FM/Admin manage stock levels, Finance views for cost reporting
    const canAccessInventory =
      isOrgPortal && Boolean(role && canAccessOrgSegment(role, "inventory"));
    const canManageInventory = isOrgPortal && (isAdmin || isFM);
    const canManageInventoryStock = isOrgPortal && (isAdmin || isFM || isTech);

    // Settings — Admin configures (US-14); FM manages org profile
    const canOpenOrgSettings = isVendor
      ? role === USER_ROLES.VENDOR_LEAD || role === USER_ROLES.VENDOR_MANAGER
      : isOrgPortal
        ? Boolean(role && canAccessOrgSegment(role, "settings"))
        : false;
    const canOpenSettings = canOpenOrgSettings;

    return {
      role,
      portal,

      // Work Orders
      canCreateWorkOrder,
      canManageWorkOrders,
      canEditWorkOrder,
      canDeleteWorkOrder,
      canAssignWorkOrder,
      canAcceptRejectWorkOrder,
      canCompleteAsVendor,
      isWorkOrderReadOnly: isOrgPortal && (isTech || isStaff || isFinance),

      // PM Schedules (US-01)
      canManagePm,
      canAccessPm:
        isOrgPortal && Boolean(role && canAccessOrgSegment(role, "preventive-maintenance")),

      // Vendors / Contracts (US-03)
      canManageVendors,
      canViewVendors,
      canAccessVendors: canViewVendors,

      // Locations (US-13)
      canManageLocations,
      canAccessLocations: isOrgPortal && Boolean(role && canAccessOrgSegment(role, "locations")),

      // Assets (US-04, US-13)
      canAccessAssets,
      canManageAssets,
      isAssignedAssetsOnly: isOrgPortal && isTech, // Tech can only see assets assigned to their WOs

      // Inventory
      canAccessInventory,
      canManageInventory,
      canManageInventoryStock,

      // Service Requests (US-08, US-09)
      canSubmitServiceRequest,
      canRateServiceRequest,
      canConvertServiceRequest,
      canManageServiceRequests,

      // Workflow-specific SR flags
      canApproveSR,
      canAssignTechnician,
      canPublishToVendors,
      canSelectVendor,
      canBidOnOpportunity,
      canAcceptAwardedWork,

      // Technician actions (US-04, US-05)
      canReportIssue,

      // Finance — Approvals (US-10)
      canApproveWorkOrders,
      canRequestMoreInfo,
      isWorkOrderGatedOnApproval,

      // Finance — Reports (US-11)
      canAccessReports,
      canExportReports,

      // Finance — Invoices (US-12)
      canManageInvoices,

      // Admin — Escalation Rules (US-14)
      canConfigureEscalation,
      canViewEscalationRules,

      // Settings
      canOpenOrgSettings,
      canOpenSettings,

      // Legacy composite flags — kept for backward compat with files not yet updated
      isMaintenanceReadOnly: isOrgPortal && (isStaff || isFinance),
      canAccessOrgSegment: (segment: string) => (role ? canAccessOrgSegment(role, segment) : false),
    };
  }, [portal, role]);
}

export type RoleAccess = ReturnType<typeof useRoleAccess>;
