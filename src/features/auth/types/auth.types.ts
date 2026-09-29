import type { z } from "zod";

import type {
  acceptInvitationRequestSchema,
  authResponseSchema,
  forgotPasswordRequestSchema,
  loginRequestSchema,
  organizationPlanSchema,
  registerOrganizationRequestSchema,
  registerVendorRequestSchema,
  resetPasswordRequestSchema,
  resendVerificationRequestSchema,
  vendorPlanSchema,
  verifyEmailRequestSchema,
  verifyEmailLinkRequestSchema,
  regenerateVerificationRequestSchema,
} from "@/api/contracts/auth.contract";

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type OrganizationPlan = z.infer<typeof organizationPlanSchema>;
export type VendorPlan = z.infer<typeof vendorPlanSchema>;
export type RegisterOrganizationRequest = z.infer<typeof registerOrganizationRequestSchema>;
export type RegisterVendorRequest = z.infer<typeof registerVendorRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type AcceptInvitationRequest = z.infer<typeof acceptInvitationRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;
export type ResendVerificationRequest = z.infer<typeof resendVerificationRequestSchema>;
export type VerifyEmailLinkRequest = z.infer<typeof verifyEmailLinkRequestSchema>;
export type RegenerateVerificationRequest = z.infer<typeof regenerateVerificationRequestSchema>;

export interface OAuthStartResponse {
  authorizationUrl: string;
}

export interface InvitationDetails {
  email: string;
  role: string;
  organizationName?: string;
  vendorName?: string;
  expiresAt: string;
}
