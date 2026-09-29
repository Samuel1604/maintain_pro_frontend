import type { UserRole } from '@/types/user.types'
import { USER_ROLES } from '@/types/user.types'

export const PORTALS = {
  ORG:    'org',
  VENDOR: 'vendor',
} as const

export type Portal = (typeof PORTALS)[keyof typeof PORTALS]

/**
 * URL segment for each role within its portal.
 *   /org/admin/dashboard
 *   /org/facility_manager/dashboard
 *   /vendor/lead/dashboard
 *   /vendor/vendor_technician/dashboard
 */
export const ROLE_URL_SEGMENT: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]:              'admin',
  [USER_ROLES.FACILITY_MANAGER]:   'facility_manager',
  [USER_ROLES.TECHNICIAN]:         'technician',
  [USER_ROLES.STAFF]:              'staff',
  [USER_ROLES.FINANCE]:            'finance',
  [USER_ROLES.VENDOR_LEAD]:        'lead',
  [USER_ROLES.VENDOR_MANAGER]:     'manager',
  [USER_ROLES.VENDOR_TECHNICIAN]:  'vendor_technician',
}

/** Which portal each role belongs to */
const ROLE_PORTAL_MAP: Record<UserRole, Portal> = {
  [USER_ROLES.ADMIN]:             PORTALS.ORG,
  [USER_ROLES.FACILITY_MANAGER]:  PORTALS.ORG,
  [USER_ROLES.STAFF]:             PORTALS.ORG,
  [USER_ROLES.FINANCE]:           PORTALS.ORG,
  [USER_ROLES.TECHNICIAN]:        PORTALS.ORG,
  [USER_ROLES.VENDOR_LEAD]:       PORTALS.VENDOR,
  [USER_ROLES.VENDOR_MANAGER]:    PORTALS.VENDOR,
  [USER_ROLES.VENDOR_TECHNICIAN]: PORTALS.VENDOR,
}

export function resolvePortalForRole(role: UserRole): Portal {
  return ROLE_PORTAL_MAP[role];
}


const ORG_SEGMENT_ROLE_MAP = {
  admin: USER_ROLES.ADMIN,
  facility_manager: USER_ROLES.FACILITY_MANAGER,
  technician: USER_ROLES.TECHNICIAN,
  staff: USER_ROLES.STAFF,
  finance: USER_ROLES.FINANCE,
} as const;

const VENDOR_SEGMENT_ROLE_MAP = {
  lead: USER_ROLES.VENDOR_LEAD,
  team_lead: USER_ROLES.VENDOR_LEAD,
  manager: USER_ROLES.VENDOR_MANAGER,
  vendor_technician: USER_ROLES.VENDOR_TECHNICIAN,
} as const;

const PORTAL_ROLES: Record<Portal, UserRole[]> = {
  [PORTALS.ORG]: [
    USER_ROLES.ADMIN,
    USER_ROLES.FACILITY_MANAGER,
    USER_ROLES.STAFF,
    USER_ROLES.FINANCE,
    USER_ROLES.TECHNICIAN,
  ],
  [PORTALS.VENDOR]: [
    USER_ROLES.VENDOR_LEAD,
    USER_ROLES.VENDOR_MANAGER,
    USER_ROLES.VENDOR_TECHNICIAN,
  ],
}

export function getPortalForRole(role: UserRole): Portal {
  return ROLE_PORTAL_MAP[role]
}

export function getRolesForPortal(portal: Portal): UserRole[] {
  return PORTAL_ROLES[portal]
}

export function isRoleAllowedInPortal(role: UserRole, portal: Portal): boolean {
  return PORTAL_ROLES[portal].includes(role)
}

/**
 * Base path for a role: /org/facility_manager  or  /vendor/lead
 */
export function getRoleBasePath(role: UserRole): string {
  const portalSlug = getPortalSlug({ role })
  const segment = ROLE_URL_SEGMENT[role]
  return `/${portalSlug}/${segment}`
}

export function getPortalSlug(user: { role: UserRole; organizationId?: string; vendorId?: string; organizationSlug?: string; vendorSlug?: string }): string {
  const isVendor = getPortalForRole(user.role) === PORTALS.VENDOR
  const inMemorySlug = isVendor ? user.vendorSlug : user.organizationSlug
  const storageKey = isVendor ? "maintainpro_vendor_slug" : "maintainpro_organization_slug"
  const storedSlug = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null
  return inMemorySlug || storedSlug || "current"
}

export function buildUserPortalPath(user: { role: UserRole; organizationId?: string; organizationSlug?: string; vendorId?: string; vendorSlug?: string }, segment = "") {
  const base = `/${getPortalSlug(user)}/${ROLE_URL_SEGMENT[user.role]}`
  if (!segment) return `${base}/dashboard`
  return `${base}${segment.startsWith("/") ? segment : `/${segment}`}`
}

/**
 * Full path for a role + optional page segment.
 *   buildPortalPath('facility_manager', '/work-orders') → /org/facility_manager/work-orders
 */
export function buildPortalPath(roleOrPortal: UserRole | Portal, segment = ''): string {
  let base: string
  if (roleOrPortal === PORTALS.ORG || roleOrPortal === PORTALS.VENDOR) {
    base = `/${roleOrPortal}`
  } else {
    base = getRoleBasePath(roleOrPortal as UserRole)
  }
  if (!segment) return `${base}/dashboard`
  const normalized = segment.startsWith('/') ? segment : `/${segment}`
  return `${base}${normalized}`
}

export function getDefaultPathForRole(role: UserRole): string {
  return `/${getPortalSlug({ role })}/${ROLE_URL_SEGMENT[role]}/dashboard`
}

/**
 * Parse portal AND role-segment from a pathname like /org/admin/work-orders
 * Returns { portal, roleSegment } or null.
 */
export function parsePortalFromPath(pathname: string): Portal | null {
  const match = pathname.match(/^\/[^/]+\/([^/]+)/)
  return match && resolveRoleFromSegment(PORTALS.ORG, match[1]) ? PORTALS.ORG : match && resolveRoleFromSegment(PORTALS.VENDOR, match[1]) ? PORTALS.VENDOR : null
}

export function parseRoleSegmentFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/[^/]+\/([^/]+)/)
  return match ? match[1] : null
}

/** Resolve the UserRole from a portal + URL segment */
export function resolveRoleFromSegment(
  portal: Portal,
  segment: string,
): UserRole | null {
  if (portal === PORTALS.ORG) {
    return (
      ORG_SEGMENT_ROLE_MAP[
        segment as keyof typeof ORG_SEGMENT_ROLE_MAP
      ] ?? null
    )
  }

  return (
    VENDOR_SEGMENT_ROLE_MAP[
      segment as keyof typeof VENDOR_SEGMENT_ROLE_MAP
    ] ?? null
  )
}

export function validatePortalAccess(role: UserRole, portal: Portal): boolean {
  return getPortalForRole(role) === portal;
}

export function getDashboardPath(role: UserRole) {
  return buildPortalPath(role, "/dashboard");
}

export function getProfilePath(role: UserRole) {
  return buildPortalPath(role, "/profile");
}

export function getSettingsPath(role: UserRole) {
  return buildPortalPath(role, "/settings");
}

/** Legacy compat: getPortalBasePath kept so Sidebar import doesn't break */
export function getPortalBasePath(portal: Portal): string {
  return `/${portal}`
}
