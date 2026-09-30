import { apiClient } from "@/api/client";
import type {
  CreatePreventiveMaintenancePayload,
  PMAssignment,
  PMOccurrenceRecord,
  PreventiveMaintenanceRecord,
} from "../types/preventiveMaintenance.types";
export interface PMListParams {
  page?: number;
  limit?: number;
  status?: string;
  occurrenceStatus?: string;
  assetId?: string;
  facilityId?: string;
  locationId?: string;
  from?: string;
  to?: string;
  search?: string;
  sort?: string;
}
export interface PMListResponse {
  data: PreventiveMaintenanceRecord[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
export interface PMOccurrenceListParams {
  page?: number;
  limit?: number;
  status?: string;
  approvalState?: string;
  preventiveMaintenanceId?: string;
  assetId?: string;
  facilityId?: string;
  locationId?: string;
  from?: string;
  to?: string;
}
export interface PMOccurrenceListResponse {
  data: PMOccurrenceRecord[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
export const preventiveMaintenanceApi = {
  list: (params?: PMListParams) =>
    apiClient.get<PMListResponse>("/preventive-maintenance", { params }),
  get: (id: string) => apiClient.get<PreventiveMaintenanceRecord>(`/preventive-maintenance/${id}`),
  occurrences: (params?: PMOccurrenceListParams) =>
    apiClient.get<PMOccurrenceListResponse>("/preventive-maintenance/occurrences", { params }),
  planOccurrences: (id: string, params?: PMOccurrenceListParams) =>
    apiClient.get<PMOccurrenceListResponse>(`/preventive-maintenance/${id}/occurrences`, {
      params,
    }),
  create: (payload: CreatePreventiveMaintenancePayload) =>
    apiClient.post<PreventiveMaintenanceRecord>("/preventive-maintenance", payload),
  update: (
    id: string,
    payload: Partial<CreatePreventiveMaintenancePayload> & { status?: "cancelled" },
  ) => apiClient.patch<PreventiveMaintenanceRecord>(`/preventive-maintenance/${id}`, payload),
  assign: (id: string, assignment: Pick<PMAssignment, "targetType" | "targetId">) =>
    apiClient.patch<PreventiveMaintenanceRecord>(
      `/preventive-maintenance/${id}/assignment`,
      assignment,
    ),
  clearAssignment: (id: string) =>
    apiClient.delete<PreventiveMaintenanceRecord>(`/preventive-maintenance/${id}/assignment`),
  assignOccurrence: (id: string, assignment: Pick<PMAssignment, "targetType" | "targetId">) =>
    apiClient.patch<PMOccurrenceRecord>(
      `/preventive-maintenance/occurrences/${id}/assignment`,
      assignment,
    ),
  clearOccurrenceAssignment: (id: string) =>
    apiClient.delete<PMOccurrenceRecord>(`/preventive-maintenance/occurrences/${id}/assignment`),
  archive: (id: string) =>
    apiClient.delete<PreventiveMaintenanceRecord>(`/preventive-maintenance/${id}`),
  approve: (id: string) =>
    apiClient.post<PreventiveMaintenanceRecord>(`/preventive-maintenance/${id}/approve`, {}),
  approveOccurrence: (id: string) =>
    apiClient.post<PMOccurrenceRecord>(`/preventive-maintenance/occurrences/${id}/approve`, {}),
  reject: (id: string, rejectionReason: string) =>
    apiClient.post<PreventiveMaintenanceRecord>(`/preventive-maintenance/${id}/reject`, {
      rejectionReason,
    }),
};
