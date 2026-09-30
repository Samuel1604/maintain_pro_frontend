import { Button } from "@/components/ui/button";
import { startOAuth, type OAuthAction, type OAuthProvider } from "@/features/auth/utils/oauth";

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.7-.06-1.38-.18-2.03H12v3.84h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.15c1.85-1.7 2.9-4.2 2.9-7.2Z"
      />
      <path
        fill="#34A853"
        d="M12 21.6c2.65 0 4.88-.88 6.5-2.37l-3.15-2.45c-.88.59-2 .94-3.35.94-2.57 0-4.75-1.73-5.53-4.06H3.22v2.53A9.82 9.82 0 0 0 12 21.6Z"
      />
      <path
        fill="#FBBC05"
        d="M6.47 13.66a5.9 5.9 0 0 1 0-3.32V7.81H3.22a9.6 9.6 0 0 0 0 8.38l3.25-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.28c1.44 0 2.73.5 3.75 1.48l2.81-2.81C16.87 3.37 14.65 2.4 12 2.4a9.82 9.82 0 0 0-8.78 5.41l3.25 2.53C7.25 8.01 9.43 6.28 12 6.28Z"
      />
    </svg>
  );
}

function LinkedInLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#0A66C2"
        d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM8.04 18.6H5.4V9.98h2.64v8.62ZM6.72 8.8a1.53 1.53 0 1 1 0-3.06 1.53 1.53 0 0 1 0 3.06ZM18.6 18.6h-2.63v-4.2c0-1-.02-2.28-1.39-2.28-1.4 0-1.61 1.09-1.61 2.2v4.28h-2.63V9.98h2.52v1.18h.04c.35-.68 1.2-1.4 2.47-1.4 2.64 0 3.13 1.74 3.13 4v4.84Z"
      />
    </svg>
  );
}

const PROVIDERS: { id: OAuthProvider; label: string; icon: typeof GoogleLogo }[] = [
  { id: "google", label: "Google", icon: GoogleLogo },
  { id: "linkedin", label: "LinkedIn", icon: LinkedInLogo },
];

interface OAuthButtonsProps {
  action?: OAuthAction;
  invitationToken?: string;
  signupData?: unknown;
  disabled?: boolean;
}

export function OAuthButtons({
  action = "login",
  invitationToken,
  signupData,
  disabled,
}: OAuthButtonsProps) {
  const extras = { invitationToken, signupData };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {PROVIDERS.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant="outline"
          type="button"
          className="gap-2"
          disabled={disabled}
          onClick={() => startOAuth(id, action, extras)}
        >
          <Icon />
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
}
