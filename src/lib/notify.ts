import { toast as sonnerToast, type ExternalToast } from "sonner";

import { mapHttpToAppError } from "@/lib/errors/errorMapper";
import type { AppError, ErrorCategory } from "@/lib/errors/AppError";
import { getApiValidationMessages } from "@/lib/form-errors";

type ToastOptions = ExternalToast;
type ToastId = string | number;

/**
 * Error categories that represent the *user's* input or a business-state
 * conflict (fixable by the user, not a system failure) render as warnings.
 * Everything else — auth, permissions, network, unexpected server errors —
 * renders as a hard error. This keeps "warning" and "error" meaningfully
 * different, not just two colors for the same thing.
 */
const WARNING_CATEGORIES: ReadonlySet<ErrorCategory> = new Set([
  "VALIDATION",
  "BUSINESS",
  "NOT_FOUND",
]);

function buildErrorToast(appError: AppError, fallback?: string) {
  const fieldMessages = appError.errors ? getApiValidationMessages(appError) : [];
  const title = appError.message || fallback || "Something went wrong. Please try again.";
  // Show extra field-level messages as supporting detail instead of stacking
  // multiple toasts on top of each other.
  const description =
    fieldMessages.length > 1
      ? fieldMessages.filter((message) => message !== title).join(" • ") || undefined
      : undefined;

  return { title, description };
}

export const notify = {
  success: (message: string, options?: ToastOptions): ToastId =>
    sonnerToast.success(message, options),

  error: (message: string, options?: ToastOptions): ToastId => sonnerToast.error(message, options),

  warning: (message: string, options?: ToastOptions): ToastId =>
    sonnerToast.warning(message, options),

  info: (message: string, options?: ToastOptions): ToastId => sonnerToast.info(message, options),

  loading: (message: string, options?: ToastOptions): ToastId =>
    sonnerToast.loading(message, options),

  dismiss: (id?: ToastId) => sonnerToast.dismiss(id),

  promise: sonnerToast.promise,

  /**
   * Show the correct toast for a thrown/caught error, whether it's an Axios
   * error, an already-mapped AppError, or something unexpected. Chooses
   * warning vs. error automatically based on the error category so callers
   * never have to guess which one to use.
   *
   * @example
   * try {
   *   await assetsService.create(payload)
   *   notify.success('Asset registered')
   * } catch (error) {
   *   notify.fromError(error)
   * }
   */
  fromError(error: unknown, fallback?: string): ToastId {
    const appError = mapHttpToAppError(error);
    const { title, description } = buildErrorToast(appError, fallback);

    if (WARNING_CATEGORIES.has(appError.category)) {
      return sonnerToast.warning(title, { description });
    }

    return sonnerToast.error(title, { description });
  },
};

// Re-exported so existing `import { toast } from 'sonner'` call sites can be
// migrated with a one-line import swap: `import { toast } from '@/lib/notify'`.
export { notify as toast };
