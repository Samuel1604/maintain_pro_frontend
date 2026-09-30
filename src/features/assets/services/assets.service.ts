import { assetsApi } from "../api/assets.api";
import type { CreateBackendAssetPayload, UpdateBackendAssetPayload } from "../api/assets.contract";

export const assetsService = {
  list: assetsApi.list,
  getById: assetsApi.get,
  create: (payload: CreateBackendAssetPayload) => assetsApi.create(payload),
  update: (assetTag: string, payload: UpdateBackendAssetPayload) =>
    assetsApi.update(assetTag, payload),
  delete: assetsApi.archive,
  getHistory: assetsApi.history,
  generateQR: assetsApi.qr,
};
