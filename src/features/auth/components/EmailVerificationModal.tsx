import { useEffect, useRef, useState } from "react";
import {
  MailCheck,
  RefreshCw,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import {
  useRegenerateVerificationLink,
  useVerifyEmail,
  useResendVerification,
} from "../hooks/useAuthQueries";
import { useAuthStore } from "@/app/store";
import { useVerificationModalStore } from "../store/useVerificationModalStore";
import { useVerificationLinkStore } from "../store/verificationLink.store";
import { authService } from "@/services/auth.service";
import { notify } from "@/components/feedback/toast";
import { getErrorMessage } from "@/lib/get-error-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export function EmailVerificationModal() {
  const isOpen = useVerificationModalStore((s) => s.isModalOpen);
  const mode = useVerificationModalStore((s) => s.mode);
  const autoDismissSeconds = useVerificationModalStore(
    (s) => s.autoDismissSeconds,
  );
  const closeModal = useVerificationModalStore((s) => s.closeModal);
  const open = useVerificationModalStore((s) => s.open);

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const email = user?.email ?? "";

  const [activeTab, setActiveTab] = useState<"link" | "otp">("link");
  const [isRegenerated, setIsRegenerated] = useState(false);

  const [otpState, setOtpState] = useState({
    code: "",
    error: null as string | null,
    isResent: false,
  });

  const [otpVerified, setOtpVerified] = useState(false);
  const [dismissProgress, setDismissProgress] = useState(100);
  const [timerCancelled, setTimerCancelled] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isPending: isRegeneratingLink } = useRegenerateVerificationLink();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyEmail();
  const { mutate: resendOtp, isPending: isResendingOtp } =
    useResendVerification();
  const { forceGenerate, expiresAt } = useVerificationLinkStore();

  useEffect(() => {
    if (mode === "otp") setActiveTab("otp");
    else setActiveTab("link");
  }, [mode]);

  useEffect(() => {
    if (!isOpen || !autoDismissSeconds || timerCancelled) {
      if (dismissTimerRef.current) clearInterval(dismissTimerRef.current);
      return;
    }

    setDismissProgress(100);
    const startTime = Date.now();
    const durationMs = autoDismissSeconds * 1000;

    dismissTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setDismissProgress(remainingPct);

      if (elapsed >= durationMs) {
        clearInterval(dismissTimerRef.current!);
        closeModal();
      }
    }, 100);

    return () => {
      if (dismissTimerRef.current) clearInterval(dismissTimerRef.current);
    };
  }, [isOpen, autoDismissSeconds, timerCancelled, closeModal]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (dismissTimerRef.current) clearInterval(dismissTimerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function startCooldown(seconds: number) {
    if (timerRef.current) clearInterval(timerRef.current as any);
    timerRef.current = setInterval(() => {
      if (!expiresAt || Date.now() >= expiresAt) {
        if (timerRef.current) {
          clearInterval(timerRef.current as any);
          timerRef.current = null;
        }
      }
    }, 1000);
  }

  function handleRegenerateLink() {
    if (!email || isRegeneratingLink) return;
    setTimerCancelled(true);
    setIsRegenerated(true);

    forceGenerate(email, 15)
      .then((data) => {
        const secs = data?.expiresInSeconds ?? 15;
        startCooldown(secs);
        timeoutRef.current = setTimeout(() => setIsRegenerated(false), 5000);
      })
      .catch((err) => {
        notify.error(getErrorMessage(err));
        setIsRegenerated(false);
      });
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !otpState.code || otpState.code.length < 6 || isVerifyingOtp)
      return;

    setTimerCancelled(true);
    setOtpState((prev) => ({ ...prev, error: null }));

    verifyOtp(
      { email, otp: otpState.code },
      {
        onSuccess: async () => {
          try {
            const fresh = await authService.me();
            if (fresh) setUser(fresh);
          } catch {
            // ignore — verification succeeded but fetching profile failed
          }
          setOtpVerified(true);
          setTimeout(() => closeModal(), 1200);
          timeoutRef.current = setTimeout(() => closeModal(), 1200);
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Invalid or expired OTP code";
          setOtpState((prev) => ({ ...prev, error: msg }));
        },
      },
    );
  }

  function handleResendOtp() {
    if (!email || isResendingOtp) return;
    setTimerCancelled(true);

    resendOtp(
      { email },
      {
        onSuccess: () => {
          setOtpState((prev) => ({ ...prev, isResent: true }));
          timeoutRef.current = setTimeout(
            () => setOtpState((prev) => ({ ...prev, isResent: false })),
            5000,
          );
        },
      },
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="!max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/15 p-3 text-white ring-1 ring-white/10">
                {activeTab === "link" ? (
                  <MailCheck size={20} />
                ) : (
                  <KeyRound size={20} />
                )}
              </div>
              <div>
                <DialogTitle className="text-white">Verify your email</DialogTitle>
                <DialogDescription className="text-white/80">
                  {email ? `Sent to ${email}` : "Verification required"}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mode !== "combined" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => open("picker")}
                  className="text-white hover:bg-white/10"
                  type="button"
                  aria-label="Back to sign-in options"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-background px-6 pb-6 pt-5">
          {mode === "combined" && (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "link" | "otp")}>
              <TabsList className="mb-5">
                <TabsTrigger value="link">Instant Link</TabsTrigger>
                <TabsTrigger value="otp">Enter OTP</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="space-y-5">
            {activeTab === "link" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-border bg-muted p-5 text-sm text-muted-foreground leading-6">
                  Check your email. We've sent a verification link to <strong>{email}</strong>. Click the link in the message to complete verification.
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegenerateLink}
                    disabled={isRegeneratingLink}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRegeneratingLink ? "animate-spin" : ""}`} />
                    {isRegeneratingLink
                      ? "Resending..."
                      : isRegenerated
                      ? "Link Resent"
                      : "Resend Verification Email"}
                  </Button>

                  {isRegenerated && (
                    <p className="text-sm text-emerald-600">
                      A fresh verification link has been sent to your email.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "otp" && (
              <div>
                {otpVerified ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-700">
                    <CheckCircle2 className="mx-auto mb-4 h-10 w-10" />
                    <div className="text-lg font-semibold">Email Verified!</div>
                    <p className="mt-2 text-sm text-emerald-700/90">
                      Your account has been successfully verified.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <p className="text-sm text-muted-foreground leading-6">
                      Enter the 6-digit verification code sent to <strong>{email}</strong>:
                    </p>

                    <div className="space-y-2">
                      <Input
                        type="text"
                        maxLength={6}
                        value={otpState.code}
                        onChange={(e) =>
                          setOtpState((prev) => ({
                            ...prev,
                            code: e.target.value.replace(/\D/g, ""),
                          }))
                        }
                        placeholder="123456"
                        className="text-center text-xl tracking-[0.4em] font-semibold"
                      />
                      {otpState.error ? (
                        <p className="text-sm text-destructive">{otpState.error}</p>
                      ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isVerifyingOtp || otpState.code.length < 6}
                      >
                        {isVerifyingOtp ? "Verifying OTP..." : "Verify OTP Code"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isResendingOtp}
                        onClick={handleResendOtp}
                        className="w-full sm:w-auto"
                      >
                        {isResendingOtp ? "Resending..." : "Didn't get a code? Resend"}
                      </Button>
                    </div>

                    {otpState.isResent ? (
                      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-700">
                        A fresh OTP code has been dispatched to your email.
                      </div>
                    ) : null}
                  </form>
                )}
              </div>
            )}

            {autoDismissSeconds && !timerCancelled ? (
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Auto closing soon</span>
                  <span>{Math.ceil((autoDismissSeconds * dismissProgress) / 100)}s</span>
                </div>
                <Progress value={dismissProgress} />
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
