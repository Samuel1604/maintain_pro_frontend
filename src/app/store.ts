import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  resolvePortalForRole,
  type Portal,
} from "@/app/portal.config";
import type { User } from "@/types/user.types";
import type { OrganizationProfile } from "@/features/organization/types/organization.types";

interface AuthStore {
  user: User | null;
  organization: OrganizationProfile | null;
  currentPortal: Portal | null;
  isHydrated: boolean;

  setUser: (user: User) => void;
  setOrganization: (organization: OrganizationProfile | null) => void;
  updateUser: (patch: Partial<User>) => void;
  updateOrganization: (patch: Partial<OrganizationProfile>) => void;
  clearUser: () => void;
  setHydrated: (value?: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      currentPortal: null,
      isHydrated: false,

      setUser: (user) =>
        set({
          user,
          currentPortal: resolvePortalForRole(user.role),
          isHydrated: true,
        }),

      setOrganization: (organization) =>
        set((state) => {
          if (organization?.name) {
            try {
              localStorage.setItem("maintainpro_organization_name", organization.name);
            } catch {
              /* ignore quota errors */
            }
          }
          return { organization };
        }),

      updateUser: (patch) => {
        set((state) => {
          if (!state.user) return state;

          const user = {
            ...state.user,
            ...patch,
            updatedAt: new Date().toISOString(),
          };

          return {
            user,
            currentPortal: resolvePortalForRole(user.role),
          };
        });
      },

      updateOrganization: (patch) => {
        set((state) => {
          if (!state.organization) return state;

          const organization = {
            ...state.organization,
            ...patch,
            updatedAt: new Date().toISOString(),
          };

          if (organization.name) {
            try {
              localStorage.setItem("maintainpro_organization_name", organization.name);
            } catch {
              /* ignore quota errors */
            }
          }

          return { organization };
        });
      },

      clearUser: () => {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("maintainpro_organization_name");
          localStorage.removeItem("maintainpro_organization_id");
          localStorage.removeItem("maintainpro_auth_storage");
        }
        set({
          user: null,
          organization: null,
          currentPortal: null,
          isHydrated: true,
        });
      },

      setHydrated: (value = true) => set({ isHydrated: value }),
    }),
    {
      name: "maintainpro_auth_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        organization: state.organization,
      }),
      onRehydrateStorage: () => () => {
        /* Session user is restored from /auth/me, not localStorage. */
      },
    }
  )
);
