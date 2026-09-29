import { PORTALS } from '@/app/portal.config'
import { useAuthStore } from '@/app/store'
import { getOrganizationName } from '@/utils/organization'
import { usePortal } from './usePortal'

/** Subtitle under the sidebar logo, e.g. "Acme Corp Portal" */
export function usePortalBranding(): string {
  const portal = usePortal()
  const user = useAuthStore((state) => state.user)

  if (portal === PORTALS.ORG) {
    return `${getOrganizationName()} Portal`
  }

  if (user?.department?.trim()) {
    return `${user.department?.trim()} Portal`
  }

  // TECH portal removed — org technicians are in PORTALS.ORG
  return 'Vendor Portal'
}
