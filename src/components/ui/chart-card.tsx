import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartCardProps { title: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }

export function ChartCard({ title, description, action, children, className }: ChartCardProps) {
  return <Card className={className}><CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 bg-gradient-to-r from-card to-muted/20 pb-4"><div className="relative pl-3"><span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-primary/70" /><CardTitle className="text-[length:var(--font-size-card-heading)] leading-[var(--line-height-card-heading)]">{title}</CardTitle>{description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p> : null}</div>{action}</CardHeader><CardContent className="pt-5">{children}</CardContent></Card>
}
