import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PublicNavbar } from "@/features/public/components/PublicNavbar";
import { PublicFooter } from "@/features/public/components/PublicFooter";
import { MaterialIcon } from "@/features/public/components/MaterialIcon";
import { PUBLIC_ROUTES } from "@/features/public/constants/routes";
import { usePageSeo } from "@/features/public/hooks/usePageSeo";
import { useAuthStore } from "@/app/store";
import { getDefaultPathForRole } from "@/app/portal.config";
import { billingService } from "@/services/billingService";

type PricingAudience = "organization" | "vendor";
type BillingCycle = "monthly" | "annual";

interface PricingPlan {
  id: "free" | "starter" | "professional" | "enterprise";
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  capabilities: string[];
  featured?: boolean;
}

const ORGANIZATION_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "FREE",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Connect single-facility service requests, basic asset logging, and internal work order assignment.",
    capabilities: [
      "Track up to 50 physical assets across 1 location",
      "Service request intake & manual work order assignment",
      "In-house technician assignment and task tracking",
      "Standard asset maintenance history audit trail",
    ],
  },
  {
    id: "starter",
    name: "STARTER",
    monthlyPrice: 29,
    annualPrice: 24,
    description: "For multi-facility operations connecting preventive maintenance, SLAs, and external vendor teams.",
    capabilities: [
      "Unlimited assets & multi-building location hierarchy",
      "Preventive maintenance scheduling against assets and locations",
      "External vendor dispatch and work order assignment",
      "SLA tracking and resolution time visibility",
      "3-month initial trial included",
    ],
    featured: true,
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    monthlyPrice: 59,
    annualPrice: 49,
    description: "For large facility portfolios managing extensive vendor networks, MSA contracts, and procurement tracking.",
    capabilities: [
      "Everything in Starter included",
      "MSA contract enforcement & vendor qualification tracking",
      "Three-way billing verification (Work Order → Quote → Invoice)",
      "Priority support and onboarding assistance",
    ],
  },
];

const VENDOR_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "FREE",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "List service offerings and respond to client work order dispatches.",
    capabilities: [
      "Vendor profile & service category listing",
      "Receive job dispatches & submit quotations",
      "Field technician work assignment tracking",
    ],
  },
  {
    id: "starter",
    name: "STARTER",
    monthlyPrice: 19,
    annualPrice: 15,
    description: "For growing contracted service providers scaling work order volume and team dispatches.",
    capabilities: [
      "Unlimited quotation & purchase order submissions",
      "Team lead dispatch and field technician assignment",
      "Compliance document and insurance certificate management",
      "3-month initial trial included",
    ],
    featured: true,
  },
  {
    id: "professional",
    name: "PROFESSIONAL",
    monthlyPrice: 39,
    annualPrice: 32,
    description: "For established contractor networks managing multi-site enterprise agreements.",
    capabilities: [
      "Everything in Starter included",
      "Multi-client work order management across accounts",
      "Electronic invoicing with work order and PO linkage",
      "Priority support access",
    ],
  },
];

export function PricingPage() {
  const user = useAuthStore((state) => state.user);
  const [pricingAudience, setPricingAudience] = useState<PricingAudience>("organization");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [catalogPrices, setCatalogPrices] = useState<Record<string, { monthlyPrice: number; annualPrice: number }>>({});

  const activePlans = pricingAudience === "organization" ? ORGANIZATION_PLANS : VENDOR_PLANS;

  useEffect(() => {
    let cancelled = false;
    void billingService.getPlanCatalog(pricingAudience)
      .then((catalog) => {
        if (!cancelled) {
          setCatalogPrices(Object.fromEntries(catalog.plans.map((plan) => [plan.id, {
            monthlyPrice: plan.monthlyPrice,
            annualPrice: plan.annualPrice,
          }])));
        }
      })
      .catch(() => {
        if (!cancelled) setCatalogPrices({});
      });
    return () => { cancelled = true; };
  }, [pricingAudience]);

  usePageSeo({
    title: "Pricing & Plans",
    description:
      "MaintainPro connects service requests, work orders, assets, facilities, and external vendors in one operational workflow. Choose the plan structured for your operational role.",
    path: "/pricing",
  });

  return (
    <>
      <PublicNavbar activeItem="pricing" />
      <main className="pt-32 pb-24 px-gutter-mobile md:px-gutter-desktop max-w-max-width mx-auto">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-label-sm shadow-sm mb-6">
            Connected Facility Operations Pricing
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-6">
            Transparent Pricing for Connected Operations
          </h1>
          <p className="text-on-surface-variant font-body-lg leading-relaxed">
            Whether you are managing facility environments or executing contracted service work orders, MaintainPro brings your operational lifecycle into one connected system.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <div className="inline-flex rounded-full bg-surface-subtle border border-border-subtle p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setPricingAudience("organization")}
              aria-pressed={pricingAudience === "organization"}
              className={`rounded-full px-6 py-2.5 font-label-md text-label-md transition-all ${
                pricingAudience === "organization"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              For Organizations & Facilities
            </button>
            <button
              type="button"
              onClick={() => setPricingAudience("vendor")}
              aria-pressed={pricingAudience === "vendor"}
              className={`rounded-full px-6 py-2.5 font-label-md text-label-md transition-all ${
                pricingAudience === "vendor"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              For Service Vendors
            </button>
          </div>

          <div className="inline-flex items-center gap-3 bg-surface-bright border border-border-subtle px-4 py-2 rounded-full font-label-sm text-outline">
            <span>Monthly</span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className={`w-11 h-6 rounded-full p-1 transition-colors ${
                billingCycle === "annual" ? "bg-primary" : "bg-surface-container-highest"
              }`}
              aria-label="Toggle annual billing"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  billingCycle === "annual" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={billingCycle === "annual" ? "text-primary font-bold" : ""}>
              Annual <span className="text-status-success font-semibold">(Save ~20%)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch mb-20">
          {activePlans.map((plan) => {
            const livePrice = catalogPrices[plan.id];
            const displayPrice = billingCycle === "annual"
              ? (livePrice?.annualPrice ?? plan.annualPrice)
              : (livePrice?.monthlyPrice ?? plan.monthlyPrice);

            let planActionUrl: string;
            let buttonText: string;

            if (user) {
              if (plan.id === "free") {
                planActionUrl = getDefaultPathForRole(user.role);
                buttonText = "Go to Portal";
              } else {
                planActionUrl = `${PUBLIC_ROUTES.CHECKOUT}?plan=${plan.id}&audience=${pricingAudience}&cycle=${billingCycle}`;
                buttonText = `Subscribe to ${plan.name}`;
              }
            } else {
              const signupPath = pricingAudience === "organization" ? PUBLIC_ROUTES.SIGNUP_ORG : PUBLIC_ROUTES.SIGNUP_VENDOR;
              if (plan.id === "free") {
                planActionUrl = `${signupPath}?plan=free`;
                buttonText = "Start Free Account";
              } else {
                planActionUrl = `${signupPath}?plan=${plan.id}&cycle=${billingCycle}`;
                buttonText = `Subscribe to ${plan.name}`;
              }
            }

            return (
              <div
                key={plan.id}
                className={
                  plan.featured
                    ? "bg-surface-bright border-2 border-primary p-8 rounded-2xl shadow-xl flex flex-col relative z-10"
                    : "bg-surface-bright border border-border-subtle p-8 rounded-2xl hover:border-primary/40 transition-colors flex flex-col"
                }
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    Recommended
                  </div>
                )}
                <h2
                  className={`font-label-md tracking-wider mb-4 ${plan.featured ? "text-primary font-bold" : "text-outline"}`}
                >
                  {plan.name}
                </h2>
                <div className="text-headline-xl font-headline-xl text-on-surface mb-2">
                  {displayPrice === 0 ? (
                    "Free"
                  ) : (
                    <>
                      ${displayPrice}
                      <span className="text-body-md font-normal text-on-surface-variant">
                        /mo
                      </span>
                    </>
                  )}
                </div>
                <p className="text-on-surface-variant mb-8 font-body-md leading-relaxed min-h-[50px]">
                  {plan.description}
                </p>
                <div className="border-t border-border-subtle pt-6 mb-8 flex-grow">
                  <div className="font-label-sm text-outline mb-4 uppercase">Operational Capabilities</div>
                  <ul className="space-y-3.5">
                    {plan.capabilities.map((capability) => (
                      <li key={capability} className="flex items-start gap-3 font-body-md text-on-surface">
                        <MaterialIcon name="check_circle" className="text-primary text-lg shrink-0 mt-0.5" />
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to={planActionUrl}
                  className={
                    plan.featured
                      ? "block w-full rounded-xl bg-primary py-3.5 text-center font-headline-md text-on-primary shadow-lg shadow-primary/20 transition-all hover:opacity-90"
                      : "block w-full rounded-xl border border-primary py-3.5 text-center font-headline-md text-primary transition-all hover:bg-surface-subtle"
                  }
                >
                  {buttonText}
                </Link>
              </div>
            );
          })}
        </div>

        <section className="bg-surface-subtle border border-border-subtle rounded-3xl p-10 md:p-14">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Need Multi-Tenant Enterprise Customization?
            </h2>
            <p className="font-body-lg text-on-surface-variant leading-relaxed">
              MaintainPro provides dedicated deployments for enterprise portfolios requiring custom compliance verification rules, system integrations, or multi-tier vendor governance.
            </p>
            <div className="pt-2">
              <Link
                to={PUBLIC_ROUTES.CONTACT}
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3.5 rounded-xl font-label-md hover:opacity-90 transition-all shadow-md"
              >
                Contact Enterprise Support
                <MaterialIcon name="arrow_forward" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter variant="pricing" />
    </>
  );
}
