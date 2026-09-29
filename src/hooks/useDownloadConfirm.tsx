import { useCallback, useState } from 'react'

import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'

export interface DownloadConfirmRequest {
  title: string
  description: string
  confirmLabel?: string
  onDownload: () => void
}

export function useDownloadConfirm() {
  const [pending, setPending] = useState<DownloadConfirmRequest | null>(null)

  const requestDownload = useCallback((request: DownloadConfirmRequest) => {
    setPending(request)
  }, [])

  const DownloadConfirmDialog = (
    <ConfirmDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) setPending(null)
      }}
      title={pending?.title ?? 'Download file?'}
      description={pending?.description ?? 'This file will be saved to your device.'}
      confirmLabel={pending?.confirmLabel ?? 'Download'}
      onConfirm={() => {
        pending?.onDownload()
        setPending(null)
      }}
    />
  )

  return { requestDownload, DownloadConfirmDialog }
}
