import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, FileText, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { AppHeader } from '@/components/navigation/Navbar'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePortalPath } from '@/hooks/usePortal'
import type { VendorInvoice } from '@/types/common.types'
import { invoicesService, type TrackedInvoice } from '../services/invoices.service'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/helpers'
import { PageError } from '@/components/feedback/PageError'
import { SkeletonCard } from '@/components/feedback/Skeletons'

import { DisputeInvoiceDialog } from '../components/DisputeInvoiceDialog'
import { PageIntro } from '@/components/layout/PageIntro'

export function VendorInvoices() {
  const [apiInvoices, setApiInvoices] = useState<VendorInvoice[]>([])
  const invoices = apiInvoices
  const workOrdersPath = usePortalPath('work-orders')
  const [filter, setFilter] = useState<'all' | VendorInvoice['status']>('pending')
  const [disputeInvoice, setDisputeInvoice] = useState<VendorInvoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadInvoices = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const result = await invoicesService.list()
      setApiInvoices((result ?? []).map((invoice: TrackedInvoice) => ({
        id: invoice._id, workOrderId: invoice.workOrderId ?? '', vendorId: invoice.vendorId,
        vendorName: invoice.vendorId, amount: invoice.amount,
        status: invoice.status === 'submitted' || invoice.status === 'under_review' ? 'pending' : invoice.status,
        submittedAt: new Date(invoice.submittedAt), paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined,
        invoiceNumber: invoice.invoiceNumber, notes: invoice.notes,
      })))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load vendor invoices'
      setLoadError(message)
      toast.error(message)
    } finally { setLoading(false) }
  }

  useEffect(() => { void loadInvoices() }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return invoices
    return invoices.filter((inv) => inv.status === filter)
  }, [filter, invoices])

  const markPaid = (inv: VendorInvoice) => {
    void invoicesService.recordExternalPayment(inv.id, `external-${Date.now()}`).then(() => { toast.success(`Invoice ${inv.id} marked paid`); return loadInvoices() }).catch(() => toast.error('Unable to record external payment'))
  }

  const approve = (inv: VendorInvoice) => {
    void invoicesService.review(inv.id, {}).then(() => { toast.success(`Invoice ${inv.id} approved`); return loadInvoices() }).catch(() => toast.error('Unable to approve invoice'))
  }

  const handleDispute = (invoiceId: string, reason: string) => {
    const inv = invoices.find((i) => i.id === invoiceId)
    if (!inv) return

    void invoicesService.dispute(invoiceId, reason).then(async () => {
        toast.success(`Invoice ${invoiceId} disputed`)
        await loadInvoices()
      }).catch(() => toast.error('Unable to dispute invoice'))
  }

  const reject = (inv: VendorInvoice) => {
    void invoicesService.review(inv.id, { rejectionReason: 'Rejected by finance' }).then(() => { toast.success(`Invoice ${inv.id} rejected`); return loadInvoices() }).catch(() => toast.error('Unable to reject invoice'))
  }

  return (
    <div className="flex flex-col bg-background">
      <AppHeader
        title="Vendor Invoices"
        subtitle="Invoices"
        hideQuickCreate
      />
      <div className="page-body space-y-4">
        <PageIntro title="Vendor Invoices" description="Review submitted invoices, match them to completed work, and record payment decisions." />
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'approved', 'paid', 'disputed'] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? 'default' : 'outline'}
              onClick={() => setFilter(s)}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>

        {loading ? (
          <div role="status" aria-live="polite" className="space-y-3"><span className="sr-only">Loading vendor invoices…</span>{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : loadError ? (
          <PageError title="Vendor invoices unavailable" message={loadError} onRetry={() => void loadInvoices()} />
        ) : filtered.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <p className="font-semibold text-foreground">{invoices.length === 0 ? 'No vendor invoices have been submitted yet' : 'No invoices match this status filter'}</p>
              <p className="mx-auto mt-2 max-w-md text-sm">{invoices.length === 0 ? 'Submitted vendor invoices will appear here for review against their related work orders.' : 'Choose another status filter to review invoices in a different stage.'}</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((inv) => {
            const variance =
              inv.estimatedAmount != null
                ? inv.amount - inv.estimatedAmount
                : null
            return (
              <Card key={inv.id} className="border-border bg-card">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{inv.invoiceNumber ?? inv.id}</span>
                        <StatusBadge status={inv.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {inv.vendorName} · WO{' '}
                        <Link
                          to={`${workOrdersPath}/${inv.workOrderId}`}
                          className="text-primary hover:underline"
                        >
                          {inv.workOrderId}
                        </Link>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {formatDate(inv.submittedAt)}
                        {inv.paidAt ? ` · Paid ${formatDate(inv.paidAt)}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${inv.amount.toLocaleString()}</p>
                      {inv.estimatedAmount != null && (
                        <p className="text-xs text-muted-foreground">
                          Estimate ${inv.estimatedAmount.toLocaleString()}
                          {variance != null && (
                            <span
                              className={cn(
                                ' ml-1',
                                variance > 0 ? 'text-amber-400' : 'text-emerald-400',
                              )}
                            >
                              ({variance > 0 ? '+' : ''}
                              {variance})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  {wo?.completionNotes && (
                    <p className="rounded-md bg-muted/40 p-2 text-sm text-muted-foreground">
                      Completion: {wo.completionNotes}
                    </p>
                  )}
                  {wo?.images && wo.images.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-muted-foreground">Completion Photos:</span>
                      <div className="flex flex-wrap gap-2">
                        {wo.images.map((img, i) => (
                          <img
                            key={i}
                            src={img.startsWith('data:') ? img : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='}
                            alt="Work completion evidence"
                            className="h-16 w-16 object-cover rounded border border-border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {inv.auditLog && inv.auditLog.length > 0 && (
                    <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/10">
                      <span className="text-xs font-semibold text-muted-foreground block">Invoice Audit Trail</span>
                      <div className="space-y-2 text-xs">
                        {inv.auditLog.map((log) => (
                          <div key={log.id} className="flex justify-between border-b border-border/40 pb-1.5 last:border-b-0 last:pb-0">
                            <div>
                              <span className="font-semibold text-foreground">{log.action}</span>
                              <span className="text-muted-foreground ml-1">by {log.actorName}</span>
                              {log.notes && <p className="text-[11px] text-muted-foreground mt-0.5">{log.notes}</p>}
                            </div>
                            <span className="text-muted-foreground text-[10px]">{formatDate(new Date(log.timestamp))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {inv.status === 'pending' && (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="gap-1" onClick={() => approve(inv)}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => markPaid(inv)}>
                        Mark paid
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-500 hover:text-amber-600"
                        onClick={() => setDisputeInvoice(inv)}
                      >
                        Dispute
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => reject(inv)}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}

        <DisputeInvoiceDialog
          invoice={disputeInvoice}
          open={Boolean(disputeInvoice)}
          onOpenChange={(open) => !open && setDisputeInvoice(null)}
          onDispute={handleDispute}
        />
      </div>
    </div>
  )
}
