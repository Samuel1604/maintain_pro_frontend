import { useRef, useState } from 'react'
import { FileDown, Loader2, FileSpreadsheet } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { FieldError } from '@/components/feedback/FieldError'
import { cn } from '@/utils/helpers'
import { assetsApi } from '@/features/assets/api/assets.api'

interface ImportAssetsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported?: (count: number) => void
}

export function ImportAssetsDialog({ open, onOpenChange, onImported }: ImportAssetsDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [updateExisting, setUpdateExisting] = useState(false)
  const [skipInvalidRows, setSkipInvalidRows] = useState(true)

  const reset = () => {
    setFile(null)
    setFileError(null)
    setUpdateExisting(false)
    setSkipInvalidRows(true)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (!picked) return
    if (!picked.name.match(/\.(csv|xlsx|xls)$/i)) {
      setFileError('Please choose a CSV or Excel file')
      setFile(null)
      return
    }
    setFileError(null)
    setFile(picked)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    try {
      const result = await assetsApi.importCsv(file)
      toast.success(`Imported ${result.imported} asset${result.imported === 1 ? '' : 's'}`)
      onImported?.(result.imported)
      handleOpenChange(false)
    } catch { toast.error('Unable to import assets') } finally { setImporting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" />
            Import assets
          </DialogTitle>
          <DialogDescription>
            Upload a spreadsheet to bulk-create or update assets. Required columns: name,
            category, location, serial number.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="sr-only"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-8 transition-colors hover:border-primary/50 hover:bg-muted/30',
              file && 'border-primary/40 bg-primary/5',
            )}
          >
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
            {file ? (
              <>
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB · Click to replace
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">Choose CSV or Excel file</p>
                <p className="text-xs text-muted-foreground">or drag and drop here</p>
              </>
            )}
          </button>

          <FieldError message={fileError} />

          <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-start gap-2">
              <Checkbox
                id="update-existing"
                checked={updateExisting}
                onCheckedChange={(v) => setUpdateExisting(v === true)}
              />
              <Label htmlFor="update-existing" className="text-sm font-normal leading-snug cursor-pointer">
                Update existing assets when serial number matches
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="skip-invalid"
                checked={skipInvalidRows}
                onCheckedChange={(v) => setSkipInvalidRows(v === true)}
              />
              <Label htmlFor="skip-invalid" className="text-sm font-normal leading-snug cursor-pointer">
                Skip rows with missing required fields
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!file || importing} onClick={handleImport}>
            {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
