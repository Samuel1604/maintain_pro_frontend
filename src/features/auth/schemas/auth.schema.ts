import { z } from "zod";

import {
  acceptInvitationRequestSchema,
  forgotPasswordRequestSchema,
  loginRequestSchema,
  organizationPlanSchema,
  resetPasswordRequestSchema,
  vendorPlanSchema,
} from "@/api/contracts/auth.contract";

export const loginSchema = loginRequestSchema;
export const forgotPasswordSchema = forgotPasswordRequestSchema;
export const resetPasswordSchema = resetPasswordRequestSchema;
export const acceptInvitationSchema = acceptInvitationRequestSchema;

const addressFormFields = {
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
};

export const registerOrganizationSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    organizationName: z.string().min(2, "Organization name is required"),
    industry: z.string().min(2, "Industry is required"),
    phone: z.string().min(7, "Phone number is required"),
    ...addressFormFields,
    plan: organizationPlanSchema.default("free"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerVendorSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    vendorName: z.string().min(2, "Vendor/Company name is required"),
    companyRegistrationNumber: z.string().optional(),
    phone: z.string().min(7, "Phone number is required"),
    ...addressFormFields,
    plan: vendorPlanSchema.default("free"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  otp: z.string().length(6),
});
