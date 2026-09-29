import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { VendorInvoice } from '@/types/common.types'

interface DisputeInvoiceDialogProps {
  invoice: VendorInvoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDispute: (invoiceId: string, reason: string) => void
}

export function DisputeInvoiceDialog({
  invoice,
  open,
  onOpenChange,
  onDispute,
}: DisputeInvoiceDialogProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoice || !reason.trim()) {
      toast.error('Please enter a reason for disputing this invoice.')
      return
    }

    setLoading(true)
    try {
      onDispute(invoice.id, reason.trim())
      setReason('')
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="h-5 w-5" /> Dispute Invoice
            </DialogTitle>
            <DialogDescription>
              Disputing invoice <span className="font-mono font-medium text-foreground">{invoice?.invoiceNumber || invoice?.id}</span> ({invoice?.vendorName}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-600 dark:text-amber-400">
              Disputing an invoice will pause payment processing and notify the vendor to provide clarification or a revised invoice.
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="dispute-reason">Dispute Reason / Notes *</Label>
                <span className="text-xs text-muted-foreground">{reason.length} / 500</span>
              </div>
              <Textarea
                id="dispute-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Detail discrepancies in line items, labor hours, rate mismatches, or incomplete work..."
                rows={4}
                maxLength={500}
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={loading || !reason.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Dispute
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
