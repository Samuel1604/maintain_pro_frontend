import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { workOrdersService } from '@/features/work-orders/services/workOrders.service'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WorkOrder, WorkOrderPriority } from '@/types/common.types'

const CATEGORIES = [
  'HVAC',
  'Electrical',
  'Plumbing',
  'Elevator',
  'Structural',
  'Safety',
  'Security',
  'Cleaning',
  'Other',
]

const PRIORITIES: WorkOrderPriority[] = ['critical', 'high', 'medium', 'low']

interface EditWorkOrderDialogProps {
  workOrder: WorkOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: (workOrder: WorkOrder) => void
}

export function EditWorkOrderDialog({
  workOrder,
  open,
  onOpenChange,
  onSaved,
}: EditWorkOrderDialogProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '' as WorkOrderPriority | '',
    dueDate: '',
  })

  useEffect(() => {
    if (!workOrder || !open) return
    setForm({
      title: workOrder.title,
      description: workOrder.description,
      category: workOrder.category.toLowerCase(),
      priority: workOrder.priority,
      dueDate: workOrder.dueDate ? workOrder.dueDate.toISOString().slice(0, 10) : '',
    })
  }, [workOrder, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workOrder) return
    setSaving(true)
    try {
      const updated = await workOrdersService.update(workOrder.id, {
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority || undefined,
        dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
      })
      toast.success(`${workOrder.id} updated`)
      onSaved?.(updated)
      onOpenChange(false)
    } catch {
      toast.error('Unable to update the work order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit work order</DialogTitle>
          <DialogDescription>
            {workOrder ? `Update details for ${workOrder.id}` : 'Update work order details'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wo-edit-title">Title</Label>
            <Input
              id="wo-edit-title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wo-edit-desc">Description</Label>
            <Textarea
              id="wo-edit-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c.toLowerCase()}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((p) => ({ ...p, priority: v as WorkOrderPriority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wo-edit-due-date">Due date</Label>
            <Input id="wo-edit-due-date" type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.title || !form.description}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
