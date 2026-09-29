import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getDefaultPathForRole } from "@/app/portal.config";
import { useAuthStore } from "@/app/store";
import { authService } from "@/services/auth.service";
import { authKeys } from "../constants/queryKeys";
import type {
  AcceptInvitationRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterOrganizationRequest,
  RegisterVendorRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyEmailLinkRequest,
  RegenerateVerificationRequest,
} from "../types/auth.types";

import { useVerificationModalStore } from "../store/useVerificationModalStore";
import { organizationApi } from "@/features/organization/api/organization.api";
import { vendorsApi } from "@/features/vendors/api/vendors.api";
import type { User } from "@/types/user.types";

function useApplyAuthenticatedSession() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const setOrganization = useAuthStore((state) => state.setOrganization);
  const updateUser = useAuthStore((state) => state.updateUser);
  const openVerificationModal = useVerificationModalStore(
    (state) => state.open,
  );

  return async (
    user: NonNullable<Awaited<ReturnType<typeof authService.me>>>,
    targetPath?: string,
  ) => {
    // The user object from login/register is the source of truth.
    setUser(user);
    {
      // In live mode, we can trust the slugs returned from the backend user object
      if (user.organizationSlug) {
        localStorage.setItem("maintainpro_organization_slug", user.organizationSlug);
      }
      if (user.vendorSlug) {
        localStorage.setItem("maintainpro_vendor_slug", user.vendorSlug);
      }

      // Also call the endpoints to fetch profile / update store organization/vendor as needed
      if (user.organizationId) {
        await organizationApi.getCurrent().then((profile) => {
          setOrganization(profile);
          const slug = (profile as typeof profile & { slug?: string }).slug;
          if (slug) {
            localStorage.setItem("maintainpro_organization_slug", slug);
            updateUser({ organizationSlug: slug });
          }
        }).catch(() => undefined);
      } else if (user.vendorId) {
        await vendorsApi.getCurrent().then((profile) => {
          const slug = (profile as typeof profile & { slug?: string }).slug;
          if (slug) {
            localStorage.setItem("maintainpro_vendor_slug", slug);
            updateUser({ vendorSlug: slug });
          }
        }).catch(() => undefined);
      }
    }
    queryClient.setQueryData(authKeys.me, user);

    if (user.isVerified === false) {
      openVerificationModal("combined", 15);
      return;
    }

    navigate(targetPath || getDefaultPathForRole(user.role), { replace: true });
  };
}

export function useLogin() {
  const applyAuthenticatedSession = useApplyAuthenticatedSession();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data: { user: User }) => applyAuthenticatedSession(data.user),
  });
}

export function useRegisterOrganization() {
  const applyAuthenticatedSession = useApplyAuthenticatedSession();

  return useMutation({
    mutationFn: (
      input:
        | RegisterOrganizationRequest
        | { payload: RegisterOrganizationRequest; targetPath?: string },
    ) => {
      const payload = "payload" in input ? input.payload : input;
      const targetPath = "targetPath" in input ? input.targetPath : undefined;
      return authService
        .registerOrganization(payload)
        .then((data) => ({ data, targetPath }));
    },
    onSuccess: ({ data, targetPath }: { data: { user: User }; targetPath?: string }) =>
      applyAuthenticatedSession(data.user, targetPath),
  });
}

export function useRegisterVendor() {
  const applyAuthenticatedSession = useApplyAuthenticatedSession();

  return useMutation({
    mutationFn: (
      input:
        | RegisterVendorRequest
        | { payload: RegisterVendorRequest; targetPath?: string },
    ) => {
      const payload = "payload" in input ? input.payload : input;
      const targetPath = "targetPath" in input ? input.targetPath : undefined;
      return authService
        .registerVendor(payload)
        .then((data) => ({ data, targetPath }));
    },
    onSuccess: ({ data, targetPath }: { data: { user: User }; targetPath?: string }) =>
      applyAuthenticatedSession(data.user, targetPath),
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clearUser);

  const finishLogout = () => {
    clearUser();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: finishLogout,
    onError: finishLogout,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => authService.forgotPassword(payload),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) => authService.resetPassword(payload),
  });
}

export function useAcceptInvitation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: AcceptInvitationRequest) => authService.acceptInvitation(payload),
    onSuccess: () => {
      navigate("/login", { replace: true });
    },
  });
}

export function useVerifyEmail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: VerifyEmailRequest) => authService.verifyEmail(payload),
    onSuccess: () => {
      // Optimistically update the user state
      const currentUser = queryClient.getQueryData<any>(authKeys.me);
      if (currentUser) {
        const updatedUser = { ...currentUser, isVerified: true };
        setUser(updatedUser);
        queryClient.setQueryData(authKeys.me, updatedUser);
        navigate(getDefaultPathForRole(updatedUser.role), { replace: true });
      }
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (payload: ResendVerificationRequest) => authService.resendVerification(payload),
  });
}

export function useVerifyEmailLink() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: VerifyEmailLinkRequest) => authService.verifyEmailLink(payload),
    onSuccess: () => {
      // Optimistically update the user state
      const currentUser = queryClient.getQueryData<any>(authKeys.me);
      if (currentUser) {
        const updatedUser = { ...currentUser, isVerified: true };
        setUser(updatedUser);
        queryClient.setQueryData(authKeys.me, updatedUser);
        navigate(getDefaultPathForRole(updatedUser.role), { replace: true });
      }
    },
  });
}

export function useRegenerateVerificationLink() {
  return useMutation({
    mutationFn: (payload: RegenerateVerificationRequest) => authService.regenerateVerificationLink(payload),
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => authService.me(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
