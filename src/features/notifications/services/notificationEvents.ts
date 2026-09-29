import type { Notification, NotificationType } from '@/types/common.types'
import type { UserRole } from '@/types/user.types'

let refreshHandler: (() => void) | null = null
export function registerNotificationRefresh(handler: () => void): void { refreshHandler = handler }

/** Notification creation belongs to backend domain policies. */
export function appendNotification(_userId: string, _role: UserRole, _partial: { type: NotificationType; title: string; message: string; priority?: Notification['priority']; actionUrl?: string }): void { refreshHandler?.() }
