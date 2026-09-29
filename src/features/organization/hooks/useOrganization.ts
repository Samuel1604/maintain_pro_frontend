import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '../api/organization.api';
import { useAuthStore } from '@/app/store';

export const organizationKeys = { current: ['organization', 'current'] as const };

export function useOrganization(enabled = true) {
  const user = useAuthStore((state) => state.user);
  const organizationFromStore = useAuthStore((state) => state.organization);
  const setOrganization = useAuthStore((state) => state.setOrganization);

  const query = useQuery({
    queryKey: organizationKeys.current,
    queryFn: organizationApi.getCurrent,
    enabled: enabled && Boolean(user?.organizationId || user?.role),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setOrganization(query.data);
    }
  }, [query.data, setOrganization]);

  return {
    ...query,
    organization: query.data || organizationFromStore,
  };
}
