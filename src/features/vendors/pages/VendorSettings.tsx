import { useEffect, useState } from 'react'
import { AppHeader } from '@/components/navigation/Navbar'
import { Button } from '@/components/ui/button'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Plus, Upload, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useVendorSettings } from '@/hooks/useSettings'
import { useVendorProfile, useVendorProfileMutation } from '../hooks/useVendorProfile'
import { uploadImage } from '@/api/uploads.api'
import { useActionConfirm } from '@/hooks/useActionConfirm'
import { PageLoader } from '@/components/feedback/PageLoader'
import { PageError } from '@/components/feedback/PageError'
import { usePaymentMethods } from '@/features/billing/hooks/useBilling'
import { useSubscription } from '@/features/billing/hooks/useBilling'
import type { PaymentMethodData } from '@/services/billingService'

type TabKey =
  | 'profile'
  | 'categories'
  | 'areas'
  | 'team'
  | 'marketplace'
  | 'billing'

const NAV_ITEMS: { id: TabKey; label: string; icon: string }[] = [
  { id: 'profile', label: 'Vendor Profile', icon: 'building' },
  { id: 'categories', label: 'Service Categories', icon: 'grid' },
  { id: 'areas', label: 'Service Areas', icon: 'map' },
  { id: 'team', label: 'Team', icon: 'users' },
  { id: 'marketplace', label: 'Marketplace Preferences', icon: 'store' },
  { id: 'billing', label: 'Billing & Plans', icon: 'credit-card' },
]

export function VendorSettings({ initialTab = 'profile' }: { initialTab?: TabKey }) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
  const navigate = useNavigate()
  const vendorSettings = useVendorSettings()
  const paymentMethodsQuery = usePaymentMethods()
  const paymentMethod = paymentMethodsQuery.data?.find((item: PaymentMethodData) => item.isDefault) ?? paymentMethodsQuery.data?.[0]
  const vendorProfile = useVendorProfile()
  const vendorProfileUpdate = useVendorProfileMutation()
  const subscriptionQuery = useSubscription()
  const hasValidSubscription = subscriptionQuery.data?.status === 'active' || subscriptionQuery.data?.status === 'trial'
  const { requestConfirm, ActionConfirmDialog } = useActionConfirm()
  // Profile Form State
  const [companyName, setCompanyName] = useState('')
  const [registrationId, setRegistrationId] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)

  // Service Categories State
  const [categories, setCategories] = useState<string[]>([])
  const [newCat, setNewCat] = useState('')

  // Service Areas State
  const [baseLocation, setBaseLocation] = useState('')
  const [radius, setRadius] = useState('')

  // Marketplace Preferences State
  const [autoApply, setAutoApply] = useState(false)
  const [quoteInquiries, setQuoteInquiries] = useState(true)
  const [publicProfile, setPublicProfile] = useState(true)
  const [minAnnualValue, setMinAnnualValue] = useState('')
  const [maxDistance, setMaxDistance] = useState('')
  const [contractTypes, setContractTypes] = useState({
    pm: true,
    emergency: true,
    modernization: false,
    audits: true,
  })

  // Handlers
  const handleRemoveCategory = (cat: string) => {
    requestConfirm({
      title: 'Remove service category?',
      description: `Remove ${cat} from your vendor service catalog?`,
      warning: 'This may affect marketplace matching for future work orders.',
      confirmLabel: 'Remove category',
      destructive: true,
      onConfirm: () => setCategories((current) => current.filter((c) => c !== cat)),
    })
  }

  const handleAddCategory = () => {
    if (!newCat.trim()) return
    setCategories([...categories, newCat.trim()])
    setNewCat('')
    toast.success('Category added')
  }

  const handleSave = (msg: string) => {
    toast.success(msg)
  }

  useEffect(() => {
    const value = vendorSettings.data
    if (!value) return
    setQuoteInquiries(value.marketplaceAvailable)
    setPublicProfile(value.profileVisible)
    setAutoApply(value.autoApply)
    setMinAnnualValue(value.minimumAnnualContractValue === undefined ? '' : `$${value.minimumAnnualContractValue} /yr`)
    setMaxDistance(typeof value.maximumDistanceKm === 'number' && Number.isFinite(value.maximumDistanceKm) ? `${value.maximumDistanceKm} km max` : '')
    setContractTypes(value.contractTypes)
  }, [vendorSettings.data])

  useEffect(() => {
    const value = vendorProfile.data
    if (!value) return
    setCompanyName(value.name)
    setRegistrationId(value.companyRegistrationNumber ?? '')
    setContactEmail(value.email)
    setLogoUrl(value.logo ?? '')
    setPhone(value.phone)
    setAddress(value.address ? [value.address.street, value.address.city, value.address.state, value.address.postalCode].filter(Boolean).join(', ') : '')
    setCategories(value.serviceCategories)
    setRadius(typeof value.coverageRadiusKm === 'number' && Number.isFinite(value.coverageRadiusKm) ? `${value.coverageRadiusKm} km` : '')
  }, [vendorProfile.data])

  if (vendorSettings.isLoading || vendorProfile.isLoading) return <PageLoader label="Loading vendor settings..." />
  if (vendorSettings.isError || vendorProfile.isError) return <PageError title="Vendor settings unavailable" message="Unable to load vendor settings. Please try again." onRetry={() => { void vendorSettings.refetch(); void vendorProfile.refetch() }} />

  const saveVendorProfile = async () => {
    try {
      await vendorProfileUpdate.mutateAsync({ vendorName: companyName, companyRegistrationNumber: registrationId || undefined, phone, logo: logoUrl || undefined, address: { street: address } })
      toast.success('Vendor profile changes saved')
    } catch {
      toast.error('Unable to save vendor profile')
    }
  }

  const handleLogoUpload = async (file?: File) => {
    if (!file) return
    setLogoUploading(true)
    try {
      const uploaded = await uploadImage(file, 'vendor-logo')
      setLogoUrl(uploaded.secureUrl)
      await vendorProfileUpdate.mutateAsync({ logo: uploaded.secureUrl })
      toast.success('Vendor logo uploaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to upload vendor logo')
    } finally { setLogoUploading(false) }
  }

  const saveMarketplacePreferences = async () => {
    try {
      const minimumAnnualContractValue = Number.parseFloat(minAnnualValue.replace(/[^0-9.]/g, ''))
      const maximumDistanceKm = Number.parseFloat(maxDistance.replace(/[^0-9.]/g, ''))
      await vendorSettings.update.mutateAsync({
        marketplaceAvailable: quoteInquiries,
        profileVisible: publicProfile,
        autoApply,
        contractTypes,
        ...(Number.isFinite(minimumAnnualContractValue) ? { minimumAnnualContractValue } : {}),
        ...(Number.isFinite(maximumDistanceKm) ? { maximumDistanceKm } : {}),
      })
      toast.success('Marketplace preferences saved')
    } catch {
      toast.error('Unable to save marketplace preferences')
    }
  }

  const saveVendorCapabilities = async () => {
    const coverageRadiusKm = Number.parseFloat(radius)
    if (!Number.isFinite(coverageRadiusKm) || coverageRadiusKm < 0) {
      toast.error('Enter a valid service radius in kilometres')
      return
    }
    try {
      await vendorProfileUpdate.mutateAsync({ serviceCategories: categories, coverageRadiusKm })
      toast.success('Vendor capabilities saved')
    } catch {
      toast.error('Unable to save vendor capabilities')
    }
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      {ActionConfirmDialog}
      <AppHeader title="Vendor Settings" subtitle={vendorProfile.data?.name ?? 'Vendor'} hideQuickCreate />
      <div className="px-8 py-6 space-y-6">
        {/* 2 Column Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Settings Sidebar (3 cols) */}
          <div className="lg:col-span-3 rounded-xl border border-border bg-card p-2 shadow-sm space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'team') {
                      navigate('../team')
                    } else {
                      setActiveTab(item.id)
                    }
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-3 ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-500 font-bold'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Main Content Panel (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* 1. VENDOR PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">Vendor Profile</h3>
                  <p className="text-[13px] text-muted-foreground">
                    Configure public business credentials, default contact details, and custom branding rules.
                  </p>
                </div>

                <div className="space-y-4 text-[13px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">COMPANY NAME</Label>
                      <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bg-background border-border" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">BUSINESS REGISTRATION ID</Label>
                      <Input value={registrationId} onChange={(e) => setRegistrationId(e.target.value)} className="bg-background border-border font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">CONTACT EMAIL</Label>
                      <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="bg-background border-border" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">PHONE</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-background border-border" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ADDRESS</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} className="bg-background border-border" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">COMPANY DESCRIPTION</Label>
                    <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="bg-background border-border" />
                  </div>

                  {/* Logo Upload Box */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <h4 className="text-[13px] font-bold text-foreground">Logo & Branding</h4>
                    <p className="text-[12px] text-muted-foreground">Upload a company symbol used on client bids, work orders, and invoices.</p>
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">COMPANY LOGO</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-4 flex items-center gap-4 bg-muted/20">
                      {logoUrl ? <img src={logoUrl} alt="Vendor logo" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">Logo</div>}
                      <div>
                        <label className="cursor-pointer text-[13px] font-bold text-foreground">{logoUploading ? 'Uploading…' : 'Choose logo'}<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" disabled={logoUploading} onChange={(event) => { void handleLogoUpload(event.target.files?.[0]) }} /></label>
                        <p className="text-[11px] text-muted-foreground">PNG, JPG up to 5MB (Ideal size: 1:1)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" className="text-[13px]">Cancel</Button>
                    <Button disabled={vendorProfileUpdate.isPending} onClick={saveVendorProfile} className="bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-semibold">Save Changes</Button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SERVICE CATEGORIES TAB */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Service Categories & Tags</h3>
                    <p className="text-[13px] text-muted-foreground">
                      Define the categories and specific service tags your team is certified to handle. MaintainPro uses this to route relevant opportunities.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ACTIVE CATEGORIES & SKILLS</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="bg-indigo-500/10 text-indigo-500 border-indigo-500/30 px-3 py-1.5 text-[12px] font-semibold flex items-center gap-2"
                        >
                          <span>{cat}</span>
                          <X className="h-3.5 w-3.5 cursor-pointer hover:text-indigo-700" onClick={() => handleRemoveCategory(cat)} />
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center gap-2 max-w-sm">
                      <Input
                        placeholder="Add new service tag..."
                        value={newCat}
                        onChange={(e) => setNewCat(e.target.value)}
                        className="h-9 text-[13px] bg-background border-border"
                      />
                      <Button onClick={handleAddCategory} variant="outline" size="sm" className="h-9 text-[13px]">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="outline" className="text-[13px]">Cancel</Button>
                    <Button disabled={vendorProfileUpdate.isPending} onClick={saveVendorCapabilities} className="bg-primary hover:bg-primary-hover text-primary-foreground text-[13px] font-semibold">Save Categories</Button>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Service Areas & Dispatch Radius</h3>
                    <p className="text-[13px] text-muted-foreground">
                      Set up your primary service dispatch base location and define how far your field technicians are willing to travel.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">PRIMARY BASE FACILITY LOCATION</Label>
                      <Input value={baseLocation} onChange={(e) => setBaseLocation(e.target.value)} className="bg-background border-border" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">MAXIMUM ALLOWED RADIUS</Label>
                      <Input value={radius} onChange={(e) => setRadius(e.target.value)} className="bg-background border-border" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-1">
                    <p className="text-[12px] font-bold text-foreground">Radius Active</p>
                    <p className="text-[12px] text-muted-foreground">Bids originating outside the 50mi threshold will automatically be flagged or filtered based on Marketplace rules.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SERVICE AREAS TAB */}
            {activeTab === 'areas' && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">Service Areas & Geographic Bounds</h3>
                  <p className="text-[13px] text-muted-foreground">Manage authorized operational zones for field dispatch.</p>
                </div>
                <div className="space-y-1.5 text-[13px]">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">PRIMARY BASE FACILITY LOCATION</Label>
                  <Input value={baseLocation} onChange={(e) => setBaseLocation(e.target.value)} className="bg-background border-border" />
                </div>
                <div className="space-y-1.5 text-[13px]">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">MAXIMUM ALLOWED RADIUS</Label>
                  <Input value={radius} onChange={(e) => setRadius(e.target.value)} className="bg-background border-border" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" className="text-[13px]">Cancel</Button>
                  <Button disabled={vendorProfileUpdate.isPending} onClick={saveVendorCapabilities} className="bg-primary hover:bg-primary-hover text-primary-foreground text-[13px] font-semibold">Save Area Settings</Button>
                </div>
              </div>
            )}

            {/* 4. MARKETPLACE PREFERENCES TAB */}
            {activeTab === 'marketplace' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Marketplace Visibility & Dispatch Rules</h3>
                    <p className="text-[13px] text-muted-foreground">
                      Control your visibility inside the MaintainPro directory and configure rules for receiving quotation inquiries.
                    </p>
                  </div>

                  <div className="space-y-4 divide-y divide-border/60 text-[13px]">
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="font-bold text-foreground">Active Auto-Apply Bidding</p>
                        <p className="text-[12px] text-muted-foreground">Automatically apply standardized quote templates to critical emergency dispatch listings inside the 15-mile service radius.</p>
                      </div>
                      <Switch checked={autoApply} onCheckedChange={setAutoApply} />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <p className="font-bold text-foreground">Quotation Inquiries Notification</p>
                        <p className="text-[12px] text-muted-foreground">Receive direct quotation requests from facility managers inside service areas.</p>
                      </div>
                      <Switch checked={quoteInquiries} onCheckedChange={setQuoteInquiries} />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <p className="font-bold text-foreground">Directory Public Profile Visibility</p>
                        <p className="text-[12px] text-muted-foreground">Allow corporate clients to search and view your compliance statistics, certifications, and service regions publicly.</p>
                      </div>
                      <Switch checked={publicProfile} onCheckedChange={setPublicProfile} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Preferred Contract Rules</h3>
                    <p className="text-[13px] text-muted-foreground">Define criteria used to qualify matches. Jobs not matching these filters will remain visible but deprioritized.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">MINIMUM CONTRACT ANNUAL VALUE</Label>
                      <Input value={minAnnualValue} onChange={(e) => setMinAnnualValue(e.target.value)} className="bg-background border-border" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">MAXIMUM TRAVEL DISTANCE PER TICKET</Label>
                      <Input value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} className="bg-background border-border" />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">QUALIFIED CONTRACT TYPES</p>
                    <div className="space-y-2 text-[13px]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={contractTypes.pm} onCheckedChange={(v) => setContractTypes((p) => ({ ...p, pm: !!v }))} />
                        <span className="text-foreground">Annual Preventive Maintenance Plans</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={contractTypes.emergency} onCheckedChange={(v) => setContractTypes((p) => ({ ...p, emergency: !!v }))} />
                        <span className="text-foreground">Emergency Breakdown Dispatch</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={contractTypes.modernization} onCheckedChange={(v) => setContractTypes((p) => ({ ...p, modernization: !!v }))} />
                        <span className="text-foreground">One-Off Equipment Modernization</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={contractTypes.audits} onCheckedChange={(v) => setContractTypes((p) => ({ ...p, audits: !!v }))} />
                        <span className="text-foreground">Comprehensive Safety Audits & Recertification</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="outline" className="text-[13px]">Cancel</Button>
                    <Button disabled={vendorSettings.update.isPending} onClick={saveMarketplacePreferences} className="bg-primary hover:bg-primary-hover text-primary-foreground text-[13px] font-semibold">Save Preferences</Button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. BILLING & PLANS TAB */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Billing &amp; Subscription</h3>
                    <p className="text-[13px] text-muted-foreground">
                      Manage your subscription package, team seat allowance, and provider payment details.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-muted/30 p-5 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-foreground">{subscriptionQuery.data?.plan ? `${subscriptionQuery.data.plan} plan` : 'No active subscription'}</h4>
                        <StatusBadge status={subscriptionQuery.data?.status?.toUpperCase() ?? 'NOT ACTIVE'} />
                      </div>
                      <p className="text-[13px] text-muted-foreground mt-1">{subscriptionQuery.data ? `${subscriptionQuery.data.billingCycle ?? 'monthly'} billing · ${subscriptionQuery.data.provider ?? 'provider checkout'}` : 'Choose a plan to activate vendor billing through a secure payment provider.'}</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/pricing?audience=vendor')} className="text-[13px] font-semibold">{subscriptionQuery.data ? 'Manage plan' : 'View plans'}</Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                    <div className="rounded-xl border border-border bg-background p-4 space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">LICENSED TEAM DISPATCH SEATS</Label>
                    <Input value="Seat usage is not part of the billing contract" disabled className="bg-background border-border font-semibold text-foreground opacity-100" />
                    </div>
                    <div className="rounded-xl border border-border bg-background p-4 space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">REGISTERED PAYMENT METHOD</Label>
                      <div className="rounded-md border border-border bg-background px-3 py-2.5 text-[13px] font-semibold text-foreground">
                        {paymentMethodsQuery.isLoading ? 'Loading payment method…' : paymentMethod ? `${paymentMethod.brand} ending in ${paymentMethod.last4} (Exp. ${String(paymentMethod.expMonth).padStart(2, '0')}/${paymentMethod.expYear})` : subscriptionQuery.data?.provider ? `${subscriptionQuery.data.provider} provider checkout` : 'No payment method recorded'}
                      </div>
                      {!paymentMethod && !subscriptionQuery.data?.provider && <p className="text-[11px] text-muted-foreground">A provider checkout will be recorded after the first successful payment.</p>}
                      <Button disabled={hasValidSubscription} onClick={() => navigate('/checkout?plan=starter&audience=vendor&cycle=monthly')} className="mt-3 w-full bg-primary text-primary-foreground text-[12px] font-semibold hover:bg-primary/90">
                        {hasValidSubscription ? 'Payment method active' : 'Add payment method'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* SaaS Billing History Table */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Subscription Invoices History</h3>
                    <p className="text-[13px] text-muted-foreground">Access PDF invoices and historical receipts for subscription software seat charges.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-3">Invoice</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Team Utilization</th>
                          <th className="px-4 py-3">Payment Provider</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3 text-right">PDF</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Invoice history will appear after a real provider payment is confirmed.</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
