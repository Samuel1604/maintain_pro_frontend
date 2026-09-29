import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppHeader } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageError } from "@/components/feedback/PageError";
import { PageHeader } from "@/components/ui/page-header";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";

interface QuotationItem {
  id: string;
  vendorPartner: string;
  serviceRequested: string;
  totalAmount: string;
  revisions: string;
  status: "submitted" | "under_review" | "accepted" | "rejected" | "withdrawn" | "expired" | "draft";
  dateSubmitted: string;
}

interface BidOption {
  id: string;
  vendorPartner: string;
  amount: string;
  isRecommended?: boolean;
  complianceRating: string;
  emergencyResp: string;
  certifications: string;
  supportAvailability: string;
}

const QUOTATIONS: QuotationItem[] = [
  {
    id: "QT-8802",
    vendorPartner: "Apex Elevator Co.",
    serviceRequested: "ASME Annual Inspection",
    totalAmount: "$12,400",
    revisions: "v1",
    status: "submitted",
    dateSubmitted: "Oct 12, 2026",
  },
  {
    id: "QT-8803",
    vendorPartner: "Elevator Systems Inc.",
    serviceRequested: "ASME Annual Inspection",
    totalAmount: "$14,100",
    revisions: "v2",
    status: "under_review",
    dateSubmitted: "Oct 11, 2026",
  },
  {
    id: "QT-8804",
    vendorPartner: "Lift Tech Partners",
    serviceRequested: "ASME Annual Inspection",
    totalAmount: "$11,900",
    revisions: "v1",
    status: "under_review",
    dateSubmitted: "Oct 10, 2026",
  },
  {
    id: "QT-8750",
    vendorPartner: "Pro HVAC Solutions",
    serviceRequested: "Chiller Overhaul",
    totalAmount: "$8,500",
    revisions: "v3",
    status: "accepted",
    dateSubmitted: "Oct 01, 2026",
  },
  {
    id: "QT-8742",
    vendorPartner: "Reliable Plumbing",
    serviceRequested: "Restroom Renovation",
    totalAmount: "$24,000",
    revisions: "v1",
    status: "under_review",
    dateSubmitted: "Sep 28, 2026",
  },
  {
    id: "QT-8611",
    vendorPartner: "Vanguard Electrical",
    serviceRequested: "Substation Repair",
    totalAmount: "$16,500",
    revisions: "v2",
    status: "expired",
    dateSubmitted: "Sep 15, 2026",
  },
];

const COMPARISON_BIDS: BidOption[] = [
  {
    id: "QT-8802",
    vendorPartner: "Apex Elevator Co.",
    amount: "$12,400",
    isRecommended: true,
    complianceRating: "98% compliance rating",
    emergencyResp: "15 min emergency resp.",
    certifications: "ASME QEI-1",
    supportAvailability: "24/7 Phone & App",
  },
  {
    id: "QT-8803",
    vendorPartner: "Elevator Systems Inc.",
    amount: "$14,100",
    complianceRating: "95% compliance rating",
    emergencyResp: "30 min emergency resp.",
    certifications: "ASME QEI-1",
    supportAvailability: "24/7 Phone Line Only",
  },
  {
    id: "QT-8804",
    vendorPartner: "Lift Tech Partners",
    amount: "$11,900",
    complianceRating: "91% compliance rating",
    emergencyResp: "45 min emergency resp.",
    certifications: "No QEI-1 logged",
    supportAvailability: "Business Hours Only",
  },
];

export function VendorQuotations() {
  const location = useLocation();
  const isVendorPortal = location.pathname.startsWith("/vendor/");
  const [search, setSearch] = useState("");
  const [selectedBid, setSelectedBid] = useState<string>("QT-8802");
  const [awardTarget, setAwardTarget] = useState<BidOption | null>(null);
  const [liveQuotes, setLiveQuotes] = useState<QuotationItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadQuotes = async () => {
    setLoadError(null);
    try {
      const items = await apiClient.get<
        Array<{
          _id: string;
          quotationNumber: string;
          vendorId: string;
          workOrderId: string;
          totalMinor: number;
          currency: string;
          currentRevision: number;
          status: string;
          createdAt: string;
        }>
      >(isVendorPortal ? "/quotations/mine" : "/quotations/organization");
      setLiveQuotes(
        items.map((item) => ({
          id: item.quotationNumber || item._id,
          vendorPartner: item.vendorId,
          serviceRequested: `Work order ${item.workOrderId}`,
          totalAmount: `${item.currency} ${(
            item.totalMinor / 100
          ).toLocaleString()}`,
          revisions: `v${item.currentRevision}`,
          status: item.status as QuotationItem["status"],
          dateSubmitted: new Date(item.createdAt).toLocaleDateString(),
        })),
      );
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load quotations",
      );
      setLiveQuotes([]);
    }
  };
  useEffect(() => {
    void loadQuotes();
  }, [isVendorPortal]);

  if (liveQuotes === null)
    return <PageLoader label="Loading quotations..." />;
  if (loadError)
    return (
      <PageError
        title="Quotations unavailable"
        message={loadError}
        onRetry={() => void loadQuotes()}
      />
    );
  const filteredQuotes = (liveQuotes ?? []).filter(
    (q) =>
      q.id.toLowerCase().includes(search.toLowerCase()) ||
      q.vendorPartner.toLowerCase().includes(search.toLowerCase()) ||
      q.serviceRequested.toLowerCase().includes(search.toLowerCase()),
  );


  const handleAwardContract = (vendor: string, quoteId: string) => {
    toast.info(
      `Contract awards for ${vendor} (${quoteId}) are managed through the Contract Awards workflow.`,
    );
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader
        title="Quotations"
        subtitle={isVendorPortal ? "Vendor submissions" : "Vendor bids"}
        hideQuickCreate
      />

      <div className="px-8 py-6 space-y-8">
        <PageHeader
          className="rounded-xl border border-border"
          title="Quotations"
          subtitle={
            isVendorPortal
              ? "Review submitted quotations and revision iterations."
              : "Evaluate vendor bids, compare revisions, and progress procurement decisions."
          }
        />

        {/* Quotations Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div className="w-72">
              <SearchInput
                placeholder="Search quotations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3.5">Quotation #</th>
                  <th className="px-6 py-3.5">Vendor Partner</th>
                  <th className="px-6 py-3.5">Service Requested</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Revisions</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Date Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredQuotes.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-indigo-500 font-mono">
                      {q.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {q.vendorPartner}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {q.serviceRequested}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {q.totalAmount}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">
                      {q.revisions}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={q.status} /></td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      {q.dateSubmitted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison details remain unavailable until the live quotation API exposes bid comparisons. */}
        {true ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Bid comparison details will appear here when the live quotation
            response includes competing bids.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Active Bid Comparison: ASME Annual Elevator Inspection
              </h2>
              <p className="text-[13px] text-muted-foreground">
                Comparing standard metrics, support commitments, and certified
                pricing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COMPARISON_BIDS.map((bid) => {
                const isSelected = selectedBid === bid.id;
                return (
                  <div
                    key={bid.id}
                    onClick={() => setSelectedBid(bid.id)}
                    className={`rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-500 ring-2 ring-indigo-500/20"
                        : "border-border hover:border-border/80"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-bold text-foreground">
                            {bid.vendorPartner}
                          </h3>
                          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {bid.id} {bid.isRecommended && "(RECOMMENDED)"}
                          </p>
                        </div>
                        {bid.isRecommended && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 font-bold text-[10px]"
                          >
                            BEST VALUE
                          </Badge>
                        )}
                      </div>

                      <div>
                        <p className="text-3xl font-extrabold text-foreground">
                          {bid.amount}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 text-[13px] border-t border-border/60">
                        <div className="flex items-center gap-2 text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{bid.complianceRating}</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{bid.emergencyResp}</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{bid.certifications}</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{bid.supportAvailability}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (bid.isRecommended) setAwardTarget(bid);
                          else setSelectedBid(bid.id);
                        }}
                        className={`w-full text-[13px] font-semibold ${
                          bid.isRecommended
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                            : "bg-muted/50 hover:bg-muted text-foreground"
                        }`}
                      >
                        {bid.isRecommended
                          ? "Accept and Award Contract"
                          : "Select Bid"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(awardTarget)}
        onOpenChange={(open) => {
          if (!open) setAwardTarget(null);
        }}
        title="Award this contract?"
        description={
          awardTarget
            ? `This will award the contract to ${awardTarget.vendorPartner} (${awardTarget.id}).`
            : ""
        }
        confirmLabel="Award Contract"
        onConfirm={() => {
          if (awardTarget)
            handleAwardContract(awardTarget.vendorPartner, awardTarget.id);
          setAwardTarget(null);
        }}
      />
    </div>
  );
}
