export type VendorStatus = "pending" | "active" | "suspended" | "inactive" | "removed";
export type VendorSubscriptionStatus = "trial" | "active" | "past_due" | "cancelled";
export type VendorVerificationBadge = "none" | "verified" | "premium";
export interface VendorAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
export interface VendorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  address?: VendorAddress;
  companyRegistrationNumber?: string;
  serviceCategories: string[];
  certifications?: string[];
  coverageRadiusKm: number;
  baseCoordinates?: { type: "Point"; coordinates: [number, number] };
  plan: string;
  subscriptionStatus: VendorSubscriptionStatus;
  applicationLimit: number;
  averageRating?: number;
  completedJobs?: number;
  isVerified: boolean;
  verificationBadge: VendorVerificationBadge;
  status: VendorStatus;
  createdAt?: string;
  updatedAt?: string;
}
export interface UpdateVendorProfilePayload {
  vendorName?: string;
  phone?: string;
  address?: VendorAddress;
  companyRegistrationNumber?: string;
  website?: string;
  logo?: string;
  serviceCategories?: string[];
  serviceAreas?: string[];
  coverageRadiusKm?: number;
  latitude?: number;
  longitude?: number;
  certifications?: string[];
}
