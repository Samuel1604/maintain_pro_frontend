import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthSplitLayout } from "@/features/auth/components/AuthBrandingPanel";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { useAcceptInvitation } from "@/features/auth/hooks/useAuthQueries";
import { FormBanner } from "@/components/feedback/FormBanner";

export function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const acceptInvitationMutation = useAcceptInvitation();
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState({ firstName: "", lastName: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    acceptInvitationMutation.mutate({
      token,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      password: form.password,
    });
  };

  if (!token) {
    return (
      <AuthSplitLayout brandingVariant="organization">
        <Card className="border-border bg-card">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-xl">Invalid invitation link</CardTitle>
            <CardDescription>
              This link is missing a valid token. Please check your invitation email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout brandingVariant="organization">
      <Card className="border-border bg-card">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <CardTitle className="text-2xl">Accept invitation</CardTitle>
              <CardDescription>
                Set up your account password to complete your invitation
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {acceptInvitationMutation.error && <FormBanner error={acceptInvitationMutation.error} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>
            <PasswordField
              id="password"
              value={form.password}
              onChange={(password) => setForm({ password })}
              placeholder="Create a strong password"
              hint="At least 8 characters with a number and symbol"
              showStrength
            />

            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                By accepting, you agree to the{" "}
                <Link to="/terms-of-service" className="underline hover:text-foreground">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                acceptInvitationMutation.isPending ||
                !form.firstName.trim() ||
                !form.lastName.trim() ||
                form.password.length < 8
              }
            >
              {acceptInvitationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting invitation…
                </>
              ) : (
                "Create account & join"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthSplitLayout>
  );
}
