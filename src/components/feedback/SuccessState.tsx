import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/helpers";

interface SuccessStateProps {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

/**
 * Full-block success confirmation — "Email verified", "Check your email",
 * "Invitation accepted". Not for transient feedback; use a toast for that.
 */
export function SuccessState({
  icon: Icon = CheckCircle2,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className,
}: SuccessStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center gap-3 py-6 text-center", className)}
    >
      <div className="rounded-full bg-status-completed/10 p-4">
        <Icon className="h-8 w-8 text-status-completed" aria-hidden />
      </div>
      <p className="text-lg font-semibold text-foreground">{title}</p>
      {description ? (
        <div className="max-w-sm text-sm text-muted-foreground">{description}</div>
      ) : null}
      {(actionLabel && onAction) || (secondaryLabel && onSecondaryAction) ? (
        <div className="mt-2 flex w-full flex-col gap-2">
          {actionLabel && onAction ? (
            <Button onClick={onAction} className="w-full">
              {actionLabel}
            </Button>
          ) : null}
          {secondaryLabel && onSecondaryAction ? (
            <Button variant="outline" onClick={onSecondaryAction} className="w-full">
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
