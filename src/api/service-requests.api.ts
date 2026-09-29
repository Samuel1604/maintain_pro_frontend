import { apiClient } from './client';
export type ServiceRequestStatus = 'pending' | 'approved' | 'rejected';
export interface ServiceRequestRecord { id: string; title: string; description: string; serviceCategory: string; priority: 'low' | 'medium' | 'high' | 'critical'; status: ServiceRequestStatus; workOrderId?: string; createdAt: string; updatedAt: string }
export interface ServiceRequestPage { data: ServiceRequestRecord[]; pagination: { page: number; limit: number; total: number; pages: number } }
export const serviceRequestsApi = { list: (params?: { page?: number; limit?: number; from?: string; to?: string; status?: ServiceRequestStatus }) => apiClient.get<ServiceRequestPage>('/service-requests', { params }) };
