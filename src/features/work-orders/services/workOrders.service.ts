import { httpClient } from '@/api/httpClient'
import { ENDPOINTS } from '@/api/endpoints'
import type { WorkOrder } from '@/types/common.types'
import type { CreateWorkOrderPayload, WorkOrderFilters } from '../types/workOrder.types'
import type { PaginatedResponse } from '@/types/api.types'

interface BackendWorkOrder { _id: string; title: string; description: string; priority: WorkOrder['priority']; serviceCategory: string; status: WorkOrder['status']; sourceType?: WorkOrder['sourceType']; facilityId: string; locationId?: string; assetId: string; assignedTechnicianId?: string; dueDate?: string; createdAt: string; updatedAt: string; fulfillmentType: string }
interface BackendWorkOrderPage { data: BackendWorkOrder[]; pagination: { page: number; limit: number; total: number; pages: number } }
export function mapWorkOrder(item: BackendWorkOrder): WorkOrder {
  const hasTechnician = Boolean(item.assignedTechnicianId)
  const rawStatus = item.status as WorkOrder['status']
  const status = !hasTechnician && ['assigned', 'in_progress'].includes(rawStatus)
    ? 'open'
    : hasTechnician && rawStatus === 'open'
      ? 'assigned'
      : rawStatus
  return { id: item._id, sourceType: item.sourceType, title: item.title, description: item.description, type: item.sourceType === 'preventive_maintenance' ? 'preventive' : 'reactive', status, priority: item.priority, category: item.serviceCategory, facilityId: item.facilityId, locationId: item.locationId ?? '', locationName: '', assetId: item.assetId, requesterId: '', requesterName: '', assigneeId: item.assignedTechnicianId, dueDate: item.dueDate ? new Date(item.dueDate) : undefined, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) }
}

export const workOrdersService = {
  list: async (filters?: WorkOrderFilters) => { const result = await httpClient.get<BackendWorkOrderPage>(ENDPOINTS.WORK_ORDERS.LIST, { params: filters as Record<string, string | number | boolean> }); return { data: result.data.map(mapWorkOrder), total: result.pagination.total, page: result.pagination.page, pageSize: result.pagination.limit, totalPages: result.pagination.pages } satisfies PaginatedResponse<WorkOrder> },

  listForVendor: async (filters?: WorkOrderFilters) => { const result = await httpClient.get<BackendWorkOrderPage>(ENDPOINTS.WORK_ORDERS.VENDOR_ASSIGNED, { params: filters as Record<string, string | number | boolean> }); return { data: result.data.map(mapWorkOrder), total: result.pagination.total, page: result.pagination.page, pageSize: result.pagination.limit, totalPages: result.pagination.pages } satisfies PaginatedResponse<WorkOrder> },
  listMarketplace: async (filters?: WorkOrderFilters) => {
    const result = await httpClient.get<BackendWorkOrderPage>(ENDPOINTS.WORK_ORDERS.MARKETPLACE_OPEN, { params: filters as Record<string, string | number | boolean> });
    return { data: result.data.map(mapWorkOrder), total: result.pagination.total, page: result.pagination.page, pageSize: result.pagination.limit, totalPages: result.pagination.pages } satisfies PaginatedResponse<WorkOrder>
  },

  getById: async (id: string) => mapWorkOrder(await httpClient.get<BackendWorkOrder>(ENDPOINTS.WORK_ORDERS.DETAIL(id))),

  create: async (payload: CreateWorkOrderPayload) => mapWorkOrder(await httpClient.post<BackendWorkOrder>(ENDPOINTS.WORK_ORDERS.CREATE, {
      ...payload,
      serviceCategory: payload.category,
      category: undefined,
      technicianId: payload.assigneeId,
      assigneeId: undefined,
    })),

  update: async (id: string, payload: Partial<WorkOrder> & { dueDate?: Date }) => mapWorkOrder(await httpClient.patch<BackendWorkOrder>(ENDPOINTS.WORK_ORDERS.UPDATE(id), {
      ...payload,
      dueDate: payload.dueDate?.toISOString(),
      serviceCategory: payload.category,
      category: undefined,
      assigneeId: undefined,
      estimatedCost: undefined,
    })),

  delete: (id: string) => httpClient.delete<void>(ENDPOINTS.WORK_ORDERS.DELETE(id)),

  assign: async (id: string, technicianId: string) => mapWorkOrder(await httpClient.post<BackendWorkOrder>(ENDPOINTS.WORK_ORDERS.ASSIGN(id), { technicianId })),

  vendorCandidates: (id: string) => httpClient.get<{ data: Array<{ vendorId: string; name: string; serviceCategories: string[]; distanceKm: number; averageRating: number; completedJobs: number }>; pagination: { page: number; limit: number; total: number; pages: number } }>(ENDPOINTS.WORK_ORDERS.VENDOR_CANDIDATES(id)),

  technicianCandidates: (id: string) => httpClient.get<{ data: Array<{ id: string; name: string; email: string }> }>(ENDPOINTS.WORK_ORDERS.TECHNICIAN_CANDIDATES(id)),

  transition: async (id: string, status: 'in_progress' | 'on_hold' | 'pending_completion') => mapWorkOrder(await httpClient.post<BackendWorkOrder>(ENDPOINTS.WORK_ORDERS.TRANSITION(id), { status })),
  vendorAccept: async (id: string, _proposedSchedule?: string) =>
    mapWorkOrder(await httpClient.post<BackendWorkOrder>(ENDPOINTS.WORK_ORDERS.VENDOR_ACCEPT(id), _proposedSchedule ? { proposedSchedule: _proposedSchedule } : {})),
  vendorReject: async (id: string, _reason: string) =>
    mapWorkOrder(await httpClient.post<BackendWorkOrder>(ENDPOINTS.WORK_ORDERS.VENDOR_REJECT(id), { reason: _reason })),
  submitInvoice: (id: string, input: { invoiceNumber: string; amount: number; currency?: string }) =>
    httpClient.post(ENDPOINTS.WORK_ORDERS.INVOICE(id), input),
  attachments: (id: string) =>
    httpClient.get<Array<Record<string, unknown>>>(ENDPOINTS.WORK_ORDERS.ATTACHMENTS(id)),
  addAttachment: (id: string, uploadId: string) =>
    httpClient.post<Record<string, unknown>>(ENDPOINTS.WORK_ORDERS.ATTACHMENTS(id), { uploadId }),
  removeAttachment: (id: string, attachmentId: string) =>
    httpClient.delete<void>(`${ENDPOINTS.WORK_ORDERS.ATTACHMENTS(id)}/${attachmentId}`),
  timeLogs: (id: string) => httpClient.get<Array<Record<string, unknown>>>(ENDPOINTS.WORK_ORDERS.TIME_LOG(id)),
  addTimeLog: (id: string, input: { hours: number; note?: string; startedAt?: string; endedAt?: string }) =>
    httpClient.post<Record<string, unknown>>(ENDPOINTS.WORK_ORDERS.TIME_LOG(id), input),
  parts: (id: string) => httpClient.get<Array<Record<string, unknown>>>(ENDPOINTS.WORK_ORDERS.PARTS(id)),
  addPart: (id: string, input: { name: string; sku?: string; quantity: number; inventoryItemId?: string }) =>
    httpClient.post<Record<string, unknown>>(ENDPOINTS.WORK_ORDERS.PARTS(id), input),

  comments: (id: string) => httpClient.get<Array<{ _id: string; authorId: string; content: string; createdAt: string; updatedAt: string }>>(ENDPOINTS.WORK_ORDERS.COMMENTS(id)),

  addComment: (id: string, content: string) => httpClient.post<{ _id: string; authorId: string; content: string; createdAt: string; updatedAt: string }>(ENDPOINTS.WORK_ORDERS.COMMENTS(id), { content }),
  activity: (id: string) => httpClient.get<Array<{ _id: string; action: string; outcome: string; createdAt: string; metadata?: Record<string, unknown> }>>(ENDPOINTS.WORK_ORDERS.ACTIVITY(id)),
}
