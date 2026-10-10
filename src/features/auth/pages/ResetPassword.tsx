import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, KeyRound } from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { useResetPassword } from "@/features/auth/hooks/useAuthQueries";
import { FormBanner } from "@/components/feedback/FormBanner";
import { SuccessState } from "@/components/feedback/SuccessState";

interface FieldErrors {
  password?: string;
  confirm?: string;
}

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const resetPasswordMutation = useResetPassword();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
    };
  }, []);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm border-border bg-card">
          <CardHeader>
            <CardTitle>Invalid reset link</CardTitle>
            <CardDescription>
              This password reset link is missing or expired. Request a new one from the sign-in
              page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/forgot-password">Request new link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }
    if (password !== confirm) {
      nextErrors.confirm = "Passwords do not match";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    resetPasswordMutation.mutate(
      { token, password },
      {
        onSuccess: () => {
          setDone(true);
          navigateTimeoutRef.current = setTimeout(
            () => navigate("/login", { replace: true }),
            2000,
          );
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <BrandLogo
          asLink={false}
          boxedIcon
          textClassName="text-xl font-semibold text-foreground"
          className="mb-8 justify-center"
        />

        <Card className="border-border bg-card">
          {done ? (
            <CardContent className="pt-6">
              <SuccessState
                icon={KeyRound}
                title="Password updated"
                description="Your password has been changed. Redirecting you to sign in…"
              />
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Set a new password</CardTitle>
                <CardDescription>Choose a new password for your account</CardDescription>
              </CardHeader>
              <CardContent>
                {resetPasswordMutation.error && (
                  <FormBanner error={resetPasswordMutation.error} className="mb-4" />
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <PasswordField
                    id="password"
                    label="New password"
                    value={password}
                    onChange={setPassword}
                    error={fieldErrors.password}
                  />
                  <PasswordField
                    id="confirm"
                    label="Confirm password"
                    value={confirm}
                    onChange={setConfirm}
                    error={fieldErrors.confirm}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </form>

                <div className="mt-6">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
