import { httpClient } from '@/api/httpClient'
import { ENDPOINTS } from '@/api/endpoints'
import type { WorkOrder } from '@/types/common.types'

export const financeApprovalsService = {
  list: () => httpClient.get<{ data: WorkOrder[]; pagination: { total: number } }>(ENDPOINTS.WORK_ORDERS.FINANCE_PENDING),
  approve: (id: string) => httpClient.post<WorkOrder>(ENDPOINTS.WORK_ORDERS.COMPLETION_APPROVE(id), {}),
  reject: (id: string, rejectionReason: string) => httpClient.post<WorkOrder>(ENDPOINTS.WORK_ORDERS.COMPLETION_REJECT(id), { rejectionReason }),
  requestInformation: (id: string, note: string) => httpClient.post<WorkOrder>(ENDPOINTS.WORK_ORDERS.COMPLETION_REQUEST_INFORMATION(id), { note }),
}
