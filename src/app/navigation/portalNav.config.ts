import {
  LayoutGrid,
  Building,
  MapPin,
  Box,
  MessageSquare,
  Wrench,
  Calendar,
  ClipboardList,
  Users,
  ShoppingBag,
  BarChart2,
  Settings,
  FileCheck,
  FileText,
  ScrollText,
  DollarSign,
  Briefcase,
  Layers,
  ShieldCheck,
  Bell,
  type LucideIcon,
} from 'lucide-react'
import { PORTALS, type Portal } from '@/app/portal.config'
import { USER_ROLES, type UserRole } from '@/types/user.types'

const { ADMIN, FACILITY_MANAGER, STAFF, FINANCE, TECHNICIAN, VENDOR_LEAD, VENDOR_MANAGER, VENDOR_TECHNICIAN } = USER_ROLES

export interface PortalNavItem {
  name: string
  segment: string
  icon: LucideIcon
  badge?: number
  roles?: UserRole[]
}

export interface PortalNavConfig {
  label: string
  primary: PortalNavItem[]
  secondary: PortalNavItem[]
}

export const PORTAL_NAV: Record<Portal, PortalNavConfig> = {
  [PORTALS.ORG]: {
    label: 'Organization',
    primary: [
      { name: 'Dashboard', segment: 'dashboard', icon: LayoutGrid, roles: [ADMIN, FACILITY_MANAGER, TECHNICIAN, STAFF, FINANCE] },
      { name: 'Facilities', segment: 'facilities', icon: Building, roles: [ADMIN, FACILITY_MANAGER] },
      { name: 'Locations', segment: 'locations', icon: MapPin, roles: [ADMIN, FACILITY_MANAGER] },
      { name: 'Assets', segment: 'assets', icon: Box, roles: [ADMIN, FACILITY_MANAGER, STAFF, TECHNICIAN] },
      { name: 'Service Requests', segment: 'service-requests', icon: MessageSquare, roles: [ADMIN, FACILITY_MANAGER, TECHNICIAN, STAFF, FINANCE] },
      { name: 'Work Orders', segment: 'work-orders', icon: Wrench, roles: [ADMIN, FACILITY_MANAGER, TECHNICIAN, FINANCE] },
      { name: 'Preventive Maint.', segment: 'preventive-maintenance', icon: Calendar, roles: [ADMIN, FACILITY_MANAGER] },
      { name: 'Inventory', segment: 'inventory', icon: ClipboardList, roles: [ADMIN, FACILITY_MANAGER, FINANCE] },
      { name: 'Vendors', segment: 'vendors', icon: Users, roles: [ADMIN, FACILITY_MANAGER, FINANCE] },
      { name: 'Marketplace', segment: 'vendors/marketplace', icon: ShoppingBag, roles: [ADMIN, FACILITY_MANAGER] },
      { name: 'Reports', segment: 'reports', icon: BarChart2, roles: [ADMIN, FACILITY_MANAGER, FINANCE] },
      { name: 'Settings', segment: 'settings', icon: Settings, roles: [ADMIN, FACILITY_MANAGER] },
      { name: 'Approvals', segment: 'approvals', icon: FileCheck, roles: [FINANCE, ADMIN] },
      { name: 'Quotations', segment: 'vendors/quotations', icon: FileText, roles: [FINANCE, ADMIN, FACILITY_MANAGER] },
      { name: 'Contracts', segment: 'vendors/contracts', icon: ScrollText, roles: [FINANCE, ADMIN, FACILITY_MANAGER] },
      { name: 'Invoices', segment: 'invoices', icon: DollarSign, roles: [FINANCE, ADMIN] },
      { name: 'Notifications', segment: 'notifications', icon: Bell, roles: [ADMIN, FACILITY_MANAGER, TECHNICIAN, STAFF, FINANCE] },
    ],
    secondary: [],
  },
  [PORTALS.VENDOR]: {
    label: 'Vendor',
    primary: [
      { name: 'Dashboard', segment: 'dashboard', icon: LayoutGrid, roles: [VENDOR_LEAD, VENDOR_MANAGER, VENDOR_TECHNICIAN] },
      { name: 'Work Orders', segment: 'work-orders', icon: Wrench, roles: [VENDOR_LEAD, VENDOR_MANAGER, VENDOR_TECHNICIAN] },
      { name: 'Opportunities', segment: 'opportunities', icon: Briefcase, roles: [VENDOR_LEAD, VENDOR_MANAGER] },
      { name: 'Applications', segment: 'applications', icon: Layers, roles: [VENDOR_LEAD, VENDOR_MANAGER] },
      { name: 'Team', segment: 'team', icon: Users, roles: [VENDOR_LEAD, VENDOR_MANAGER] },
      { name: 'Contracts', segment: 'contracts', icon: ScrollText, roles: [VENDOR_LEAD, VENDOR_MANAGER] },
      { name: 'SLAs', segment: 'slas', icon: ShieldCheck, roles: [VENDOR_LEAD, VENDOR_MANAGER] },
      { name: 'Reports', segment: 'reports', icon: BarChart2, roles: [VENDOR_LEAD, VENDOR_MANAGER] },
      { name: 'Notifications', segment: 'notifications', icon: Bell, roles: [VENDOR_LEAD, VENDOR_MANAGER, VENDOR_TECHNICIAN] },
      { name: 'Settings', segment: 'settings', icon: Settings, roles: [VENDOR_LEAD, VENDOR_MANAGER] },
      { name: 'Billing', segment: 'billing', icon: DollarSign, roles: [VENDOR_LEAD, VENDOR_MANAGER] },
    ],
    secondary: [],
  },
}
