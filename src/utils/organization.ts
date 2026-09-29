const ORG_NAME_KEY = 'maintainpro_organization_name'

export const DEFAULT_ORGANIZATION_NAME = 'MaintainPro Organization'

export function getOrganizationName(): string {
  try {
    return localStorage.getItem(ORG_NAME_KEY) || DEFAULT_ORGANIZATION_NAME
  } catch {
    return DEFAULT_ORGANIZATION_NAME
  }
}

export function setOrganizationName(name: string): void {
  const trimmed = name.trim().charAt(0).toUpperCase() + name.trim().slice(1)
  if (!trimmed) return
  try {
    localStorage.setItem(ORG_NAME_KEY, trimmed)
  } catch {
    /* ignore quota errors in dev */
  }
}
