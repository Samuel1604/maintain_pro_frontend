import { useState } from "react";
import { Eye, EyeOff, ArrowBigUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/feedback/FieldError";
import { PasswordStrengthBar } from "@/features/auth/components/PasswordStrengthBar";
import { cn } from "@/utils/helpers";

interface PasswordFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  showStrength?: boolean;
  /** Validation message (client-side or backend) shown inline below the field. */
  error?: string;
  autoFocus?: boolean;
}

export function PasswordField({
  id,
  label = "Password",
  value,
  onChange,
  placeholder = "Enter your password",
  required = true,
  hint,
  showStrength = false,
  error,
  autoFocus = false,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const errorId = error ? `${id}-error` : undefined;

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={checkCapsLock}
          onKeyUp={checkCapsLock}
          onBlur={() => setCapsLockOn(false)}
          required={required}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn("bg-secondary pr-10")}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {capsLockOn && (
        <p className="flex items-center gap-1.5 text-xs text-status-high" role="status">
          <ArrowBigUp className="h-3.5 w-3.5" aria-hidden />
          Caps Lock is on
        </p>
      )}
      {showStrength && <PasswordStrengthBar password={value} />}
      <FieldError id={errorId} message={error} />
      {!error && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
