export type OAuthProvider = "google" | "linkedin";
export type OAuthAction = "login" | "register-org" | "register-vendor" | "accept-invitation";

export function oauthStartUrl(
  provider: OAuthProvider,
  action: OAuthAction = "login",
  extras?: { invitationToken?: string; signupData?: unknown },
): string {
  const params = new URLSearchParams({ action });
  if (extras?.invitationToken) {
    params.set("invitationToken", extras.invitationToken);
  }
  if (extras?.signupData) {
    params.set("signupData", JSON.stringify(extras.signupData));
  }
  return `/api/v1/auth/oauth/${provider}?${params.toString()}`;
}

export function startOAuth(
  provider: OAuthProvider,
  action: OAuthAction = "login",
  extras?: { invitationToken?: string; signupData?: unknown },
): void {
  window.location.href = oauthStartUrl(provider, action, extras);
}
