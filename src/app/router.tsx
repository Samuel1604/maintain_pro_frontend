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
    const module = await loader();
    return { default: module[exportName] as ComponentType };
  });
}

function lazyPage(element: ReactNode) {
  return <Suspense fallback={<MaintainProAppLoader />}>{element}</Suspense>;
}

const Login = lazyNamed(() => import("@/features/auth/pages/Login"), "Login");
const SignupHub = lazyNamed(
  () => import("@/features/auth/pages/SignupHub"),
  "SignupHub",
);
const SignupOrganization = lazyNamed(
  () => import("@/features/auth/pages/SignupOrganization"),
  "SignupOrganization",
);
const SignupVendor = lazyNamed(
  () => import("@/features/auth/pages/SignupVendor"),
  "SignupVendor",
);
const ForgotPassword = lazyNamed(
  () => import("@/features/auth/pages/ForgotPassword"),
  "ForgotPassword",
);
const ResetPassword = lazyNamed(
  () => import("@/features/auth/pages/ResetPassword"),
  "ResetPassword",
);
const AcceptInvite = lazyNamed(
  () => import("@/features/auth/pages/AcceptInvite"),
  "AcceptInvite",
);
const VerifyEmailPage = lazyNamed(
  () => import("@/features/auth/pages/VerifyEmail"),
  "VerifyEmail",
);
const OAuthSuccess = lazyNamed(
  () => import("@/features/auth/pages/OAuthSuccess"),
  "OAuthSuccess",
);
const UnauthorizedPage = lazy(
  () => import("@/features/auth/pages/UnauthorizedPage"),
);

const AboutPage = lazyNamed(
  () => import("@/features/public/pages/AboutPage"),
  "AboutPage",
);
const ContactPage = lazyNamed(
  () => import("@/features/public/pages/ContactPage"),
  "ContactPage",
);
const FeaturesPage = lazyNamed(
  () => import("@/features/public/pages/FeaturesPage"),
  "FeaturesPage",
);
const PricingPage = lazyNamed(
  () => import("@/features/public/pages/PricingPage"),
  "PricingPage",
);
const CheckoutPage = lazyNamed(
  () => import("@/features/public/pages/CheckoutPage"),
  "CheckoutPage",
);
const PrivacyPolicyPage = lazyNamed(
  () => import("@/features/public/pages/PrivacyPolicyPage"),
  "PrivacyPolicyPage",
);
const PublicHomeRoute = lazyNamed(
  () => import("@/features/public/pages/LandingPage"),
  "LandingPage",
);
const TermsOfServicePage = lazyNamed(
  () => import("@/features/public/pages/TermsOfServicePage"),
  "TermsOfServicePage",
);

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
          { path: "/", element: lazyPage(<PublicHomeRoute />) },
          { path: "/features", element: lazyPage(<FeaturesPage />) },
          { path: "/pricing", element: lazyPage(<PricingPage />) },
          { path: "/checkout", element: lazyPage(<CheckoutPage />) },
          { path: "/about", element: lazyPage(<AboutPage />) },
          { path: "/contact", element: lazyPage(<ContactPage />) },
          { path: "/privacy-policy", element: lazyPage(<PrivacyPolicyPage />) },
          {
            path: "/terms-of-service",
            element: lazyPage(<TermsOfServicePage />),
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
        children: [
          ...orgPortalRoutes,
        ],
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
        children: [
          ...vendorPortalRoutes,
        ],
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
