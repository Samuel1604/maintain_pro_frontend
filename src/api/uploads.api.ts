import { apiClient } from './client'

export interface UploadedFile { id: string; secureUrl: string; url: string; originalName: string; mimeType?: string; size?: number; category?: string }

/** Identifies the owner of an uploaded image so branding cannot reuse a user avatar. */
export type UploadPurpose =
  | 'profile-avatar'
  | 'organization-logo'
  | 'vendor-logo'
  | 'work-order-attachment'
  | 'service-request-attachment'
  | 'contract-document'
  | 'asset-import'
  | 'general-attachment'

export interface UploadOptions {
  purpose: UploadPurpose
  facilityId?: string
  onProgress?: (percent: number) => void
}

const MAX_FILE_SIZE = 50 * 1024 * 1024
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])

function validateFile(file: File) {
  if (!file || file.size === 0) throw new Error('Select a non-empty file.')
  if (file.size > MAX_FILE_SIZE) throw new Error('Files must be 50MB or smaller.')
  if (file.type.startsWith('image/') && file.size > MAX_IMAGE_SIZE) throw new Error('Images must be 10MB or smaller.')
  if (!file.type || (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/') && !file.type.startsWith('text/') && !file.type.startsWith('application/'))) {
    throw new Error('This file type is not supported.')
  }
  if (file.type.startsWith('image/') && !imageTypes.has(file.type)) throw new Error('This image type is not supported.')
}

export async function uploadFile(file: File, options: UploadOptions): Promise<UploadedFile> {
  validateFile(file)
  const body = new FormData()
  body.append('file', file)
  body.append('purpose', options.purpose)
  if (options.facilityId) body.append('facilityId', options.facilityId)
  return apiClient.post<UploadedFile>('/uploads', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total && options.onProgress) options.onProgress(Math.round((event.loaded / event.total) * 100))
    },
  })
}

export const uploadImage = (file: File, purpose: Extract<UploadPurpose, 'profile-avatar' | 'organization-logo' | 'vendor-logo'>) => uploadFile(file, { purpose })
