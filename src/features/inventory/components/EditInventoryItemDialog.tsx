import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { inventoryService } from '../services/inventory.service'
import type { InventoryCategory, InventoryItemRecord } from '../services/inventory.service'
import { facilitiesApi } from '@/features/facilities/api/facilities.api'
import { locationsApi } from '@/features/locations/api/locations.api'

interface EditInventoryItemDialogProps {
  item: InventoryItemRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function EditInventoryItemDialog({ item, open, onOpenChange, onSaved }: EditInventoryItemDialogProps) {
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string }>>([])
  const [locations, setLocations] = useState<Array<{ id: string; name: string; facilityId: string }>>([])
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: '',
    minStock: '',
    unitPrice: '',
    supplier: '',
    facilityId: '',
    locationId: '',
  })

  useEffect(() => {
    if (!item || !open) return
    setForm({
      name: item.name,
      sku: item.sku,
      category: item.categoryId ?? '',
      quantity: '',
      minStock: String(item.minimumStockLevel),
      unitPrice: '',
      supplier: '',
      facilityId: item.facilityId ?? '',
      locationId: item.locationId ?? '',
    })
  }, [item, open])

  useEffect(() => {
    if (!open) return
    void Promise.all([inventoryService.categories(), facilitiesApi.list({ limit: 100 }), locationsApi.list()]).then(([nextCategories, facilityResponse, nextLocations]) => { setCategories(nextCategories); setFacilities(facilityResponse.data); setLocations(nextLocations); if (facilityResponse.data.length === 1) setForm((current) => ({ ...current, facilityId: facilityResponse.data[0].id })) }).catch(() => undefined)
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return
    if (!form.facilityId || !form.locationId) { toast.error('Facility and location are required.'); return }
    setSaving(true)
    try {
      await inventoryService.updateItem(item.id ?? item._id!, { name: form.name, sku: form.sku, facilityId: form.facilityId, locationId: form.locationId, ...(form.category && form.category !== 'uncategorized' ? { categoryId: form.category } : {}), minimumStockLevel: Number(form.minStock), reorderLevel: Number(form.minStock) })
      toast.success(`${item.name} updated`)
      onSaved?.()
      onOpenChange(false)
    } catch { toast.error('Unable to update inventory item') } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-3xl w-[calc(100vw-2rem)] !h-[calc(100dvh-2rem)] !max-h-[calc(100dvh-2rem)] overflow-y-auto bg-card border-border p-6">
        <DialogHeader>
          <DialogTitle>Edit inventory item</DialogTitle>
          <p className="text-sm text-muted-foreground">Update the item details and replenishment thresholds.</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label>Facility *</Label><Select value={form.facilityId} onValueChange={(value) => setForm((p) => ({ ...p, facilityId: value, locationId: '' }))}><SelectTrigger><SelectValue placeholder="Select facility" /></SelectTrigger><SelectContent>{facilities.map((facility) => <SelectItem key={facility.id} value={facility.id}>{facility.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><Label>Location *</Label><Select value={form.locationId} onValueChange={(value) => setForm((p) => ({ ...p, locationId: value }))}><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger><SelectContent>{locations.filter((location) => !form.facilityId || location.facilityId === form.facilityId).map((location) => <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>)}</SelectContent></Select></div></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Qty</Label>
              <Input type="number" min={0} value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Min stock</Label>
              <Input type="number" min={0} value={form.minStock} onChange={(e) => setForm((p) => ({ ...p, minStock: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Unit price</Label>
              <Input type="number" min={0} step="0.01" value={form.unitPrice} onChange={(e) => setForm((p) => ({ ...p, unitPrice: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Supplier</Label>
            <Input value={form.supplier} onChange={(e) => setForm((p) => ({ ...p, supplier: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
