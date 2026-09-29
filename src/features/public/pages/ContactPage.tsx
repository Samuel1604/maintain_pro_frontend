import { useEffect, useRef, useState } from "react";

import { PublicNavbar } from "@/features/public/components/PublicNavbar";
import { PublicFooter } from "@/features/public/components/PublicFooter";
import { MaterialIcon } from "@/features/public/components/MaterialIcon";
import { usePageSeo } from "@/features/public/hooks/usePageSeo";

type SubmitState = 'idle' | 'loading' | 'success'

export function ContactPage() {
  usePageSeo({
    title: "Contact",
    description:
      "Get in touch with the MaintainPro support team. We respond to all inquiries within 24 hours.",
    path: "/contact",
  });

  const formRef = useRef<HTMLFormElement>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const timer1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer1Ref.current) clearTimeout(timer1Ref.current);
      if (timer2Ref.current) clearTimeout(timer2Ref.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitState !== 'idle') return

    setSubmitState('loading')
    timer1Ref.current = setTimeout(() => {
      setSubmitState('success')
      formRef.current?.reset()
      timer2Ref.current = setTimeout(() => setSubmitState('idle'), 3000)
    }, 1500)
  }

  return (
    <>
      <PublicNavbar activeItem="contact" />
      <main className="mx-auto max-w-max-width px-gutter-desktop pb-20 pt-32">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h1 className="mb-4 font-headline-xl text-headline-xl text-primary">
            Let&apos;s solve your maintenance challenges together.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Our technical support team is ready to help you optimize your facility operations. Reach
            out and experience the MaintainPro standard.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          <div className="bento-card rounded-xl p-8 md:col-span-7">
            <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    className="w-full rounded-lg border border-border-subtle px-4 py-3 font-body-md outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                    Work Email
                  </label>
                  <input
                    className="w-full rounded-lg border border-border-subtle px-4 py-3 font-body-md outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    id="email"
                    name="email"
                    placeholder="john@company.com"
                    required
                    type="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="message">
                  Your Message
                </label>
                <textarea
                  className="w-full resize-none rounded-lg border border-border-subtle px-4 py-3 font-body-md outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  id="message"
                  name="message"
                  placeholder="How can we help your organization?"
                  required
                  rows={5}
                />
              </div>
              <button
                type="submit"
                disabled={submitState === 'loading'}
                className={`w-full rounded-lg py-4 font-headline-md text-headline-md shadow-sm transition-colors ${
                  submitState === 'success'
                    ? 'bg-status-success text-white'
                    : 'bg-primary text-white hover:bg-primary-container'
                }`}
              >
                {submitState === 'loading' && (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending...
                  </span>
                )}
                {submitState === 'success' && (
                  <span className="flex items-center justify-center gap-2">
                    <MaterialIcon name="check_circle" />
                    Message Sent
                  </span>
                )}
                {submitState === 'idle' && 'Send Message'}
              </button>
            </form>
          </div>

          <div className="space-y-8 md:col-span-5">
            <div className="bento-card space-y-6 rounded-2xl p-8 border border-border-subtle bg-surface-bright shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <MaterialIcon name="mail" />
                </div>
                <div>
                  <h3 className="mb-1 font-headline-md text-headline-md text-on-surface">Support Email</h3>
                  <a
                    className="font-body-lg text-body-lg font-medium text-primary hover:underline"
                    href="mailto:support@maintainpro.com"
                  >
                    support@maintainpro.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-secondary/10 p-3 text-secondary">
                  <MaterialIcon name="headset_mic" />
                </div>
                <div>
                  <h3 className="mb-1 font-headline-md text-headline-md text-on-surface">Enterprise Inquiries</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Dedicated account managers for multi-site organizations and vendor partners.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-border-subtle pt-4">
                <div className="rounded-xl bg-status-success/10 p-3 text-status-success">
                  <MaterialIcon name="timer" />
                </div>
                <div>
                  <h3 className="mb-1 font-headline-md text-headline-md text-on-surface">Response Time</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    We aim to respond to all enquiries within one business day.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-border-subtle bg-surface-subtle p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <MaterialIcon name="location_on" filled />
                  </div>
                  <div>
                    <h4 className="font-label-md text-on-surface">Global Headquarters</h4>
                    <p className="text-xs text-outline">San Francisco, CA • USA</p>
                  </div>
                </div>
                <span className="text-xs font-mono bg-surface-bright border border-border-subtle px-2.5 py-1 rounded">
                  PST (UTC-8)
                </span>
              </div>
              <div className="p-4 bg-surface-bright rounded-xl border border-border-subtle text-xs text-on-surface-variant leading-relaxed">
                548 Market Street, Suite 9000<br />
                San Francisco, CA 94104
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter variant="contact" />
    </>
  )
}
