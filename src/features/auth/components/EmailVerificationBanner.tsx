import { useState } from "react";
import { Link } from "react-router-dom";
import { MailWarning, Settings, X } from "lucide-react";
import { useAuthStore } from "@/app/store";
import { buildPortalPath, buildUserPortalPath } from "@/app/portal.config";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/helpers";

export function EmailVerificationBanner() {
  const user = useAuthStore((s) => s.user);
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.isVerified !== false || dismissed) return null;

  const profilePath = buildUserPortalPath(user, "/profile");

  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-400",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <MailWarning className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">
          Please verify your email to unlock all features. Go to your profile to
          complete verification.
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-amber-700 hover:bg-amber-500/10 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
        >
          <Link to={profilePath} onClick={() => setDismissed(true)}>
            <Settings className="h-3.5 w-3.5" />
            Go to Profile Settings
          </Link>
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss for this session"
          className="rounded-sm p-1 text-amber-700/70 hover:text-amber-800 dark:text-amber-400/70 dark:hover:text-amber-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
