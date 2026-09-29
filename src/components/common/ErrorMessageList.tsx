import { AlertCircle, WifiOff, ShieldAlert, ServerCrash, Info } from "lucide-react";
import { mapHttpToAppError } from "@/lib/errors/errorMapper";
import { getErrorMessages } from "@/lib/get-error-message";
import type { ErrorCategory } from "@/lib/errors/AppError";

interface ErrorMessageListProps {
  error: unknown;
  fallback?: string;
}

const CATEGORY_ICON: Record<ErrorCategory, React.ElementType> = {
  VALIDATION:                  AlertCircle,
  AUTHENTICATION:              ShieldAlert,
  AUTHORIZATION:               ShieldAlert,
  NOT_FOUND:                   Info,
  BUSINESS:                    Info,
  NETWORK:                     WifiOff,
  UNEXPECTED:                  ServerCrash,
  EMAIL_VERIFICATION_REQUIRED: Info,
};

const CATEGORY_CLASS: Record<ErrorCategory, string> = {
  VALIDATION:                  "text-destructive",
  AUTHENTICATION:              "text-destructive",
  AUTHORIZATION:               "text-amber-500",
  NOT_FOUND:                   "text-muted-foreground",
  BUSINESS:                    "text-amber-500",
  NETWORK:                     "text-orange-500",
  UNEXPECTED:                  "text-destructive",
  EMAIL_VERIFICATION_REQUIRED: "text-amber-500",
};

export function ErrorMessageList({ error, fallback }: ErrorMessageListProps) {
  const messages = getErrorMessages(error, fallback);
  const appError = error ? mapHttpToAppError(error) : null;
  const category: ErrorCategory = appError?.category ?? "UNEXPECTED";

  const Icon = CATEGORY_ICON[category];
  const cls = CATEGORY_CLASS[category];

  if (messages.length === 1) {
    return (
      <span className={cls}>
        {messages[0]}
      </span>
    );
  }

  return (
    <div className={`space-y-2 ${cls}`}>
      <p className="flex items-center gap-1.5 font-medium">
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        {messages[0]}
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {messages.slice(1).map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
