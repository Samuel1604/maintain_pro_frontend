export type {
  Asset,
  AssetStatus,
  AssetDocument,
  AssetMaintenanceRecord,
} from "@/types/common.types";

export type AssetWarrantyFilter = "active" | "expired" | "none";
export type AssetMaintenanceDueFilter = "overdue" | "due_soon" | "none";

export interface AssetFilters {
  search?: string;
  status?: string;
  category?: string;
  locationId?: string;
  facilityId?: string;
  manufacturer?: string;
  installDateFrom?: string;
  installDateTo?: string;
  warrantyStatus?: AssetWarrantyFilter;
  maintenanceDue?: AssetMaintenanceDueFilter;
}

export interface CreateAssetPayload {
  name: string;
  category: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  locationId: string;
  status: string;
  installDate?: string;
  warrantyExpiry?: string;
  purchaseCost?: number;
  description?: string;
}
