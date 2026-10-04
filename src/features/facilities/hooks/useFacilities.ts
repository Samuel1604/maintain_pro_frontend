import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { facilitiesApi } from '../api/facilities.api';
import type { Facility, FacilityPayload, FacilitiesResponse, FacilityUpdatePayload } from '../types/facility.types';
import { queryTiming } from '@/lib/query-options';

export const facilityKeys = { all: ['facilities'] as const, detail: (id: string) => ['facilities', id] as const };

export function useFacilities() {
  return useQuery<FacilitiesResponse>({ queryKey: facilityKeys.all, queryFn: () => facilitiesApi.list(), ...queryTiming.reference, retry: false });
}

export function useFacility(id: string) {
  return useQuery({ queryKey: facilityKeys.detail(id), queryFn: () => facilitiesApi.get(id), enabled: Boolean(id), ...queryTiming.reference, retry: false });
}

export function useFacilityMutations() {
  const client = useQueryClient();
  const refreshAll = () => { void client.invalidateQueries({ queryKey: facilityKeys.all }); };
  const refreshDetail = (id: string) => { refreshAll(); void client.invalidateQueries({ queryKey: facilityKeys.detail(id) }); };
  return {
    create: useMutation({ mutationFn: (payload: FacilityPayload) => facilitiesApi.create(payload), onSuccess: refreshAll }),
    update: useMutation({ mutationFn: (input: { id: string; payload: FacilityUpdatePayload }) => facilitiesApi.update(input.id, input.payload), onSuccess: (_data: Facility, variables: { id: string; payload: FacilityUpdatePayload }) => refreshDetail(variables.id) }),
    deactivate: useMutation({ mutationFn: (id: string) => facilitiesApi.deactivate(id), onSuccess: (_data: Facility, id: string) => refreshDetail(id) }),
  };
}
