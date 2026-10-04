/** Human-friendly references for display only; API routes continue using real IDs. */
export function displayReference(prefix: 'AST' | 'SR' | 'WO' | 'FAC' | 'LOC', value?: string | null) {
  if (!value) return 'Not configured'
  const normalized = value.toUpperCase()
  return normalized.startsWith(`${prefix}-`) ? value : `${prefix}-${value.slice(-6).toUpperCase()}`
}

export function displayLabel(value?: string | null) {
  if (!value) return 'Not configured'
  const normalized = value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  return normalized.replace(/\bHvac\b/g, 'HVAC').replace(/\bId\b/g, 'ID')
}
