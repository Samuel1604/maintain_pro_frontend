import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, ShieldAlert } from "lucide-react";
import { applyBackendValidationErrors } from "@/lib/form-errors";
import { FormBanner } from "@/components/feedback/FormBanner";
import { FieldError } from "@/components/feedback/FieldError";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AuthSplitLayout } from "@/features/auth/components/AuthBrandingPanel";
import { PasswordField } from "@/features/auth/components/PasswordField";

import { loginSchema } from "@/features/auth/schemas/auth.schema";

import { useLogin } from "@/features/auth/hooks/useLogin";
import { startOAuth } from "@/features/auth/utils/oauth";

import type { z } from "zod";

type LoginFormValues = z.infer<typeof loginSchema>;

function GoogleLogo() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M21.35 12.23c0-.7-.06-1.38-.18-2.03H12v3.84h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.15c1.85-1.7 2.9-4.2 2.9-7.2Z"/><path fill="#34A853" d="M12 21.6c2.65 0 4.88-.88 6.5-2.37l-3.15-2.45c-.88.59-2 .94-3.35.94-2.57 0-4.75-1.73-5.53-4.06H3.22v2.53A9.82 9.82 0 0 0 12 21.6Z"/><path fill="#FBBC05" d="M6.47 13.66a5.9 5.9 0 0 1 0-3.32V7.81H3.22a9.6 9.6 0 0 0 0 8.38l3.25-2.53Z"/><path fill="#EA4335" d="M12 6.28c1.44 0 2.73.5 3.75 1.48l2.81-2.81C16.87 3.37 14.65 2.4 12 2.4a9.82 9.82 0 0 0-8.78 5.41l3.25 2.53C7.25 8.01 9.43 6.28 12 6.28Z"/></svg>
}

function LinkedInLogo() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#0A66C2" d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM8.04 18.6H5.4V9.98h2.64v8.62ZM6.72 8.8a1.53 1.53 0 1 1 0-3.06 1.53 1.53 0 0 1 0 3.06ZM18.6 18.6h-2.63v-4.2c0-1-.02-2.28-1.39-2.28-1.4 0-1.61 1.09-1.61 2.2v4.28h-2.63V9.98h2.52v1.18h.04c.35-.68 1.2-1.4 2.47-1.4 2.64 0 3.13 1.74 3.13 4v4.84Z"/></svg>
}

export function Login() {
  const loginMutation = useLogin();
  const location = useLocation();
  const redirectMessage = (location.state as { message?: string } | null)?.message;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!loginMutation.error) return;

    applyBackendValidationErrors(loginMutation.error, setError, ["email", "password"]);
  }, [loginMutation.error, setError]);

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <AuthSplitLayout brandingVariant="login">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>

          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <CardContent>
          {redirectMessage && (
            <div className="mb-4 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">Access Denied</p>
                <p className="mt-0.5 text-xs text-destructive/80">{redirectMessage}</p>
              </div>
            </div>
          )}

          {loginMutation.error && (
            <FormBanner error={loginMutation.error} className="mb-4" />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                autoFocus
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />

              <FieldError id="email-error" message={errors.email?.message} />
            </div>

            <div className="space-y-2">
              <PasswordField
                id="password"
                value={watch("password") || ""}
                onChange={(val) => setValue("password", val, { shouldValidate: true })}
                placeholder="Enter password"
                error={errors.password?.message}
              />

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>

              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                className="gap-2"
                onClick={() => startOAuth("google", "login")}
              >
                <GoogleLogo />
                <span>Google</span>
              </Button>

              <Button
                variant="outline"
                type="button"
                className="gap-2"
                onClick={() => startOAuth("linkedin", "login")}
              >
                <LinkedInLogo />
                <span>LinkedIn</span>
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            Need SSO/SAML for your organization?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Contact sales
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthSplitLayout>
  );
}
