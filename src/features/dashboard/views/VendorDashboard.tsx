import React from 'react'
import { Link } from 'react-router-dom'
import { AppHeader as Navbar } from '@/components/navigation/Navbar'
import { KPICard } from '@/features/dashboard/components/StatCard'
import { HandWaveGreeting } from '@/components/ui/HandWaveGreeting'
import { useAuthStore } from '@/app/store'
import { useRoleDashboardDateRange } from '@/features/dashboard/hooks/useRoleDashboardDateRange'
import { useVendorProfile } from '@/features/vendors/hooks/useVendorProfile'
import { usePortalPath } from '@/hooks/usePortal'
import { useQuery } from '@tanstack/react-query'
import { workOrdersService } from '@/features/work-orders/services/workOrders.service'
import { apiClient } from '@/api/client'
import type { WorkOrder } from '@/types/common.types'

type ContractRow = { title: string; score: string; meta: string; pct: number; fill: string }
type TechnicianRow = { name: string; status: string; wos: string; dotColor: string }


function SectionCard({ title, subtitle, children, noPadding }: { title: string; subtitle: string; children: React.ReactNode; noPadding?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-none">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  )
}

type VendorDashboardMode = 'lead' | 'manager' | 'technician'

export function VendorDashboard({ mode = 'lead' }: { mode?: VendorDashboardMode }) {
  const user = useAuthStore((state) => state.user)
  const { data: vendorProfile } = useVendorProfile()
  const { workOrdersInRange, stats } = useRoleDashboardDateRange('30d')
  const opportunitiesQuery = useQuery<{ data: WorkOrder[] }>({ queryKey: ['dashboard', 'vendor-opportunities', user?.id], queryFn: () => workOrdersService.listMarketplace({ limit: 10 }), enabled: Boolean(user?.id), staleTime: 60_000 })
  const applicationsQuery = useQuery({ queryKey: ['dashboard', 'vendor-applications', user?.id], queryFn: () => apiClient.get<Array<{ id: string; workOrderId: string; status: string }>>('/vendor-applications/mine'), enabled: Boolean(user?.id), staleTime: 60_000 })
  const workOrdersPath = usePortalPath('work-orders')
  const opportunitiesPath = usePortalPath('opportunities')
  const applicationsPath = usePortalPath('applications')
  const contractsPath = usePortalPath('contracts')
  const slasPath = usePortalPath('slas')
  const teamPath = usePortalPath('team')

  const vendorCompanyName = vendorProfile?.name || (user as (typeof user & { vendorName?: string }))?.vendorName || 'Vendor Company'

  const activeCount = stats.openWorkOrders ?? workOrdersInRange.filter((workOrder) => !['completed', 'cancelled'].includes(workOrder.status)).length
  const applicationsCount = applicationsQuery.data?.length ?? 0
  const contractsCount = 0
  const slaPct = '—'
  const teamCount = 0
  const activeDispatchRows = workOrdersInRange.filter((workOrder) => !['completed', 'cancelled'].includes(workOrder.status)).slice(0, 10).map((workOrder) => ({
    id: workOrder.id,
    location: workOrder.locationName || 'Location unavailable',
    desc: workOrder.title,
    priority: workOrder.priority.toUpperCase(),
    priorityBg: 'var(--muted)',
    priorityColor: 'var(--foreground)',
    sla: workOrder.dueDate ? `Due ${new Date(workOrder.dueDate).toLocaleDateString()}` : 'SLA unavailable',
    tech: workOrder.assigneeName || 'Unassigned',
  }))
  const opportunityRows = (opportunitiesQuery.data?.data ?? []).map((opportunity: WorkOrder) => ({ id: opportunity.id, title: opportunity.title, distance: opportunity.locationName || 'Location unavailable', desc: opportunity.description || opportunity.category, details: `${opportunity.priority.toUpperCase()} priority` }))
  const applicationRows = (applicationsQuery.data ?? []).slice(0, 10).map((application: { id: string; workOrderId: string; status: string }) => ({ id: application.id, title: `Work order ${application.workOrderId.slice(0, 8)}`, desc: 'Submitted marketplace application', badge: application.status.replace('_', ' '), badgeBg: 'var(--muted)', badgeColor: 'var(--foreground)', time: 'Live application' }))
  const contractRows: ContractRow[] = []
  const technicianRows: TechnicianRow[] = []

  return (
    <>
      <Navbar title="Manager Operations" subtitle={vendorCompanyName} hideQuickCreate />

      <div className="dashboard-page min-h-full bg-background px-8 py-6 pb-12 text-foreground">
        {/* ── Page Header Banner ── */}
        <div className="mb-6">
          <HandWaveGreeting
            userName={user?.firstName}
            subtext="Your team operations and service delivery at a glance."
          />
        </div>

        {/* ── 5 KPI Cards Row ── */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <KPICard
            title="Active Work Orders"
            value={activeCount}
            changeLabel="Live assigned work"
            icon="work-orders"
            href={workOrdersPath}
          />
          <KPICard
            title="Open Applications"
            value={applicationsCount}
            changeLabel="Live applications"
            icon="compliance"
            href={applicationsPath}
          />
          <KPICard
            title="Awarded Contracts"
            value={contractsCount}
            changeLabel="Live contracts"
            icon="completed"
            href={contractsPath}
          />
          <KPICard
            title="SLA Compliance"
            value={slaPct}
            changeLabel="Not available"
            icon="compliance"
            variant="success"
            href={slasPath}
          />
          <KPICard
            title="Team Members"
            value={teamCount}
            changeLabel="Live team roster"
            icon="work-orders"
            href={teamPath}
          />
        </div>

        {/* ── 2 Column Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Dispatch Work Orders */}
            <SectionCard
              title="Active Dispatch Work Orders"
              subtitle="Live tracking of vendor service responses"
              noPadding
            >
              <div className="divide-y divide-border">
                {activeDispatchRows.map((wo) => (
                  <Link
                    key={wo.id}
                    to={`${workOrdersPath}/${wo.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-[13px] font-semibold text-primary w-20 shrink-0">{wo.id}</span>
                    <span className="text-[13px] font-medium text-foreground w-28 truncate shrink-0">{wo.location}</span>
                    <span className="text-[12px] text-muted-foreground flex-1 truncate">{wo.desc}</span>
                    <span
                      className="rounded px-2 py-0.5 text-[11px] font-bold shrink-0"
                      style={{ backgroundColor: wo.priorityBg, color: wo.priorityColor }}
                    >
                      {wo.priority}
                    </span>
                    <span className="text-[12px] text-muted-foreground shrink-0 w-24 text-right">{wo.sla}</span>
                    <span className="text-[13px] font-semibold text-foreground shrink-0 w-24 text-right">{wo.tech}</span>
                  </Link>
                ))}
              </div>
            </SectionCard>

            {/* Available Service Opportunities */}
            <SectionCard
              title="Available Service Opportunities"
              subtitle="New maintenance bids on MaintainPro marketplace"
            >
              <div className="space-y-4">
                {opportunityRows.map((opp: { id: string; title: string; distance: string; desc: string; details: string }) => (
                  <div
                    key={opp.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-accent/30 p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-foreground">{opp.title}</span>
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                          {opp.distance}
                        </span>
                      </div>
                      <p className="text-[13px] text-muted-foreground">{opp.desc}</p>
                      <p className="text-[11px] text-muted-foreground/70">{opp.details}</p>
                    </div>
                    <Link
                      to={opportunitiesPath}
                      className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Apply Bid
                    </Link>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Right Column (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Open Applications */}
            <SectionCard
              title="Open Applications"
              subtitle="Tracking submitted contract bids"
            >
              <div className="space-y-3">
                {applicationRows.map((app: { id: string; title: string; desc: string; badge: string; badgeBg: string; badgeColor: string; time: string }) => (
                  <div
                    key={app.id}
                    className="rounded-xl border border-border bg-accent/30 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-bold text-foreground">{app.title}</span>
                      <span
                        className="rounded px-2 py-0.5 text-[11px] font-bold"
                        style={{ backgroundColor: app.badgeBg, color: app.badgeColor }}
                      >
                        {app.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-muted-foreground">{app.desc}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground/70">{app.time}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Contract SLA Compliance */}
            <SectionCard
              title="Contract SLA Compliance"
              subtitle="Active client contract compliance ratings"
            >
              <div className="space-y-4">
                {contractRows.length === 0 ? <p className="text-sm text-muted-foreground">No contract performance data is available yet.</p> : contractRows.map((c) => (
                  <div key={c.title} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-foreground">{c.title}</span>
                      <span className="text-[13px] font-bold text-emerald-500">{c.score}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-accent overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.pct}%`, backgroundColor: c.fill }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{c.meta}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Technician Dispatch Workload */}
            <SectionCard
              title="Technician Dispatch Workload"
              subtitle="Active team assignments and status"
              noPadding
            >
              <div className="divide-y divide-border">
                {technicianRows.length === 0 ? <p className="px-5 py-4 text-sm text-muted-foreground">No technician workload data is available yet.</p> : technicianRows.map((t) => (
                  <div key={t.name} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: t.dotColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground">{t.name}</p>
                      <p className="text-[12px] text-muted-foreground">{t.status}</p>
                    </div>
                    <span className="text-[13px] font-bold text-foreground">{t.wos}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  )
}

export function VendorLeadDashboard() { return <VendorDashboard mode="lead" /> }
export function VendorManagerDashboard() { return <VendorDashboard mode="manager" /> }
export function VendorTechnicianDashboard() { return <VendorDashboard mode="technician" /> }
