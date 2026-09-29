import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  MailCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FeedbackAlert } from "@/components/feedback/FeedbackAlert";
import { FormBanner } from "@/components/feedback/FormBanner";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuthStore } from "@/app/store";
import { authKeys } from "@/features/auth/constants/queryKeys";
import {
  useVerifyEmailLink,
  useRegenerateVerificationLink,
} from "@/features/auth/hooks/useAuthQueries";
import { useVerificationLinkStore } from "@/features/auth/store/verificationLink.store";
import { getErrorMessage } from "@/lib/get-error-message";

type ViewState =
  | "prompt"
  | "verifying"
  | "success"
  | "error_invalid"
  | "error_expired";

const REGENERATE_COOLDOWN = 300; // 5 minutes in seconds

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Use stored email (from auth state) or fall back to URL param
  const userEmail = user?.email ?? email ?? "";

  const verifyMutation = useVerifyEmailLink();
  const regenerateMutation = useRegenerateVerificationLink();
  const { getOrGenerate } = useVerificationLinkStore();

  const [view, setView] = useState<ViewState>("prompt");
  const [regenerated, setRegenerated] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Auto-verify if a token + email are present in the URL
  useEffect(() => {
    if (!token || !userEmail) return;
    setView("verifying");
    verifyMutation.mutate(
      { token, email: userEmail },
      {
        onSuccess: () => {
          setView("success");
          // Invalidate user data. The existing profile mechanism (useQuery(['me']))
          // will automatically refetch and update the global state, dismissing banners
          // and enabling functionality without a page refresh.
          queryClient.invalidateQueries({ queryKey: authKeys.me });
        },
        onError: (error: unknown) => {
          const msg = getErrorMessage(error).toLowerCase();
          if (msg.includes("expired")) {
            setView("error_expired");
          } else {
            setView("error_invalid");
          }
        },
      },
    );
  }, [token, userEmail]);

  function startCooldown(seconds: number) {
    setCooldown(seconds);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const handleRegenerate = () => {
    if (!userEmail || regenerateMutation.isPending) return;

    // If a cooldown is active, do not send a new request.
    // Instead, show the "regenerated" message to inform the user a link is already active.
    if (cooldown > 0) {
      setRegenerated(true);
      setTimeout(() => setRegenerated(false), 5000); // Hide message after 5s
      timeoutRef.current = setTimeout(() => setRegenerated(false), 5000); // Hide message after 5s
      return;
    }

    // Prefer using the global verification link store to avoid duplicate generation
    getOrGenerate(userEmail)
      .then((data) => {
        const secs = data?.expiresInSeconds ?? REGENERATE_COOLDOWN;
        setRegenerated(true);
        startCooldown(secs);
        setTimeout(() => setRegenerated(false), 5000);
        timeoutRef.current = setTimeout(() => setRegenerated(false), 5000);
      })
      .catch(() => {
        // Fall back to server call (handled by regenerateMutation) on unexpected error
        regenerateMutation.mutate(
          { email: userEmail },
          {
            onSuccess: () => {
              setRegenerated(true);
              startCooldown(REGENERATE_COOLDOWN);
              setTimeout(() => setRegenerated(false), 5000);
              timeoutRef.current = setTimeout(() => setRegenerated(false), 5000);
            },
          },
        );
      });
  };

  const regenerateButton = (
    <Button
      id="regenerate-verification-btn"
      className="w-full"
      variant={cooldown > 0 ? "outline" : "default"}
      onClick={handleRegenerate}
      disabled={regenerateMutation.isPending || cooldown > 0}
    >
      {regenerateMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating…
        </>
      ) : cooldown > 0 ? (
        <>
          <Clock className="mr-2 h-4 w-4" />
          Available in {formatTime(cooldown)}
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate verification link
        </>
      )}
    </Button>
  );

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
          {/* ── Verifying (auto from token URL) ── */}
          {view === "verifying" && (
            <>
              <CardHeader className="text-center space-y-3">
                <div className="flex justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
                <CardTitle className="text-2xl">
                  Verifying your email…
                </CardTitle>
                <CardDescription>Please wait a moment.</CardDescription>
              </CardHeader>
            </>
          )}

          {/* ── Success ── */}
          {view === "success" && (
            <>
              <CardHeader className="text-center space-y-3">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <CardTitle className="text-2xl">Email verified!</CardTitle>
                <CardDescription>
                  Your account is now active. You can access your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => navigate("/", { replace: true })}
                >
                  Go to dashboard
                </Button>
              </CardContent>
            </>
          )}

          {/* ── Invalid link ── */}
          {view === "error_invalid" && (
            <>
              <CardHeader className="text-center space-y-3">
                <div className="flex justify-center">
                  <XCircle className="h-10 w-10 text-destructive" />
                </div>
                <CardTitle className="text-2xl">
                  Invalid verification link
                </CardTitle>
                <CardDescription>
                  This link is not valid. It may have already been used or
                  copied incorrectly. Request a fresh link below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {userEmail && (
                  <>
                    {regenerateMutation.error && (
                      <FormBanner error={regenerateMutation.error} />
                    )}
                    {regenerateButton}
                  </>
                )}
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/login">Back to sign in</Link>
                </Button>
              </CardContent>
            </>
          )}

          {/* ── Expired link ── */}
          {view === "error_expired" && (
            <>
              <CardHeader className="text-center space-y-3">
                <div className="flex justify-center">
                  <XCircle className="h-10 w-10 text-amber-500" />
                </div>
                <CardTitle className="text-2xl">
                  Verification link expired
                </CardTitle>
                <CardDescription>
                  This link has expired — verification links are valid for 5
                  minutes. Request a fresh one below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {userEmail && (
                  <>
                    {regenerated && (
                      <FeedbackAlert variant="success">
                        A new link has been sent to <strong>{userEmail}</strong>
                        . Check your inbox — it expires in 5 minutes.
                      </FeedbackAlert>
                    )}
                    {regenerateMutation.error && !regenerated && (
                      <FormBanner error={regenerateMutation.error} />
                    )}
                    {regenerateButton}
                  </>
                )}
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/login">Back to sign in</Link>
                </Button>
              </CardContent>
            </>
          )}

          {/* ── Default prompt (no token in URL yet) ── */}
          {view === "prompt" && (
            <>
              <CardHeader className="text-center space-y-3">
                <div className="flex justify-center">
                  <MailCheck className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Check your email</CardTitle>
                <CardDescription>
                  We sent a verification link to{" "}
                  <strong>{userEmail || "your email address"}</strong>. Open it
                  to activate your account. The link expires in{" "}
                  <strong>5 minutes</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {regenerated && (
                  <FeedbackAlert variant="success">
                    A verification link has been sent to{" "}
                    <strong>{userEmail}</strong>. Please check your inbox. The
                    link expires in{" "}
                    {formatTime(cooldown > 0 ? cooldown : REGENERATE_COOLDOWN)}.
                  </FeedbackAlert>
                )}

                {!regenerated && (
                  <>
                    {regenerateMutation.error && (
                      <FormBanner error={regenerateMutation.error} />
                    )}
                    <p className="text-center text-sm text-muted-foreground">
                      Didn&apos;t receive it? Check your spam folder or:
                    </p>
                  </>
                )}
                {userEmail && regenerateButton}

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    useAuthStore.getState().clearUser();
                    navigate("/login", { replace: true });
                  }}
                >
                  Sign out
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
