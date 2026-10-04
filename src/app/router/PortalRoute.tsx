import { Navigate, useLocation, useParams } from "react-router-dom";
import {
  getDefaultPathForRole,
  isRoleAllowedInPortal,
  parseRoleSegmentFromPath,
  resolveRoleFromSegment,
  getPortalForRole,
  ROLE_URL_SEGMENT,
  type Portal,
} from "@/app/portal.config";

import { useAuthStore } from "@/app/store";
import {
  canAccessOrgSegment,
  canAccessVendorSegment,
  normalizeOrgAccessSegment,
} from "@/app/access.matrix";

interface PortalRouteProps {
  portal: Portal;

  children: React.ReactNode;
}

export default function PortalRoute({ portal, children }: PortalRouteProps) {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const roleSegment = parseRoleSegmentFromPath(location.pathname);
  const activePortal = roleSegment
    ? (resolveRoleFromSegment("vendor", roleSegment) ? "vendor" : "org")
    : (user ? getPortalForRole(user.role) : portal);

  if (!isHydrated) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ message: "Please log in to access this page." }} replace />;
  }

  if (!isRoleAllowedInPortal(user.role, activePortal)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (roleSegment) {
    const expectedRole = resolveRoleFromSegment(activePortal, roleSegment);

    if (!expectedRole || expectedRole !== user.role) {
      return <Navigate to="/unauthorized" replace />;
    }

    if (activePortal === "org") {
      const pageSegment = location.pathname.split("/").filter(Boolean).slice(2).join("/");
      const accessSegment = normalizeOrgAccessSegment(pageSegment);

      if (!canAccessOrgSegment(user.role, accessSegment)) {
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      const pageSegment = location.pathname.split("/").filter(Boolean).slice(2).join("/");
      if (!canAccessVendorSegment(user.role, pageSegment)) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return <>{children}</>;
}

export function PortalIndexRedirect() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  if (!isHydrated) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleSegment = ROLE_URL_SEGMENT[user.role];
  return <Navigate to={`${roleSegment}/dashboard`} replace />;
}

export function RootRedirect() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  if (!isHydrated) {
    return null;
  }

  if (user) {
    return <Navigate to={getDefaultPathForRole(user.role)} replace />;
  }

  return <Navigate to="/login" replace />;
}

interface LegacyPortalRedirectProps {
  segment: string;
}

/** Redirect legacy /app/org/... and bare /dashboard routes */
export function LegacyPortalRedirect({ segment }: LegacyPortalRedirectProps) {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  if (!isHydrated || !user) {
    return <Navigate to="/login" replace />;
  }

  const path = segment.startsWith("/") ? segment : `/${segment}`;

  return (
    <Navigate
      to={`${getDefaultPathForRole(user.role).replace(
        "/dashboard",
        "",
      )}${path}`}
      replace
    />
  );
}

export function LegacyWorkOrderDetailRedirect() {
  const { id } = useParams<{
    id: string;
  }>();

  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  if (!isHydrated || !user) {
    return <Navigate to="/login" replace />;
  }

  const base = getDefaultPathForRole(user.role).replace("/dashboard", "");

  return <Navigate to={`${base}/work-orders/${id}`} replace />;
}

export function LegacyAssetDetailRedirect() {
  const { id } = useParams<{
    id: string;
  }>();

  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  if (!isHydrated || !user) {
    return <Navigate to="/login" replace />;
  }

  const base = getDefaultPathForRole(user.role).replace("/dashboard", "");

  return <Navigate to={`${base}/assets/${id}`} replace />;
}
