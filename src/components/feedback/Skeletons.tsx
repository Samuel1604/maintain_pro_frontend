import { cn } from "@/utils/helpers";
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-muted via-muted/60 to-muted",
        className,
      )}
    />
  );
}
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn("h-3", index === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <div className="mt-5">
        <SkeletonText lines={3} />
      </div>
    </div>
  );
}
export function SkeletonTable({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex gap-4 border-b border-border pb-4">
        {Array.from({ length: columns }, (_, column) => (
          <Skeleton key={column} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex gap-4">
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton key={column} className={cn("h-9 flex-1", column === 0 && "max-w-[18%]")} />
          ))}
        </div>
      ))}
    </div>
  );
}
