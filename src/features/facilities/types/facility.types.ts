export type FacilityStatus = 'active' | 'inactive' | 'suspended';
export interface FacilityAddress { street: string; city: string; state: string; postalCode?: string; country: string }
export interface Facility { id: string; organizationId: string; name: string; address: FacilityAddress; coordinates: { type: 'Point'; coordinates: [number, number] }; status: FacilityStatus; description?: string; managerName?: string; primaryPhone?: string; emergencyContact?: string; createdAt: string; updatedAt: string; locationCount?: number; assetCount?: number; openWorkOrderCount?: number }
export interface FacilitiesResponse { data: Facility[]; pagination: { page: number; limit: number; total: number; pages: number } }
export interface FacilityPayload { organizationId: string; name: string; address: FacilityAddress; latitude: number; longitude: number; description?: string; managerName?: string; primaryPhone?: string; emergencyContact?: string; status?: FacilityStatus }
export type FacilityUpdatePayload = Partial<Omit<FacilityPayload, 'organizationId'>> & { description?: string | null; managerName?: string | null; primaryPhone?: string | null; emergencyContact?: string | null }
export interface FacilityListParams { page?: number; limit?: number; status?: FacilityStatus; sort?: 'name' | 'createdAt' | '-createdAt' }
export interface FacilityStatistics { total: number; byStatus: Record<string, number> }
