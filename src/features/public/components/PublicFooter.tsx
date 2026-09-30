import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { PUBLIC_ROUTES } from "@/features/public/constants/routes";

type FooterVariant = "landing" | "features" | "about" | "contact" | "pricing";

interface PublicFooterProps {
  variant?: FooterVariant;
}

export function PublicFooter({ variant = "landing" }: PublicFooterProps) {
  // Keep the public experience consistent across every marketing page.
  // `variant` remains accepted for existing call sites and future active-state needs.
  void variant;
  const showNewsletter = true;
  const [newsletterState, setNewsletterState] = useState<"idle" | "success">(
    "idle",
  );
  const newsletterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (newsletterTimeoutRef.current) clearTimeout(newsletterTimeoutRef.current);
    };
  }, []);

  return (
    <footer className="w-full border-t border-border-subtle bg-surface-container-lowest py-12">
      <div className="mx-auto grid max-w-max-width grid-cols-1 gap-8 px-gutter-desktop md:grid-cols-4">
        <div className="md:col-span-1">
          <BrandLogo
            to={PUBLIC_ROUTES.HOME}
            iconSize={28}
            textClassName="font-headline-md text-headline-md font-bold text-primary"
            className="mb-6"
          />
          <p className="font-body-md text-body-md text-on-surface-variant">
            A connected system for facility operations, maintenance work, assets, and external service
            vendors.
          </p>
        </div>

        <div>
          <h4 className="mb-6 font-label-md text-label-md font-bold text-on-surface">
            Platform
          </h4>
          <ul className="space-y-4">
            <li>
              <Link
                to={PUBLIC_ROUTES.FEATURES}
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                to={PUBLIC_ROUTES.PRICING}
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                to={PUBLIC_ROUTES.SIGNUP_ORG}
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                Organizations
              </Link>
            </li>
            <li>
              <Link
                to={PUBLIC_ROUTES.SIGNUP_VENDOR}
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                Vendors
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 font-label-md text-label-md font-bold text-on-surface">
            Company
          </h4>
          <ul className="space-y-4">
            <li>
              <Link
                to={PUBLIC_ROUTES.ABOUT}
                className={
                  variant === "about"
                    ? "font-body-md text-body-md font-bold text-primary"
                    : "text-on-surface-variant transition-colors hover:text-primary"
                }
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to={PUBLIC_ROUTES.PRIVACY}
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to={PUBLIC_ROUTES.TERMS}
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {showNewsletter && (
          <div>
            <h4 className="mb-6 font-label-md text-label-md font-bold text-on-surface">
              Newsletter
            </h4>
            <p className="mb-4 font-body-md text-body-md text-on-surface-variant">
              Stay updated with facility trends.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setNewsletterState("success");
                newsletterTimeoutRef.current = setTimeout(() => setNewsletterState("idle"), 2500);
              }}
            >
              <input
                className="w-full rounded-lg border border-border-subtle bg-surface-subtle px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
                placeholder="Email address"
                type="email"
                aria-label="Email address for newsletter"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 font-label-sm text-label-sm text-on-primary"
              >
                {newsletterState === "success" ? "Joined" : "Join"}
              </button>
            </form>
            {newsletterState === "success" && (
              <p className="mt-2 font-label-sm text-label-sm text-status-success">
                Thanks for subscribing.
              </p>
            )}
          </div>
        )}

      </div>

      <div className="mx-auto mt-12 max-w-max-width border-t border-border-subtle px-gutter-desktop pt-8 text-center font-body-md text-body-md text-on-surface-variant">
        © 2026 MaintainPro Inc. All rights reserved.
      </div>
    </footer>
  );
}
