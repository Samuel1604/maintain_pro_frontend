import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePortalPath } from '@/hooks/usePortal'
import { FileText, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AppHeader } from '@/components/navigation/Navbar'
import { PageIntro } from '@/components/layout/PageIntro'
import { toast } from 'sonner'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts'
import { SkeletonTable } from '@/components/feedback/Skeletons'
import { inventoryService, type InventoryItemRecord, type InventoryOverview } from '@/features/inventory/services/inventory.service'
import { downloadBlob } from '@/utils/downloadFile'
import { useReports } from '../hooks/useReports'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import type { TrendPoint, WorkOrderReportRow } from '../api/reports.api'

export function Reports() {
  const [activeTab, setActiveTab] = useState<'generation_hub' | 'maintenance_summary' | 'inventory_report'>('generation_hub')
  const navigate = useNavigate()
  const reportsPath = usePortalPath('reports')

  return (
    <div className="min-h-full bg-background text-foreground">
      {/* Top Bar Header */}
      <AppHeader
        title={
          activeTab === 'generation_hub'
            ? 'Generation Hub'
            : activeTab === 'maintenance_summary'
            ? 'Maintenance Summary'
            : 'Inventory Report'
        }
        subtitle="Reports"
        hideQuickCreate
      />
      {/* Main Page Top Header & Sub-Navigation */}
      <div className="border-b border-border bg-card px-8 py-5">
        <div className="flex items-center justify-between">
          <PageIntro
            title={activeTab === 'generation_hub' ? 'Generation Hub' : activeTab === 'maintenance_summary' ? 'Maintenance Summary' : 'Inventory Report'}
            description={activeTab === 'generation_hub'
              ? 'Instantly compile data models, audits, compliance rates, and vendor performance history.'
              : activeTab === 'maintenance_summary'
              ? 'Review and analyze cross-facility hardware performance, dispatch duration, and SLA rates.'
              : 'Monitor storage reserves, parts valuation, low-stock triggers, and critical safety thresholds.'}
          />

          <div className="flex items-center gap-3">
            {activeTab === 'inventory_report' ? (
              <Button
                disabled
                title="Restock request creation is not exposed by the inventory API yet"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Restock Request
              </Button>
            ) : null}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-5 flex items-center rounded-lg border border-border bg-muted/30 p-1 text-[12px] font-semibold w-fit">
          <button
            onClick={() => setActiveTab('generation_hub')}
            className={`rounded-md px-4 py-1.5 transition-colors ${activeTab === 'generation_hub' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Reports Hub
          </button>
          <button
            onClick={() => setActiveTab('maintenance_summary')}
            className={`rounded-md px-4 py-1.5 transition-colors ${activeTab === 'maintenance_summary' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Maintenance Summary
          </button>
          <button
            onClick={() => setActiveTab('inventory_report')}
            className={`rounded-md px-4 py-1.5 transition-colors ${activeTab === 'inventory_report' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Inventory Report
          </button>
        </div>
      </div>

      {/* Main Tab Contents */}
      <div className="p-8">
        {activeTab === 'generation_hub' ? (
          <GenerationHubView setActiveTab={setActiveTab} onOpenReport={(slug) => navigate(`${reportsPath}/${slug}`)} />
        ) : activeTab === 'maintenance_summary' ? (
          <MaintenanceSummaryView />
        ) : (
          <InventoryReportView />
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. GENERATION HUB VIEW
   ───────────────────────────────────────────────────────────────────────────── */
function GenerationHubView({ setActiveTab, onOpenReport }: { setActiveTab: (t: 'generation_hub' | 'maintenance_summary' | 'inventory_report') => void; onOpenReport: (slug: string) => void }) {
  const recentReports = useMemo(() => {
    const end = new Date()
    const format = (date: Date) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
    const offset = (days: number) => {
      const date = new Date(end)
      date.setDate(date.getDate() - days)
      return date
    }
    return [
      { name: 'HQ_Tower_SLA_Compliance', type: 'SLA Compliance Report', range: `${format(offset(30))} - ${format(end)}`, by: 'Samuel Dane', date: format(offset(1)) },
      { name: 'PM_Preventive_Quarterly_Schedule', type: 'PM Schedule Report', range: `${format(offset(90))} - ${format(offset(1))}`, by: 'Dave Miller', date: format(offset(3)) },
      { name: 'Full_Organization_Inventory_Valuation', type: 'Inventory Report', range: `As of ${format(end)}`, by: 'Sarah Jenkins', date: format(offset(5)) },
      { name: 'HQ_HVAC_SLA_Audit_Anomalies', type: 'SLA Compliance Report', range: `${format(offset(20))} - ${format(offset(7))}`, by: 'System (Auto)', date: format(offset(7)) },
      { name: 'West_Campus_Backlog_Analysis', type: 'Work Order Analysis', range: `${format(offset(120))} - ${format(offset(30))}`, by: 'John Doe', date: format(offset(10)) },
    ]
  }, [])
  const reportRangeLabel = useMemo(() => {
    const end = new Date()
    const start = new Date(end)
    start.setDate(start.getDate() - 29)
    const format = (date: Date) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
    return `Last 30 Days (${format(start)} - ${format(end)})`
  }, [])

  return (
    <div className="space-y-6">
      {/* Global Report Filters Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-foreground">Global Report Filters</h2>
          <span className="text-[11px] text-muted-foreground">Apply parameters prior to file extraction</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-muted-foreground">SELECT FACILITY</label>
            <Select defaultValue="all">
              <SelectTrigger className="h-9 border-border bg-muted/30">
                <SelectValue placeholder="All Facilities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Facilities</SelectItem>
                <SelectItem value="hq">HQ Office Tower</SelectItem>
                <SelectItem value="west">West Campus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-muted-foreground">DATE RANGE</label>
            <Select defaultValue="30d">
              <SelectTrigger className="h-9 border-border bg-muted/30">
                <SelectValue placeholder={reportRangeLabel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">{reportRangeLabel}</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-muted-foreground">EXPORT FORMAT</label>
            <Select defaultValue="pdf">
              <SelectTrigger className="h-9 border-border bg-muted/30">
                <SelectValue placeholder="Adobe PDF Document (.pdf)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">Adobe PDF Document (.pdf)</SelectItem>
                <SelectItem value="csv">CSV Spreadsheet (.csv)</SelectItem>
                <SelectItem value="excel">Excel Workbook (.xlsx)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 6 Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: 'Maintenance Summary',
            desc: 'Overall health index, count of requests vs. completions, and active labor cost estimations.',
            actionLabel: 'Generate Summary',
            tabTarget: 'maintenance_summary' as const,
          },
          {
            title: 'Work Order Analysis',
            desc: 'Distribution of tickets by severity level, priority category, average times, and backlog age.',
            actionLabel: 'Generate Analysis',
            reportSlug: 'work-order-analysis',
          },
          {
            title: 'SLA Compliance Report',
            desc: 'Vendor performance benchmarks, emergency response success, and breach warning tallies.',
            actionLabel: 'Generate SLA Report',
            reportSlug: 'sla-compliance',
          },
          {
            title: 'PM Schedule Report',
            desc: 'Preventive maintenance schedules, approvals, generated work orders, and upcoming activities.',
            actionLabel: 'Generate PM Report',
            reportSlug: 'pm-compliance',
          },
          {
            title: 'Inventory Report',
            desc: 'Total stock valuation, low thresholds list, replacement frequency, and safety margins.',
            actionLabel: 'Generate Inventory Report',
            tabTarget: 'inventory_report' as const,
          },
          {
            title: 'Vendor Performance Report',
            desc: 'Rating summaries, dispatch frequency, invoice accuracies, and technician evaluations.',
            actionLabel: 'Generate Vendor Report',
            reportSlug: 'vendor-performance',
          },
        ].map((card, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-[15px] font-bold text-foreground">{card.title}</h3>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">{card.desc}</p>
            </div>
            <Button
              onClick={() => {
                if (card.tabTarget) setActiveTab(card.tabTarget)
                else if (card.reportSlug) onOpenReport(card.reportSlug)
              }}
              className="w-fit rounded-xl bg-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              {card.actionLabel}
            </Button>
          </div>
        ))}
      </div>

      {/* Recently Generated Reports Table */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-[15px] font-bold text-foreground">Recently Generated Reports</h2>
          <p className="text-[12px] text-muted-foreground">Download previously compiled report executions from history cache</p>
        </div>

        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-border bg-muted/30 text-[10px] font-bold uppercase text-muted-foreground">
            <tr>
              <th className="py-2.5 px-4">REPORT NAME</th>
              <th className="py-2.5 px-4">REPORT TYPE</th>
              <th className="py-2.5 px-4">DATE RANGE</th>
              <th className="py-2.5 px-4">GENERATED BY</th>
              <th className="py-2.5 px-4">GENERATION DATE</th>
              <th className="py-2.5 px-4 text-right">DOWNLOAD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentReports.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {row.name}
                </td>
                <td className="py-3 px-4 text-muted-foreground">{row.type}</td>
                <td className="py-3 px-4 text-muted-foreground">{row.range}</td>
                <td className="py-3 px-4 text-foreground font-medium">{row.by}</td>
                <td className="py-3 px-4 text-muted-foreground">{row.date}</td>
                <td className="py-3 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info(`Preview for ${row.name} is not available yet`)}
                    title="Report preview unavailable"
                    className="h-7 rounded bg-info/15 px-2.5 text-[11px] font-bold text-info hover:bg-info/25"
                  >
                    Preview
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. MAINTENANCE SUMMARY VIEW
   ───────────────────────────────────────────────────────────────────────────── */
function MaintenanceSummaryView() {
  const safeDate = (value?: string) => {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
  }
  const query = useMemo(() => {
    const end = new Date()
    const start = new Date(end)
    start.setDate(start.getDate() - 30)
    return { startDate: start.toISOString(), endDate: end.toISOString(), page: 1, pageSize: 100 }
  }, [])
  const report = useReports(query)
  const [priority, setPriority] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const rows = useMemo(() => (report.workOrders?.items ?? []).filter((item: WorkOrderReportRow) =>
    (priority === 'all' || item.priority.toLowerCase() === priority) &&
    (status === 'all' || item.status.toLowerCase() === status)
  ), [report.workOrders, priority, status])
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const visible = rows.slice((page - 1) * pageSize, page * pageSize)
  const summary = report.summary
  const trends = report.trends
  const statuses = Array.from(new Set<string>((report.workOrders?.items ?? []).map((item: WorkOrderReportRow) => String(item.status).toLowerCase())))
  const priorities = Array.from(new Set<string>((report.workOrders?.items ?? []).map((item: WorkOrderReportRow) => String(item.priority).toLowerCase())))

  const exportCsv = () => {
    if (!summary) return
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const lines = [
      ['Maintenance Summary', `${query.startDate} to ${query.endDate}`],
      [],
      ['Metric', 'Value'],
      ['Total Work Orders', summary.totalWorkOrders],
      ['Completed Work Orders', summary.completedWorkOrders],
      ['Open Work Orders', summary.openWorkOrders],
      ['Completion Rate', `${summary.completionRate}%`],
      [],
      ['Work Order', 'Status', 'Priority', 'Service Category', 'Created At', 'Due Date', 'Completed At'],
      ...(report.workOrders?.items ?? []).map((item: WorkOrderReportRow) => [item.id, item.status, item.priority, item.serviceCategory, item.createdAt, item.dueDate ?? '', item.completedAt ?? '']),
    ]
    downloadBlob('maintainpro-maintenance-summary.csv', lines.map((row) => row.map(escape).join(',')).join('\n'), 'text/csv;charset=utf-8')
    toast.success('Maintenance summary downloaded')
  }

  if (report.loading) return <SkeletonTable rows={5} columns={5} />
  if (report.error) return <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">{report.error}</div>
  if (!summary) return <div className="rounded-xl border border-border bg-card p-8 text-center"><h3 className="text-lg font-semibold text-foreground">No maintenance data available</h3><p className="mt-1 text-sm text-muted-foreground">Create work orders or adjust the reporting period to populate this view.</p></div>

  const categoryCounts = (report.workOrders?.items ?? []).reduce<Record<string, number>>((result: Record<string, number>, item: WorkOrderReportRow) => { result[item.serviceCategory] = (result[item.serviceCategory] ?? 0) + 1; return result }, {})
  const categories = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
  const trend = trends.map((point: TrendPoint) => ({ day: point.period, created: point.created, completed: point.completed }))
  const colors = ['var(--primary)', 'var(--info)', 'var(--warning)', 'var(--muted-foreground)']
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div>
          <p className="font-medium text-foreground">Export this report</p>
          <p className="text-sm text-muted-foreground">Download the currently loaded report results for the selected reporting period.</p>
        </div>
        <Button onClick={exportCsv} variant="outline" className="shrink-0">
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          ['Total Work Orders', summary.totalWorkOrders],
          ['Completed Orders', summary.completedWorkOrders],
          ['Open Backlog', summary.openWorkOrders],
          ['Completion Rate', `${summary.completionRate}%`],
        ].map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-sm"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold text-foreground">{value}</p></div>)}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm xl:col-span-3"><h2 className="font-semibold text-foreground">Work order flow</h2><p className="mb-3 text-sm text-muted-foreground">Created versus completed in the selected period</p><div className="h-64">{trend.length === 0 ? <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">No trend data for this period.</div> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="day" /><YAxis /><Tooltip /><Area type="monotone" dataKey="created" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} /><Area type="monotone" dataKey="completed" stroke="var(--success)" fill="transparent" /></AreaChart></ResponsiveContainer>}</div></div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm xl:col-span-2"><h2 className="font-semibold text-foreground">Requests by category</h2><p className="mb-3 text-sm text-muted-foreground">Live work-order volume by service category</p><div className="h-64">{categories.length === 0 ? <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">No category data for this period.</div> : <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82}>{categories.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>}</div></div>
      </div>
      <div className="flex flex-wrap gap-3"><Select value={priority} onValueChange={(value) => { setPriority(value); setPage(1) }}><SelectTrigger className="w-44"><SelectValue placeholder="All priorities" /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{priorities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}><SelectTrigger className="w-44"><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-[13px]"><thead className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-3.5">Work order</th><th className="px-5 py-3.5">Facility</th><th className="px-5 py-3.5">Location</th><th className="px-5 py-3.5">Asset</th><th className="px-5 py-3.5">Category</th><th className="px-5 py-3.5">Priority</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Created</th><th className="px-5 py-3.5">Due date</th></tr></thead><tbody className="divide-y divide-border/60">{visible.length === 0 ? <tr><td colSpan={9} className="p-10 text-center text-sm text-muted-foreground">No work orders match the selected filters. Adjust the priority or status to broaden the report.</td></tr> : visible.map((item: WorkOrderReportRow) => <tr key={item.id} className="hover:bg-muted/20"><td className="px-5 py-4"><p className="font-semibold text-foreground">{item.title}</p><p className="font-mono text-[11px] text-muted-foreground">{item.id}</p></td><td className="px-5 py-4 text-muted-foreground">{item.facilityId || '—'}</td><td className="px-5 py-4 text-muted-foreground">{item.locationId || '—'}</td><td className="px-5 py-4 text-muted-foreground">{item.assetId || '—'}</td><td className="px-5 py-4">{item.serviceCategory}</td><td className="px-5 py-4 capitalize">{item.priority.toLowerCase()}</td><td className="px-5 py-4 capitalize">{item.status.toLowerCase().replace(/_/g, ' ')}</td><td className="px-5 py-4 text-muted-foreground">{safeDate(item.createdAt)}</td><td className="px-5 py-4 text-muted-foreground">{safeDate(item.dueDate)}</td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-border p-4 text-sm text-muted-foreground"><span>Showing {rows.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, rows.length)} of {rows.length} entries</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</Button></div></div></div>
    </div>
  )

  /* Legacy mock layout retained below temporarily during migration. */
  return (
    <div className="space-y-6">
      {/* 5 Filter Bar Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-44 border-border bg-card text-[13px]">
            <SelectValue placeholder="Facility: All Facilities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Facility: All</SelectItem>
            <SelectItem value="hq">HQ Office Tower</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="30d">
          <SelectTrigger className="h-9 w-48 border-border bg-card text-[13px]">
            <SelectValue placeholder="Date Range: Last 30 Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Date Range: Last 30 Days</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-44 border-border bg-card text-[13px]">
            <SelectValue placeholder="Priority: All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Priority: All</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-48 border-border bg-card text-[13px]">
            <SelectValue placeholder="Category: All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Category: All</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-44 border-border bg-card text-[13px]">
            <SelectValue placeholder="Status: All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Operational graphs */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm xl:col-span-3">
          <div className="mb-3"><h2 className="text-[15px] font-bold text-foreground">Work order flow</h2><p className="text-[12px] text-muted-foreground">Created versus completed in the selected period</p></div>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ left: -20, right: 8 }}><defs><linearGradient id="reportCreated" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={.25}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/><XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11}/><YAxis tickLine={false} axisLine={false} fontSize={11}/><Tooltip/><Area type="monotone" dataKey="created" stroke="#4f46e5" fill="url(#reportCreated)" strokeWidth={2}/><Area type="monotone" dataKey="completed" stroke="#10b981" fill="transparent" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm xl:col-span-2">
          <div className="mb-3"><h2 className="text-[15px] font-bold text-foreground">Requests by category</h2><p className="text-[12px] text-muted-foreground">Share of maintenance volume</p></div>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={3}>{categories.map((entry, index) => <Cell key={entry.name} fill={colors[index]}/>)}</Pie><Tooltip/><Legend verticalAlign="bottom" height={28}/></PieChart></ResponsiveContainer></div>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Work Orders', val: '148', sub: '◆ +12% from last month', isPositive: true },
          { label: 'Completed Orders', val: '124', sub: '◆ 83.7% completion rate', isPositive: true },
          { label: 'Avg. Resolution Time', val: '4h 12m', sub: '◆ -22m since last week', isPositive: true },
          { label: 'SLA Compliance Rate', val: '94.2%', sub: '◆ Target SLA is 92%', isPositive: true },
        ].map((kpi, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-1">
            <p className="text-[12px] font-medium text-muted-foreground">{kpi.label}</p>
            <p className="text-3xl font-extrabold text-foreground">{kpi.val}</p>
            <p className="text-[11px] font-medium text-success">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Work Orders Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-3.5">WO #</th>
              <th className="px-6 py-3.5">FACILITY</th>
              <th className="px-6 py-3.5">LOCATION</th>
              <th className="px-6 py-3.5">ASSET</th>
              <th className="px-6 py-3.5">CATEGORY</th>
              <th className="px-6 py-3.5">PRIORITY</th>
              <th className="px-6 py-3.5">STATUS</th>
              <th className="px-6 py-3.5">ASSIGNED TO</th>
              <th className="px-6 py-3.5">CREATED</th>
              <th className="px-6 py-3.5">RESOLVED</th>
              <th className="px-6 py-3.5 text-right">RES. TIME</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              { id: 'WO-4810', fac: 'HQ Office Tower', loc: 'Conf Room B', asset: 'Carrier HVAC v4', cat: 'HVAC', pri: 'CRITICAL', stat: 'IN_PROGRESS', tech: 'Sarah Jenkins', cr: 'Jan 12, 09:00', res: 'Jan 12, 13:12', time: '4h 12m' },
              { id: 'WO-4809', fac: 'West Campus', loc: 'Elevator Shaft B', asset: 'Otis Lift 2000', cat: 'Elevator', pri: 'HIGH', stat: 'COMPLETED', tech: 'Dave Miller', cr: 'Jan 11, 10:15', res: 'Jan 11, 12:45', time: '2h 30m' },
              { id: 'WO-4808', fac: 'North Logistics', loc: 'Basement Pump Room', asset: 'Grundfos Seal Pump', cat: 'Plumbing', pri: 'CRITICAL', stat: 'ON_HOLD', tech: 'John Doe', cr: 'Jan 10, 08:30', res: '—', time: '—' },
              { id: 'WO-4807', fac: 'HQ Office Tower', loc: 'Cafeteria Kitchen', asset: 'Hobart Dishwasher', cat: 'Appliances', pri: 'MEDIUM', stat: 'COMPLETED', tech: 'Unassigned', cr: 'Jan 10, 14:20', res: 'Jan 10, 17:50', time: '3h 30m' },
              { id: 'WO-4806', fac: 'East Warehouses', loc: 'Dock Gate 3', asset: 'Linear Safety Loop', cat: 'Security', pri: 'HIGH', stat: 'IN_PROGRESS', tech: 'John Doe', cr: 'Jan 09, 11:10', res: '—', time: '—' },
              { id: 'WO-4805', fac: 'HQ Office Tower', loc: 'All Floors', asset: 'Honeywell Alarm Gen3', cat: 'Fire Safety', pri: 'HIGH', stat: 'COMPLETED', tech: 'Sarah Jenkins', cr: 'Jan 09, 08:00', res: 'Jan 09, 10:15', time: '2h 15m' },
              { id: 'WO-4804', fac: 'Silicon Valley Lab', loc: 'Room 102', asset: 'APC Backup UPS 10k', cat: 'Electrical', pri: 'CRITICAL', stat: 'IN_PROGRESS', tech: 'Dave Miller', cr: 'Jan 08, 12:00', res: '—', time: '—' },
              { id: 'WO-4803', fac: 'HQ Office Tower', loc: 'Lobby Front', asset: 'Philips LED Panel', cat: 'Lighting', pri: 'LOW', stat: 'COMPLETED', tech: 'Unassigned', cr: 'Jan 08, 15:45', res: 'Jan 08, 16:30', time: '45m' },
            ].map(row => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-foreground">{row.id}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.fac}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.loc}</td>
                <td className="px-6 py-4 text-foreground font-medium">{row.asset}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.cat}</td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={row.pri} />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.stat} />
                </td>
                <td className="px-6 py-4 text-foreground font-medium">{row.tech}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.cr}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.res}</td>
                <td className="px-6 py-4 text-right font-bold text-foreground">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4 text-[13px] text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">1-8</span> of{' '}
            <span className="font-semibold text-foreground">148</span> entries
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-8 rounded-md border-border px-3 text-[12px]">Previous</Button>
            <Button size="sm" className="h-8 rounded-lg bg-primary px-3 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90">1</Button>
            <Button variant="outline" size="sm" className="h-8 rounded-md border-border px-3 text-[12px]">2</Button>
            <Button variant="outline" size="sm" className="h-8 rounded-md border-border px-3 text-[12px]">3</Button>
            <Button variant="outline" size="sm" className="h-8 rounded-md border-border px-3 text-[12px]">Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. INVENTORY REPORT VIEW
   ───────────────────────────────────────────────────────────────────────────── */
function InventoryReportView() {
  const [overview, setOverview] = useState<InventoryOverview | null>(null)
  const [items, setItems] = useState<InventoryItemRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    Promise.all([inventoryService.overview(), inventoryService.listItems()])
      .then(([nextOverview, nextItems]) => { setOverview(nextOverview); setItems(nextItems ?? []) })
      .catch((err: { message?: string }) => setError(err.message ?? 'Unable to load inventory report'))
      .finally(() => setLoading(false))
  }, [])

  const filteredItems = items.filter((item) => status === 'all' || (item.status ?? '').toLowerCase() === status)
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const visibleItems = filteredItems.slice((page - 1) * pageSize, page * pageSize)
  const stockLevels = [
    { name: 'In stock', value: items.filter((item) => ['active', 'in_stock'].includes((item.status ?? '').toLowerCase())).length },
    { name: 'Low stock', value: items.filter((item) => ['low', 'low_stock'].includes((item.status ?? '').toLowerCase())).length },
    { name: 'Critical', value: items.filter((item) => ['critical', 'critical_low', 'out_of_stock'].includes((item.status ?? '').toLowerCase())).length },
  ]
  const categoryCounts = items.reduce<Record<string, number>>((counts, item) => {
    const category = item.categoryId ?? 'Uncategorized'
    counts[category] = (counts[category] ?? 0) + 1
    return counts
  }, {})
  const categoryLevels = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
  if (loading) return <SkeletonTable rows={5} columns={5} />
  if (error || !overview) return <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">{error ?? 'Unable to load inventory report'}</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[['Total Monitored Items', overview.totalItems], ['Low Stock Warnings', overview.lowStockItems], ['Reserved Items', overview.reservedItems], ['Total Categories', overview.categoriesCount]].map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-sm"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-extrabold text-foreground">{value}</p></div>)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-foreground">Stock health</h2>
          <p className="mt-1 text-sm text-muted-foreground">Inventory grouped by replenishment state.</p>
          <div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={stockLevels}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="var(--primary)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-foreground">Items by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">Current inventory distribution across categories.</p>
          <div className="mt-4 h-56">{categoryLevels.length === 0 ? <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">No category data available.</div> : <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryLevels} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82}>{categoryLevels.map((entry, index) => <Cell key={entry.name} fill={['var(--primary)', 'var(--info)', 'var(--warning)', 'var(--success)', 'var(--destructive)'][index % 5]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>}</div>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-semibold text-foreground">Inventory items</h2><p className="mt-1 text-sm text-muted-foreground">Stock thresholds and replenishment status by item.</p></div><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}><SelectTrigger className="w-44"><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{[...new Set(items.map((item) => (item.status ?? '').toLowerCase()))].filter(Boolean).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-[13px]"><thead className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-3.5">Item / SKU</th><th className="px-5 py-3.5">Category</th><th className="px-5 py-3.5">Current stock</th><th className="px-5 py-3.5">Minimum</th><th className="px-5 py-3.5">Reorder level</th><th className="px-5 py-3.5">Maximum</th><th className="px-5 py-3.5">Unit</th><th className="px-5 py-3.5">Status</th></tr></thead><tbody className="divide-y divide-border/60">{visibleItems.length === 0 ? <tr><td colSpan={8} className="p-10 text-center text-sm text-muted-foreground">No inventory items match the selected status. Adjust the filter or add inventory items to populate this report.</td></tr> : visibleItems.map((item) => <tr key={item._id} className="hover:bg-muted/20"><td className="px-5 py-4"><p className="font-semibold text-foreground">{item.name}</p><p className="font-mono text-[11px] text-muted-foreground">{item.sku}</p></td><td className="px-5 py-4 text-muted-foreground">{item.categoryId ?? '—'}</td><td className="px-5 py-4 font-semibold">{item.quantity ?? '—'}</td><td className="px-5 py-4">{item.minimumStockLevel}</td><td className="px-5 py-4">{item.reorderLevel}</td><td className="px-5 py-4">{item.maximumStockLevel ?? '—'}</td><td className="px-5 py-4 text-muted-foreground">{item.unitOfMeasure}</td><td className="px-5 py-4 capitalize">{(item.status ?? 'unknown').toLowerCase().replace(/_/g, ' ')}</td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-border p-4 text-sm text-muted-foreground"><span>Showing {filteredItems.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filteredItems.length)} of {filteredItems.length} entries</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</Button></div></div></div>
    </div>
  )

  /* Legacy mock layout retained below temporarily during migration. */
  return (
    <div className="space-y-6">
      {/* 4 Filter Bar Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-44 border-border bg-card text-[13px]">
            <SelectValue placeholder="Facility: All Facilities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Facility: All</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-52 border-border bg-card text-[13px]">
            <SelectValue placeholder="Location: All Storage Rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Location: All Rooms</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-48 border-border bg-card text-[13px]">
            <SelectValue placeholder="Category: Spare Parts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Category: Spare Parts</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="low">
          <SelectTrigger className="h-9 w-52 border-border bg-card text-[13px]">
            <SelectValue placeholder="Stock Status: Low & Critical" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Stock Status: Low & Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm"><h2 className="text-[15px] font-bold text-foreground">Stock health</h2><p className="mb-3 text-[12px] text-muted-foreground">Items by replenishment state</p><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={stockLevels} margin={{ left: -20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11}/><YAxis tickLine={false} axisLine={false} fontSize={11}/><Tooltip/><Bar dataKey="value" fill="#4f46e5" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm"><h2 className="text-[15px] font-bold text-foreground">Inventory value outlook</h2><p className="mb-3 text-[12px] text-muted-foreground">Current value remains concentrated in healthy stock</p><div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{name:'Healthy value',value:42850},{name:'At-risk value',value:6200}]} dataKey="value" innerRadius={54} outerRadius={82} paddingAngle={3}><Cell fill="#10b981"/><Cell fill="#f59e0b"/></Pie><Tooltip formatter={(value: number) => `$${value.toLocaleString()}`}/></PieChart></ResponsiveContainer></div></div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Monitored Items', val: '482', sub: 'Across 8 storage units', color: 'var(--info)' },
          { label: 'Low Stock Warnings', val: '14', sub: 'Needs replenishment action', isWarn: true },
          { label: 'Out of Stock', val: '3', sub: 'Severe backlog risk', isCrit: true },
          { label: 'Total Inventory Value', val: '$42,850', sub: 'Audit completed yesterday', isSuccess: true },
        ].map((kpi, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-1">
            <p className="text-[12px] font-medium text-muted-foreground">{kpi.label}</p>
            <p className="text-3xl font-extrabold text-foreground">{kpi.val}</p>
            <p className={`text-[11px] font-medium ${kpi.isWarn ? 'text-warning' : kpi.isCrit ? 'text-destructive' : kpi.isSuccess ? 'text-success' : 'text-muted-foreground'}`}>
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Inventory Report Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-3.5">ITEM NAME / SKU</th>
              <th className="px-6 py-3.5">CATEGORY</th>
              <th className="px-6 py-3.5">FACILITY</th>
              <th className="px-6 py-3.5 text-center">CURRENT STOCK</th>
              <th className="px-6 py-3.5 text-center">MIN STOCK</th>
              <th className="px-6 py-3.5 text-center">MAX STOCK</th>
              <th className="px-6 py-3.5">UNIT COST</th>
              <th className="px-6 py-3.5">TOTAL VALUE</th>
              <th className="px-6 py-3.5 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              { sku: 'FLT-CH-8201', cat: 'HVAC Filters', fac: 'Silicon Valley Lab', stock: 2, min: 10, max: 40, cost: '$45.00', val: '$90.00', stat: 'CRITICAL_LOW' },
              { sku: 'BULB-4FT-09', cat: 'Electrical', fac: 'HQ Office Tower', stock: 15, min: 40, max: 200, cost: '$8.50', val: '$225.00', stat: 'DUE_SOON' },
              { sku: 'BLT-HVAC-12', cat: 'Mechanical', fac: 'North Logistics', stock: 4, min: 12, max: 50, cost: '$18.00', val: '$72.00', stat: 'DUE_SOON' },
              { sku: 'LIFT-G-002', cat: 'Elevator Parts', fac: 'West Campus', stock: 0, min: 4, max: 20, cost: '—', val: '—', stat: 'OUT_OF_STOCK' },
              { sku: 'GAS-R410A-C', cat: 'HVAC Gas', fac: 'All Facilities', stock: 18, min: 8, max: 30, cost: '$110.00', val: '$1,980.00', stat: 'ACTIVE' },
              { sku: 'SL-PMP-G9', cat: 'Plumbing Accessories', fac: 'North Logistics', stock: 42, min: 20, max: 100, cost: '$3.20', val: '$134.40', stat: 'ACTIVE' },
              { sku: 'GLS-EM-EX0', cat: 'Safety Hardwares', fac: 'HQ Office Tower', stock: 1, min: 10, max: 25, cost: '$35.00', val: '$35.00', stat: 'CRITICAL_LOW' },
              { sku: 'CBL-C6-SPL', cat: 'Cabling', fac: 'Silicon Valley Lab', stock: 8, min: 5, max: 15, cost: '$145.00', val: '$1,160.00', stat: 'ACTIVE' },
            ].map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-bold text-foreground">{row.sku}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.cat}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.fac}</td>
                <td className="px-6 py-4 text-center font-bold text-foreground">{row.stock}</td>
                <td className="px-6 py-4 text-center text-muted-foreground">{row.min}</td>
                <td className="px-6 py-4 text-center text-muted-foreground">{row.max}</td>
                <td className="px-6 py-4 font-medium text-foreground">{row.cost}</td>
                <td className="px-6 py-4 font-bold text-foreground">{row.val}</td>
                <td className="px-6 py-4 text-right">
                  <StatusBadge status={row.stat} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4 text-[13px] text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">1-8</span> of{' '}
            <span className="font-semibold text-foreground">482</span> entries
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-8 rounded-md border-border px-3 text-[12px]">Previous</Button>
            <Button size="sm" className="h-8 rounded-lg bg-primary px-3 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90">1</Button>
            <Button variant="outline" size="sm" className="h-8 rounded-md border-border px-3 text-[12px]">2</Button>
            <Button variant="outline" size="sm" className="h-8 rounded-md border-border px-3 text-[12px]">3</Button>
            <Button variant="outline" size="sm" className="h-8 rounded-md border-border px-3 text-[12px]">Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
