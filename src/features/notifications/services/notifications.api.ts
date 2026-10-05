import { apiClient } from "@/api/client";

export interface BackendNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: "low" | "normal" | "high" | "critical";
  isRead: boolean;
  readAt?: string;
  resourceType?: string;
  resourceId?: string;
  createdAt: string;
}
export interface NotificationPage {
  data: BackendNotification[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
export interface NotificationPreferences {
  channels: Record<string, { inApp: boolean; email: boolean; push: boolean; sms: boolean }>;
  quietHours?: { enabled: boolean; start: string; end: string };
}
export interface EscalationRule {
  id: string;
  name: string;
  triggerHours: number;
  priority: "low" | "medium" | "high" | "critical";
  escalateTo: string;
  method: string[];
  level: number;
  isActive: boolean;
}
export const notificationsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    unread?: boolean;
    type?: string;
    priority?: string;
  }) => apiClient.get<NotificationPage>("/notifications", { params }),
  unreadCount: () => apiClient.get<{ count: number }>("/notifications/unread-count"),
  markRead: (id: string) => apiClient.post<BackendNotification>(`/notifications/${id}/read`, {}),
  markAllRead: () => apiClient.post<null>("/notifications/read-all", {}),
  getPreferences: () => apiClient.get<NotificationPreferences>("/notifications/preferences"),
  updatePreferences: (payload: Partial<NotificationPreferences>) =>
    apiClient.patch<NotificationPreferences>("/notifications/preferences", payload),
  listEscalationRules: () => apiClient.get<EscalationRule[]>("/notifications/escalation-rules"),
  createEscalationRule: (payload: Omit<EscalationRule, "id">) =>
    apiClient.post<EscalationRule>("/notifications/escalation-rules", payload),
  updateEscalationRule: (id: string, payload: Partial<Omit<EscalationRule, "id">>) =>
    apiClient.patch<EscalationRule>(`/notifications/escalation-rules/${id}`, payload),
  deleteEscalationRule: (id: string) =>
    apiClient.delete<null>(`/notifications/escalation-rules/${id}`),
};
