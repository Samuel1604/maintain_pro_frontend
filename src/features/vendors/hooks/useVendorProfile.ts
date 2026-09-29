import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendorsApi } from "../api/vendors.api";
import type { UpdateVendorProfilePayload } from "../types/vendor.types";
import type { VendorProfile } from "../types/vendor.types";
export const vendorKeys = { current: ["vendors", "me"] as const };
export function useVendorProfile(enabled = true) {
  return useQuery<VendorProfile>({
    queryKey: vendorKeys.current,
    queryFn: vendorsApi.getCurrent,
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
export function useVendorProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateVendorProfilePayload) => vendorsApi.updateCurrent(payload),
    onSuccess: (profile: VendorProfile) => {
      queryClient.setQueryData(vendorKeys.current, profile);
    },
  });
}
