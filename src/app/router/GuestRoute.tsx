import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/app/store";
import { getDefaultPathForRole } from "@/app/portal.config";

interface GuestRouteProps {
  children: React.ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const user = useAuthStore((state) => state.user);

  // Redirect authenticated, verified users to their role dashboard.
  // Unverified users remain on the login page so the verification modal
  // can be shown without giving them full app access.
  if (user && user.isVerified !== false) {
    return <Navigate to={getDefaultPathForRole(user.role)} replace />;
  }

  return children;
}
