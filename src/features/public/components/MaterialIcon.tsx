import { cn } from '@/utils/helpers'

interface MaterialIconProps {
  name: string
  className?: string
  filled?: boolean
}

export function MaterialIcon({ name, className, filled = false }: MaterialIconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', className)}
      aria-hidden="true"
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  )
}
