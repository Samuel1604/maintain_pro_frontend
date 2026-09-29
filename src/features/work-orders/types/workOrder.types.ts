export type { WorkOrder, WorkOrderStatus, WorkOrderPriority, Comment } from '@/types/common.types'

export interface WorkOrderFilters {
  status?: string
  priority?: string
  search?: string
  assigneeId?: string
  locationId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface CreateWorkOrderPayload {
  organizationId: string
  facilityId: string
  title: string
  description: string
  category: string
  priority: string
  locationId: string
  fulfillmentType: 'internal' | 'marketplace'
  assetId: string
  assigneeId?: string
  estimatedCost?: number
  dueDate?: string
}
