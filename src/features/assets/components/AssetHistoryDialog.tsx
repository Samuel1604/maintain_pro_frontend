import { Wrench } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate } from '@/utils/formatDate'
import type { Asset } from '@/types/common.types'

interface AssetHistoryDialogProps {
  asset: Asset | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssetHistoryDialog({ asset, open, onOpenChange }: AssetHistoryDialogProps) {
  const records = asset?.maintenanceHistory ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Maintenance history — {asset?.name}</DialogTitle>
        </DialogHeader>
        {records.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No maintenance records yet.</p>
        ) : (
          <ul className="max-h-64 space-y-3 overflow-y-auto text-sm">
            {records.map((r) => (
              <li key={r.id} className="flex gap-3 border-b border-border pb-3 last:border-0">
                <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{r.type}</p>
                  <p className="text-muted-foreground">{r.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(r.date)} · {r.technician} · ${r.cost}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
