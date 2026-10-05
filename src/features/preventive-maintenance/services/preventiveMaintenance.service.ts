import { httpClient } from "@/api/httpClient";
import { ENDPOINTS } from "@/api/endpoints";

export interface PreventiveMaintenanceRecord {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  facilityId: string;
  locationId: string;
  assetId: string;
  maintenanceType: string;
  priority: string;
  status: string;
  plannedDate?: string;
  occurrenceDate?: string;
  nextDueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const preventiveMaintenanceService = {
  list: (params?: {
    facilityId?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => httpClient.get<PreventiveMaintenanceRecord[]>(ENDPOINTS.PM.LIST, { params }),
  calendar: (params?: { from?: string; to?: string; facilityId?: string }) =>
    httpClient.get<unknown[]>(ENDPOINTS.PM.CALENDAR, { params }),
  get: (id: string) => httpClient.get<PreventiveMaintenanceRecord>(ENDPOINTS.PM.DETAIL(id)),
  create: (payload: Record<string, unknown>) =>
    httpClient.post<PreventiveMaintenanceRecord>(ENDPOINTS.PM.CREATE, payload),
  update: (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<PreventiveMaintenanceRecord>(ENDPOINTS.PM.UPDATE(id), payload),
  archive: (id: string) => httpClient.delete<void>(ENDPOINTS.PM.DELETE(id)),
  skip: (id: string, reason: string) =>
    httpClient.post<PreventiveMaintenanceRecord>(ENDPOINTS.PM.SKIP(id), { reason }),
};
