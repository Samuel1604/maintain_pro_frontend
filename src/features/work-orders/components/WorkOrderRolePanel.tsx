import { useState } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  Camera,
  Clock,
  DollarSign,
  FileText,
  Play,
  AlertTriangle,
} from 'lucide-react'

import { PORTALS } from '@/app/portal.config'
import { useAuthStore } from '@/app/store'
import { usePortal } from '@/hooks/usePortal'
import { useRoleAccess } from '@/hooks/useRoleAccess'
import { useActionConfirm } from '@/hooks/useActionConfirm'
import { appendNotification } from '@/features/notifications/services/notificationEvents'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from '@/components/feedback/FieldError'
import { workOrdersService } from '@/features/work-orders/services/workOrders.service'
import type { WorkOrder } from '@/types/common.types'
import { USER_ROLES } from '@/types/user.types'
import { uploadFile } from '@/api/uploads.api'
import { serviceRequestsService } from '@/features/service-requests/services/serviceRequests.service'

interface WorkOrderRolePanelProps {
  workOrder: WorkOrder
  onWorkOrderUpdated: (updated: WorkOrder) => void
}

export function WorkOrderRolePanel({ workOrder, onWorkOrderUpdated }: WorkOrderRolePanelProps) {
  const portal = usePortal()
  const user = useAuthStore((s) => s.user)
  const { role, isMaintenanceReadOnly } = useRoleAccess()
  const updateWorkOrder = async (id: string, changes: Partial<WorkOrder>) => {
    if (changes.status === 'in_progress' || changes.status === 'pending_completion' || changes.status === 'on_hold') {
      const targetStatus: 'in_progress' | 'pending_completion' | 'on_hold' = changes.status
      const updated = await workOrdersService.transition(id, targetStatus)
      onWorkOrderUpdated(updated)
      return updated
    }
    const updated = await workOrdersService.update(id, {
      ...changes,
      dueDate: changes.dueDate,
    })
    onWorkOrderUpdated(updated)
    return updated
  }
  const notifyUpdate = (promise: Promise<WorkOrder>, message: string, after?: (updated: WorkOrder) => void) => {
    void promise.then((updated) => { after?.(updated); toast.success(message) }).catch((cause) => {
      toast.error(cause instanceof Error ? cause.message : 'Unable to update work order')
    })
  }
  const { requestConfirm, ActionConfirmDialog } = useActionConfirm()

  const [rejectReason, setRejectReason] = useState('')
  const [rejectReasonError, setRejectReasonError] = useState<string | null>(null)
  const [proposedDate, setProposedDate] = useState('')
  const [completionNotes, setCompletionNotes] = useState('')
  const [timeSpent, setTimeSpent] = useState('')
  const [partsUsed, setPartsUsed] = useState('')
  const [invoiceAmount, setInvoiceAmount] = useState(
    String(workOrder.estimatedCost ?? workOrder.actualCost ?? ''),
  )
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [approvalNotes, setApprovalNotes] = useState('')
  const [issueForm, setIssueForm] = useState({
    title: '',
    category: workOrder.category,
    description: '',
    priority: workOrder.priority,
  })
  const [issueFormErrors, setIssueFormErrors] = useState<{ title?: string; description?: string }>({})

  const isVendor =
    portal === PORTALS.VENDOR && user?.id === workOrder.assigneeId
  const isTech =
    portal === PORTALS.ORG &&
    role === USER_ROLES.TECHNICIAN &&
    user?.id === workOrder.assigneeId
  const isFinance = portal === PORTALS.ORG && role === USER_ROLES.FINANCE
  const needsApproval =
    isFinance &&
    workOrder.requiresApproval &&
    !workOrder.approvedAt &&
    workOrder.status !== 'cancelled'

  const notifyManager = (title: string, message: string) => {
    appendNotification('user-1', USER_ROLES.FACILITY_MANAGER, {
      type: 'work_order',
      title,
      message,
      priority: 'high',
      actionUrl: `work-orders/${workOrder.id}`,
    })
  }

  if (workOrder.requiresApproval && !workOrder.approvedAt && workOrder.status !== 'cancelled') {
    if (isFinance) {
      return (
        <>
          {ActionConfirmDialog}
          <Card className="border-amber-400/30 bg-amber-400/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Approval required (US-10)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Estimated cost:{' '}
                <strong>${(workOrder.estimatedCost ?? 0).toLocaleString()}</strong> — exceeds
                approval threshold.
              </p>
              <Textarea
                rows={2}
                placeholder="Approval notes (optional)"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    notifyUpdate(updateWorkOrder(workOrder.id, {
                      approvedAt: new Date(),
                      approvedBy: user?.email,
                      approvalNotes,
                      requiresApproval: false,
                    }), 'Work order approved')
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    notifyUpdate(updateWorkOrder(workOrder.id, {
                      status: 'cancelled',
                      rejectionReason: approvalNotes || 'Rejected by finance',
                    }), 'Work order rejected')
                  }}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )
    }

    // Block both technician and vendor if work order requires approval but is not yet approved
    if (isTech || isVendor || isMaintenanceReadOnly) {
      return (
        <Card className="border-border bg-muted/30">
          <CardContent className="p-4 text-sm text-muted-foreground">
            <Clock className="mb-2 h-4 w-4" />
            Pending finance approval before work can proceed.
          </CardContent>
        </Card>
      )
    }
  }

  if (isVendor) {
    const pending =
      workOrder.vendorOfferStatus === 'pending_acceptance' ||
      (workOrder.status === 'assigned' && !workOrder.vendorOfferStatus)

    return (
      <>
        {ActionConfirmDialog}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vendor job response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pending ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Accept this assignment or decline with a reason. You can propose a scheduled
                  date after accepting.
                </p>
                <div className="space-y-2">
                  <Label>Proposed date (optional)</Label>
                  <Input
                    type="date"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Decline reason</Label>
                  <Textarea
                    rows={2}
                    placeholder="Required if declining"
                    value={rejectReason}
                    onChange={(e) => {
                      setRejectReason(e.target.value)
                      if (rejectReasonError) setRejectReasonError(null)
                    }}
                    aria-invalid={!!rejectReasonError}
                  />
                  <FieldError message={rejectReasonError} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="gap-2"
                    onClick={() => {
                      notifyUpdate(workOrdersService.vendorAccept(workOrder.id, proposedDate || undefined), 'Job accepted', () => notifyManager('Vendor accepted job', `${workOrder.id} accepted by vendor`))
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Accept job
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 text-destructive"
                    onClick={() => {
                      if (!rejectReason.trim()) {
                        setRejectReasonError('Provide a decline reason')
                        return
                      }
                      notifyUpdate(workOrdersService.vendorReject(workOrder.id, rejectReason), 'Job declined')
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </>
            ) : null}

            {workOrder.vendorOfferStatus === 'accepted' ||
            workOrder.status === 'in_progress' ? (
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-sm font-medium">Complete job & invoice (US-07)</p>
                <div className="space-y-2">
                  <Label>Work notes</Label>
                  <Textarea
                    rows={3}
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Summary of work performed"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Invoice #</Label>
                    <Input
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="INV-XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={() =>
                    requestConfirm({
                      title: 'Mark complete & submit invoice?',
                      description: 'Completes the work order and submits invoice for finance review.',
                      confirmLabel: 'Submit',
                      onConfirm: () => {
                        const amount = Number(invoiceAmount) || 0
                        notifyUpdate(workOrdersService.transition(workOrder.id, 'pending_completion').then((updated) => workOrdersService.submitInvoice(workOrder.id, { invoiceNumber: invoiceNumber || `INV-${workOrder.id}`, amount, currency: 'NGN' }).then(() => updated)), 'Job completed and invoice submitted', () => {
                          appendNotification('user-3', USER_ROLES.FINANCE, {
                            type: 'approval',
                            title: 'Vendor invoice submitted',
                            message: `${workOrder.id} — $${amount.toLocaleString()} pending verification`,
                            actionUrl: 'invoices',
                          })
                        })
                      },
                    })
                  }
                >
                  <FileText className="h-4 w-4" />
                  Complete & submit invoice
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </>
    )
  }

  if (isTech) {
    return (
      <>
        {ActionConfirmDialog}
        <Card className="border-border bg-card lg:hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Field work (US-04)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-2"
                disabled={workOrder.status === 'in_progress'}
                onClick={() => {
                  notifyUpdate(updateWorkOrder(workOrder.id, { status: 'in_progress' }), 'Work started')
                }}
              >
                <Play className="h-4 w-4" />
                Start work
              </Button>
              <Button
                className="gap-2"
                disabled={workOrder.status === 'completed'}
                onClick={() =>
                  requestConfirm({
                    title: 'Complete work order?',
                    description: 'Mark this job as completed with your notes and time.',
                    confirmLabel: 'Complete',
                    onConfirm: () => {
                      const complete = async () => {
                        if (timeSpent && Number(timeSpent) > 0) await workOrdersService.addTimeLog(workOrder.id, { hours: Number(timeSpent), note: completionNotes || undefined })
                        const updated = await workOrdersService.transition(workOrder.id, 'pending_completion')
                        onWorkOrderUpdated(updated)
                        return updated
                      }
                      notifyUpdate(complete(), 'Work order submitted for completion')
                    },
                  })
                }
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Time spent (hrs)</Label>
                <Input
                  type="number"
                  step="0.25"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Parts cost ($)</Label>
                <Input
                  type="number"
                  value={partsUsed}
                  onChange={(e) => setPartsUsed(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Completion notes</Label>
              <Textarea
                rows={2}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                id="tech-photo-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      requestConfirm({
                        title: 'Add photo?',
                        description: 'Attach the selected photo to this work order.',
                        confirmLabel: 'Attach',
                        onConfirm: () => notifyUpdate((async () => {
                          const uploaded = await uploadFile(file, { purpose: 'work-order-attachment', facilityId: workOrder.facilityId })
                          await workOrdersService.addAttachment(workOrder.id, uploaded.id)
                          return workOrder
                        })(), 'Photo attached'),
                      })
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  document.getElementById('tech-photo-upload')?.click()
                }}
              >
                <Camera className="h-4 w-4" />
                Upload photo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Report new issue (US-05)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Issue title"
              value={issueForm.title}
              onChange={(e) => {
                setIssueForm((p) => ({ ...p, title: e.target.value }))
                if (issueFormErrors.title) setIssueFormErrors((p) => ({ ...p, title: undefined }))
              }}
              aria-invalid={!!issueFormErrors.title}
            />
            <FieldError message={issueFormErrors.title} />
            <Textarea
              rows={2}
              placeholder="Describe the issue found"
              value={issueForm.description}
              onChange={(e) => {
                setIssueForm((p) => ({ ...p, description: e.target.value }))
                if (issueFormErrors.description) setIssueFormErrors((p) => ({ ...p, description: undefined }))
              }}
              aria-invalid={!!issueFormErrors.description}
            />
            <FieldError message={issueFormErrors.description} />
            <Button
              size="sm"
              onClick={() => {
                const nextErrors: { title?: string; description?: string } = {}
                if (!issueForm.title.trim()) nextErrors.title = 'Issue title is required'
                if (!issueForm.description.trim()) nextErrors.description = 'Description is required'
                setIssueFormErrors(nextErrors)
                if (Object.keys(nextErrors).length > 0) return
                const report = serviceRequestsService.create({ organizationId: user?.organizationId ?? '', facilityId: workOrder.facilityId ?? '', locationId: workOrder.locationId ?? '', assetId: workOrder.assetId ?? '', title: issueForm.title, description: `${issueForm.description}\n\nLinked to ${workOrder.id}`, priority: issueForm.priority, serviceCategory: issueForm.category, sourceWorkOrderId: workOrder.id }).then(() => workOrder)
                notifyUpdate(report, 'Issue reported — manager notified', () => notifyManager('Issue reported from field', issueForm.title))
                setIssueForm({ title: '', category: workOrder.category, description: '', priority: workOrder.priority })
              }}
            >
              Submit issue
            </Button>
          </CardContent>
        </Card>
      </>
    )
  }

  return null
}
