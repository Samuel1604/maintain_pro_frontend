import { PublicFooter } from '@/features/public/components/PublicFooter'
import { PublicNavbar } from '@/features/public/components/PublicNavbar'

export function TermsOfServicePage() {
  return (
    <>
      <PublicNavbar />
      <main className="mx-auto max-w-max-width px-gutter-desktop pb-20 pt-32">
        <section className="rounded-2xl border border-border-subtle bg-surface-bg p-8 md:p-12">
          <h1 className="mb-4 font-headline-xl text-headline-xl text-primary">Terms of Service</h1>
          <p className="mb-6 font-body-lg text-body-lg text-on-surface-variant">
            These terms govern use of MaintainPro for enterprise maintenance and facility operations.
          </p>
          <div className="space-y-5 font-body-md text-body-md text-on-surface-variant">
            <p>
              By using the platform, users agree to authorized, role-based usage aligned with their
              organization’s policies and applicable service agreements.
            </p>
            <p>
              Organizations are responsible for account governance, workflow configuration, and
              compliance with regulatory obligations for uploaded operational data.
            </p>
            <p>
              For legal or contractual questions, contact{' '}
              <a className="text-primary underline" href="mailto:support@maintainpro.com">
                support@maintainpro.com
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <PublicFooter variant="contact" />
    </>
  )
}
