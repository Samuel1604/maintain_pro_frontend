import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/helpers";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-gradient-to-b from-card to-muted/20 px-6 text-center text-muted-foreground shadow-sm",
        compact ? "py-7" : "py-14",
        className,
      )}
    >
      <div
        className={cn(
          "mb-3 flex items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary",
          compact ? "h-10 w-10" : "h-14 w-14",
        )}
      >
        <Icon className={cn(compact ? "h-5 w-5" : "h-6 w-6")} aria-hidden />
      </div>
      <p className="font-semibold tracking-tight text-foreground">{title}</p>
      {description ? <p className="mt-1 max-w-md text-sm leading-6">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button size="sm" className={cn(compact ? "mt-3" : "mt-4")} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
