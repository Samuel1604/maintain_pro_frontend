import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { mapHttpToAppError } from "@/lib/errors/errorMapper";
import { useVerificationModalStore } from "@/features/auth/store/useVerificationModalStore";

/**
 * Centralized error interception: any query or mutation anywhere in the app
 * that comes back with `code: "EMAIL_NOT_VERIFIED"` opens the reusable
 * verification modal here, once, instead of every feature/component having
 * to check `user.isVerified` before calling a restricted operation.
 */
function handleGlobalError(error: unknown) {
  const appError = mapHttpToAppError(error);

  if (appError.category === "EMAIL_VERIFICATION_REQUIRED") {
    useVerificationModalStore.getState().open("combined", 15);
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleGlobalError }),
  mutationCache: new MutationCache({ onError: handleGlobalError }),

  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,

      gcTime: 1000 * 60 * 15,

      // A retry after a 4s transport timeout would push normal navigation
      // beyond the product's five-second loading budget. Mutations/pages that
      // need retry expose an explicit user retry action instead.
      retry: 0,

      refetchOnWindowFocus: false,
    },

    mutations: {
      retry: 0,
    },
  },
});
