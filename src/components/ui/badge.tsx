import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../utils/helpers'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export type StatusType =
  | 'OPEN'
  | 'APPROVED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_COMPLETION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'ON_HOLD'
  | 'SUBMITTED'
  | 'PENDING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'DRAFT'
  | 'SCHEDULED'
  | 'OVERDUE'
  | string

export function StatusBadge({ status, label: labelProp, className }: { status: StatusType; label?: string; className?: string }) {
  const normalized = (status || '').toUpperCase().replace(/\s+/g, '_')

  let style = 'bg-surface-muted text-muted-foreground border-border'
  let label = labelProp ?? (status || 'UNKNOWN')

  switch (normalized) {
    case 'APPROVED':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'RESOLVED':
    case 'ACCEPTED':
    case 'AWARDED':
      style = 'bg-success-muted text-success border-success/20'
      break
    case 'IN_PROGRESS':
    case 'SCHEDULED':
    case 'DISPATCHED':
    case 'ASSIGNED':
    case 'GENERATED':
      style = 'bg-info-muted text-info border-info/20'
      break
    case 'OPEN':
    case 'PENDING_APPROVAL':
    case 'PENDING_COMPLETION':
    case 'PENDING':
    case 'PENDING_VERIFICATION':
    case 'PENDING_INVITATION':
    case 'SUBMITTED':
    case 'ON_HOLD':
    case 'SHORTLISTED':
    case 'DUE_SOON':
    case 'UNDER_REVIEW':
    case 'PROPOSED':
      style = 'bg-warning-muted text-warning border-warning/20'
      break
    case 'CANCELLED':
    case 'REJECTED':
    case 'OVERDUE':
    case 'CRITICAL_LOW':
    case 'OUT_OF_STOCK':
    case 'TERMINATED':
    case 'REVOKED':
    case 'PAST_DUE':
      style = 'bg-danger-muted text-danger border-danger/20'
      break
    case 'WITHDRAWN':
    case 'INACTIVE':
    case 'REMOVED':
    case 'DEACTIVATED':
    case 'EXPIRED':
    case 'DRAFT':
      style = 'bg-surface-muted text-muted-foreground border-border'
      break
    case 'SUSPENDED':
    case 'MAINTENANCE':
    case 'CRITICAL':
      style = 'bg-danger-muted text-danger border-danger/20'
      break
    default:
      style = 'bg-muted text-muted-foreground border-border'
      break
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border transition-colors shrink-0',
        style,
        className
      )}
    >
      {label.replace(/_/g, ' ')}
    </span>
  )
}

export type PriorityType = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string

export function PriorityBadge({ priority, className }: { priority: PriorityType; className?: string }) {
  const normalized = (priority || '').toUpperCase()

  let style = 'bg-muted text-muted-foreground border-border'

  switch (normalized) {
    case 'CRITICAL':
    case 'EMERGENCY':
      style = 'bg-danger-muted text-danger border-danger/30 font-extrabold'
      break
    case 'HIGH':
      style = 'bg-danger-muted/70 text-danger border-danger/20'
      break
    case 'MEDIUM':
      style = 'bg-warning-muted text-warning border-warning/20'
      break
    case 'LOW':
      style = 'bg-muted text-muted-foreground border-border'
      break
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border transition-colors shrink-0',
        style,
        className
      )}
    >
      {priority}
    </span>
  )
}

export { Badge, badgeVariants }
