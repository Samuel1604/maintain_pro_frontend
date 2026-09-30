import { apiClient } from "@/api/client";
import type {
  BackendAsset,
  CreateBackendAssetPayload,
  UpdateBackendAssetPayload,
} from "./assets.contract";

type UpdateAssetPayload = UpdateBackendAssetPayload;
export interface AssetListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BackendAsset["status"];
  category?: BackendAsset["category"];
  locationId?: string;
  facilityId?: string;
  sort?: "assetTag" | "name" | "createdAt" | "-createdAt";
}
export interface AssetListResponse {
  data: BackendAsset[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
export interface AssetHistoryEntry {
  id: string;
  organizationId: string;
  assetId: string;
  event: string;
  description?: string;
  actorId?: string;
  sourceType?: string;
  sourceId?: string;
  data?: Record<string, unknown>;
  occurredAt: string;
}
export interface AssetHistoryResponse {
  data: AssetHistoryEntry[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
export interface AssetImportResponse {
  imported: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
  assets: BackendAsset[];
}

export const assetsApi = {
  downloadQr: (assetTag: string) =>
    apiClient.download(`/assets/${encodeURIComponent(assetTag)}/qr.png`, `${assetTag}-qr.png`),
  qrImage: (assetTag: string) =>
    apiClient.getBlob(`/assets/${encodeURIComponent(assetTag)}/qr.png?display=${Date.now()}`),
  downloadPdf: (assetTag: string) =>
    apiClient.download(
      `/assets/${encodeURIComponent(assetTag)}/pdf`,
      `${assetTag}-asset-record.pdf`,
    ),
  list: (params?: AssetListParams) => apiClient.get<AssetListResponse>("/assets", { params }),
  get: (assetTag: string) => apiClient.get<BackendAsset>(`/assets/${encodeURIComponent(assetTag)}`),
  qr: (assetTag: string) =>
    apiClient.get<{ assetTag: string; qrCode: string }>(
      `/assets/${encodeURIComponent(assetTag)}/qr`,
    ),
  history: (
    assetTag: string,
    params?: { page?: number; limit?: number; event?: string; from?: string; to?: string },
  ) =>
    apiClient.get<AssetHistoryResponse>(`/assets/${encodeURIComponent(assetTag)}/history`, {
      params,
    }),
  create: (payload: CreateBackendAssetPayload) => apiClient.post<BackendAsset>("/assets", payload),
  update: (assetTag: string, payload: UpdateAssetPayload) =>
    apiClient.patch<BackendAsset>(`/assets/${encodeURIComponent(assetTag)}`, payload),
  archive: (assetTag: string) =>
    apiClient.delete<boolean>(`/assets/${encodeURIComponent(assetTag)}`),
  importCsv: (_file: File) => {
    const body = new FormData();
    body.append("file", _file);
    return apiClient.post<AssetImportResponse>("/assets/import", body);
  },
};
