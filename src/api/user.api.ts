import { apiClient } from './client'
import type { User } from '@/types/user.types'

export const userApi = {
  updateMe: (payload: Partial<User>) => apiClient.patch<User>('/users/me', payload),
}
