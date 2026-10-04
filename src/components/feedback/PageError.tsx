import { AlertCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/helpers'

interface PageErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function PageError({
  title = 'Something went wrong',
  message = 'We could not load this page. Please try again.',
  onRetry,
  className,
}: PageErrorProps) {
  return (
    <div
      className={cn(
        'flex min-h-[240px] flex-col items-center justify-center gap-3 px-4 text-center',
        className,
      )}
      role="alert"
    >
      <AlertCircle className="h-10 w-10 text-destructive opacity-80" aria-hidden />
      <p className="font-medium text-foreground">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      ) : null}
    </div>
  )
}
