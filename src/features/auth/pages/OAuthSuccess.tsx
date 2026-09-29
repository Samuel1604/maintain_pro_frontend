import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getDefaultPathForRole } from "@/app/portal.config";
import { useAuthStore } from "@/app/store";
import { MaintainProAppLoader } from "@/components/feedback/MaintainProLoader";
import { useCurrentUser } from "@/features/auth/hooks/useAuthQueries";
import { useVerificationModalStore } from "@/features/auth/store/useVerificationModalStore";
import { queryClient } from "@/lib/query-client";
import { authKeys } from "@/features/auth/constants/queryKeys";

export function OAuthSuccess() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const openVerificationModal = useVerificationModalStore((state) => state.open);
  const { data: user, isError, isSuccess } = useCurrentUser();

  useEffect(() => {
    if (isError) {
      navigate("/login", {
        replace: true,
        state: { message: "Social sign-in did not complete. Please try again." },
      });
      return;
    }

    if (!isSuccess || !user) return;

    setUser(user);
    queryClient.setQueryData(authKeys.me, user);

    if (user.isVerified === false) {
      openVerificationModal("combined", 15);
      navigate("/login", { replace: true });
      return;
    }

    navigate(getDefaultPathForRole(user.role), { replace: true });
  }, [isError, isSuccess, navigate, openVerificationModal, setUser, user]);

  return <MaintainProAppLoader />;
}
