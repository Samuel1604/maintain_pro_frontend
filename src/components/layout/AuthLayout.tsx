import { Outlet } from "react-router-dom";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AuthBackToHome } from "@/features/auth/components/AuthBackToHome";
import { PublicFooter } from "@/features/public/components/PublicFooter";

export function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute left-4 top-4 z-50">
        <AuthBackToHome />
      </div>
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <Outlet />
      <PublicFooter variant="contact" />
    </div>
  );
}
