import { FeedbackAlert, type FeedbackVariant } from '@/components/feedback/FeedbackAlert'
import { mapHttpToAppError } from '@/lib/errors/errorMapper'
import type { ErrorCategory } from '@/lib/errors/AppError'
import { getErrorMessages } from '@/lib/get-error-message'
import { cn } from '@/utils/helpers'

const CATEGORY_VARIANT: Record<ErrorCategory, FeedbackVariant> = {
  VALIDATION: 'error',
  AUTHENTICATION: 'error',
  AUTHORIZATION: 'warning',
  NOT_FOUND: 'info',
  BUSINESS: 'warning',
  NETWORK: 'error',
  EMAIL_VERIFICATION_REQUIRED: 'warning',
  UNEXPECTED: 'error',
}

interface FormBannerProps {
  /** Raw error from a mutation/query — mapped and categorized here. Never re-worded. */
  error: unknown
  fallback?: string
  className?: string
  onDismiss?: () => void
}

/**
 * Standardized banner for form/page-level submission errors (auth failures,
 * business-rule conflicts, network issues). Displays the backend's own
 * message — this component only handles presentation, icon, and color.
 */
export function FormBanner({ error, fallback, className, onDismiss }: FormBannerProps) {
  if (!error) return null

  const appError = mapHttpToAppError(error)
  const variant = CATEGORY_VARIANT[appError.category]
  const messages = getErrorMessages(error, fallback)

  return (
    <FeedbackAlert variant={variant} className={cn(className)} onDismiss={onDismiss}>
      {messages.length === 1 ? (
        messages[0]
      ) : (
        <div className="space-y-1.5">
          <p className="font-medium leading-tight">{messages[0]}</p>
          <ul className="list-disc space-y-0.5 pl-4">
            {messages.slice(1).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}
    </FeedbackAlert>
  )
}
