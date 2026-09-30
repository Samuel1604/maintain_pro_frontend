import { apiClient } from "@/api/client";
import type {
  CreateLocationPayload,
  Location,
  UpdateLocationPayload,
} from "../types/location.types";
export const locationsApi = {
  list: () => apiClient.get<Location[]>("/locations"),
  listByFacility: (facilityId: string) =>
    apiClient.get<Location[]>(`/locations/facility/${facilityId}`),
  children: (id: string) => apiClient.get<Location[]>(`/locations/${id}/children`),
  get: (id: string) => apiClient.get<Location>(`/locations/${id}`),
  relationships: (id: string) =>
    apiClient.get<{
      location?: Location;
      assets?: unknown[];
      workOrders?: unknown[];
      serviceRequests?: unknown[];
      preventiveMaintenance?: unknown[];
    }>(`/locations/${id}/relationships`),
  create: (payload: CreateLocationPayload) => apiClient.post<Location>("/locations", payload),
  update: (id: string, payload: UpdateLocationPayload) =>
    apiClient.patch<Location>(`/locations/${id}`, payload),
  archive: (id: string) => apiClient.delete<void>(`/locations/${id}`),
};
