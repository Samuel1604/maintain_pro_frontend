import { httpClient } from '@/api/httpClient'
import { ENDPOINTS } from '@/api/endpoints'
import type { PaginatedResponse } from '@/types/api.types'

export interface ServiceRequestRecord { id: string; organizationId: string; facilityId: string; facilityName?: string; locationId: string; locationName?: string; assetId: string; assetName?: string; requestedBy: string; requesterName?: string; title: string; description: string; priority: 'low' | 'medium' | 'high' | 'critical'; serviceCategory: string; status: 'pending' | 'approved' | 'rejected'; workOrderId?: string; approvalDecision?: 'approved' | 'rejected'; rejectionReason?: string; createdAt: string; updatedAt: string }
interface ApiPage { data: ServiceRequestRecord[]; pagination: { page: number; limit: number; total: number; pages: number } }
export interface CreateServiceRequestInput { organizationId: string; facilityId: string; locationId: string; assetId: string; title: string; description: string; priority: ServiceRequestRecord['priority']; serviceCategory: string; attachments?: string[]; sourceWorkOrderId?: string }

export const serviceRequestsService = {
  async list(params?: { page?: number; limit?: number; status?: ServiceRequestRecord['status']; from?: string; to?: string }): Promise<PaginatedResponse<ServiceRequestRecord>> { const result = await httpClient.get<ApiPage>(ENDPOINTS.SERVICE_REQUESTS.LIST, { params: params as Record<string, string | number | boolean> }); return { data: result.data, total: result.pagination.total, page: result.pagination.page, pageSize: result.pagination.limit, totalPages: Math.max(1, result.pagination.pages) } },
  create: (input: CreateServiceRequestInput) => httpClient.post<ServiceRequestRecord>(ENDPOINTS.SERVICE_REQUESTS.CREATE, input),
  getById: (id: string) => httpClient.get<ServiceRequestRecord>(ENDPOINTS.SERVICE_REQUESTS.DETAIL(id)),
  update: (id: string, input: Partial<Pick<ServiceRequestRecord, 'title' | 'description' | 'priority' | 'serviceCategory'>>) => httpClient.patch<ServiceRequestRecord>(ENDPOINTS.SERVICE_REQUESTS.UPDATE(id), input),
  approve: (id: string, fulfillmentType: 'internal' | 'marketplace', technicianId?: string) => httpClient.post<{ serviceRequest: ServiceRequestRecord; workOrder: { _id: string } }>(ENDPOINTS.SERVICE_REQUESTS.APPROVE(id), { fulfillmentType, technicianId }),
  reject: (id: string, rejectionReason: string) => httpClient.post<ServiceRequestRecord>(ENDPOINTS.SERVICE_REQUESTS.REJECT(id), { rejectionReason }),
  rate: (id: string, rating: number, comment?: string) => httpClient.post<ServiceRequestRecord>(ENDPOINTS.SERVICE_REQUESTS.RATE(id), { rating, comment }),
  attachments: (id: string) => httpClient.get<Array<Record<string, unknown>>>(ENDPOINTS.SERVICE_REQUESTS.ATTACHMENTS(id)),
  addAttachment: (id: string, uploadId: string) => httpClient.post<Record<string, unknown>>(ENDPOINTS.SERVICE_REQUESTS.ATTACHMENTS(id), { uploadId }),
}
