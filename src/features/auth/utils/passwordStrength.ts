export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'strong' | 'very-strong'

export interface PasswordStrengthResult {
  level: PasswordStrengthLevel
  score: number
  maxScore: number
}

/** Score password complexity for signup strength indicator */
export function getPasswordStrength(password: string): PasswordStrengthResult {
  const maxScore = 6

  if (!password) {
    return { level: 'empty', score: 0, maxScore }
  }

  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  let level: PasswordStrengthLevel
  if (score <= 1) level = 'weak'
  else if (score <= 2) level = 'fair'
  else if (score <= 4) level = 'strong'
  else level = 'very-strong'

  return { level, score, maxScore }
}

export const PASSWORD_STRENGTH_LABELS: Record<Exclude<PasswordStrengthLevel, 'empty'>, string> = {
  weak: 'Weak',
  fair: 'Fair',
  strong: 'Strong',
  'very-strong': 'Very strong',
}
