import { Outlet } from "react-router-dom";
import { EmailVerificationBanner } from "@/features/auth/components/EmailVerificationBanner";

/**
 * Main application layout component.
 * This is where global elements like headers, footers, and banners are rendered.
 */
export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* The verification banner will use the auth store to determine its own visibility */}
      <EmailVerificationBanner />
      <main className="flex-grow">
        <Outlet /> {/* Renders the current route's component */}
      </main>
    </div>
  );
}
