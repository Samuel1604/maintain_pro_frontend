import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationApi, type UpdateOrganizationProfilePayload } from '../api/organization.api';
import { useAuthStore } from '@/app/store';
import type { OrganizationProfile } from '../types/organization.types';

export const organizationProfileKey = ['organization', 'current'] as const;

export function useOrganizationProfile(enabled = true) {
  const client = useQueryClient();
  const setOrganization = useAuthStore((state) => state.setOrganization);
  const query = useQuery<OrganizationProfile>({ queryKey: organizationProfileKey, queryFn: organizationApi.getCurrent, enabled, retry: false });
  const update = useMutation({
    mutationFn: (payload: UpdateOrganizationProfilePayload) => organizationApi.updateCurrent(payload),
    onSuccess: (profile: OrganizationProfile) => {
      client.setQueryData(organizationProfileKey, profile);
      setOrganization(profile);
    },
  });
  return { ...query, update };
}
