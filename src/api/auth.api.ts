import { apiClient } from "./client";
import { toAuthenticatedUser, toAuthResponse } from "./contracts/auth.contract";
import type {
  LoginRequest,
  RegisterOrganizationRequest,
  RegisterVendorRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AcceptInvitationRequest,
  AuthResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
  VerifyEmailLinkRequest,
  RegenerateVerificationRequest,
} from "@/features/auth/types/auth.types";
import type { User } from "@/types/user.types";

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    return toAuthResponse(await apiClient.post<AuthResponse>("/auth/login", payload));
  },

  logout: () => apiClient.post<void>("/auth/logout"),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    apiClient.post<void>("/auth/change-password", payload),
  sessions: () =>
    apiClient.get<
      Array<{
        id: string;
        userAgent?: string;
        ipAddress?: string;
        location?: string;
        current?: boolean;
        lastSeenAt?: string;
      }>
    >("/auth/sessions"),
  revokeSession: (id: string) => apiClient.delete<void>(`/auth/sessions/${id}`),

  // Tokens are refreshed via httpOnly cookies — there's no user payload
  // to parse here. (Note: the automatic 401-retry-after-refresh flow in
  // api/client.ts calls the endpoint directly and doesn't go through
  // this function at all; this is exposed for any explicit/manual
  // refresh call sites.)
  async refresh(): Promise<void> {
    await apiClient.post<void>("/auth/refresh");
  },

  async me(): Promise<User> {
    return toAuthenticatedUser(await apiClient.get<User>("/auth/me"));
  },

  async registerOrganization(payload: RegisterOrganizationRequest): Promise<AuthResponse> {
    return toAuthResponse(
      await apiClient.post<AuthResponse>("/auth/register/organization", payload),
    );
  },

  async registerVendor(payload: RegisterVendorRequest): Promise<AuthResponse> {
    return toAuthResponse(await apiClient.post<AuthResponse>("/auth/register/vendor", payload));
  },

  acceptInvitation: (payload: AcceptInvitationRequest) =>
    apiClient.post<void>("/auth/accept-invitation", payload),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    apiClient.post<void>("/auth/forgot-password", payload),

  resetPassword: (payload: ResetPasswordRequest) =>
    apiClient.post<void>("/auth/reset-password", payload),

  verifyEmail: (payload: VerifyEmailRequest) => apiClient.post<void>("/auth/verify-otp", payload),

  resendVerification: (payload: ResendVerificationRequest) =>
    apiClient.post<void>("/auth/resend-otp", payload),

  verifyEmailLink: (payload: VerifyEmailLinkRequest) =>
    apiClient.post<void>("/auth/verify-link", payload),

  regenerateVerificationLink: (payload: RegenerateVerificationRequest) =>
    apiClient.post<{ expiresInSeconds: number; verificationUrl?: string }>(
      "/auth/regenerate-verification",
      payload,
    ),
};

export const login = authApi.login;
export const logout = authApi.logout;
export const refresh = authApi.refresh;
export const me = authApi.me;
export const registerOrganization = authApi.registerOrganization;
export const registerVendor = authApi.registerVendor;
export const acceptInvitation = authApi.acceptInvitation;
export const forgotPassword = authApi.forgotPassword;
export const resetPassword = authApi.resetPassword;
export const getCurrentUser = authApi.me;
