import { useState } from 'react'
import { FileUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { downloadBlob } from '@/utils/downloadFile'
import type { Asset } from '@/types/common.types'

type ExportFormat = 'csv' | 'json' | 'xlsx'
type ExportScope = 'filtered' | 'all'

interface ExportAssetsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filteredAssets: Asset[]
  allAssets: Asset[]
}

function assetsToCsv(rows: Asset[]): string {
  const headers = ['id', 'name', 'category', 'location', 'status', 'serialNumber', 'manufacturer', 'model']
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`
  const lines = [
    headers.join(','),
    ...rows.map((a) =>
      [
        a.id,
        a.name,
        a.category,
        a.locationName,
        a.status,
        a.serialNumber ?? '',
        a.manufacturer ?? '',
        a.model ?? '',
      ]
        .map(escape)
        .join(','),
    ),
  ]
  return lines.join('\n')
}

export function ExportAssetsDialog({
  open,
  onOpenChange,
  filteredAssets,
  allAssets,
}: ExportAssetsDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [scope, setScope] = useState<ExportScope>('filtered')
  const [exporting, setExporting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const filteredCount = filteredAssets.length
  const totalCount = allAssets.length
  const rowCount = scope === 'filtered' ? filteredCount : totalCount
  const dataToExport = scope === 'filtered' ? filteredAssets : allAssets

  const handleExport = async () => {
    setExporting(true)
    await new Promise((r) => setTimeout(r, 500))

    const stamp = new Date().toISOString().slice(0, 10)
    const base = `assets-export-${stamp}`

    if (format === 'json') {
      downloadBlob(`${base}.json`, JSON.stringify(dataToExport, null, 2), 'application/json')
    } else if (format === 'csv') {
      downloadBlob(`${base}.csv`, assetsToCsv(dataToExport), 'text/csv;charset=utf-8')
    } else {
      downloadBlob(`${base}.json`, JSON.stringify(dataToExport, null, 2), 'application/json')
      toast.info('Excel export uses CSV-compatible data until the API is connected')
    }

    setExporting(false)
    toast.success(`Exported ${rowCount} assets as ${format.toUpperCase()}`)
    onOpenChange(false)
  }

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Download asset export?"
        description={`${rowCount} asset record${rowCount === 1 ? '' : 's'} will be saved as ${format.toUpperCase()} to your device.`}
        confirmLabel="Download"
        onConfirm={() => {
          void handleExport()
        }}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            Export assets
          </DialogTitle>
          <DialogDescription>
            Download asset records for reporting, backups, or external tools.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Records to include</Label>
            <RadioGroup value={scope} onValueChange={(v) => setScope(v as ExportScope)} className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                <RadioGroupItem value="filtered" id="scope-filtered" />
                <Label htmlFor="scope-filtered" className="flex-1 cursor-pointer font-normal">
                  Current view ({filteredCount} assets)
                </Label>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all" className="flex-1 cursor-pointer font-normal">
                  All assets ({totalCount} total)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <p className="text-xs text-muted-foreground">
            Export will include ID, name, category, location, status, and serial number fields.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={exporting || rowCount === 0}
            onClick={() => setConfirmOpen(true)}
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileUp className="mr-2 h-4 w-4" />
            )}
            Download {rowCount} records
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
