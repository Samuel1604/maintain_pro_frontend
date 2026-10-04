import { Link } from 'react-router-dom'

import { BrandMark } from '@/components/brand/BrandMark'
import { PUBLIC_ROUTES } from '@/features/public/constants/routes'
import { APP_NAME } from '@/utils/constants'
import { cn } from '@/utils/helpers'

type AuthLogoVariant = 'panel' | 'inline'

interface AuthLogoLinkProps {
  variant?: AuthLogoVariant
  className?: string
}

/** MaintainPro logo (gear icon + name) linking to the marketing home page. */
export function AuthLogoLink({ variant = 'inline', className }: AuthLogoLinkProps) {
  const isPanel = variant === 'panel'

  return (
    <Link
      to={PUBLIC_ROUTES.HOME}
      className={cn('inline-flex w-fit self-start items-center gap-3 transition-opacity hover:opacity-90', className)}
      aria-label={`Back to ${APP_NAME} home`}
    >
      <BrandMark size={40} />
      <span
        className={cn(
          'text-xl font-semibold shrink-0',
          isPanel ? 'text-primary-foreground' : 'text-foreground',
        )}
      >
        {APP_NAME}
      </span>
    </Link>
  )
}
