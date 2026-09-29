import { authApi } from "@/api/auth.api";

/**
 * authService — single façade consumed by all auth hooks.
 * Components never import authApi directly.
 */
export const authService = {
  login:                authApi.login,
  logout:               authApi.logout,
  changePassword:        authApi.changePassword,
  sessions:              authApi.sessions,
  revokeSession:         authApi.revokeSession,
  refresh:              authApi.refresh,
  me:                   authApi.me,
  registerOrganization: authApi.registerOrganization,
  registerVendor:       authApi.registerVendor,
  acceptInvitation:     authApi.acceptInvitation,
  forgotPassword:       authApi.forgotPassword,
  resetPassword:        authApi.resetPassword,
  verifyEmail:          authApi.verifyEmail,
  resendVerification:   authApi.resendVerification,
  verifyEmailLink:      authApi.verifyEmailLink,
  regenerateVerificationLink: authApi.regenerateVerificationLink,
};
