export interface OrganizationAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
export interface OrganizationProfile {
  id: string;
  name: string;
  industry: string;
  email: string;
  phone: string;
  website?: string;
  address: OrganizationAddress;
  logo?: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
}
