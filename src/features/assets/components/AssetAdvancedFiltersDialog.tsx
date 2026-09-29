import { useEffect, useState } from 'react'
import { Filter, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { locationsApi } from '@/features/locations/api/locations.api'
import type { Location } from '@/features/locations/types/location.types'
import type { AssetFilters } from '../types/asset.types'

type AdvancedDraft = {
  locationId?: string
  manufacturer?: string
  installDateFrom?: string
  installDateTo?: string
  warrantyStatus: 'all' | NonNullable<AssetFilters['warrantyStatus']>
  maintenanceDue: 'all' | NonNullable<AssetFilters['maintenanceDue']>
}

const emptyAdvanced: AdvancedDraft = {
  locationId: undefined,
  manufacturer: undefined,
  installDateFrom: undefined,
  installDateTo: undefined,
  warrantyStatus: 'all',
  maintenanceDue: 'all',
}

interface AssetAdvancedFiltersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: AssetFilters
  onApply: (patch: Partial<AssetFilters>) => void
  manufacturers: string[]
}

export function AssetAdvancedFiltersDialog({
  open,
  onOpenChange,
  filters,
  onApply,
  manufacturers,
}: AssetAdvancedFiltersDialogProps) {
  const [draft, setDraft] = useState<AdvancedDraft>(emptyAdvanced)
  const [locations, setLocations] = useState<Location[]>([])
  const [locationsError, setLocationsError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    void locationsApi.list().then(setLocations).catch(() => setLocationsError('Unable to load locations'))
  }, [open])

  useEffect(() => {
    if (!open) return
    setDraft({
      locationId: filters.locationId,
      manufacturer: filters.manufacturer,
      installDateFrom: filters.installDateFrom,
      installDateTo: filters.installDateTo,
      warrantyStatus: filters.warrantyStatus ?? 'all',
      maintenanceDue: filters.maintenanceDue ?? 'all',
    })
  }, [open, filters])

  const apply = () => {
    onApply({
      locationId: draft.locationId || undefined,
      manufacturer: draft.manufacturer?.trim() || undefined,
      installDateFrom: draft.installDateFrom || undefined,
      installDateTo: draft.installDateTo || undefined,
      warrantyStatus: draft.warrantyStatus === 'all' ? undefined : draft.warrantyStatus,
      maintenanceDue: draft.maintenanceDue === 'all' ? undefined : draft.maintenanceDue,
    })
    onOpenChange(false)
  }

  const reset = () => {
    setDraft(emptyAdvanced)
    onApply({
      locationId: undefined,
      manufacturer: undefined,
      installDateFrom: undefined,
      installDateTo: undefined,
      warrantyStatus: undefined,
      maintenanceDue: undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] !max-w-lg gap-0 overflow-hidden border-border bg-card p-0 sm:!max-w-lg">
        <DialogHeader className="space-y-2 px-6 pt-6 text-left">
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Advanced filters
          </DialogTitle>
          <DialogDescription>
            Narrow assets by location, manufacturer, dates, warranty, and maintenance schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(55vh,420px)] space-y-5 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={draft.locationId ?? 'all'}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, locationId: v === 'all' ? undefined : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
                {locationsError && <p className="text-xs text-destructive">{locationsError}</p>}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Manufacturer</Label>
            <Select
              value={draft.manufacturer ?? 'all'}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, manufacturer: v === 'all' ? undefined : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All manufacturers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All manufacturers</SelectItem>
                {manufacturers.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="install-from">Install date from</Label>
              <Input
                id="install-from"
                type="date"
                value={draft.installDateFrom ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, installDateFrom: e.target.value || undefined }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="install-to">Install date to</Label>
              <Input
                id="install-to"
                type="date"
                value={draft.installDateTo ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, installDateTo: e.target.value || undefined }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Warranty</Label>
            <Select
              value={draft.warrantyStatus ?? 'all'}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, warrantyStatus: v as AdvancedDraft['warrantyStatus'] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any warranty status</SelectItem>
                <SelectItem value="active">Under warranty</SelectItem>
                <SelectItem value="expired">Warranty expired</SelectItem>
                <SelectItem value="none">No warranty on file</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Maintenance schedule</Label>
            <Select
              value={draft.maintenanceDue ?? 'all'}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, maintenanceDue: v as AdvancedDraft['maintenanceDue'] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any maintenance status</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="due_soon">Due within 30 days</SelectItem>
                <SelectItem value="none">No scheduled maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 border-t border-border px-6 py-4 sm:justify-end">
          <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button type="button" className="flex-1 sm:flex-none" onClick={apply}>
            Apply filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
