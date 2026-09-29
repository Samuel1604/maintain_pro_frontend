import { useCallback, useEffect, useMemo, useState } from "react";
import type { WorkOrder } from "@/types/common.types";
import type { WorkOrderFilters } from "../types/workOrder.types";
import { workOrdersService } from "../services/workOrders.service";
import { usePortal } from "@/hooks/usePortal";
import { locationsApi } from "@/features/locations/api/locations.api";

export function useWorkOrders(initialFilters: WorkOrderFilters = {}) {
  const [filters, setFilters] = useState<WorkOrderFilters>(initialFilters);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const portal = usePortal();
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  });

  const load = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);
      try {
        const result = await (portal === "vendor"
          ? workOrdersService.listForVendor(filters)
          : workOrdersService.list(filters));
        const locations = await locationsApi.list().catch(() => []);
        const locationNames = new Map(locations.map((location) => [location.id, location.name]));
        setWorkOrders(result.data.map((order) => ({
          ...order,
          locationName: order.locationName || locationNames.get(order.locationId) || order.locationId,
        })));
        setPagination({
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
        });
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause
            : new Error("Unable to load work orders"),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters, portal],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(
    () => ({
      total: workOrders.length,
      open: workOrders.filter((o) => o.status === "open").length,
      inProgress: workOrders.filter((o) => o.status === "in_progress").length,
      completed: workOrders.filter((o) => o.status === "completed").length,
      critical: workOrders.filter((o) => o.priority === "critical").length,
    }),
    [workOrders],
  );

  return {
    workOrders,
    stats,
    filters,
    setFilters,
    ...pagination,
    isLoading,
    isRefreshing,
    error,
    refetch: () => load(true),
  };
}
