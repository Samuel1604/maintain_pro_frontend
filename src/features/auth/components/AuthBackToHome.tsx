import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { PUBLIC_ROUTES } from '@/features/public/constants/routes'
import { cn } from '@/utils/helpers'

/** Mobile-only back control; desktop uses the branding panel logo instead. */
export function AuthBackToHome({ className }: { className?: string }) {
  return (
    <Link
      to={PUBLIC_ROUTES.HOME}
      className={cn(
        'inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Home
    </Link>
  )
}
