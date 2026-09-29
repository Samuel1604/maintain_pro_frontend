import { Link } from "react-router-dom";

import { PublicNavbar } from "@/features/public/components/PublicNavbar";
import { PublicFooter } from "@/features/public/components/PublicFooter";
import { MaterialIcon } from "@/features/public/components/MaterialIcon";
import { PUBLIC_ROUTES } from "@/features/public/constants/routes";
import { usePageSeo } from "@/features/public/hooks/usePageSeo";

interface FeatureItem {
  icon: string;
  title: string;
  body: string;
}

const CORE_FEATURES: FeatureItem[] = [
  {
    icon: "assignment",
    title: "Work Management",
    body: "Any team member can submit a service request. It enters a structured approval queue where a facility manager or administrator reviews, approves, and converts it into a work order. Each work order tracks status, assignment, activity notes, and completion documentation from a single record.",
  },
  {
    icon: "warehouse",
    title: "Asset Management",
    body: "Physical assets (equipment, systems, fixtures) are registered with their location, specifications, and condition. Every work order performed on an asset updates its maintenance history, giving your team a complete record of what has been done, when, and by whom.",
  },
  {
    icon: "apartment",
    title: "Facilities and Locations",
    body: "Organize your operational environment by facility, building, floor, and room. Assets and work orders are associated with specific locations, so you always know where work is happening and which physical spaces have outstanding maintenance needs.",
  },
  {
    icon: "event_repeat",
    title: "Preventive Maintenance",
    body: "Schedule recurring maintenance tasks against specific assets or locations. Rather than waiting for failures, teams define maintenance cycles so work is planned and visible before problems arise. Scheduled tasks generate work orders automatically on their defined interval.",
  },
  {
    icon: "handshake",
    title: "Vendor Management",
    body: "Maintain a directory of external service providers, their service categories, qualifications, and compliance documents. Organizations control which vendors are active and eligible to receive work, with records of their ongoing performance within the system.",
  },
  {
    icon: "construction",
    title: "Vendor Operations Portal",
    body: "Vendors operate from their own dedicated portal, separate from the organization workspace. From it, they manage assigned work orders, respond to quotation requests, receive purchase orders, submit invoices, and coordinate their field technicians without accessing client-side data.",
  },
  {
    icon: "bar_chart",
    title: "Reporting and Visibility",
    body: "Operational activity across work orders, assets, facilities, and vendors produces reporting data that management and facility teams can use. Instead of pulling figures from disconnected spreadsheets, relevant operational history is accessible within the system.",
  },
  {
    icon: "groups",
    title: "Role-Specific Portals",
    body: "MaintainPro provides distinct interfaces for each operational role: Organization Admin, Facility Manager, Technician, Finance, Staff, Vendor Team Lead, Vendor Manager, and Vendor Technician. Each portal surfaces the workflows and information appropriate to that role, not a single generic interface for everyone.",
  },
];

const LIFECYCLE_STEPS = [
  {
    step: "01",
    icon: "edit_document",
    title: "Service Request",
    body: "A staff member or facility manager identifies a maintenance need and submits a service request, describing the issue, associated asset, and location.",
  },
  {
    step: "02",
    icon: "rule",
    title: "Review and Approval",
    body: "The request enters a review queue. A facility manager or administrator assesses it, approves or declines, and converts approved requests into a work order.",
  },
  {
    step: "03",
    icon: "person_pin_circle",
    title: "Assignment",
    body: "The work order is assigned to an in-house technician or dispatched to a qualified vendor from the approved vendor directory.",
  },
  {
    step: "04",
    icon: "handyman",
    title: "Execution",
    body: "The assigned technician or vendor team executes the work. Progress updates, notes, and completion evidence are recorded against the work order.",
  },
  {
    step: "05",
    icon: "task_alt",
    title: "Completion",
    body: "Work is marked complete and reviewed. The associated asset record is updated with the maintenance event, preserving the full history.",
  },
  {
    step: "06",
    icon: "history",
    title: "History and Reporting",
    body: "Completed work becomes part of the operational record, queryable for asset history, vendor performance, and facility-level reporting.",
  },
];

const VENDOR_CAPABILITIES = [
  {
    icon: "receipt_long",
    title: "Quotation and Purchase Orders",
    body: "Vendors receive quotation requests from organizations, submit their quotes, and once approved, receive a formal purchase order before any work begins.",
  },
  {
    icon: "verified",
    title: "Compliance and Qualification",
    body: "Organizations track vendor qualifications, insurance documents, and compliance records. Vendors maintain their own profile including service categories and active certifications.",
  },
  {
    icon: "group_work",
    title: "Team Dispatch",
    body: "Vendor team leads assign dispatched work orders to managers or technicians. Vendor managers oversee task progress and field technicians operate from their own view of assigned work.",
  },
  {
    icon: "payments",
    title: "Invoicing",
    body: "On work completion, vendors submit invoices tied to the originating work order and purchase order, creating a traceable billing chain from request to payment.",
  },
];

const DOMAIN_NODES = [
  { icon: "edit_document", label: "Service Request", sub: "Submitted by staff", highlight: false },
  { icon: "assignment", label: "Work Order", sub: "Assigned and tracked", highlight: true },
  { icon: "precision_manufacturing", label: "Asset", sub: "Linked and updated", highlight: false },
  { icon: "apartment", label: "Facility", sub: "Location context", highlight: false },
  { icon: "engineering", label: "Vendor / Tech", sub: "Executes the work", highlight: false },
];

export function FeaturesPage() {
  usePageSeo({
    title: "Features",
    description:
      "MaintainPro connects service requests, work orders, assets, facilities, and vendors in one operational workflow. Explore the capabilities that give every role in your organization a clear view of what needs attention, who owns it, and what happened.",
    path: "/features",
  });

  return (
    <>
      <PublicNavbar activeItem="features" />
      <main className="pt-32 pb-24 px-gutter-mobile md:px-gutter-desktop max-w-max-width mx-auto">

        {/* Hero */}
        <section className="mb-24 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-label-sm shadow-sm mb-6">
            <MaterialIcon name="route" className="text-sm" />
            Connected Operational Workflow
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-6">
            Every Part of the Maintenance Lifecycle,{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              In One System
            </span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            MaintainPro is not a ticketing tool, an asset tracker, or a vendor directory in isolation.
            Its value comes from connecting these operational domains so a service request leads to a work order,
            the work order links to an asset, the asset sits in a known location, and an assigned vendor or technician
            has everything they need to act on it.
          </p>
        </section>

        {/* Lifecycle Steps */}
        <section className="mb-32">
          <div className="flex items-center gap-3 mb-10">
            <span className="bg-primary-container text-on-primary-container p-2.5 rounded-xl material-symbols-outlined">
              published_with_changes
            </span>
            <h2 className="font-headline-lg text-headline-lg">
              The Operational Lifecycle
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LIFECYCLE_STEPS.map((step) => (
              <div
                key={step.step}
                className="bg-surface-bright border border-border-subtle p-6 rounded-xl hover:shadow-md hover:border-primary/30 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 font-bold text-4xl text-surface-container-highest opacity-30">
                  {step.step}
                </div>
                <MaterialIcon name={step.icon} className="text-primary mb-4 text-3xl" />
                <h3 className="font-headline-md text-headline-md mb-2">{step.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Core Feature Grid */}
        <section className="mb-32">
          <div className="text-center mb-12">
            <h2 className="font-headline-xl text-headline-xl text-on-surface mb-4">
              What MaintainPro Manages
            </h2>
            <p className="text-on-surface-variant font-body-lg max-w-2xl mx-auto">
              Each capability area is connected to the others. Work orders tie to assets, assets belong to facilities,
              facilities host vendors, vendors operate through their own portal.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CORE_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-5 p-6 bg-surface-bright border border-border-subtle rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="shrink-0 w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <MaterialIcon name={feature.icon} className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md mb-2">{feature.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{feature.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Role-Specific Portals */}
        <section className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-primary-container text-on-primary-container p-2 rounded-lg material-symbols-outlined">
                  dashboard_customize
                </span>
                <h2 className="font-headline-lg text-headline-lg">
                  Role-Specific Portals
                </h2>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                Different people in the maintenance lifecycle have different responsibilities. An administrator approving budget
                does not need the same view as a technician checking their assigned jobs for the day. MaintainPro provides
                separate portals tailored to what each role actually needs to do.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: "corporate_fare",
                    color: "primary",
                    title: "Organization Portals",
                    roles: ["Admin", "Facility Manager", "Technician", "Finance", "Staff"],
                    description: "Work requests, approvals, asset records, vendor coordination, reporting, and billing. Each role sees the relevant subset.",
                  },
                  {
                    icon: "engineering",
                    color: "secondary",
                    title: "Vendor Portal",
                    roles: ["Team Lead", "Manager", "Technician"],
                    description: "Assigned work, quotation submission, purchase order tracking, invoicing, and team dispatch. Operated independently from client data.",
                  },
                ].map((group) => (
                  <div
                    key={group.title}
                    className={`flex items-start gap-4 p-5 rounded-xl border border-border-subtle bg-surface-bright shadow-sm hover:border-${group.color}/30 transition-colors`}
                  >
                    <span className={`material-symbols-outlined text-${group.color} p-2 bg-${group.color}/10 rounded-lg shrink-0`}>
                      {group.icon}
                    </span>
                    <div>
                      <h4 className={`font-headline-md text-headline-md text-${group.color} mb-1`}>{group.title}</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {group.roles.map((r) => (
                          <span key={r} className="text-xs px-2.5 py-0.5 bg-surface-subtle rounded-full border border-border-subtle text-outline">
                            {r}
                          </span>
                        ))}
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant">{group.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-subtle p-6 rounded-2xl border border-border-subtle shadow-xl space-y-3">
              <div className="flex items-center justify-between font-label-md text-outline border-b border-border-subtle pb-3 mb-3">
                <span>Portal Access by Role</span>
                <span className="text-xs bg-surface-bright px-2.5 py-1 rounded border border-border-subtle">
                  Role-scoped views
                </span>
              </div>
              {[
                { role: "Org Admin", access: "Full organization scope", note: "Facilities, assets, vendors, users, billing", color: "text-primary" },
                { role: "Facility Manager", access: "Facility-level scope", note: "Work orders, assets, vendor dispatch, scheduling", color: "text-primary" },
                { role: "Technician", access: "Assigned work only", note: "Work orders assigned to them, task updates", color: "text-on-surface" },
                { role: "Finance", access: "Financial records", note: "Invoices, purchase orders, billing reports", color: "text-on-surface" },
                { role: "Staff", access: "Request submission", note: "Create service requests, track their status", color: "text-outline" },
                { role: "Vendor Team Lead", access: "Vendor org scope", note: "Dispatched work, quotes, POs, invoices, team management", color: "text-secondary" },
                { role: "Vendor Manager", access: "Team oversight", note: "Assigned jobs, technician progress, field coordination", color: "text-secondary" },
                { role: "Vendor Technician", access: "Assigned field tasks", note: "Work orders assigned to them by team lead or manager", color: "text-secondary" },
              ].map((item) => (
                <div key={item.role} className="p-3.5 bg-surface-bright rounded-xl border border-border-subtle space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-label-md ${item.color}`}>{item.role}</span>
                    <span className="text-xs text-outline font-mono">{item.access}</span>
                  </div>
                  <p className="text-xs text-outline">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vendor Operations Deep Dive */}
        <section className="mb-32">
          <div className="bg-surface-subtle border border-border-subtle rounded-3xl p-10 md:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                <MaterialIcon name="storefront" className="text-primary text-4xl mb-4" />
                <h2 className="font-headline-xl text-headline-xl text-primary mb-4">
                  Vendor Operations
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 leading-relaxed">
                  Vendors are participants in the operational workflow, not just names in a directory.
                  MaintainPro gives vendors the tools to manage their side of the work relationship
                  through a dedicated portal that keeps client and vendor workspaces cleanly separated.
                </p>
                <Link
                  to={PUBLIC_ROUTES.SIGNUP_VENDOR}
                  className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md hover:opacity-90 transition-all shadow-md"
                >
                  Register as a Vendor
                  <MaterialIcon name="arrow_forward" className="text-lg" />
                </Link>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {VENDOR_CAPABILITIES.map((cap) => (
                  <div key={cap.title} className="bg-surface-bright p-6 rounded-xl border border-border-subtle shadow-sm">
                    <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center mb-4">
                      <MaterialIcon name={cap.icon} className="text-xl" />
                    </div>
                    <h4 className="font-headline-md text-headline-md text-on-surface mb-2">{cap.title}</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{cap.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Connected Domain Diagram */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
              How the Domains Connect
            </h2>
            <p className="text-on-surface-variant font-body-lg max-w-2xl mx-auto">
              MaintainPro's value is in the connections between domains. A work order is linked to an asset,
              the asset is in a facility, the facility has vendors, the vendor has technicians. Nothing operates in isolation.
            </p>
          </div>

          {/* Desktop: horizontal chain with arrow connectors */}
          <div className="hidden md:flex items-center justify-between gap-0">
            {DOMAIN_NODES.map((node, i) => (
              <div key={node.label} className="flex items-center flex-1 last:flex-none">
                {/* Node card */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md border transition-all
                      ${node.highlight
                        ? "bg-primary text-on-primary border-primary shadow-primary/20"
                        : "bg-surface-bright border-border-subtle text-on-surface"
                      }`}
                  >
                    <MaterialIcon name={node.icon} className="text-2xl" />
                  </div>
                  <div className="text-center">
                    <div className={`font-label-md ${node.highlight ? "text-primary" : "text-on-surface"}`}>
                      {node.label}
                    </div>
                    <div className="text-xs text-outline">{node.sub}</div>
                  </div>
                </div>
                {/* Arrow connector between nodes */}
                {i < DOMAIN_NODES.length - 1 && (
                  <div className="flex items-center shrink-0 -mt-7 px-1">
                    <div className="h-px w-8 bg-border-subtle" />
                    <span className="material-symbols-outlined text-primary text-base">
                      arrow_forward
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: vertical chain */}
          <div className="flex md:hidden flex-col items-center gap-0">
            {DOMAIN_NODES.map((node, i) => (
              <div key={node.label} className="flex flex-col items-center">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border
                    ${node.highlight
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-bright border-border-subtle text-on-surface"
                    }`}
                >
                  <MaterialIcon name={node.icon} className="text-xl" />
                </div>
                <div className="text-center mt-1 mb-1">
                  <div className={`font-label-md text-sm ${node.highlight ? "text-primary" : "text-on-surface"}`}>
                    {node.label}
                  </div>
                  <div className="text-xs text-outline">{node.sub}</div>
                </div>
                {i < DOMAIN_NODES.length - 1 && (
                  <span className="material-symbols-outlined text-primary text-base my-1">
                    arrow_downward
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface-subtle border border-border-subtle rounded-3xl p-10 md:p-14 text-center">
          <h2 className="font-headline-xl text-headline-xl text-on-surface mb-4">
            Ready to See the Full System?
          </h2>
          <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto mb-8 leading-relaxed">
            Create an account to access the organization or vendor portal and experience the connected operational workflow firsthand.
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
              to={PUBLIC_ROUTES.PRICING}
              className="inline-flex items-center gap-2 border border-border-subtle text-on-surface px-8 py-3.5 rounded-xl font-label-md hover:border-primary/40 hover:bg-surface-subtle transition-all"
            >
              View Pricing Plans
            </Link>
          </div>
        </section>

      </main>
      <PublicFooter variant="features" />
    </>
  );
}
