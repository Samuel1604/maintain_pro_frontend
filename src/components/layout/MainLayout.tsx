import { Outlet } from "react-router-dom";

import type { Portal } from "@/app/portal.config";
import { getPortalForRole } from "@/app/portal.config";
import { AppSidebar as Sidebar } from "@/components/navigation/Sidebar";
import { EmailVerificationBanner } from "@/features/auth/components/EmailVerificationBanner";
import { useAuthStore } from "@/app/store";

interface MainLayoutProps {
  portal: Portal;
}

import { KeyboardShortcutsModal } from "@/components/navigation/KeyboardShortcutsModal";

export function MainLayout({ portal }: MainLayoutProps) {
  const user = useAuthStore((state) => state.user);
  const activePortal = user ? getPortalForRole(user.role) : portal;

  return (
    <div className="app-portal flex h-dvh max-h-dvh overflow-hidden bg-background text-foreground">
      <div className="hidden h-full shrink-0 lg:flex">
        <Sidebar portal={activePortal} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
        <EmailVerificationBanner />
        <main
          data-scroll-container
          className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 bg-background"
        >
          <Outlet />
        </main>
      </div>
      <KeyboardShortcutsModal />
    </div>
  );
}
