import { CircleAlert } from 'lucide-react'

import { cn } from '@/utils/helpers'

interface FieldErrorProps {
  /** Backend or client-side validation message. Rendered as-is — never rewritten. */
  message?: string | null
  id?: string
  className?: string
}

/**
 * Inline validation error displayed directly below its input.
 * Pair the input with `aria-describedby={id}` and `aria-invalid` when a message is present.
 */
export function FieldError({ message, id, className }: FieldErrorProps) {
  if (!message) return null

  return (
    <p
      id={id}
      role="alert"
      className={cn('flex items-start gap-1.5 text-sm text-destructive', className)}
    >
      <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  )
}
