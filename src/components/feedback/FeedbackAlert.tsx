import type { ReactNode } from 'react'
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/helpers'

export type FeedbackVariant = 'success' | 'error' | 'warning' | 'info'

const VARIANT_ICON: Record<FeedbackVariant, LucideIcon> = {
  success: CheckCircle2,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
}

const VARIANT_CLASSES: Record<FeedbackVariant, string> = {
  success: 'border-status-completed/30 bg-status-completed/10 text-status-completed [&>svg]:text-status-completed',
  error: 'border-destructive/30 bg-destructive/10 text-destructive [&>svg]:text-destructive',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400',
  info: 'border-primary/30 bg-primary/10 text-primary [&>svg]:text-primary',
}

interface FeedbackAlertAction {
  label: string
  onClick: () => void
}

interface FeedbackAlertProps {
  variant: FeedbackVariant
  title?: string
  children: ReactNode
  className?: string
  /** Persistent contextual alerts are dismissible by default; pass false to keep them pinned. */
  onDismiss?: () => void
  action?: FeedbackAlertAction
}

/**
 * Use for persistent, contextual business-rule or state messages
 * (e.g. "Email verification required", "Invitation expired").
 * Not for transient feedback — use the toast helpers for that instead.
 */
export function FeedbackAlert({ variant, title, children, className, onDismiss, action }: FeedbackAlertProps) {
  const Icon = VARIANT_ICON[variant]

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'relative flex w-full gap-3 rounded-lg border px-4 py-3 text-sm',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        {title ? <p className="font-medium leading-tight">{title}</p> : null}
        <div className="text-sm leading-relaxed [&_a]:underline [&_a]:underline-offset-2">{children}</div>
        {action ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={action.onClick}
            className="h-auto p-0 text-sm font-medium underline"
          >
            {action.label}
          </Button>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}
