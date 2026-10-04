import { PublicFooter } from '@/features/public/components/PublicFooter'
import { PublicNavbar } from '@/features/public/components/PublicNavbar'

export function PrivacyPolicyPage() {
  return (
    <>
      <PublicNavbar />
      <main className="mx-auto max-w-max-width px-gutter-desktop pb-20 pt-32">
        <section className="rounded-2xl border border-border-subtle bg-surface-bg p-8 md:p-12">
          <h1 className="mb-4 font-headline-xl text-headline-xl text-primary">Privacy Policy</h1>
          <p className="mb-6 font-body-lg text-body-lg text-on-surface-variant">
            MaintainPro is committed to protecting your data and privacy across all facility operations
            workflows.
          </p>
          <div className="space-y-5 font-body-md text-body-md text-on-surface-variant">
            <p>
              We process account data, operational records, and maintenance activity strictly to deliver
              the MaintainPro platform and improve reliability, reporting, and support.
            </p>
            <p>
              Data access is role-based, audited, and restricted according to organizational permissions.
              We do not sell customer data.
            </p>
            <p>
              For data requests or privacy inquiries, contact{' '}
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
