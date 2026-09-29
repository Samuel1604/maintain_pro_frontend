import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import {
  buildPortalPath,
  buildUserPortalPath,
  getPortalForRole,
  parsePortalFromPath,
  type Portal,
} from '@/app/portal.config'
import { useAuthStore } from '@/app/store'

export function usePortal(): Portal {
  const { pathname } = useLocation()
  const user = useAuthStore((state) => state.user)

  return useMemo(() => {
    const fromPath = parsePortalFromPath(pathname)
    if (fromPath) return fromPath
    if (user) return getPortalForRole(user.role)
    return 'org'
  }, [pathname, user])
}

export function usePortalPath(segment = ''): string {
  const { pathname } = useLocation()
  const portal = usePortal()
  const user = useAuthStore((state) => state.user)

  return useMemo(() => {
    if (user) return buildUserPortalPath(user, segment || '/dashboard')
    return buildPortalPath(portal, segment || '/dashboard')
  }, [pathname, portal, segment, user])
}
