import { useState } from "react";
import { Link } from "react-router-dom";

import { PublicNavbar } from "@/features/public/components/PublicNavbar";
import { PublicFooter } from "@/features/public/components/PublicFooter";
import { MaterialIcon } from "@/features/public/components/MaterialIcon";
import { PUBLIC_ROUTES } from "@/features/public/constants/routes";
import { SupportChat } from "@/components/navigation/SupportChat";

export function LandingPage() {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <>
      <PublicNavbar />
      <main className="pt-20">
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(97,97,255,0.12),transparent_50%)] -z-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,180,216,0.08),transparent_50%)] -z-10"></div>
          <div className="max-w-max-width mx-auto px-gutter-desktop grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-label-sm shadow-sm">
                <span
                  className="material-symbols-outlined text-sm"
                  data-icon="apartment"
                >
                  apartment
                </span>
                Connected Facility Operations Platform
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface leading-tight">
                One System for Your{" "}
                <span className="text-primary bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  Entire Maintenance Lifecycle.
                </span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                MaintainPro connects service requests, work orders, assets, facilities, and external vendors into one operational workflow, giving every team member a clear view of what needs attention, who owns it, and what happened.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <Link
                  to={PUBLIC_ROUTES.SIGNUP}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md shadow-lg shadow-primary/25 hover:shadow-xl hover:opacity-95 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Get Started Free</span>
                  <span className="material-symbols-outlined text-lg" data-icon="arrow_forward">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  to={PUBLIC_ROUTES.LOGIN}
                  className="border border-outline/30 text-on-surface hover:border-primary/40 px-8 py-4 rounded-xl font-label-md hover:bg-surface-container-low transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Log In to Portal</span>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-2 text-on-surface-variant font-label-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-status-success text-base" data-icon="check_circle">
                    check_circle
                  </span>
                  <span>Free plan available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-status-success text-base" data-icon="check_circle">
                    check_circle
                  </span>
                  <span>Separate portals for Organizations &amp; Vendors</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass-card rounded-2xl p-6 shadow-2xl overflow-hidden border border-border-subtle bg-surface-bright/80 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6 border-b border-border-subtle pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-status-danger/80"></div>
                    <div className="w-3 h-3 rounded-full bg-status-warning/80"></div>
                    <div className="w-3 h-3 rounded-full bg-status-success/80"></div>
                    <span className="ml-2 font-mono text-xs text-outline">Work Order Manager</span>
                  </div>
                  <span className="font-label-sm text-outline text-xs">Facility Operations</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-subtle p-3.5 rounded-xl border border-border-subtle">
                    <div className="text-outline font-label-sm flex items-center justify-between">
                      <span>Open Work Orders</span>
                      <span className="material-symbols-outlined text-primary text-base" data-icon="assignment">
                        assignment
                      </span>
                    </div>
                    <div className="text-headline-md font-headline-md text-primary mt-1">
                      24
                    </div>
                  </div>
                  <div className="bg-surface-subtle p-3.5 rounded-xl border border-border-subtle">
                    <div className="text-outline font-label-sm flex items-center justify-between">
                      <span>Pending Approval</span>
                      <span className="material-symbols-outlined text-status-warning text-base" data-icon="rule">
                        rule
                      </span>
                    </div>
                    <div className="text-headline-md font-headline-md text-status-warning mt-1">
                      7
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4 space-y-3">
                  <div className="font-label-sm text-outline border-b border-border-subtle pb-2">
                    Recent Work Orders
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2.5 bg-surface-bright rounded-lg border border-border-subtle">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-lg" data-icon="hvac">
                            hvac
                          </span>
                        </div>
                        <div>
                          <div className="font-label-md text-on-surface">HVAC Compressor Replacement</div>
                          <div className="text-xs text-outline">Building B • HQ Facility</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-xs rounded-full bg-status-warning/15 text-status-warning font-medium">
                        In Progress
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-surface-bright rounded-lg border border-border-subtle">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                          <span className="material-symbols-outlined text-lg" data-icon="electrical_services">
                            electrical_services
                          </span>
                        </div>
                        <div>
                          <div className="font-label-md text-on-surface">Generator Inspection</div>
                          <div className="text-xs text-outline">Data Centre Facility</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-xs rounded-full bg-status-success/15 text-status-success font-medium">
                        Assigned
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-surface-bright rounded-lg border border-border-subtle">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-outline/10 text-outline">
                          <span className="material-symbols-outlined text-lg" data-icon="plumbing">
                            plumbing
                          </span>
                        </div>
                        <div>
                          <div className="font-label-md text-on-surface">Pipe Leak (Level 2 Bathroom)</div>
                          <div className="text-xs text-outline">Block A • Site 3</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-xs rounded-full bg-status-danger/15 text-status-danger font-medium">
                        Open
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface-subtle" id="features">
          <div className="max-w-max-width mx-auto px-gutter-desktop">
            <div className="text-center mb-16">
              <h2 className="font-headline-xl text-headline-xl mb-4">
                What MaintainPro Connects
              </h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto font-body-lg">
                Facility operations involve many moving parts: physical assets, maintenance work, service providers, locations, and the people responsible for each. MaintainPro brings these into a single connected system.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 glass-card p-8 rounded-2xl border border-border-subtle hover:border-primary/30 transition-all group">
                <span
                  className="material-symbols-outlined text-4xl text-primary mb-6"
                  data-icon="assignment"
                >
                  assignment
                </span>
                <h3 className="font-headline-md text-headline-md mb-2">
                  Work Management
                </h3>
                <p className="text-on-surface-variant">
                  Capture service requests from any team member, route them through an approval workflow, assign work orders to in-house technicians or external vendors, and maintain a complete activity record from request to close.
                </p>
              </div>
              <div className="glass-card p-8 rounded-2xl border border-border-subtle hover:border-primary/30 transition-all group">
                <span
                  className="material-symbols-outlined text-4xl text-secondary mb-6"
                  data-icon="precision_manufacturing"
                >
                  precision_manufacturing
                </span>
                <h3 className="font-headline-md text-headline-md mb-2">
                  Asset &amp; Facilities Management
                </h3>
                <p className="text-on-surface-variant">
                  Maintain records of physical assets tied to specific buildings, floors, and rooms. Track condition, maintenance history, and link assets directly to the work performed on them.
                </p>
              </div>
              <div className="glass-card p-8 rounded-2xl border border-border-subtle hover:border-primary/30 transition-all group">
                <span
                  className="material-symbols-outlined text-4xl text-status-success mb-6"
                  data-icon="event_repeat"
                >
                  event_repeat
                </span>
                <h3 className="font-headline-md text-headline-md mb-2">
                  Preventive Maintenance
                </h3>
                <p className="text-on-surface-variant">
                  Schedule recurring maintenance against specific assets or locations so work happens on a defined cycle, not only when something breaks.
                </p>
              </div>
              <div className="md:col-span-2 glass-card p-8 rounded-2xl border border-border-subtle hover:border-primary/30 transition-all group">
                <span
                  className="material-symbols-outlined text-4xl text-primary-container mb-6"
                  data-icon="groups"
                >
                  groups
                </span>
                <h3 className="font-headline-md text-headline-md mb-2">
                  Role-Specific Operational Experiences
                </h3>
                <p className="text-on-surface-variant">
                  Administrators, facility managers, technicians, finance teams, and external vendor roles (Lead, Manager, Technician) each operate from a dedicated portal showing the workflows and information relevant to their responsibilities, not a single generic view for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24" id="how-it-works">
          <div className="max-w-max-width mx-auto px-gutter-desktop">
            <div className="text-center mb-16">
              <h2 className="font-headline-xl text-headline-xl mb-4">
                How the Operational Lifecycle Works
              </h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto font-body-lg">
                Every maintenance event in MaintainPro follows a structured path from the initial request through to documented completion.
              </p>
            </div>
            <div className="relative">
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-border-subtle -z-10"></div>
              <div className="grid md:grid-cols-3 gap-12">
                <div className="bg-white p-8 rounded-2xl text-center space-y-4 border border-border-subtle relative">
                  <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center font-bold absolute -top-6 left-1/2 -translate-x-1/2">
                    1
                  </div>
                  <span
                    className="material-symbols-outlined text-5xl text-primary"
                    data-icon="edit_document"
                  >
                    edit_document
                  </span>
                  <h4 className="font-headline-md text-headline-md">
                    Request &amp; Approval
                  </h4>
                  <p className="text-on-surface-variant">
                    A staff member or facility manager submits a service request. It enters a review queue where the right person approves and converts it into a work order.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-2xl text-center space-y-4 border border-border-subtle relative">
                  <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center font-bold absolute -top-6 left-1/2 -translate-x-1/2">
                    2
                  </div>
                  <span
                    className="material-symbols-outlined text-5xl text-primary"
                    data-icon="handyman"
                  >
                    handyman
                  </span>
                  <h4 className="font-headline-md text-headline-md">
                    Assignment &amp; Execution
                  </h4>
                  <p className="text-on-surface-variant">
                    The work order is assigned to an in-house technician or dispatched to a qualified external vendor. Vendor leads, managers, and technicians execute and record progress on-site.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-2xl text-center space-y-4 border border-border-subtle relative">
                  <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center font-bold absolute -top-6 left-1/2 -translate-x-1/2">
                    3
                  </div>
                  <span
                    className="material-symbols-outlined text-5xl text-primary"
                    data-icon="task_alt"
                  >
                    task_alt
                  </span>
                  <h4 className="font-headline-md text-headline-md">
                    Completion &amp; History
                  </h4>
                  <p className="text-on-surface-variant">
                    Work is signed off, the asset record updated, and the full activity trail preserved, giving management visibility into what happened, when, and who was responsible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary text-on-primary">
          <div className="max-w-max-width mx-auto px-gutter-desktop grid md:grid-cols-2 gap-px bg-primary-container/20 overflow-hidden rounded-3xl border border-primary-container">
            <div className="p-12 lg:p-20 flex flex-col justify-center space-y-6">
              <h2 className="font-headline-xl text-headline-xl">
                For Organizations &amp; Facility Teams
              </h2>
              <p className="text-primary-fixed text-body-lg">
                If your team manages buildings, equipment, assets, and maintenance work across one or more sites, MaintainPro gives administrators, facility managers, technicians, finance, and staff a shared operational system with role-scoped access.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-status-success"
                    data-icon="check_circle"
                  >
                    check_circle
                  </span>{" "}
                  Work orders tracked from submission through to documented completion
                </li>
                <li className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-status-success"
                    data-icon="check_circle"
                  >
                    check_circle
                  </span>{" "}
                  Assets and facilities organized by location with full maintenance history
                </li>
                <li className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-status-success"
                    data-icon="check_circle"
                  >
                    check_circle
                  </span>{" "}
                  Preventive maintenance scheduled on a defined cycle, not only on failure
                </li>
              </ul>
              <Link
                to={PUBLIC_ROUTES.SIGNUP_ORG}
                className="bg-white text-primary px-8 py-4 rounded-xl font-label-md w-fit hover:bg-primary-fixed transition-colors flex items-center gap-2 shadow-md"
              >
                <span>Register Your Organization</span>
                <span className="material-symbols-outlined text-lg" data-icon="arrow_forward">
                  arrow_forward
                </span>
              </Link>
            </div>
            <div className="p-12 lg:p-20 flex flex-col justify-center space-y-6 bg-primary-container">
              <h2 className="font-headline-xl text-headline-xl">
                For Service Vendors
              </h2>
              <p className="text-primary-fixed text-body-lg">
                Vendors operate from their own authenticated portal, with views tailored for vendor team leads, managers, and field technicians, managing dispatches, quotes, purchase orders, and invoices without client data access.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-status-success"
                    data-icon="check_circle"
                  >
                    check_circle
                  </span>{" "}
                  Dedicated vendor portal for work, quotes, and invoicing
                </li>
                <li className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-status-success"
                    data-icon="check_circle"
                  >
                    check_circle
                  </span>{" "}
                  Team dispatch, manager oversight, and field technician assignment tools
                </li>
                <li className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-status-success"
                    data-icon="check_circle"
                  >
                    check_circle
                  </span>{" "}
                  Contract, compliance document, and purchase order tracking
                </li>
              </ul>
              <Link
                to={PUBLIC_ROUTES.SIGNUP_VENDOR}
                className="bg-secondary text-on-primary px-8 py-4 rounded-xl font-label-md w-fit hover:opacity-90 transition-colors flex items-center gap-2 shadow-md"
              >
                <span>Register as a Vendor</span>
                <span className="material-symbols-outlined text-lg" data-icon="arrow_forward">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-4xl mx-auto px-gutter-desktop text-center">
            <div className="bg-surface-container-high rounded-4xl p-12 lg:p-20 relative overflow-hidden border border-border-subtle">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <h2 className="font-headline-xl text-headline-xl mb-6">
                  Ready to Connect Your Facility Operations?
                </h2>
                <p className="text-on-surface-variant text-body-lg mb-10 max-w-2xl mx-auto">
                  MaintainPro is available to organizations managing facility work and vendors providing contracted services. Start with a free account or review available plans.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to={PUBLIC_ROUTES.SIGNUP}
                    className="bg-primary text-on-primary px-10 py-5 rounded-xl font-label-md hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    to={PUBLIC_ROUTES.PRICING}
                    className="bg-white text-on-surface px-10 py-5 rounded-xl font-label-md border border-border-subtle hover:bg-surface-subtle transition-all"
                  >
                    View Pricing &amp; Plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter variant="landing" />

      {/* Floating AI Assistant / Support FAB */}
      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className="group fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-all hover:scale-110 active:scale-95"
        aria-label="AI Assistant & Support"
      >
        <MaterialIcon name="smart_toy" className="text-3xl" />
        <span className="absolute right-full mr-4 whitespace-nowrap rounded bg-on-surface px-3.5 py-1.5 text-xs text-surface-bright shadow-md opacity-0 transition-opacity group-hover:opacity-100 font-label-sm">
          AI Assistant &amp; Support
        </span>
      </button>
      <SupportChat open={chatOpen} onOpenChange={setChatOpen} publicMode />
    </>
  );
}
