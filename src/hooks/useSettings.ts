import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type UserSettings, type OrganizationSettings, type VendorSettings } from '@/api/settings.api';

export const settingsKeys = { user: ['settings', 'user'] as const, organization: ['settings', 'organization'] as const, vendor: ['settings', 'vendor'] as const };

export function useUserSettings() {
  const client = useQueryClient();
  const query = useQuery<UserSettings>({ queryKey: settingsKeys.user, queryFn: settingsApi.user.get, retry: false });
  const update = useMutation({ mutationFn: (payload: Partial<UserSettings>) => settingsApi.user.update(payload), onSuccess: (data: UserSettings) => client.setQueryData(settingsKeys.user, data) });
  return { ...query, update };
}
export function useOrganizationSettings(enabled = true) {
  const client = useQueryClient();
  const query = useQuery<OrganizationSettings>({ queryKey: settingsKeys.organization, queryFn: settingsApi.organization.get, enabled, retry: false });
  const update = useMutation({ mutationFn: (payload: Partial<OrganizationSettings>) => settingsApi.organization.update(payload), onSuccess: (data: OrganizationSettings) => client.setQueryData(settingsKeys.organization, data) });
  return { ...query, update };
}
export function useVendorSettings(enabled = true) {
  const client = useQueryClient();
  const query = useQuery<VendorSettings>({ queryKey: settingsKeys.vendor, queryFn: settingsApi.vendor.get, enabled, retry: false });
  const update = useMutation({ mutationFn: (payload: Partial<VendorSettings>) => settingsApi.vendor.update(payload), onSuccess: (data: VendorSettings) => client.setQueryData(settingsKeys.vendor, data) });
  return { ...query, update };
}
