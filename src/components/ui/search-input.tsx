import * as React from 'react'
import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/utils/helpers'

export function SearchInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input {...props} className={cn('border-0 bg-surface-muted pl-9 shadow-none focus-visible:bg-surface focus-visible:ring-1', className)} type="search" />
    </div>
  )
}
