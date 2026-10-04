import { useCallback, useState } from 'react'

import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'

export interface ActionConfirmRequest {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  /** Show only the primary button (for acknowledgements). */
  singleAction?: boolean
  onConfirm: () => void
  warning?: string
}

export function useActionConfirm() {
  const [pending, setPending] = useState<ActionConfirmRequest | null>(null)

  const requestConfirm = useCallback((request: ActionConfirmRequest) => {
    setPending(request)
  }, [])

  const ActionConfirmDialog = (
    <ConfirmDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) setPending(null)
      }}
      title={pending?.title ?? 'Confirm'}
      description={pending?.description ?? ''}
      confirmLabel={pending?.confirmLabel ?? 'Continue'}
      cancelLabel={pending?.cancelLabel}
      destructive={pending?.destructive}
      singleAction={pending?.singleAction}
      onConfirm={() => {
        pending?.onConfirm()
        setPending(null)
      }}
      warning={pending?.warning}
    />
  )

  return { requestConfirm, ActionConfirmDialog }
}
