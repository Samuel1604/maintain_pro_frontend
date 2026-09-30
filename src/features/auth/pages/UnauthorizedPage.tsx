import { getDefaultPathForRole } from "@/app/portal.config";
import { useAuthStore } from "@/app/store";
import { ErrorPage } from "@/components/feedback/ErrorPage";

export default function UnauthorizedPage() {
  const user = useAuthStore((state) => state.user);
  const dashboardPath = user ? getDefaultPathForRole(user.role) : "/login";

  return (
    <ErrorPage
      kind="unauthorized"
      title="Access denied"
      message="You do not have permission to access this page."
      primaryAction={{ label: "Back to dashboard", to: dashboardPath }}
      secondaryAction={{ label: "Login again", to: "/login" }}
    />
  );
}
