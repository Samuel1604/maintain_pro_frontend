import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { MaintainProAppLoader } from "@/components/feedback/MaintainProLoader";
import { ScrollToTop } from "@/components/navigation/ScrollToTop";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { RouteErrorDialog } from "@/app/router/RouteErrorDialog";

import ProtectedRoute from "@/app/router/ProtectedRoute";
import GuestRoute from "@/app/router/GuestRoute";
import PortalRoute, {
  LegacyAssetDetailRedirect,
  LegacyPortalRedirect,
  LegacyWorkOrderDetailRedirect,
  RootRedirect,
} from "@/app/router/PortalRoute";
import { orgPortalRoutes, vendorPortalRoutes } from "@/app/router/portalRoutes";
import { PORTALS } from "@/app/portal.config";

import { PublicLayout } from "@/features/public/layout/PublicLayout";
import { EmailVerificationHost } from "@/features/auth/components/EmailVerificationHost";

function lazyNamed<TModule, TKey extends keyof TModule>(
  loader: () => Promise<TModule>,
  exportName: TKey,
) {
  return lazy(async () => {
    try {
      const module = await loader();
      sessionStorage.removeItem("maintainpro:chunk-reload");
      return { default: module[exportName] as ComponentType };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isChunkLoadFailure =
        message.includes("Failed to fetch dynamically imported module") ||
        message.includes("Importing a module script failed");

      if (isChunkLoadFailure && !sessionStorage.getItem("maintainpro:chunk-reload")) {
        sessionStorage.setItem("maintainpro:chunk-reload", "1");
        window.location.reload();
      }

      throw error;
    }
  });
}

function lazyPage(element: ReactNode) {
  return <Suspense fallback={<MaintainProAppLoader />}>{element}</Suspense>;
}

const Login = lazyNamed(() => import("@/features/auth/pages/Login"), "Login");
const SignupHub = lazyNamed(() => import("@/features/auth/pages/SignupHub"), "SignupHub");
const SignupOrganization = lazyNamed(
  () => import("@/features/auth/pages/SignupOrganization"),
  "SignupOrganization",
);
const SignupVendor = lazyNamed(() => import("@/features/auth/pages/SignupVendor"), "SignupVendor");
const ForgotPassword = lazyNamed(
  () => import("@/features/auth/pages/ForgotPassword"),
  "ForgotPassword",
);
const ResetPassword = lazyNamed(
  () => import("@/features/auth/pages/ResetPassword"),
  "ResetPassword",
);
const AcceptInvite = lazyNamed(() => import("@/features/auth/pages/AcceptInvite"), "AcceptInvite");
const VerifyEmailPage = lazyNamed(() => import("@/features/auth/pages/VerifyEmail"), "VerifyEmail");
const OAuthSuccess = lazyNamed(() => import("@/features/auth/pages/OAuthSuccess"), "OAuthSuccess");
const UnauthorizedPage = lazy(() => import("@/features/auth/pages/UnauthorizedPage"));

import { AboutPage } from "@/features/public/pages/AboutPage";
import { ContactPage } from "@/features/public/pages/ContactPage";
import { FeaturesPage } from "@/features/public/pages/FeaturesPage";
import { PricingPage } from "@/features/public/pages/PricingPage";
import { CheckoutPage } from "@/features/public/pages/CheckoutPage";
import { PrivacyPolicyPage } from "@/features/public/pages/PrivacyPolicyPage";
import { LandingPage } from "@/features/public/pages/LandingPage";
import { TermsOfServicePage } from "@/features/public/pages/TermsOfServicePage";

/** Legacy segments that used to be bare /dashboard etc. */
const LEGACY_SEGMENTS = [
  "dashboard",
  "work-orders",
  "work-orders/new",
  "assets",
  "locations",
  "preventive-maintenance",
  "service-requests",
  "vendors",
  "inventory",
  "reports",
  "notifications",
  "settings",
] as const;

const legacyRedirects = LEGACY_SEGMENTS.map((segment) => ({
  path: `/${segment}`,
  element: <LegacyPortalRedirect segment={segment} />,
}));

/** Legacy /app/org|tech|vendor redirects → new role-based URLs */
const legacyAppRedirects = [
  { path: "/app/org/*", element: <LegacyPortalRedirect segment="dashboard" /> },
  {
    path: "/app/vendor/*",
    element: <LegacyPortalRedirect segment="dashboard" />,
  },
];

function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
      <EmailVerificationHost />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorDialog />,
    children: [
      /* PUBLIC MARKETING ROUTES */
      {
        element: <PublicLayout />,
        children: [
          { path: "/", element: <LandingPage /> },
          { path: "/features", element: <FeaturesPage /> },
          { path: "/pricing", element: <PricingPage /> },
          { path: "/checkout", element: <CheckoutPage /> },
          { path: "/about", element: <AboutPage /> },
          { path: "/contact", element: <ContactPage /> },
          { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
          {
            path: "/terms-of-service",
            element: <TermsOfServicePage />,
          },
        ],
      },

      /* AUTH ROUTES */
      {
        element: (
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        ),
        children: [
          { path: "/login", element: lazyPage(<Login />) },
          { path: "/oauth/success", element: lazyPage(<OAuthSuccess />) },
          { path: "/signup", element: lazyPage(<SignupHub />) },
          {
            path: "/signup/organization",
            element: lazyPage(<SignupOrganization />),
          },
          { path: "/signup/vendor", element: lazyPage(<SignupVendor />) },
          { path: "/forgot-password", element: lazyPage(<ForgotPassword />) },
          { path: "/reset-password", element: lazyPage(<ResetPassword />) },
          { path: "/accept-invite", element: lazyPage(<AcceptInvite />) },
        ],
      },

      { path: "/verify-email", element: lazyPage(<VerifyEmailPage />) },
      { path: "/unauthorized", element: lazyPage(<UnauthorizedPage />) },

      /* Email verification is handled primarily in-app via modal; */
      /* /verify-email remains available for email-link verification fallback. */

      /*
       * ORG PORTAL — /org/:roleSegment/*
       * roleSegment: admin | facility_manager | technician | staff | finance
       */
      {
        path: "/:portalSlug",
        element: (
          <ProtectedRoute>
            <PortalRoute portal={PORTALS.ORG}>
              <MainLayout portal={PORTALS.ORG} />
            </PortalRoute>
          </ProtectedRoute>
        ),
        children: [...orgPortalRoutes],
      },

      /* VENDOR PORTAL — /vendor/:roleSegment/* */
      {
        path: "/:portalSlug",
        element: (
          <ProtectedRoute>
            <PortalRoute portal={PORTALS.VENDOR}>
              <MainLayout portal={PORTALS.VENDOR} />
            </PortalRoute>
          </ProtectedRoute>
        ),
        children: [...vendorPortalRoutes],
      },

      /* LEGACY /app/* REDIRECTS → new URL structure */
      ...legacyAppRedirects,

      /* LEGACY BARE ROUTE REDIRECTS */
      ...legacyRedirects,
      { path: "/work-orders/:id", element: <LegacyWorkOrderDetailRedirect /> },
      { path: "/assets/:id", element: <LegacyAssetDetailRedirect /> },

      /* CATCH-ALL */
      { path: "*", element: <RootRedirect /> },
    ],
  },
]);
