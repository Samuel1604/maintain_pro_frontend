import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import { MaintainProAppLoader } from "@/components/feedback/MaintainProLoader";

const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const WorkOrders = lazy(() =>
  import("@/features/work-orders/pages/WorkOrders").then((m) => ({ default: m.WorkOrders })),
);
const Assets = lazy(() =>
  import("@/features/assets/pages/Assets").then((m) => ({ default: m.Assets })),
);
const Locations = lazy(() =>
  import("@/features/locations/pages/Locations").then((m) => ({ default: m.Locations })),
);
const Reports = lazy(() =>
  import("@/features/reports/pages/Reports").then((m) => ({ default: m.Reports })),
);
const ReportDetailPage = lazy(() =>
  import("@/features/reports/pages/ReportDetailPage").then((m) => ({
    default: m.ReportDetailPage,
  })),
);
const Settings = lazy(() =>
  import("@/features/settings/pages/Settings").then((m) => ({ default: m.Settings })),
);
const WorkOrderDetails = lazy(() =>
  import("@/features/work-orders/pages/WorkOrderDetails").then((m) => ({
    default: m.WorkOrderDetails,
  })),
);
const CreateWorkOrder = lazy(() =>
  import("@/features/work-orders/pages/CreateWorkOrder").then((m) => ({
    default: m.CreateWorkOrder,
  })),
);
const AssetDetails = lazy(() =>
  import("@/features/assets/pages/AssetDetails").then((m) => ({ default: m.AssetDetails })),
);
const LocationDetails = lazy(() =>
  import("@/features/locations/pages/LocationDetails").then((m) => ({
    default: m.LocationDetails,
  })),
);
const PreventiveMaintenance = lazy(() =>
  import("@/features/preventive-maintenance/pages/PreventiveMaintenance").then((m) => ({
    default: m.PreventiveMaintenance,
  })),
);
const PreventiveMaintenanceDetails = lazy(() =>
  import("@/features/preventive-maintenance/pages/PreventiveMaintenanceDetails").then((m) => ({
    default: m.PreventiveMaintenanceDetails,
  })),
);
const ServiceRequests = lazy(() =>
  import("@/features/service-requests/pages/ServiceRequests").then((m) => ({
    default: m.ServiceRequests,
  })),
);
const CreateServiceRequest = lazy(() =>
  import("@/features/service-requests/pages/CreateServiceRequest").then((m) => ({
    default: m.CreateServiceRequest,
  })),
);
const ServiceRequestDetails = lazy(() =>
  import("@/features/service-requests/pages/ServiceRequestDetails").then((m) => ({
    default: m.ServiceRequestDetails,
  })),
);
const Vendors = lazy(() =>
  import("@/features/vendors/pages/Vendors").then((m) => ({ default: m.Vendors })),
);
const Inventory = lazy(() =>
  import("@/features/inventory/pages/Inventory").then((m) => ({ default: m.Inventory })),
);
const InventoryItemDetails = lazy(() =>
  import("@/features/inventory/pages/InventoryItemDetails").then((m) => ({
    default: m.InventoryItemDetails,
  })),
);
const Notifications = lazy(() =>
  import("@/features/notifications/pages/Notifications").then((m) => ({
    default: m.NotificationCenter,
  })),
);
const VendorTeam = lazy(() =>
  import("@/features/vendors/pages/VendorTeam").then((m) => ({ default: m.VendorTeam })),
);
const VendorOpportunities = lazy(() =>
  import("@/features/vendors/pages/VendorOpportunities").then((m) => ({
    default: m.VendorOpportunities,
  })),
);
const VendorPerformance = lazy(() =>
  import("@/features/vendors/pages/VendorPerformance").then((m) => ({
    default: m.VendorPerformance,
  })),
);
const VendorMarketplace = lazy(() =>
  import("@/features/vendors/pages/VendorMarketplace").then((m) => ({
    default: m.VendorMarketplace,
  })),
);
const VendorApplications = lazy(() =>
  import("@/features/vendors/pages/VendorApplications").then((m) => ({
    default: m.VendorApplications,
  })),
);
const VendorDetails = lazy(() =>
  import("@/features/vendors/pages/VendorDetails").then((m) => ({ default: m.VendorDetails })),
);
const VendorSLAs = lazy(() =>
  import("@/features/vendors/pages/VendorSLAs").then((m) => ({ default: m.VendorSLAs })),
);
const VendorSLADetails = lazy(() =>
  import("@/features/vendors/pages/VendorSLADetails").then((m) => ({
    default: m.VendorSLADetails,
  })),
);
const VendorQuotations = lazy(() =>
  import("@/features/vendors/pages/VendorQuotations").then((m) => ({
    default: m.VendorQuotations,
  })),
);
const VendorContracts = lazy(() =>
  import("@/features/vendors/pages/VendorContracts").then((m) => ({ default: m.VendorContracts })),
);
const VendorContractDetails = lazy(() =>
  import("@/features/vendors/pages/VendorContractDetails").then((m) => ({
    default: m.VendorContractDetails,
  })),
);
const VendorSettings = lazy(() =>
  import("@/features/vendors/pages/VendorSettings").then((m) => ({ default: m.VendorSettings })),
);
const FinanceApprovals = lazy(() =>
  import("@/features/finance/pages/FinanceApprovals").then((m) => ({
    default: m.FinanceApprovals,
  })),
);
const VendorInvoices = lazy(() =>
  import("@/features/finance/pages/VendorInvoices").then((m) => ({ default: m.VendorInvoices })),
);
const OrganizationPage = lazy(() =>
  import("@/features/organization/pages/OrganizationPage").then((m) => ({
    default: m.OrganizationPage,
  })),
);
const BillingPage = lazy(() =>
  import("@/features/billing/pages/BillingPage").then((m) => ({ default: m.BillingPage })),
);
const FacilitiesPage = lazy(() =>
  import("@/features/facilities/pages/FacilitiesPage").then((m) => ({ default: m.FacilitiesPage })),
);
const FacilityDetailsPage = lazy(() =>
  import("@/features/facilities/pages/FacilityDetailsPage").then((m) => ({
    default: m.FacilityDetailsPage,
  })),
);
const UserProfile = lazy(() =>
  import("@/features/settings/pages/UserProfile").then((m) => ({ default: m.UserProfile })),
);
const SystemStatesReference = lazy(() =>
  import("@/features/system/pages/SystemStatesReference").then((m) => ({
    default: m.SystemStatesReference,
  })),
);
const page = (element: ReactNode) => (
  <Suspense fallback={<MaintainProAppLoader />}>{element}</Suspense>
);

const orgPages: RouteObject[] = [
  { path: "dashboard", element: page(<DashboardPage />) },
  { path: "work-orders", element: page(<WorkOrders />) },
  { path: "work-orders/new", element: page(<CreateWorkOrder />) },
  { path: "work-orders/:id", element: page(<WorkOrderDetails />) },
  { path: "assets", element: page(<Assets />) },
  { path: "assets/new", element: page(<Assets />) },
  { path: "assets/:id", element: page(<AssetDetails />) },
  { path: "locations", element: page(<Locations />) },
  { path: "locations/:id", element: page(<LocationDetails />) },
  { path: "preventive-maintenance", element: page(<PreventiveMaintenance />) },
  { path: "preventive-maintenance/:id", element: page(<PreventiveMaintenanceDetails />) },
  { path: "service-requests", element: page(<ServiceRequests />) },
  { path: "service-requests/new", element: page(<CreateServiceRequest />) },
  { path: "service-requests/:id", element: page(<ServiceRequestDetails />) },
  { path: "vendors", element: page(<Vendors />) },
  { path: "vendors/new", element: page(<Vendors />) },
  { path: "vendors/marketplace", element: page(<VendorMarketplace />) },
  { path: "vendors/slas", element: page(<VendorSLAs />) },
  { path: "vendors/quotations", element: page(<VendorQuotations />) },
  { path: "vendors/contracts", element: page(<VendorContracts />) },
  { path: "vendors/contracts/:contractId", element: page(<VendorContractDetails />) },
  { path: "vendors/:vendorId", element: page(<VendorDetails />) },
  { path: "inventory", element: page(<Inventory />) },
  { path: "inventory/:id", element: page(<InventoryItemDetails />) },
  { path: "reports", element: page(<Reports />) },
  { path: "reports/:reportType", element: page(<ReportDetailPage />) },
  { path: "approvals", element: page(<FinanceApprovals />) },
  { path: "invoices", element: page(<VendorInvoices />) },
  { path: "notifications", element: page(<Notifications />) },
  { path: "settings", element: page(<Settings />) },
  { path: "organization", element: page(<OrganizationPage />) },
  { path: "billing", element: page(<BillingPage />) },
  { path: "facilities", element: page(<FacilitiesPage />) },
  { path: "facilities/:facilityId", element: page(<FacilityDetailsPage />) },
  { path: "profile", element: page(<UserProfile />) },
  { path: "system-states", element: page(<SystemStatesReference />) },
  { index: true, element: <Navigate to="dashboard" replace /> },
];

const VendorWorkOrders = lazy(() =>
  import("@/features/vendors/pages/VendorWorkOrders").then((m) => ({
    default: m.VendorWorkOrders,
  })),
);

const vendorPages: RouteObject[] = [
  { path: "dashboard", element: page(<DashboardPage />) },
  { path: "work-orders", element: page(<VendorWorkOrders />) },
  { path: "work-orders/:id", element: page(<WorkOrderDetails />) },
  { path: "team", element: page(<VendorTeam />) },
  { path: "opportunities", element: page(<VendorOpportunities />) },
  // Vendors review opportunities to bid on; they do not browse the organization vendor directory.
  { path: "marketplace", element: <Navigate to="opportunities" replace /> },
  { path: "applications", element: page(<VendorApplications />) },
  { path: "slas", element: page(<VendorSLAs />) },
  { path: "slas/:slaId", element: page(<VendorSLADetails />) },
  { path: "contracts", element: page(<VendorContracts />) },
  { path: "contracts/:contractId", element: page(<VendorContractDetails />) },
  { path: "reports", element: page(<VendorPerformance />) },
  { path: "notifications", element: page(<Notifications />) },
  { path: "settings", element: page(<VendorSettings />) },
  { path: "billing", element: page(<VendorSettings initialTab="billing" />) },
  { path: "profile", element: page(<UserProfile />) },
  { index: true, element: <Navigate to="dashboard" replace /> },
];

export const orgPortalRoutes: RouteObject[] = [
  { path: "admin", children: orgPages },
  { path: "facility_manager", children: orgPages },
  { path: "technician", children: orgPages },
  { path: "staff", children: orgPages },
  { path: "finance", children: orgPages },
  { index: true, element: <Navigate to="admin/dashboard" replace /> },
];

export const vendorPortalRoutes: RouteObject[] = [
  { path: "lead", children: vendorPages },
  { path: "manager", children: vendorPages },
  { path: "team_lead", children: vendorPages },
  { path: "vendor_technician", children: vendorPages },
  { index: true, element: <Navigate to="lead/dashboard" replace /> },
];
