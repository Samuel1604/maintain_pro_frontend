import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '../api/locations.api';
import type { CreateLocationPayload, UpdateLocationPayload } from '../types/location.types';
import type { Location } from '../types/location.types';
import { queryTiming } from '@/lib/query-options';

export const locationKeys = { all: ['locations'] as const, facility: (id: string) => ['locations', 'facility', id] as const, detail: (id: string) => ['locations', id] as const };

export function useLocationsApi() {
  return useQuery<Location[]>({ queryKey: locationKeys.all, queryFn: locationsApi.list, ...queryTiming.reference, retry: false });
}
export function useFacilityLocations(facilityId: string) {
  return useQuery({ queryKey: locationKeys.facility(facilityId), queryFn: () => locationsApi.listByFacility(facilityId), enabled: Boolean(facilityId), ...queryTiming.reference, retry: false });
}
export function useLocationApi(id: string) {
  return useQuery({ queryKey: locationKeys.detail(id), queryFn: () => locationsApi.get(id), enabled: Boolean(id), ...queryTiming.reference, retry: false });
}
export function useLocationChildren(id: string) {
  return useQuery({ queryKey: [...locationKeys.detail(id), 'children'], queryFn: () => locationsApi.children(id), enabled: Boolean(id), ...queryTiming.reference, retry: false });
}
export function useLocationMutations() {
  const client = useQueryClient();
  const refresh = () => { void client.invalidateQueries({ queryKey: locationKeys.all }); };
  return {
    create: useMutation({ mutationFn: (payload: CreateLocationPayload) => locationsApi.create(payload), onSuccess: refresh }),
    update: useMutation({ mutationFn: (input: { id: string; payload: UpdateLocationPayload }) => locationsApi.update(input.id, input.payload), onSuccess: refresh }),
    archive: useMutation({ mutationFn: (id: string) => locationsApi.archive(id), onSuccess: refresh }),
  };
}
