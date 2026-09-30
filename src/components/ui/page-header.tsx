import type { ReactNode } from "react";

import { cn } from "@/utils/helpers";
import { PageIntro } from "@/components/layout/PageIntro";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Shared content header used below the persistent portal topbar. */
export function PageHeader({ title, subtitle, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("border-b border-border bg-card px-8 py-5", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <PageIntro title={title} description={subtitle ?? ""} />
          {breadcrumbs ? (
            <div className="mt-2 pl-4 text-xs font-medium text-muted-foreground">{breadcrumbs}</div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
