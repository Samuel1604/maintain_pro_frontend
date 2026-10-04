import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { preventiveMaintenanceApi, type PMListParams } from '../api/preventiveMaintenance.api';
import type { CreatePreventiveMaintenancePayload } from '../types/preventiveMaintenance.types';
import { queryTiming } from '@/lib/query-options';

export const preventiveMaintenanceKeys = { all: ['preventive-maintenance', 'list'] as const };
export function usePreventiveMaintenanceApi(params?: PMListParams) {
  return useQuery({ queryKey: [...preventiveMaintenanceKeys.all, params], queryFn: () => preventiveMaintenanceApi.list(params), ...queryTiming.operationalList, retry: false });
}
export function usePreventiveMaintenance(id: string) {
  return useQuery({ queryKey: ['preventive-maintenance', id], queryFn: () => preventiveMaintenanceApi.get(id), enabled: Boolean(id), ...queryTiming.reference, retry: false });
}
export function usePreventiveMaintenanceMutations() {
  const client = useQueryClient();
  const refresh = () => { void client.invalidateQueries({ queryKey: preventiveMaintenanceKeys.all }); };
  return {
    create: useMutation({ mutationFn: (payload: CreatePreventiveMaintenancePayload) => preventiveMaintenanceApi.create(payload), onSuccess: refresh }),
    update: useMutation({ mutationFn: (input: { id: string; payload: Partial<CreatePreventiveMaintenancePayload> & { status?: 'cancelled' } }) => preventiveMaintenanceApi.update(input.id, input.payload), onSuccess: refresh }),
    archive: useMutation({ mutationFn: (id: string) => preventiveMaintenanceApi.archive(id), onSuccess: refresh }),
    approve: useMutation({ mutationFn: (id: string) => preventiveMaintenanceApi.approve(id), onSuccess: refresh }),
    reject: useMutation({ mutationFn: (input: { id: string; rejectionReason: string }) => preventiveMaintenanceApi.reject(input.id, input.rejectionReason), onSuccess: refresh }),
  };
}
