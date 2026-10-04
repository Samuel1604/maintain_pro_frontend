import type { LucideIcon } from 'lucide-react'
import { ShieldAlert, CircleAlert, SearchX, ServerCrash } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/helpers'

export type ErrorPageKind = 'not-found' | 'unauthorized' | 'server' | 'generic'

const KIND_ICON: Record<ErrorPageKind, LucideIcon> = {
  'not-found': SearchX,
  unauthorized: ShieldAlert,
  server: ServerCrash,
  generic: CircleAlert,
}

interface ErrorPageAction {
  label: string
  to?: string
  onClick?: () => void
}

interface ErrorPageProps {
  kind?: ErrorPageKind
  title: string
  message?: string
  primaryAction?: ErrorPageAction
  secondaryAction?: ErrorPageAction
  className?: string
}

/**
 * Standardized full-page error screen. Use for whole-page failures:
 * 403/Unauthorized, 404/Not found, uncaught route errors, or a generic
 * "something went wrong" screen. Not for inline widget failures — use
 * PageError for those instead.
 */
export function ErrorPage({
  kind = 'generic',
  title,
  message,
  primaryAction,
  secondaryAction,
  className,
}: ErrorPageProps) {
  const Icon = KIND_ICON[kind]

  return (
    <div className={cn('flex min-h-screen items-center justify-center bg-background px-4', className)}>
      <div
        role="alert"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
      >
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <Icon className="h-10 w-10 text-destructive" aria-hidden />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">{title}</h1>

        {message ? <p className="mb-6 text-sm text-muted-foreground">{message}</p> : null}

        {(primaryAction || secondaryAction) && (
          <div className="flex flex-wrap justify-center gap-3">
            {primaryAction ? <ErrorPageButton action={primaryAction} /> : null}
            {secondaryAction ? <ErrorPageButton action={secondaryAction} variant="outline" /> : null}
          </div>
        )}
      </div>
    </div>
  )
}

function ErrorPageButton({
  action,
  variant = 'default',
}: {
  action: ErrorPageAction
  variant?: 'default' | 'outline'
}) {
  if (action.to) {
    return (
      <Button asChild variant={variant}>
        <Link to={action.to}>{action.label}</Link>
      </Button>
    )
  }

  return (
    <Button variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  )
}
