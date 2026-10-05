import { apiClient } from "@/api/client";
import type { OrganizationProfile } from "../types/organization.types";
export type UpdateOrganizationProfilePayload = Partial<
  Pick<
    OrganizationProfile,
    "name" | "industry" | "email" | "phone" | "address" | "website" | "logo"
  >
>;
export const organizationApi = {
  getCurrent: () => apiClient.get<OrganizationProfile>("/organizations/me"),
  updateCurrent: (payload: UpdateOrganizationProfilePayload) =>
    apiClient.patch<OrganizationProfile>("/organizations/me", payload),
};
