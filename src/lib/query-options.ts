/** Read-cache policies by data volatility. Mutations invalidate their feature keys. */
export const queryTiming = {
  reference: { staleTime: 5 * 60_000, gcTime: 30 * 60_000 },
  operationalList: { staleTime: 30_000, gcTime: 15 * 60_000 },
  report: { staleTime: 2 * 60_000, gcTime: 20 * 60_000 },
} as const;
