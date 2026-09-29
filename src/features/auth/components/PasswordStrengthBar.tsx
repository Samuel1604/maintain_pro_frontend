import { cn } from '@/utils/helpers'
import {
  getPasswordStrength,
  PASSWORD_STRENGTH_LABELS,
  type PasswordStrengthLevel,
} from '@/features/auth/utils/passwordStrength'

const SEGMENT_COUNT = 4

const LEVEL_SEGMENTS: Record<Exclude<PasswordStrengthLevel, 'empty'>, number> = {
  weak: 1,
  fair: 2,
  strong: 3,
  'very-strong': 4,
}

const LEVEL_BAR_COLORS: Record<Exclude<PasswordStrengthLevel, 'empty'>, string> = {
  weak: 'bg-destructive',
  fair: 'bg-amber-500',
  strong: 'bg-primary',
  'very-strong': 'bg-emerald-500',
}

const LEVEL_TEXT_COLORS: Record<Exclude<PasswordStrengthLevel, 'empty'>, string> = {
  weak: 'text-destructive',
  fair: 'text-amber-600 dark:text-amber-500',
  strong: 'text-primary',
  'very-strong': 'text-emerald-600 dark:text-emerald-500',
}

interface PasswordStrengthBarProps {
  password: string
  className?: string
}

export function PasswordStrengthBar({ password, className }: PasswordStrengthBarProps) {
  const { level } = getPasswordStrength(password)

  if (level === 'empty') {
    return null
  }

  const filledSegments = LEVEL_SEGMENTS[level]
  const label = PASSWORD_STRENGTH_LABELS[level]

  return (
    <div className={cn('space-y-2', className)} aria-live="polite">
      <div
        className="flex gap-1"
        role="meter"
        aria-valuenow={filledSegments}
        aria-valuemin={0}
        aria-valuemax={SEGMENT_COUNT}
        aria-label={`Password strength: ${label}`}
      >
        {Array.from({ length: SEGMENT_COUNT }, (_, index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              index < filledSegments ? LEVEL_BAR_COLORS[level] : 'bg-muted',
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', LEVEL_TEXT_COLORS[level])}>{label}</p>
    </div>
  )
}
