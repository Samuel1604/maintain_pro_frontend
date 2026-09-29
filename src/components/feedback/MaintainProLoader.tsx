import { BrandLogo } from '@/components/brand/BrandLogo'
import { cn } from '@/utils/helpers'

type LoaderSize = 'sm' | 'md' | 'lg' | 'full'
const sizes: Record<LoaderSize, string> = { sm: 'h-5 w-5 text-xs', md: 'h-8 w-8 text-sm', lg: 'h-12 w-12 text-base', full: 'h-16 w-16 text-lg' }
export function MaintainProLoader({ size = 'md', className }: { size?: LoaderSize; className?: string }) {
  const iconSize = size === 'full' ? 64 : size === 'lg' ? 42 : size === 'md' ? 28 : 18
  return <div className={cn('flex items-center justify-center', className)} role="status" aria-label="Loading"><span className={cn('inline-flex items-center justify-center rounded-full', sizes[size])}><BrandLogo asLink={false} showText={false} iconSize={iconSize} iconClassName="animate-pulse drop-shadow-[0_0_12px_hsl(var(--primary)/0.65)]" /></span><span className="sr-only">Loading</span></div>
}
export function MaintainProAppLoader() { return <div className="flex min-h-screen items-center justify-center bg-background"><MaintainProLoader size="full" /></div> }
