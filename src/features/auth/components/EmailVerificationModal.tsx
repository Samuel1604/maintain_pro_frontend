import { useEffect, useRef, useState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { useVerifyEmail, useResendVerification } from "../hooks/useAuthQueries";
import { useAuthStore } from "@/app/store";
import { useVerificationModalStore } from "../store/useVerificationModalStore";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export function EmailVerificationModal() {
  const isOpen = useVerificationModalStore((s) => s.isModalOpen);
  const autoDismissSeconds = useVerificationModalStore((s) => s.autoDismissSeconds);
  const closeModal = useVerificationModalStore((s) => s.closeModal);

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const email = user?.email ?? "";

  const [otpState, setOtpState] = useState({
    code: "",
    error: null as string | null,
    isResent: false,
  });

  const [otpVerified, setOtpVerified] = useState(false);
  const [dismissProgress, setDismissProgress] = useState(100);

  const dismissTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyEmail();
  const { mutate: resendOtp, isPending: isResendingOtp } = useResendVerification();

  useEffect(() => {
    if (!isOpen || !autoDismissSeconds) {
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
  }, [isOpen, autoDismissSeconds, closeModal]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearInterval(dismissTimerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !otpState.code || otpState.code.length < 6 || isVerifyingOtp) return;

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
          const msg = err.response?.data?.message || err.message || "Invalid or expired OTP code";
          setOtpState((prev) => ({ ...prev, error: msg }));
        },
      },
    );
  }

  function handleResendOtp() {
    if (!email || isResendingOtp) return;

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

  const canDismiss = otpVerified || !autoDismissSeconds;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && canDismiss && closeModal()}>
      <DialogContent className="!max-w-xl min-h-[32rem] sm:min-h-[38rem] max-h-[calc(100dvh-2rem)] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/15 p-3 text-white ring-1 ring-white/10">
                <KeyRound size={20} />
              </div>
              <div>
                <DialogTitle className="text-white">Verify your email</DialogTitle>
                <DialogDescription className="text-white/80">
                  {email ? `Sent to ${email}` : "Verification required"}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2"></div>
          </div>
        </div>

        <div className="bg-background px-6 pb-6 pt-5">
          <div className="space-y-5">
            <div>
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
            </div>

            {autoDismissSeconds ? (
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
