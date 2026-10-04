import * as React from 'react'

import { cn } from '../../utils/helpers'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-(--radius-card) border border-border/80 py-6 shadow-(--shadow-card) transition-[border-color,box-shadow,transform] duration-150 hover:border-border hover:shadow-md',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-4 sm:px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4 sm:[.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-4 sm:px-6', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-4 sm:px-6 [.border-t]:pt-4 sm:[.border-t]:pt-6', className)}
      {...props}
    />
  )
}

function SectionCard({
  title,
  subtitle,
  children,
  action,
  noPadding,
  className,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
  noPadding?: boolean
  className?: string
}) {
  return (
    <div className={cn('rounded-(--radius-card) border border-border/80 bg-card shadow-(--shadow-card)', className)}>
      <div className="flex items-center justify-between border-b border-border/80 bg-gradient-to-r from-card to-muted/20 px-6 py-4">
        <div>
          <h2 className="text-[15px] font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  SectionCard,
}
