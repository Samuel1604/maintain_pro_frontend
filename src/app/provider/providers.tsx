import React from "react";

import { RouterProvider } from "react-router-dom";

import { Toaster } from "sonner";
import { CheckCircle2, CircleAlert, Info, Loader2, TriangleAlert } from "lucide-react";

import { router } from "../router";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./ThemeProvider";
import { AuthInitializer } from "@/features/auth/components/AuthInitializer";
import { RealtimeProvider } from "@/realtime/RealtimeProvider";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";

/**
 * Single source of truth for toast icons across the app — no emojis, no
 * per-call-site icon props. Every `toast.success/error/warning/info(...)`
 * call anywhere in the app automatically picks these up.
 */
const TOAST_ICONS = {
  success: <CheckCircle2 className="h-4 w-4" aria-hidden />,
  error: <CircleAlert className="h-4 w-4" aria-hidden />,
  warning: <TriangleAlert className="h-4 w-4" aria-hidden />,
  info: <Info className="h-4 w-4" aria-hidden />,
  loading: <Loader2 className="h-4 w-4 animate-spin" aria-hidden />,
};

export function Providers() {
  return (
    <React.StrictMode>
      <ThemeProvider />

      <ErrorBoundary>
        <QueryProvider>
          <AuthInitializer />
          <RealtimeProvider />
          <RouterProvider router={router} />
        </QueryProvider>
      </ErrorBoundary>

      <Toaster
        richColors
        closeButton
        position="top-right"
        icons={TOAST_ICONS}
        containerAriaLabel="Notifications"
      />
    </React.StrictMode>
  );
}
