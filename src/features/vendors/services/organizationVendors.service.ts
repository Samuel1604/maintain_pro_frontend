import { httpClient } from '@/api/httpClient';
import { ENDPOINTS } from '@/api/endpoints';

export interface OrganizationVendorRecord { id: string; vendorId: string; organizationId: string; name: string; email: string; phone: string; serviceCategories: string[]; averageRating?: number; completedJobs?: number; status: string; createdAt: string; updatedAt: string }

export const organizationVendorsService = {
  list: (params?: { search?: string; status?: string; page?: number; limit?: number }) => httpClient.get<OrganizationVendorRecord[]>(ENDPOINTS.ORGANIZATION_VENDORS.LIST, { params }),
  get: (vendorId: string) => httpClient.get<OrganizationVendorRecord>(ENDPOINTS.ORGANIZATION_VENDORS.DETAIL(vendorId)),
  performance: (vendorId: string) => httpClient.get<{ total: number; completed: number; inProgress: number; assigned: number; completionRate: number }>(ENDPOINTS.ORGANIZATION_VENDORS.PERFORMANCE(vendorId)),
  changeStatus: (vendorId: string, status: 'active' | 'inactive' | 'suspended') => httpClient.patch<OrganizationVendorRecord>(ENDPOINTS.ORGANIZATION_VENDORS.STATUS(vendorId), { status }),
};
