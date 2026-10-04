import { Building, Mail, Phone, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate } from '@/utils/formatDate'
import type { Vendor } from '@/types/common.types'

interface ViewVendorDialogProps {
  vendor: Vendor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: () => void
}

export function ViewVendorDialog({ vendor, open, onOpenChange, onEdit }: ViewVendorDialogProps) {
  if (!vendor) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            {vendor.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">{vendor.status}</Badge>
            <Badge variant="secondary">{vendor.category}</Badge>
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              {vendor.rating.toFixed(1)}
            </span>
          </div>
          <div className="space-y-2 text-muted-foreground">
            {vendor.contactPerson && <p>Contact: <span className="text-foreground">{vendor.contactPerson}</span></p>}
            <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{vendor.email}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{vendor.phone}</p>
          </div>
          {vendor.serviceCategories?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Services</p>
              <div className="flex flex-wrap gap-1">
                {vendor.serviceCategories.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
          )}
          {vendor.contractEnd && (
            <p className="text-muted-foreground">
              Contract ends: <span className="text-foreground">{formatDate(vendor.contractEnd)}</span>
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {onEdit && <Button onClick={onEdit}>Edit vendor</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
