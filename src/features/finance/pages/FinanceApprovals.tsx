import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, ExternalLink, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

import { AppHeader } from '@/components/navigation/Navbar'
import { PageIntro } from '@/components/layout/PageIntro'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from '@/components/feedback/FieldError'
import { SkeletonCard } from '@/components/feedback/Skeletons'
import { useAuthStore } from '@/app/store'
import { usePortalPath } from '@/hooks/usePortal'
import { financeApprovalsService } from '../services/financeApprovals.service'
import type { WorkOrder } from '@/types/common.types'

export function FinanceApprovals() {
  const user = useAuthStore((s) => s.user)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const workOrdersPath = usePortalPath('work-orders')
  const [notesById, setNotesById] = useState<Record<string, string>>({})
  const [noteErrorById, setNoteErrorById] = useState<Record<string, string>>({})

  const loadApprovals = async () => {
    setLoading(true)
    try {
      const result = await financeApprovalsService.list()
      setWorkOrders((result.data ?? []).map((item: any) => ({
        ...item,
        id: item._id ?? item.id,
        category: item.serviceCategory ?? item.category,
        status: item.status === 'pending_completion' ? 'pending' : item.status,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })))
      setLoadError('')
    } catch { setLoadError('Unable to load finance approvals.') } finally { setLoading(false) }
  }

  useEffect(() => { void loadApprovals() }, [])

  const pending = useMemo(
    () =>
      workOrders.filter(
        (wo) =>
          wo.requiresApproval &&
          !wo.approvedAt &&
          wo.status !== 'cancelled' &&
          wo.status !== 'completed',
      ),
    [workOrders],
  )

  const handleApprove = (wo: WorkOrder) => {
    void financeApprovalsService.approve(wo.id).then(() => { toast.success(`${wo.id} approved`); void loadApprovals() }).catch(() => toast.error(`Unable to approve ${wo.id}`))
  }

  const handleReject = (wo: WorkOrder) => {
    void financeApprovalsService.reject(wo.id, notesById[wo.id] || 'Rejected by finance').then(() => { toast.success(`${wo.id} rejected`); void loadApprovals() }).catch(() => toast.error(`Unable to reject ${wo.id}`))
  }

  const handleRequestMoreInfo = (wo: WorkOrder) => {
    const note = notesById[wo.id]?.trim()
    if (!note) {
      setNoteErrorById((p) => ({ ...p, [wo.id]: 'Add a note explaining what information is needed before requesting more info' }))
      return
    }
    setNoteErrorById((p) => ({ ...p, [wo.id]: '' }))
    void financeApprovalsService.requestInformation(wo.id, note).then(() => { toast.success(`More info requested for ${wo.id}`); void loadApprovals() }).catch(() => toast.error(`Unable to request information for ${wo.id}`))
  }

  return (
    <div className="flex flex-col bg-background">
      <AppHeader
        title="Financial & Budget Approvals"
        subtitle="High-value work orders and transactions requiring finance sign-off (US-10)"
        hideQuickCreate
      />
      <div className="px-6 pt-6 lg:px-8"><PageIntro title="Financial & Budget Approvals" description="Review pending financial decisions and approve eligible maintenance expenses." /></div>
      <div className="page-body space-y-4">
        {loading ? <div role="status" aria-live="polite" className="space-y-4"><span className="sr-only">Loading approvals…</span>{Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}</div> : loadError ? <Card><CardContent className="p-8 text-center text-destructive">{loadError}</CardContent></Card> : pending.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              No work orders pending approval.
            </CardContent>
          </Card>
        ) : (
          pending.map((wo) => (
            <Card key={wo.id} className="border-border bg-card">
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{wo.id}</span>
                      <Badge variant="outline" className="capitalize">
                        {wo.priority}
                      </Badge>
                    </div>
                    <p className="font-medium">{wo.title}</p>
                    <p className="text-sm text-muted-foreground">{wo.locationName} · {wo.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Estimated cost</p>
                    <p className="flex items-center justify-end gap-1 text-lg font-semibold">
                      <DollarSign className="h-4 w-4" />
                      {(wo.estimatedCost ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{wo.description}</p>
                <Textarea
                  rows={2}
                  placeholder="Approval notes (optional for approve/reject, required for requesting more info)"
                  value={notesById[wo.id] ?? ''}
                  aria-invalid={!!noteErrorById[wo.id]}
                  aria-describedby={noteErrorById[wo.id] ? `note-error-${wo.id}` : undefined}
                  onChange={(e) => {
                    setNotesById((p) => ({ ...p, [wo.id]: e.target.value }))
                    if (noteErrorById[wo.id]) setNoteErrorById((p) => ({ ...p, [wo.id]: '' }))
                  }}
                />
                <FieldError id={`note-error-${wo.id}`} message={noteErrorById[wo.id]} />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => handleApprove(wo)}>Approve</Button>
                  <Button variant="outline" onClick={() => handleReject(wo)}>
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleRequestMoreInfo(wo)}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Request More Info
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`${workOrdersPath}/${wo.id}`} className="gap-1">
                      View details <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
