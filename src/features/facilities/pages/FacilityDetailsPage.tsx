import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useFacility } from '../hooks/useFacilities'
import { facilitiesApi } from '../api/facilities.api'
import { PageLoader } from '@/components/feedback/PageLoader'
import { PageError } from '@/components/feedback/PageError'
import { Button } from '@/components/ui/button'
import { usePortalPath } from '@/hooks/usePortal'
import { AppHeader } from '@/components/navigation/Navbar'
import { PageHeader } from '@/components/ui/page-header'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { KPICard } from '@/features/dashboard/components/StatCard'
import { InviteUserModal } from '@/features/auth/components/InviteUserModal'

type FacilityRelationships = {
  locations?: unknown[]
  assets?: unknown[]
  workOrders?: unknown[]
  vendors?: unknown[]
  locationCount?: number
  assetCount?: number
  openWorkOrderCount?: number
  pmScheduleCount?: number
}

const emptyRelationships = {
  locations: [],
  assets: [],
  workOrders: [],
  vendors: [],
}

export function FacilityDetailsPage() {
  const { facilityId = '' } = useParams()
  const navigate = useNavigate()
  const { data: facility, isLoading, isError, refetch } = useFacility(facilityId)
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'assets' | 'work-orders' | 'pm' | 'vendors'>('overview')
  const [relationships, setRelationships] = useState<Required<Pick<FacilityRelationships, 'locations' | 'assets' | 'workOrders' | 'vendors'>> & Omit<FacilityRelationships, 'locations' | 'assets' | 'workOrders' | 'vendors'>>(emptyRelationships)
  const [relationshipError, setRelationshipError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', street: '', city: '', state: '', country: '', description: '', managerName: '', primaryPhone: '', emergencyContact: '' })
  const [showManagerInvite, setShowManagerInvite] = useState(false)
  useEffect(() => {
    if (!facilityId) return
    void facilitiesApi.relationships(facilityId)
      .then((result: FacilityRelationships) => {
        setRelationships({
          ...result,
          locations: Array.isArray(result.locations) ? result.locations : [],
          assets: Array.isArray(result.assets) ? result.assets : [],
          workOrders: Array.isArray(result.workOrders) ? result.workOrders : [],
          vendors: Array.isArray(result.vendors) ? result.vendors : [],
        })
      })
      .catch((error) => setRelationshipError(error instanceof Error ? error.message : 'Unable to load facility relationships'))
  }, [facilityId])

  const locationsPath = usePortalPath('locations')
  const assetsPath = usePortalPath('assets')
  const workOrdersPath = usePortalPath('work-orders')
  const pmSchedulesPath = usePortalPath('preventive-maintenance')

  if (isLoading) return <PageLoader label="Loading facility overview..." />
  if (isError) return <PageError title="Facility unavailable" message="Unable to fetch facility details. Please try again." onRetry={() => void refetch()} />

  const facilityName = facility?.name || 'Facility'
  const addressStr = facility ? Object.values(facility.address ?? {}).filter(Boolean).join(', ') || 'Address unavailable' : 'Address unavailable'
  const managerName = facility?.managerName || 'Not configured'
  const primaryPhone = facility?.primaryPhone || 'Not configured'
  const emergencyPhone = facility?.emergencyContact || 'Not configured'
  const subLocationCount = relationships.locationCount ?? relationships.locations.length
  const assetCount = relationships.assetCount ?? relationships.assets.length
  const openWorkOrderCount = relationships.openWorkOrderCount ?? relationships.workOrders.filter((item: any) => !['completed', 'cancelled'].includes(item.status)).length
  const pmScheduleCount = relationships.pmScheduleCount ?? 0

  const openEdit = () => {
    setForm({
      name: facilityName,
      street: facility?.address?.street ?? '',
      city: facility?.address?.city ?? '',
      state: facility?.address?.state ?? '',
      country: facility?.address?.country ?? '',
      description: facility?.description ?? '',
      managerName: facility?.managerName ?? '',
      primaryPhone: facility?.primaryPhone ?? '',
      emergencyContact: facility?.emergencyContact ?? '',
    })
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!facility || !form.name.trim()) return
    setSaving(true)
    try {
      await facilitiesApi.update(facility.id, {
        name: form.name.trim(),
        address: {
          ...facility.address,
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country.trim() || facility.address.country,
        },
        description: form.description.trim() || null,
        primaryPhone: form.primaryPhone.trim() || null,
        emergencyContact: form.emergencyContact.trim() || null,
      })
      toast.success('Facility updated')
      setEditOpen(false)
      void refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update facility')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-full bg-muted/30 text-foreground">
      <AppHeader title={facilityName} subtitle="Facility Detail" hideQuickCreate />
      {/* ── Page Content ── */}
      <PageHeader
        title={facilityName}
        subtitle="Review facility information, operational scope, and related maintenance activity."
      />
      <div className="p-8 space-y-6">
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={openEdit}
            className="h-9 rounded-lg border-border bg-card text-[13px] font-medium text-foreground hover:bg-muted/30"
          >
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit Facility
          </Button>
        </div>
        {relationshipError && <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">Some related facility records are unavailable. Refresh to try again.</p>}
        {/* ── Top Context Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-foreground">General Information</h2>
            <div className="mt-4 space-y-3 text-[13px]">
              <div className="flex items-start justify-between gap-6">
                <span className="text-muted-foreground">Address</span>
                <span className="font-semibold text-foreground text-right">{addressStr}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Facility Manager</span>
                <span className="font-semibold text-foreground">{managerName}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Primary Phone</span>
                <span className="font-semibold text-foreground">{primaryPhone}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Emergency Contact</span>
                <span className="font-semibold text-foreground">{emergencyPhone}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-foreground">Operational Scope</h2>
            <div className="mt-4 space-y-3 text-[13px]">
              <div className="flex items-start justify-between gap-6">
                <span className="text-muted-foreground">Description</span>
                <span className="text-right font-semibold text-foreground">{facility?.description || 'Not configured'}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold capitalize text-foreground">{facility?.status ?? 'Not configured'}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Created</span>
                <span className="font-semibold text-foreground">{facility?.createdAt ? new Date(facility.createdAt).toLocaleDateString() : 'Not configured'}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground">Last updated</span>
                <span className="font-semibold text-foreground">{facility?.updatedAt ? new Date(facility.updatedAt).toLocaleDateString() : 'Not configured'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sub-navigation Tabs ── */}
        <div className="border-b border-border flex items-center gap-6">
          {(['overview', 'locations', 'assets', 'work-orders', 'pm', 'vendors'] as const).map((tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[13px] font-semibold capitalize transition-colors border-b-2 ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            )
          })}
        </div>

        {/* ── Overview Tab Content ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Sub-Locations" value={subLocationCount} changeLabel="Locations assigned to this facility" icon="facilities" href={locationsPath} />
              <KPICard title="Tracked Assets" value={assetCount} changeLabel="Assets registered at this facility" icon="assets" href={assetsPath} />
              <KPICard title="Open Work Orders" value={openWorkOrderCount} changeLabel="Active work requiring attention" icon="work-orders" href={workOrdersPath} variant={openWorkOrderCount > 0 ? 'warning' : 'default'} />
              <KPICard title="PM Schedules" value={pmScheduleCount} changeLabel="Preventive maintenance schedules" icon="calendar" href={pmSchedulesPath} />
            </div>

            {/* Bottom 2 Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Locations Health */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-[15px] font-bold text-foreground">Locations Health</h3>
                  <button
                    onClick={() => navigate(locationsPath)}
                    className="text-[12px] font-semibold text-primary hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="mt-4 divide-y divide-border">
                  {relationships.locations.map((loc: any) => (
                    <div key={loc.name} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-[13px] font-bold text-foreground">{loc.name}</p>
                        <p className="text-[12px] text-muted-foreground">{loc.floor}</p>
                      </div>
                      <span
                        className="rounded px-2 py-0.5 text-[11px] font-bold uppercase"
                        style={{ backgroundColor: loc.bg, color: loc.text }}
                      >
                        {loc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Work Orders */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-[15px] font-bold text-foreground">Recent Work Orders</h3>
                  <button
                    onClick={() => navigate(workOrdersPath)}
                    className="text-[12px] font-semibold text-primary hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="mt-4 divide-y divide-border">
                  {relationships.workOrders.map((wo: any) => (
                    <div key={wo.id} className="flex items-center justify-between py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-foreground">{wo.id}</span>
                          <span className="text-[13px] text-muted-foreground">{wo.title}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{wo.time}</p>
                      </div>
                      <span
                        className="rounded px-2 py-0.5 text-[11px] font-bold uppercase"
                        style={{ backgroundColor: wo.bg, color: wo.text }}
                      >
                        {wo.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related records */}
        {activeTab !== 'overview' && (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            <p className="text-[14px] font-medium">{({ locations: relationships.locations, assets: relationships.assets, 'work-orders': relationships.workOrders, pm: [], vendors: relationships.vendors } as Record<string, unknown[]>)[activeTab]?.length ?? 0} {activeTab.replace('-', ' ')} records for {facilityName}.</p>
            <div className="mx-auto mt-5 max-w-xl space-y-2 text-left">
              {(({ locations: relationships.locations, assets: relationships.assets, 'work-orders': relationships.workOrders, pm: [], vendors: relationships.vendors } as Record<string, unknown[]>)[activeTab] ?? []).slice(0, 5).map((item: any, index) => <div key={item.id ?? item._id ?? index} className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm"><span className="font-semibold text-foreground">{item.name ?? item.title ?? item.assetTag ?? item.id ?? 'Related record'}</span><span className="ml-2 text-muted-foreground">{item.status ?? item.category ?? item.locationName ?? ''}</span></div>)}
            </div>
            <Button
              onClick={() => {
                if (activeTab === 'locations') navigate(locationsPath)
                if (activeTab === 'assets') navigate(assetsPath)
                if (activeTab === 'work-orders') navigate(workOrdersPath)
              }}
              className="mt-4 bg-primary text-primary-foreground text-[13px] hover:bg-primary/90"
            >
              Open Full {activeTab.replace('-', ' ')} Directory
            </Button>
          </div>
        )}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="!max-w-4xl w-[calc(100vw-2rem)] !h-[calc(100dvh-2rem)] !max-h-[calc(100dvh-2rem)] overflow-y-auto bg-card border-border">
          <DialogHeader><DialogTitle>Edit Facility</DialogTitle><p className="text-sm text-muted-foreground">Update facility details and operating context.</p></DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2"><Label>Facility Name</Label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Street Address</Label><Input value={form.street} onChange={(event) => setForm((current) => ({ ...current, street: event.target.value }))} /></div>
            <div className="space-y-1.5"><Label>City</Label><Input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} /></div>
            <div className="space-y-1.5"><Label>State / Province</Label><Input value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Country</Label><Input value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} /></div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Facility Description</Label>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5"><Label>Facility Manager</Label><Button type="button" variant="outline" onClick={() => setShowManagerInvite(true)} className="w-full justify-start">Invite Facility Manager</Button></div>
            <div className="space-y-1.5"><Label>Primary Phone</Label><Input value={form.primaryPhone} onChange={(event) => setForm((current) => ({ ...current, primaryPhone: event.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Emergency Contact</Label><Input value={form.emergencyContact} onChange={(event) => setForm((current) => ({ ...current, emergencyContact: event.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={() => void saveEdit()} disabled={!form.name.trim() || saving}>{saving ? 'Saving…' : 'Save Changes'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <InviteUserModal isOpen={showManagerInvite} onClose={() => setShowManagerInvite(false)} facilityId={facility?.id} facilityName={facility?.name} />
      </div>
    </div>
  )
}
