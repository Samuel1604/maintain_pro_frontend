import { useEffect } from "react";

import { useAuthStore } from "@/app/store";
import { useCurrentUser } from "../hooks/useAuthQueries";
import { organizationApi } from "@/features/organization/api/organization.api";
import { vendorsApi } from "@/features/vendors/api/vendors.api";

export function AuthInitializer() {
  const { data: user, isError, isLoading, isSuccess } = useCurrentUser();

  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  const moveLegacyRoute = (slug: string) => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/current/')) {
      window.history.replaceState({}, '', `/${slug}${window.location.pathname.slice('/current'.length)}${window.location.search}${window.location.hash}`);
    }
  };

  useEffect(() => {
    if (isLoading) {
      setHydrated(false);
      return;
    }

    if (isSuccess && user) {
      setUser(user);
      {
        if (user.organizationSlug) {
          localStorage.setItem("maintainpro_organization_slug", user.organizationSlug);
          useAuthStore.getState().updateUser({ organizationSlug: user.organizationSlug });
        }
        if (user.vendorSlug) {
          localStorage.setItem("maintainpro_vendor_slug", user.vendorSlug);
          useAuthStore.getState().updateUser({ vendorSlug: user.vendorSlug });
        }

        if (user.organizationId) {
          organizationApi.getCurrent().then((profile) => {
            useAuthStore.getState().setOrganization(profile);
            const slug = (profile as typeof profile & { slug?: string }).slug;
            if (slug) {
              localStorage.setItem("maintainpro_organization_slug", slug);
              useAuthStore.getState().updateUser({ organizationSlug: slug });
              moveLegacyRoute(slug);
            }
          }).catch(() => undefined);
        } else if (user.vendorId) {
          vendorsApi.getCurrent().then((profile) => {
            const slug = (profile as typeof profile & { slug?: string }).slug;
            if (slug) {
              localStorage.setItem("maintainpro_vendor_slug", slug);
              useAuthStore.getState().updateUser({ vendorSlug: slug });
              moveLegacyRoute(slug);
            }
          }).catch(() => undefined);
        }
      }
      return;
    }

    if (isError) {
      clearUser();
      return;
    }
  }, [clearUser, isError, isLoading, isSuccess, setHydrated, setUser, user]);

  return null;
}
