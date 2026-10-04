import { apiClient } from './client';
export interface UserSettings { language: string; timezone: string; dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'; timeFormat: '12h' | '24h'; accessibility: { reducedMotion: boolean; highContrast: boolean; screenReaderAnnouncements: boolean } }
export interface OrganizationSettings { timezone: string; locale: string; currency: string; defaultWorkOrderPriority: 'low' | 'medium' | 'high' | 'critical'; defaultServiceRequestPriority: 'low' | 'medium' | 'high' | 'critical'; notificationPolicies: Record<string, boolean> }
export interface VendorSettings { timezone: string; locale: string; marketplaceAvailable: boolean; profileVisible: boolean; autoApply: boolean; minimumAnnualContractValue?: number; maximumDistanceKm?: number; contractTypes: { pm: boolean; emergency: boolean; modernization: boolean; audits: boolean } }
export const settingsApi = {
  user: { get: () => apiClient.get<UserSettings>('/settings/me'), update: (payload: Partial<UserSettings>) => apiClient.patch<UserSettings>('/settings/me', payload) },
  organization: { get: () => apiClient.get<OrganizationSettings>('/settings/organization'), update: (payload: Partial<OrganizationSettings>) => apiClient.patch<OrganizationSettings>('/settings/organization', payload) },
  vendor: { get: () => apiClient.get<VendorSettings>('/settings/vendor'), update: (payload: Partial<VendorSettings>) => apiClient.patch<VendorSettings>('/settings/vendor', payload) },
};
