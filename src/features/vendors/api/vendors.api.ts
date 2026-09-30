import { apiClient } from "@/api/client";
import type { UpdateVendorProfilePayload, VendorProfile } from "../types/vendor.types";
export const vendorsApi = {
  getCurrent: () => apiClient.get<VendorProfile>("/vendors/me"),
  updateCurrent: (payload: UpdateVendorProfilePayload) =>
    apiClient.patch<VendorProfile>("/vendors/me", payload),
};
