import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { PublicNavbar } from "@/features/public/components/PublicNavbar";
import { PublicFooter } from "@/features/public/components/PublicFooter";
import { MaterialIcon } from "@/features/public/components/MaterialIcon";
import { PUBLIC_ROUTES } from "@/features/public/constants/routes";
import { usePageSeo } from "@/features/public/hooks/usePageSeo";
import { billingService } from "@/services/billingService";
import type { SubscriptionResponseData } from "@/services/billingService";
import { useAuthStore } from "@/app/store";
import { getDefaultPathForRole, getSettingsPath } from "@/app/portal.config";

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const plan = (searchParams.get("plan") || "starter") as "free" | "starter" | "professional" | "enterprise";
  const audience = (searchParams.get("audience") || "organization") as "organization" | "vendor";
  const billingCycle = (searchParams.get("cycle") || "monthly") as "monthly" | "annual";

  const [provider, setProvider] = useState<"stripe" | "paystack" | "flutterwave">("paystack");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingSubscription, setExistingSubscription] = useState(false);
  const [successData, setSuccessData] = useState<SubscriptionResponseData | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [catalogPrice, setCatalogPrice] = useState<number | null>(null);
  const [trialDays, setTrialDays] = useState(0);

  usePageSeo({
    title: "Checkout",
    description: "Complete your MaintainPro subscription checkout.",
    path: "/checkout",
  });

  useEffect(() => {
    let cancelled = false;
    void billingService.getPlanCatalog(audience).then((catalog) => {
      if (!cancelled) {
        const selected = catalog.plans.find((item) => item.id === plan);
        setCatalogPrice(selected ? (billingCycle === "annual" ? selected.annualPrice : selected.monthlyPrice) : 0);
        setTrialDays(selected?.trialDays ?? 0);
      }
    }).catch(() => { if (!cancelled) { setCatalogPrice(null); setTrialDays(0); } });
    return () => { cancelled = true; };
  }, [audience, billingCycle, plan]);

  const currentPrice = catalogPrice ?? 0;
  const displayedTrialDays = trialDays;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setExistingSubscription(false);
    setCheckoutMessage(null);

    try {
      const subscription = await billingService.createSubscription({
        ownerType: audience,
        ownerId: user?.organizationId || user?.vendorId || "000000000000000000000000",
        plan: plan,
        billingCycle: billingCycle,
        provider: provider,
        startsAt: new Date().toISOString(),
      });

      // Paid gateways create a provider checkout session after the subscription
      // record exists. The provider owns card collection; never send card data
      // or provider secrets from this page.
      const checkout = await billingService.initiateCheckout(provider);
      if (checkout.redirectUrl) {
        setCheckoutMessage(`Redirecting to ${provider === "paystack" ? "Paystack" : provider === "stripe" ? "Stripe" : "Flutterwave"} secure checkout…`);
        window.location.assign(checkout.redirectUrl);
        return;
      }

      setSuccessData(subscription);
    } catch (err: any) {
      const message = err?.message || err?.response?.data?.message || "";
      const isAlreadySubscribed = err?.status === 409 || /already has a subscription|already subscribed/i.test(message);
      setExistingSubscription(isAlreadySubscribed);
      setErrorMessage(
        isAlreadySubscribed
          ? "This account already has an active subscription. Manage it from Billing or choose a different plan."
          : message || "Failed to initialize subscription. Please verify details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const portalPath = user ? getDefaultPathForRole(user.role) : null;

  if (successData) {
    return (
      <>
        <PublicNavbar activeItem="pricing" />
        <main className="pt-32 pb-24 px-gutter-mobile md:px-gutter-desktop max-w-2xl mx-auto text-center">
          <div className="bg-surface-bright border border-border-subtle p-10 rounded-2xl shadow-xl space-y-6">
            <div className="w-16 h-16 bg-status-success/15 text-status-success rounded-full flex items-center justify-center mx-auto">
              <MaterialIcon name="check_circle" className="text-4xl" />
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface">
              Subscription Provisioned
            </h1>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Your <span className="font-bold text-primary capitalize">{plan} Plan</span> ({billingCycle} cycle) subscription for{" "}
              <span className="font-bold capitalize">{audience}</span> has been activated with{" "}
              <span className="font-bold text-primary uppercase">{provider}</span>.
            </p>

            <div className="p-5 bg-surface-subtle rounded-xl border border-border-subtle text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-outline">Subscription ID:</span>
                <span className="font-bold text-on-surface">{successData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Status:</span>
                <span className="font-bold text-status-success capitalize">{successData.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Billing Gateway:</span>
                <span className="font-bold uppercase text-primary">{provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Billing Cycle:</span>
                <span className="font-bold capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Starts At:</span>
                <span>{new Date(successData.startsAt).toLocaleDateString()}</span>
              </div>
              {successData.trialEndsAt && (
                <div className="flex justify-between border-t border-border-subtle pt-2 mt-2">
                  <span className="text-outline">Trial End Date ({displayedTrialDays} Days):</span>
                  <span className="text-primary font-bold">{new Date(successData.trialEndsAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              {portalPath ? (
                <Link
                  to={portalPath}
                  className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-label-md hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Go to Portal</span>
                  <MaterialIcon name="arrow_forward" />
                </Link>
              ) : (
                <Link
                  to={audience === "organization" ? PUBLIC_ROUTES.SIGNUP_ORG : PUBLIC_ROUTES.SIGNUP_VENDOR}
                  className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-label-md hover:opacity-90 transition-all shadow-md"
                >
                  Create Account Profile
                </Link>
              )}
            </div>
          </div>
        </main>
        <PublicFooter variant="pricing" />
      </>
    );
  }

  return (
    <>
      <PublicNavbar activeItem="pricing" />
      <main className="relative isolate overflow-hidden bg-surface-subtle/40 pt-32 pb-24 px-gutter-mobile md:px-gutter-desktop">
        <div className="pointer-events-none absolute -left-32 top-16 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-72 -z-10 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            <MaterialIcon name="verified_user" className="text-sm" />
            Secure plan enrollment
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-3">
            Complete Subscription Order
          </h1>
          <p className="mx-auto max-w-xl text-on-surface-variant font-body-md">
            Review your operational plan and continue to the provider’s secure payment experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7 overflow-hidden rounded-3xl border border-border-subtle bg-surface-bright shadow-[0_20px_60px_-32px_rgba(15,23,42,0.35)] space-y-6">
            <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-amber-400" />
            <div className="p-8 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Payment Details
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-outline bg-surface-subtle px-3 py-1.5 rounded-full border border-border-subtle">
                <MaterialIcon name="lock" className="text-sm text-status-success" />
                256-Bit Encrypted
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs font-medium">
                <div className="flex items-start gap-2">
                  <MaterialIcon name="error" />
                  <span>{errorMessage}</span>
                </div>
                {existingSubscription && user && (
                  <button type="button" onClick={() => navigate(`${getSettingsPath(user.role)}?tab=billing`)} className="mt-3 ml-6 font-label-sm text-primary underline underline-offset-2 hover:no-underline">
                    Open Billing settings
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-6">
              {/* Provider Selector Grid */}
              <div className="space-y-2">
                <label className="font-label-md text-on-surface text-xs uppercase tracking-wider text-outline">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    ["stripe", "Stripe", "Cards and digital wallets", "credit_card", "bg-[#635bff]/10 text-[#635bff]"],
                    ["paystack", "Paystack", "Cards, bank and Africa payments", "account_balance", "bg-[#00c3a0]/10 text-[#008f78]"],
                    ["flutterwave", "Flutterwave", "Cards and bank transfers", "language", "bg-orange-500/10 text-orange-600"],
                  ] as const).map(([value, label, description, icon, iconClass]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setProvider(value)}
                      aria-pressed={provider === value}
                      className={`group min-h-[104px] rounded-2xl border p-4 text-left transition-all ${
                        provider === value
                          ? "border-primary bg-primary/[0.04] shadow-md ring-2 ring-primary/10"
                          : "border-border-subtle bg-surface-bright text-outline hover:border-primary/40 hover:bg-surface-subtle hover:shadow-sm"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                            <MaterialIcon name={icon} className="text-lg" />
                          </span>
                          <span>
                            <span className={`block font-label-md text-sm ${provider === value ? "text-primary" : "text-on-surface"}`}>{label}</span>
                            <span className="mt-1 block text-[11px] font-normal leading-4 text-outline">{description}</span>
                          </span>
                        </span>
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${provider === value ? "border-primary bg-primary text-on-primary" : "border-border-subtle bg-surface-bright"}`}>
                          {provider === value && <MaterialIcon name="check" className="text-sm" />}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {checkoutMessage && (
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  {checkoutMessage}
                </div>
              )}

              {provider === "paystack" && (
                <div className="p-3.5 rounded-xl bg-[#00c3a0]/10 border border-[#00c3a0]/30 text-xs text-on-surface-variant flex items-center gap-2">
                  <MaterialIcon name="open_in_new" className="text-base text-[#008f78] shrink-0" />
                  <span><strong>Paystack:</strong> you’ll be redirected to Paystack’s secure hosted checkout to complete payment.</span>
                </div>
              )}

              <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4 text-xs text-on-surface-variant">
                Payment details are collected only by the selected provider’s secure checkout. MaintainPro never receives or stores card numbers or CVV values.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline-md hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authorizing & Provisioning...
                  </>
                ) : (
                  <>
                    {`Continue with ${provider === "paystack" ? "Paystack" : provider === "stripe" ? "Stripe" : "Flutterwave"}`}
                    <MaterialIcon name="arrow_forward" />
                  </>
                )}
              </button>

              <div className="flex justify-center items-center gap-2 text-xs text-outline pt-1">
                <MaterialIcon name="shield" className="text-sm text-status-success" />
                PCI-DSS Compliant • Immediate Operational Access
              </div>
            </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-5 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-surface-subtle to-surface-subtle p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.3)] space-y-6">
            <h3 className="font-label-md text-outline uppercase tracking-wider text-xs">Order Summary</h3>

            <div className="p-5 bg-surface-bright rounded-xl border border-border-subtle space-y-3 shadow-sm">
              <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                <div>
                  <span className="font-headline-md text-on-surface capitalize block">{plan} Plan</span>
                  <span className="text-xs text-outline capitalize">{audience} Portal Access</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-primary text-lg block">
                    {currentPrice === 0 ? "Free" : `$${currentPrice}/mo`}
                  </span>
                  {billingCycle === "annual" && currentPrice > 0 && (
                    <span className="text-[10px] text-status-success font-semibold uppercase">20% Annual Discount Applied</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-on-surface-variant pt-1">
                <span>Billing Frequency:</span>
                <span className="font-medium capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Trial Period:</span>
                <span className="font-medium text-status-success">
                  {displayedTrialDays === 0 ? "No trial (Instant Access)" : `${displayedTrialDays} Days Complimentary Trial`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Payment Gateway:</span>
                <span className="font-medium capitalize text-primary font-bold">{provider}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <MaterialIcon name="check" className="text-status-success text-sm shrink-0" />
                {displayedTrialDays > 0 ? `Zero commitment during ${displayedTrialDays}-day trial period` : "Immediate active operational provisioning"}
              </div>
              <div className="flex items-center gap-2">
                <MaterialIcon name="check" className="text-status-success text-sm shrink-0" />
                Instant API token & tenant provisioning
              </div>
              <div className="flex items-center gap-2">
                <MaterialIcon name="check" className="text-status-success text-sm shrink-0" />
                Role-appropriate portal permissions enabled
              </div>
            </div>

            <div className="border-t border-border-subtle pt-4 flex justify-between items-center font-headline-md text-on-surface">
              <span>Total Due Today</span>
              <span className="text-primary font-bold font-mono text-lg">
                {currentPrice === 0 ? "$0.00" : displayedTrialDays > 0 ? "$0.00 (Trial)" : `$${currentPrice}.00`}
              </span>
            </div>
          </div>
        </div>
        </div>
      </main>
      <PublicFooter variant="pricing" />
    </>
  );
}
