import { useEffect } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/app/store";
import { useVerificationModalStore } from "@/features/auth/store/useVerificationModalStore";

import { Loader } from "@/components/ui/Loader";

interface Props {
  children: React.ReactNode;
}

/**
 * Gates on *authentication* only — a valid session (access + refresh
 * tokens, restored via /me) is enough to stay inside the app. Email
 * verification is an authorization concern handled separately: unverified
 * users see a persistent banner (EmailVerificationBanner) and get a
 * reusable modal when they attempt a restricted operation
 * (EMAIL_NOT_VERIFIED interception in the query client), but they are
 * never redirected out of the app for it.
 */
export default function ProtectedRoute({ children }: Props) {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const openVerificationModal = useVerificationModalStore((s) => s.open);

  useEffect(() => {
    if (user?.isVerified === false) {
      openVerificationModal("combined", 15);
    }
  }, [openVerificationModal, user]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
