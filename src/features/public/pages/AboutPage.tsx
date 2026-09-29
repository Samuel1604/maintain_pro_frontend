import { Link } from "react-router-dom";

import { PublicNavbar } from "@/features/public/components/PublicNavbar";
import { PublicFooter } from "@/features/public/components/PublicFooter";
import { MaterialIcon } from "@/features/public/components/MaterialIcon";
import { PUBLIC_ROUTES } from "@/features/public/constants/routes";
import { usePageSeo } from "@/features/public/hooks/usePageSeo";

const PRINCIPLES = [
  {
    step: "01",
    title: "Operational Clarity Over Feature Abundance",
    body: "MaintainPro is built around what facility and maintenance teams actually need to do, not around what makes a product demo impressive. Every module reflects a real operational role and a real workflow.",
  },
  {
    step: "02",
    title: "Connected, Not Siloed",
    body: "A work order without an asset is incomplete. An asset without a location context is hard to act on. A vendor without a structured relationship to work and payment is just a contact. MaintainPro connects these domains by design.",
  },
  {
    step: "03",
    title: "Role-Appropriate Access",
    body: "A technician should see their work. A finance user should see billing. A vendor should operate independently from client data. Role-scoped interfaces are a structural requirement, not an afterthought.",
  },
  {
    step: "04",
    title: "Traceable from Request to Resolution",
    body: "Every service request, work order, asset update, vendor invoice, and approval action is recorded. Operations that matter need an audit trail, not just a status field.",
  },
];

const WHAT_WE_BUILD = [
  {
    icon: "edit_document",
    title: "A Structured Request Pipeline",
    body: "Service requests submitted by any team member enter a defined review and approval workflow, rather than an untracked inbox.",
  },
  {
    icon: "assignment",
    title: "Work Order Lifecycle Management",
    body: "From open to assigned to completed, each work order carries its full context: asset, location, assignee, notes, and history.",
  },
  {
    icon: "precision_manufacturing",
    title: "Asset & Facility Records",
    body: "Physical assets are tracked with their maintenance history. Facilities are structured hierarchically so location context is always present.",
  },
  {
    icon: "handshake",
    title: "Vendor Relationship Infrastructure",
    body: "Vendors are integrated into the operational workflow by receiving work, submitting quotes and invoices, and maintaining their compliance profile.",
  },
  {
    icon: "bar_chart",
    title: "Operational Reporting",
    body: "Activity across work orders, assets, vendors, and facilities generates queryable records, making reporting a product of normal operations, not a separate effort.",
  },
  {
    icon: "groups",
    title: "Multi-Role Portal Architecture",
    body: "Separate, role-scoped portals for organization staff (Admin, FM, Technician, Finance, Staff) and vendor teams (Lead, Manager, Technician), with each role seeing what they need to act on.",
  },
];

export function AboutPage() {
  usePageSeo({
    title: "About",
    description:
      "MaintainPro is a facility and maintenance management platform built to connect service requests, work orders, assets, vendors, and operational roles in one structured system.",
    path: "/about",
  });

  return (
    <>
      <PublicNavbar activeItem="about" />
      <main className="pt-32 pb-24">

        {/* Hero */}
        <section className="relative overflow-hidden mb-24">
          <div className="absolute inset-0 z-0 opacity-[0.06]">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative z-10 max-w-max-width mx-auto px-gutter-mobile md:px-gutter-desktop text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-label-sm shadow-sm mb-6">
              <MaterialIcon name="info" className="text-sm" />
              About MaintainPro
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-6 leading-tight">
              Built for the Teams That Keep{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Facilities Running
              </span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
              MaintainPro is a facility and maintenance management platform designed to give every
              person in the maintenance lifecycle (from the staff member who spots a problem to the
              technician who resolves it) a structured, connected environment to do their work.
            </p>
          </div>
        </section>

        {/* The Problem We Solve */}
        <section className="mb-32 max-w-max-width mx-auto px-gutter-mobile md:px-gutter-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-primary-container text-on-primary-container p-2.5 rounded-xl material-symbols-outlined">
                  troubleshoot
                </span>
                <h2 className="font-headline-lg text-headline-lg">The Problem</h2>
              </div>
              <div className="space-y-5 text-on-surface-variant font-body-lg text-body-lg leading-relaxed">
                <p>
                  Maintenance operations in most organizations are handled across disconnected tools: a shared inbox for requests, a spreadsheet for assets, phone calls to coordinate vendors, and manual reconciliation of invoices. When things fall through the cracks, the root cause is usually missing structure, not missing effort.
                </p>
                <p>
                  Facility managers do not have clear visibility into what is open and what has been resolved. Technicians get assigned work without the asset context they need. Vendors receive work orders through informal channels and submit invoices that have no traceable link to a purchase order. Finance teams chase down records manually.
                </p>
                <p>
                  These are not technical problems; they are workflow problems caused by the absence of a shared operational system that all roles can rely on.
                </p>
              </div>
            </div>
            <div className="bg-surface-subtle border border-border-subtle rounded-2xl p-8 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-secondary-container text-on-secondary-container p-2 rounded-lg material-symbols-outlined">
                  check_circle
                </span>
                <h3 className="font-headline-md text-headline-md">What MaintainPro Addresses</h3>
              </div>
              {[
                "Service requests that disappear into inboxes",
                "Work orders with no linked asset or location context",
                "Vendor coordination that happens outside the system",
                "Invoices with no traceable link to approved work",
                "Maintenance history that lives in no permanent record",
                "Role-mixed interfaces where everyone sees everything",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <MaterialIcon name="arrow_right" className="text-primary mt-0.5 shrink-0" />
                  <p className="font-body-md text-body-md text-on-surface-variant">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Provide */}
        <section className="mb-32 bg-surface-subtle border-y border-border-subtle py-20">
          <div className="max-w-max-width mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="text-center mb-14">
              <h2 className="font-headline-xl text-headline-xl text-on-surface mb-4">
                What MaintainPro Provides
              </h2>
              <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Each capability is a structural part of the operational workflow, not a standalone module bolted onto a generic platform.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WHAT_WE_BUILD.map((item) => (
                <div
                  key={item.title}
                  className="bg-surface-bright border border-border-subtle rounded-2xl p-6 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                    <MaterialIcon name={item.icon} className="text-2xl" />
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-2">{item.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="mb-32 max-w-max-width mx-auto px-gutter-mobile md:px-gutter-desktop">
          <div className="text-center mb-14">
            <h2 className="font-headline-xl text-headline-xl text-on-surface mb-4">
              What Shaped the System
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              The decisions behind MaintainPro reflect a set of convictions about how operational software should be built.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PRINCIPLES.map((p) => (
              <div
                key={p.step}
                className="flex gap-6 p-7 bg-surface-bright border border-border-subtle rounded-2xl hover:border-primary/30 transition-colors"
              >
                <span className="font-mono text-4xl font-bold text-surface-container-highest opacity-40 shrink-0 leading-none mt-1">
                  {p.step}
                </span>
                <div>
                  <h3 className="font-headline-md text-headline-md mb-2">{p.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Who Uses It */}
        <section className="mb-32 max-w-max-width mx-auto px-gutter-mobile md:px-gutter-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-surface-subtle border border-border-subtle rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-3xl p-2 bg-primary/10 rounded-xl">
                  corporate_fare
                </span>
                <h2 className="font-headline-lg text-headline-lg">For Organizations</h2>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-6">
                Teams responsible for managing facilities (commercial properties, campuses, healthcare sites, industrial installations) that need a structured system for maintenance requests, work order execution, asset records, and vendor coordination.
              </p>
              <div className="space-y-3">
                {["Facility Managers", "Maintenance Administrators", "Technicians", "Finance Teams", "Operations Staff"].map((role) => (
                  <div key={role} className="flex items-center gap-3 text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="font-body-md text-body-md">{role}</span>
                  </div>
                ))}
              </div>
              <Link
                to={PUBLIC_ROUTES.SIGNUP_ORG}
                className="mt-8 inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md hover:opacity-90 transition-all shadow-md"
              >
                Register Your Organization
                <MaterialIcon name="arrow_forward" className="text-lg" />
              </Link>
            </div>

            <div className="bg-surface-subtle border border-border-subtle rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary text-3xl p-2 bg-secondary/10 rounded-xl">
                  engineering
                </span>
                <h2 className="font-headline-lg text-headline-lg">For Vendors</h2>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-6">
                External maintenance and service providers dispatched by client organizations to carry out work. Vendors operate from their own dedicated portal, with roles for Team Leads, Managers, and Technicians managing assigned jobs, quotations, purchase orders, and invoices without client data exposure.
              </p>
              <div className="space-y-3">
                {["Vendor Team Leads", "Vendor Managers", "Field Technicians", "Specialist Contractors"].map((role) => (
                  <div key={role} className="flex items-center gap-3 text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                    <span className="font-body-md text-body-md">{role}</span>
                  </div>
                ))}
              </div>
              <Link
                to={PUBLIC_ROUTES.SIGNUP_VENDOR}
                className="mt-8 inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-xl font-label-md hover:opacity-90 transition-all shadow-md"
              >
                Register as a Vendor
                <MaterialIcon name="arrow_forward" className="text-lg" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-max-width mx-auto px-gutter-mobile md:px-gutter-desktop">
          <div className="bg-surface-subtle border border-border-subtle rounded-3xl p-10 md:p-14 text-center">
            <h2 className="font-headline-xl text-headline-xl text-on-surface mb-4">
              See the System in Practice
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto mb-8 leading-relaxed">
              Create an account to access the organization or vendor portal and experience the connected operational workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={PUBLIC_ROUTES.SIGNUP_ORG}
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3.5 rounded-xl font-label-md hover:opacity-90 transition-all shadow-md"
              >
                Register as Organization
                <MaterialIcon name="arrow_forward" />
              </Link>
              <Link
                to={PUBLIC_ROUTES.FEATURES}
                className="inline-flex items-center gap-2 border border-border-subtle text-on-surface px-8 py-3.5 rounded-xl font-label-md hover:border-primary/40 hover:bg-surface-subtle transition-all"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </section>

      </main>
      <PublicFooter variant="about" />
    </>
  );
}
