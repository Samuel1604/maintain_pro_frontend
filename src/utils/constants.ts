import { buildPortalPath, type Portal } from '@/app/portal.config'

export const APP_NAME = 'MaintainPro'

export const WORK_ORDER_STATUSES = ['open', 'in_progress', 'pending', 'completed', 'cancelled'] as const
export const WORK_ORDER_PRIORITIES = ['critical', 'high', 'medium', 'low'] as const
export const PM_FREQUENCIES = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  SIGNUP_ORGANIZATION: '/signup/organization',
  SIGNUP_TECHNICIAN: '/signup/technician',
  SIGNUP_VENDOR: '/signup/vendor',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  UNAUTHORIZED: '/unauthorized',

  portalDashboard: (portal: Portal) => buildPortalPath(portal, '/dashboard'),
  portalWorkOrders: (portal: Portal) => buildPortalPath(portal, '/work-orders'),
  portalWorkOrderNew: (portal: Portal) => buildPortalPath(portal, '/work-orders/new'),
  portalWorkOrderDetail: (portal: Portal, id: string) => buildPortalPath(portal, `/work-orders/${id}`),
  portalAssets: (portal: Portal) => buildPortalPath(portal, '/assets'),
  portalAssetDetail: (portal: Portal, id: string) => buildPortalPath(portal, `/assets/${id}`),
  portalLocations: (portal: Portal) => buildPortalPath(portal, '/locations'),
  portalLocationDetail: (portal: Portal, id: string) => buildPortalPath(portal, `/locations/${id}`),
  portalInventory: (portal: Portal) => buildPortalPath(portal, '/inventory'),
  portalVendors: (portal: Portal) => buildPortalPath(portal, '/vendors'),
  portalPreventiveMaintenance: (portal: Portal) => buildPortalPath(portal, '/preventive-maintenance'),
  portalReports: (portal: Portal) => buildPortalPath(portal, '/reports'),
  portalProfile: (portal: Portal) => buildPortalPath(portal, '/profile'),
  portalSettings: (portal: Portal) => buildPortalPath(portal, '/settings'),
  portalNotifications: (portal: Portal) => buildPortalPath(portal, '/notifications'),
} as const
