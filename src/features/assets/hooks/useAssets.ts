import { useCallback, useEffect, useMemo, useState } from 'react'
import { assetsApi, type AssetListParams } from '../api/assets.api'
import type { BackendAsset, BackendAssetCategory, BackendAssetStatus } from '../api/assets.contract'
import type { AssetFilters } from '../types/asset.types'

const BACKEND_STATUSES: BackendAssetStatus[] = ['active', 'inactive', 'under_maintenance', 'retired']
const BACKEND_CATEGORIES: BackendAssetCategory[] = ['hardware', 'software', 'infrastructure', 'other']

function toListParams(filters: AssetFilters): AssetListParams {
  const status = BACKEND_STATUSES.includes(filters.status as BackendAssetStatus)
    ? (filters.status as BackendAssetStatus)
    : undefined
  const category = BACKEND_CATEGORIES.includes(filters.category as BackendAssetCategory)
    ? (filters.category as BackendAssetCategory)
    : undefined
  return {
    page: 1,
    limit: 100,
    search: filters.search,
    status,
    category,
    locationId: filters.locationId,
    facilityId: filters.facilityId,
  }
}

export function useAssets(initialFilters: AssetFilters = {}) {
  const [filters, setFilters] = useState<AssetFilters>(initialFilters)
  const [assets, setAssets] = useState<BackendAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await assetsApi.list(toListParams(filters))
      setAssets(result.data ?? [])
    } catch (cause) {
      setAssets([])
      setError(cause instanceof Error ? cause : new Error('Unable to load assets'))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void load()
  }, [load])

  const stats = useMemo(
    () => ({
      total: assets.length,
      active: assets.filter((asset) => asset.status === 'active').length,
      underMaintenance: assets.filter((asset) => asset.status === 'under_maintenance').length,
      inactive: assets.filter((asset) => asset.status === 'inactive').length,
      retired: assets.filter((asset) => asset.status === 'retired').length,
    }),
    [assets],
  )

  return { assets, stats, filters, setFilters, isLoading, error, refetch: load }
}
