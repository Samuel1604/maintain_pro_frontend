import { toast } from 'sonner'

/**
 * Use for transient feedback only — "Saved successfully", "Invitation sent",
 * "Connection restored". Never use for validation errors (those belong
 * inline, below the field) or persistent business-rule messages (those
 * belong in a FeedbackAlert/FormBanner instead).
 *
 * Icons are configured once, globally, on the <Toaster> in providers.tsx —
 * call sites just pass the backend/business message through untouched.
 */
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  warning: (message: string) => toast.warning(message),
  info: (message: string) => toast.info(message),
}
