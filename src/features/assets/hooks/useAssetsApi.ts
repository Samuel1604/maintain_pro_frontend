import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetsApi, type AssetListParams } from '../api/assets.api';
import type { CreateBackendAssetPayload, UpdateBackendAssetPayload } from '../api/assets.contract';
import { queryTiming } from '@/lib/query-options';

export const backendAssetKeys = {
  all: ['backend-assets'] as const,
  list: (params?: AssetListParams) => ['backend-assets', 'list', params] as const,
  detail: (tag: string) => ['backend-assets', tag] as const,
};

export function useBackendAssets(params?: AssetListParams) {
  return useQuery({ queryKey: backendAssetKeys.list(params), queryFn: () => assetsApi.list(params), ...queryTiming.operationalList, retry: false });
}
export function useBackendAsset(assetTag: string) {
  return useQuery({ queryKey: backendAssetKeys.detail(assetTag), queryFn: () => assetsApi.get(assetTag), enabled: Boolean(assetTag), ...queryTiming.reference, retry: false });
}
export function useBackendAssetHistory(assetTag: string, params?: { page?: number; limit?: number; event?: string; from?: string; to?: string }) {
  return useQuery({ queryKey: [...backendAssetKeys.detail(assetTag), 'history', params], queryFn: () => assetsApi.history(assetTag, params), enabled: Boolean(assetTag), ...queryTiming.operationalList, retry: false });
}
export function useBackendAssetMutations() {
  const client = useQueryClient();
  const refresh = () => { void client.invalidateQueries({ queryKey: backendAssetKeys.all }); };
  return {
    create: useMutation({ mutationFn: (payload: CreateBackendAssetPayload) => assetsApi.create(payload), onSuccess: refresh }),
    update: useMutation({ mutationFn: (input: { assetTag: string; payload: UpdateBackendAssetPayload }) => assetsApi.update(input.assetTag, input.payload), onSuccess: refresh }),
    archive: useMutation({ mutationFn: (assetTag: string) => assetsApi.archive(assetTag).then(() => true), onSuccess: refresh }),
  };
}
