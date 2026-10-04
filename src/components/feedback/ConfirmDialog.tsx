import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/utils/helpers'
import { CircleX } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  /** When true, only the primary button is shown (acknowledgement dialogs). */
  singleAction?: boolean
  onConfirm: () => void
  warning?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  singleAction = false,
  onConfirm,
  warning,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md overflow-hidden rounded-xl border-border bg-card p-0 shadow-2xl">
        <AlertDialogHeader className="items-center px-6 pb-0 pt-6 text-center">
          {destructive && (
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <CircleX className="h-6 w-6" />
            </div>
          )}
          <AlertDialogTitle className="text-xl font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="max-w-sm text-center leading-5">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {warning && (
          <div className="mx-6 mt-4 rounded-lg bg-destructive/10 px-3 py-3 text-left text-xs leading-4 text-destructive font-medium">
            {warning}
          </div>
        )}
        <AlertDialogFooter className="mt-5 border-t border-border px-6 py-4 sm:justify-between">
          {!singleAction ? <AlertDialogCancel>{cancelLabel}</AlertDialogCancel> : null}
          <AlertDialogAction
            className={cn(destructive && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
