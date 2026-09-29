import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { AppHeader } from '@/components/navigation/Navbar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/api/client'
import { useLocation, useNavigate } from 'react-router-dom'
import { SkeletonTable } from '@/components/feedback/Skeletons'
import { PageError } from '@/components/feedback/PageError'
import { PageIntro } from '@/components/layout/PageIntro'

type Sla = { _id: string; responseTimeHours: number; resolutionTimeHours: number; status: string; workOrderId: string; vendorApplicationId: string }
const formatHours = (hours: number) => hours < 1 ? `${Math.round(hours * 60)} min` : `${hours % 1 ? hours.toFixed(1) : hours} hour${hours === 1 ? '' : 's'}`

export function VendorSLAs() {
  const [slas, setSlas] = useState<Sla[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const vendorBase = location.pathname.split('/').slice(0, 3).join('/')
  const loadSlas = async () => {
    setLoading(true)
    setLoadError(null)
    try { setSlas(await apiClient.get<Sla[]>('/sla-agreements/mine')) }
    catch (error) { const message = error instanceof Error ? error.message : 'Unable to load SLA agreements'; setLoadError(message); toast.error(message) }
    finally { setLoading(false) }
  }
  useEffect(() => { void loadSlas() }, [])
  const filtered = useMemo(() => slas.filter((sla) => `${sla._id} ${sla.workOrderId} ${sla.status}`.toLowerCase().includes(search.toLowerCase())), [slas, search])
  const statusLabel = (status: string) => status.toUpperCase().replace('_', ' ')
  return <div className="min-h-full bg-background text-foreground"><AppHeader title="SLA Agreements" subtitle="Vendors" hideQuickCreate /><div className="px-8 py-6 space-y-6"><div><p className="mt-1 text-[13px] text-muted-foreground">Review your contracted response, resolution, and service delivery benchmarks.</p></div><div className="flex items-center justify-between"><div className="relative w-80"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search SLA agreements..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9 bg-card" /></div></div>{loading ? <div role="status" aria-live="polite"><span className="sr-only">Loading SLA agreements…</span><SkeletonTable rows={5} columns={5} /></div> : loadError ? <PageError title="SLA agreements unavailable" message={loadError} onRetry={() => void loadSlas()} /> : <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-[13px]"><thead className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><tr><th className="px-6 py-3.5">SLA Agreement</th><th className="px-6 py-3.5">Application</th><th className="px-6 py-3.5">Response Target</th><th className="px-6 py-3.5">Resolution Target</th><th className="px-6 py-3.5">Status</th></tr></thead><tbody className="divide-y divide-border/60">{filtered.map((sla) => <tr key={sla._id} className="cursor-pointer hover:bg-muted/20" tabIndex={0} onClick={() => navigate(`${vendorBase}/slas/${sla._id}`, { state: { sla } })} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate(`${vendorBase}/slas/${sla._id}`, { state: { sla } }) }}><td className="px-6 py-4 font-bold">Agreement {sla._id.slice(0, 8).toUpperCase()}</td><td className="px-6 py-4 text-muted-foreground">Application {sla.vendorApplicationId.slice(0, 8).toUpperCase()}<p className="text-[11px]">Work order {sla.workOrderId.slice(0, 8)}</p></td><td className="px-6 py-4 font-semibold">{formatHours(sla.responseTimeHours)}</td><td className="px-6 py-4">{formatHours(sla.resolutionTimeHours)}</td><td className="px-6 py-4"><Badge variant="outline" className={sla.status === 'active' ? 'bg-success/15 text-success border-success/30' : sla.status === 'rejected' ? 'bg-destructive/15 text-destructive border-destructive/30' : 'bg-warning/15 text-warning border-warning/30'}>{statusLabel(sla.status)}</Badge></td></tr>)}{filtered.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">No SLA agreements found.</td></tr>}</tbody></table></div></div>}</div></div>
}
