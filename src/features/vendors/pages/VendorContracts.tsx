import { useEffect, useState } from 'react'
import { AppHeader } from '@/components/navigation/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiClient } from '@/api/client'
import { PageLoader } from '@/components/feedback/PageLoader'
import { PageError } from '@/components/feedback/PageError'
import { PageHeader } from '@/components/ui/page-header'

interface ContractItem {
  id: string
  organization: string
  value: string
  status: 'draft' | 'pending_approval' | 'awarded' | 'active' | 'completed' | 'terminated' | 'cancelled'
  activeDates: string
  scope: string
}

export function VendorContracts() {
  const [search, setSearch] = useState('')
  const [selectedContractId, setSelectedContractId] = useState<string>('CON-1192')
  const [contracts, setContracts] = useState<ContractItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const isOrganizationView = location.pathname.includes('/vendors/contracts')
  const pathParts = location.pathname.split('/').filter(Boolean)
  // Organization contracts live under `/vendors/contracts`, while vendor
  // contracts live directly under the vendor role segment.
  const vendorBase = `/${(isOrganizationView ? pathParts.slice(0, 3) : pathParts.slice(0, 2)).join('/')}`

  const loadContracts = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const items = await apiClient.get<
        Array<{
          _id: string;
          organizationId: string;
          vendorId: string;
          workOrderId: string;
          status: string;
          effectiveAt?: string;
          expiresAt?: string;
          notes?: string;
        }>
      >(isOrganizationView ? "/contract-awards" : "/contract-awards/mine");
      const mapped = items.map(
        (item) =>
          ({
            id: item._id,
            organization: isOrganizationView ? item.vendorId : item.organizationId,
            value: "Tracked operational agreement",
            status: item.status as ContractItem["status"],
            activeDates:
              [item.effectiveAt, item.expiresAt]
                .filter(Boolean)
                .map((value) => new Date(value as string).toLocaleDateString())
                .join(" – ") || "Dates not configured",
            scope: item.notes || `Awarded work order ${item.workOrderId}.`,
          } as ContractItem),
      );
      setContracts(mapped);
      if (mapped[0] && !selectedContractId) setSelectedContractId(mapped[0].id);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load contracts",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void loadContracts() }, [])
  if (loading) return <PageLoader label="Loading contracts..." />
  if (loadError) return <PageError title="Contracts unavailable" message={loadError} onRetry={() => void loadContracts()} />
  const selectedContract = contracts.find((c) => c.id === selectedContractId) ?? contracts[0]
  if (!selectedContract) {
    return (
      <div className="min-h-full bg-background text-foreground">
        <AppHeader title={isOrganizationView ? 'Contracts' : 'Contracts'} subtitle={isOrganizationView ? 'Organization contract awards' : 'My Service Contracts'} hideQuickCreate />
        <main className="px-6 py-8 lg:px-8">
          <PageHeader
            className="rounded-xl border border-border"
            title={isOrganizationView ? 'Contracts' : 'My Service Contracts'}
            subtitle={isOrganizationView ? 'Review awarded vendor contracts, terms, and operational commitments.' : 'Review your active service contracts, scope, and renewal dates.'}
          />
          <div className="h-6" />
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {isOrganizationView ? 'No organization contract awards are available yet.' : 'No vendor service contracts are available yet.'}
          </div>
        </main>
      </div>
    )
  }

  const filteredContracts = contracts.filter(
    (c) =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.organization.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader title={isOrganizationView ? 'Contracts' : 'My Service Contracts'} subtitle={isOrganizationView ? 'Organization contract awards' : 'Vendor Portal'} hideQuickCreate />

      <div className="px-8 py-6 space-y-6">
        <PageHeader
          className="rounded-xl border border-border"
          title={isOrganizationView ? 'Contracts' : 'My Service Contracts'}
          subtitle={isOrganizationView ? 'Review awarded vendor contracts, terms, and operational commitments.' : 'Review your active service contracts, scope, and renewal dates.'}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Contracts List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contracts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-[13px] bg-card border-border"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3.5">Contract #</th>
                      <th className="px-5 py-3.5">Organization Client</th>
                      <th className="px-5 py-3.5">Value</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Active Dates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredContracts.map((c) => {
                      const isSelected = c.id === selectedContractId
                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedContractId(c.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-500/10' : 'hover:bg-muted/20'
                          }`}
                        >
                          <td
                            className="px-5 py-4 font-bold text-indigo-500 font-mono hover:underline"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`${vendorBase}/contracts/${c.id}`)
                            }}
                          >
                            {c.id}
                          </td>
                          <td className="px-5 py-4 font-bold text-foreground">{c.organization}</td>
                          <td className="px-5 py-4 text-foreground font-semibold">{c.value}</td>
                          <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                          <td className="px-5 py-4 text-right text-muted-foreground font-mono text-[12px]">
                            {c.activeDates}
                          </td>
                        </tr>
                      )
                    })}
                    {!loading && filteredContracts.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No contract awards found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Contract Side Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between">
                {selectedContract && <>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Contract Details</p>
                    <h3 className="text-xl font-bold text-foreground mt-0.5">{selectedContract.id}</h3>
                  </div>
                  <StatusBadge status={selectedContract.status} />
                </>}
              </div>

              <div className="space-y-4 text-[13px]">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Organization Client</p>
                  <p className="font-bold text-foreground mt-0.5">{selectedContract.organization}</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Scope of Work</p>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">{selectedContract.scope}</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Financial Commitment</p>
                  <p className="text-base font-extrabold text-foreground mt-0.5">{selectedContract.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Note: No automatic payments. Transactions authorized manually via work-order signoff.
                  </p>
                </div>
              </div>

              {/* Linked Active Work Orders */}
              <div className="pt-4 border-t border-border space-y-3">
                <p className="text-[12px] font-bold text-foreground">Linked Active Work Orders</p>
                <p className="rounded-lg border border-dashed border-border p-3 text-[12px] text-muted-foreground">
                  Linked work orders are available from the Work Orders area. This contract response does not include them yet.
                </p>
              </div>

              <Button
                className="w-full text-[13px] font-semibold"
                disabled={!selectedContract}
                onClick={() => navigate(`${vendorBase}/contracts/${selectedContract.id}`)}
              >
                View Full Contract Record
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
