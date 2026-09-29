import { z } from "zod";

import type { User } from "@/types/user.types";

export const authProviderSchema = z.enum(["local", "google", "linkedin", "apple"]);

export const accountStatusSchema = z.enum([
  "pending_verification",
  "active",
  "suspended",
  "deactivated",
]);

export const userRoleSchema = z.enum([
  "admin",
  "facility_manager",
  "technician",
  "vendor_lead",
  "vendor_manager",
  "vendor_technician",
  "finance",
  "staff",
]);

export const authenticatedUserSchema = z.object({
  id: z.string(),
  role: userRoleSchema,
  organizationId: z.string().optional(),
  vendorId: z.string().optional(),
  facilityId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  department: z.string().optional(),
  provider: authProviderSchema.optional(),
  isVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
  status: accountStatusSchema.optional(),
  lastLoginAt: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}) satisfies z.ZodType<User>;

export const loginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const organizationPlanSchema = z.enum([
  "free",
  "starter",
  "professional",
  "enterprise",
]);

export const vendorPlanSchema = z.enum(["free", "starter", "professional"]);

export const addressSchema = z.object({
  street: z.string().trim().max(255).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  country: z.string().trim().max(100).optional(),
});

export const registerOrganizationRequestSchema = z
  .object({
    organizationName: z.string().min(2, "Organization name is required"),
    industry: z.string().min(2, "Industry is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(7, "Phone number is required"),
    address: addressSchema,
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerVendorRequestSchema = z
  .object({
    vendorName: z.string().min(2, "Vendor/Company name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(7, "Phone number is required"),
    address: addressSchema,
    companyRegistrationNumber: z.string().optional(),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordRequestSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const acceptInvitationRequestSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const authResponseSchema = z.object({
  // accessToken/refreshToken are no longer returned in the body — the
  // server sets them as httpOnly cookies (see api/client.ts /
  // shared/middleware/authenticate.ts on the backend). Kept optional
  // here only so old/alternate response shapes don't break parsing.
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  sessionId: z.string().optional(),
  user: authenticatedUserSchema,
});

export function toAuthenticatedUser(value: unknown): User {
  return authenticatedUserSchema.parse(value);
}

export function toAuthResponse(value: unknown): z.infer<typeof authResponseSchema> {
  return authResponseSchema.parse(value);
}

export const verifyEmailRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const resendVerificationRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type LoginRequestContract = z.infer<typeof loginRequestSchema>;
export type RegisterOrganizationRequestContract = z.infer<typeof registerOrganizationRequestSchema>;
export type RegisterVendorRequestContract = z.infer<typeof registerVendorRequestSchema>;
export type ForgotPasswordRequestContract = z.infer<typeof forgotPasswordRequestSchema>;
export type ResetPasswordRequestContract = z.infer<typeof resetPasswordRequestSchema>;
export type AcceptInvitationRequestContract = z.infer<typeof acceptInvitationRequestSchema>;
export type AuthResponseContract = z.infer<typeof authResponseSchema>;
export type VerifyEmailRequestContract = z.infer<typeof verifyEmailRequestSchema>;
export type ResendVerificationRequestContract = z.infer<typeof resendVerificationRequestSchema>;

export const verifyEmailLinkRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string().min(1, "Token is required"),
});

export const regenerateVerificationRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type VerifyEmailLinkRequestContract = z.infer<typeof verifyEmailLinkRequestSchema>;
export type RegenerateVerificationRequestContract = z.infer<typeof regenerateVerificationRequestSchema>;
