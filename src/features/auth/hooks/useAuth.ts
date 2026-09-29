import { useAuthStore } from "../store/auth.store";
import { useLogout } from "./useAuthQueries";

export function useAuth() {
  const store = useAuthStore();
  const logoutMutation = useLogout();

  return {
    ...store,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}
