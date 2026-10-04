import { USER_ROLES, type UserRole } from '@/types/user.types'
import type { Portal } from '@/app/portal.config'

const {
  ADMIN,
  FACILITY_MANAGER,
  TECHNICIAN,
  STAFF,
  FINANCE,
  VENDOR_LEAD,
  VENDOR_MANAGER,
  VENDOR_TECHNICIAN,
} = USER_ROLES

const ORG_ALL: UserRole[] = [ADMIN, FACILITY_MANAGER, TECHNICIAN, STAFF, FINANCE]
const ORG_MANAGERS: UserRole[] = [ADMIN, FACILITY_MANAGER]
const VENDOR_OPERATORS: UserRole[] = [VENDOR_LEAD, VENDOR_MANAGER]
const VENDOR_ALL: UserRole[] = [VENDOR_LEAD, VENDOR_MANAGER, VENDOR_TECHNICIAN]

/**
 * Route access after Codex operator-gap authorize lists.
 * Staff never gets the org work-order list (API does not authorize it).
 */
export const ORG_ROUTE_ROLES: Record<string, UserRole[]> = {
  dashboard: ORG_ALL,
  facilities: ORG_MANAGERS,
  locations: ORG_MANAGERS,
  assets: [ADMIN, FACILITY_MANAGER, STAFF, TECHNICIAN],
  'service-requests': ORG_ALL,
  'work-orders': [ADMIN, FACILITY_MANAGER, TECHNICIAN, FINANCE],
  'work-orders/new': ORG_MANAGERS,
  'preventive-maintenance': ORG_MANAGERS,
  inventory: [ADMIN, FACILITY_MANAGER, FINANCE],
  vendors: [ADMIN, FACILITY_MANAGER, FINANCE],
  'vendors/marketplace': ORG_MANAGERS,
  'vendors/applications': ORG_MANAGERS,
  'vendors/slas': [ADMIN, FACILITY_MANAGER, FINANCE],
  'vendors/quotations': [ADMIN, FACILITY_MANAGER, FINANCE],
  'vendors/contracts': [ADMIN, FACILITY_MANAGER, FINANCE],
  reports: [ADMIN, FACILITY_MANAGER, FINANCE],
  approvals: [ADMIN, FINANCE],
  invoices: [ADMIN, FINANCE],
  notifications: ORG_ALL,
  settings: ORG_MANAGERS,
  organization: ORG_MANAGERS,
  billing: ORG_MANAGERS,
  profile: ORG_ALL,
  'system-states': [ADMIN],
}

export const VENDOR_ROUTE_ROLES: Record<string, UserRole[]> = {
  dashboard: VENDOR_ALL,
  'work-orders': VENDOR_ALL,
  team: VENDOR_OPERATORS,
  opportunities: VENDOR_OPERATORS,
  marketplace: VENDOR_OPERATORS,
  applications: VENDOR_OPERATORS,
  slas: VENDOR_OPERATORS,
  contracts: VENDOR_OPERATORS,
  reports: VENDOR_OPERATORS,
  notifications: VENDOR_ALL,
  settings: VENDOR_OPERATORS,
  billing: VENDOR_OPERATORS,
  profile: VENDOR_ALL,
}

export function normalizeOrgAccessSegment(pageSegment: string): string {
  if (pageSegment.startsWith('work-orders/')) {
    return pageSegment === 'work-orders/new' ? 'work-orders/new' : 'work-orders'
  }
  if (pageSegment.startsWith('preventive-maintenance')) return 'preventive-maintenance'
  if (pageSegment.startsWith('locations')) return 'locations'
  if (pageSegment.startsWith('assets')) return 'assets'
  if (pageSegment.startsWith('service-requests')) return 'service-requests'
  if (pageSegment.startsWith('vendors/')) {
    const nested = pageSegment.split('/').slice(0, 2).join('/')
    return ORG_ROUTE_ROLES[nested] ? nested : 'vendors'
  }
  if (pageSegment.startsWith('vendors')) return 'vendors'
  if (pageSegment.startsWith('inventory')) return 'inventory'
  if (pageSegment.startsWith('reports')) return 'reports'
  if (pageSegment.startsWith('approvals')) return 'approvals'
  if (pageSegment.startsWith('invoices')) return 'invoices'
  if (pageSegment.startsWith('settings')) return 'settings'
  if (pageSegment.startsWith('facilities')) return 'facilities'
  if (pageSegment.startsWith('organization')) return 'organization'
  if (pageSegment.startsWith('billing')) return 'billing'
  if (pageSegment.startsWith('notifications')) return 'notifications'
  if (pageSegment.startsWith('profile')) return 'profile'
  return pageSegment.split('/')[0] ?? pageSegment
}

export function normalizeVendorAccessSegment(pageSegment: string): string {
  if (
    pageSegment === 'dashboard' ||
    pageSegment === 'work-orders' ||
    pageSegment.startsWith('work-orders/') ||
    pageSegment === 'notifications' ||
    pageSegment === 'profile'
  ) {
    return pageSegment.startsWith('work-orders') ? 'work-orders' : pageSegment.split('/')[0] ?? pageSegment
  }
  if (pageSegment.startsWith('slas')) return 'slas'
  if (pageSegment.startsWith('contracts')) return 'contracts'
  return pageSegment.split('/')[0] ?? pageSegment
}

export function canAccessOrgSegment(role: UserRole, segment: string): boolean {
  const key = normalizeOrgAccessSegment(segment)
  const allowed = ORG_ROUTE_ROLES[key]
  if (!allowed) return false
  return allowed.includes(role)
}

export function canAccessVendorSegment(role: UserRole, segment: string): boolean {
  const key = normalizeVendorAccessSegment(segment)
  const allowed = VENDOR_ROUTE_ROLES[key]
  return Boolean(allowed?.includes(role))
}

export function filterNavItemsByRole<T extends { roles?: UserRole[]; segment?: string }>(
  items: T[],
  role: UserRole | undefined,
  portal?: Portal,
): T[] {
  if (!role) return items
  return items.filter((item) => {
    if (item.roles) return item.roles.includes(role)
    if (item.segment) {
      if (portal === 'org') {
        const allowed = ORG_ROUTE_ROLES[item.segment]
        return allowed ? allowed.includes(role) : true
      }
      if (portal === 'vendor') {
        const allowed = VENDOR_ROUTE_ROLES[item.segment]
        return allowed ? allowed.includes(role) : true
      }
      const org = ORG_ROUTE_ROLES[item.segment]
      if (org) return org.includes(role)
      const vendor = VENDOR_ROUTE_ROLES[item.segment]
      if (vendor) return vendor.includes(role)
    }
    return true
  })
}
