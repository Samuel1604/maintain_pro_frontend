import { cn } from '@/utils/helpers'
import { Skeleton, SkeletonCard, SkeletonTable } from './Skeletons'

interface PageLoaderProps {
  label?: string
  className?: string
}

export function PageLoader({ label = 'Loading…', className }: PageLoaderProps) {
  const normalizedLabel = label.toLowerCase()
  const isDashboard = normalizedLabel.includes('dashboard')
  const isDetail = normalizedLabel.includes('detail') || normalizedLabel.includes('overview') || normalizedLabel.includes('profile') || normalizedLabel.includes('settings')
  return (
    <div
      className={cn('mx-auto w-full max-w-6xl space-y-4 p-6', className)}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
      {isDashboard ? <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div><div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-72 rounded-xl" /><Skeleton className="h-72 rounded-xl" /></div></> : isDetail ? <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-48 rounded-xl lg:col-span-2" /></div> : <><Skeleton className="h-12 w-full rounded-xl" /><SkeletonTable rows={6} columns={6} /></>}
    </div>
  )
}
