export type LocationType = 'BUILDING' | 'FLOOR' | 'AREA' | 'ROOM' | 'ZONE' | 'OTHER';
export type LocationStatus = 'active' | 'inactive';
export interface Location { id: string; organizationId: string; facilityId: string; parentId?: string; name: string; type: LocationType; code?: string; floor?: string; roomNumber?: string; description?: string; status: LocationStatus; createdAt: string; updatedAt: string; assetCount?: number; openWorkOrderCount?: number }
export interface CreateLocationPayload { facilityId: string; name: string; type: LocationType; code?: string; floor?: string; roomNumber?: string; description?: string; status?: LocationStatus; parentId?: string | null }
export type UpdateLocationPayload = Partial<Omit<CreateLocationPayload, 'facilityId'>>;
