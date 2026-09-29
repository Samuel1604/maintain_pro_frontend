import { useCallback, useEffect, useState } from "react";
import {
  serviceRequestsService,
  type ServiceRequestRecord,
} from "../services/serviceRequests.service";

export function useServiceRequests(
  filters: {
    page?: number;
    limit?: number;
    status?: ServiceRequestRecord["status"];
    from?: string;
    to?: string;
  } = {},
) {
  const [data, setData] = useState<ServiceRequestRecord[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);
      try {
        const result = await serviceRequestsService.list(filters);
        setData(result.data);
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
            : new Error("Unable to load service requests"),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters.page, filters.limit, filters.status, filters.from, filters.to],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    ...pagination,
    isLoading,
    isRefreshing,
    error,
    refetch: () => load(true),
  };
}
