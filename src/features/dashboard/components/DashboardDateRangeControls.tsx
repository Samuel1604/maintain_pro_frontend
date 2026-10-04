import { Calendar, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DASHBOARD_RANGE_LABELS,
  type DashboardDateRange,
} from '@/features/dashboard/utils/dashboardDateRange'

interface DashboardDateRangeControlsProps {
  range: DashboardDateRange
  onRangeChange: (range: DashboardDateRange) => void
  onExport?: () => void
  exportLabel?: string
  layout?: 'desktop' | 'mobile' | 'both'
}

export function DashboardDateRangeControls({
  range,
  onRangeChange,
  onExport,
  exportLabel = 'Export dashboard',
  layout = 'both',
}: DashboardDateRangeControlsProps) {
  const select = (
    <Select
      value={range}
      onValueChange={(v) => onRangeChange(v as DashboardDateRange)}
    >
      <SelectTrigger className="h-9 w-[160px] bg-card border-border flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(['7d', '30d', '90d'] as const).map((key) => (
          <SelectItem key={key} value={key}>
            {DASHBOARD_RANGE_LABELS[key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const desktop = (
    <div className="hidden items-center gap-2 sm:flex">
      {select}
      {onExport ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          aria-label={exportLabel}
          className="h-9"
        >
          <Download className="h-4 w-4" aria-hidden />
          <span className="sr-only">{exportLabel}</span>
        </Button>
      ) : null}
    </div>
  )

  const mobile = (
    <div className="page-body flex items-center gap-2 pb-0 sm:hidden">
      <div className="flex-1">{select}</div>
      {onExport ? (
        <Button variant="outline" size="sm" onClick={onExport} className="h-9">
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Export
        </Button>
      ) : null}
    </div>
  )

  if (layout === 'desktop') return desktop
  if (layout === 'mobile') return mobile
  return (
    <>
      {desktop}
      {mobile}
    </>
  )
}
