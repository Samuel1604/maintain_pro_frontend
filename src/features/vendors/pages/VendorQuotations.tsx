/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppHeader } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageError } from "@/components/feedback/PageError";
import { PageIntro } from "@/components/layout/PageIntro";
import { useRoleAccess } from "@/hooks/useRoleAccess";

interface QuotationItem {
  id: string;
  recordId: string;
  vendorPartner: string;
  serviceRequested: string;
  totalAmount: string;
  revisions: string;
  status:
    "submitted" | "under_review" | "accepted" | "rejected" | "withdrawn" | "expired" | "draft";
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
    recordId: "QT-8802",
    vendorPartner: "Apex Elevator Co.",
    serviceRequested: "ASME Annual Inspection",
    totalAmount: "$12,400",
    revisions: "v1",
    status: "submitted",
    dateSubmitted: "Oct 12, 2026",
  },
  {
    id: "QT-8803",
    recordId: "QT-8803",
    vendorPartner: "Elevator Systems Inc.",
    serviceRequested: "ASME Annual Inspection",
    totalAmount: "$14,100",
    revisions: "v2",
    status: "under_review",
    dateSubmitted: "Oct 11, 2026",
  },
  {
    id: "QT-8804",
    recordId: "QT-8804",
    vendorPartner: "Lift Tech Partners",
    serviceRequested: "ASME Annual Inspection",
    totalAmount: "$11,900",
    revisions: "v1",
    status: "under_review",
    dateSubmitted: "Oct 10, 2026",
  },
  {
    id: "QT-8750",
    recordId: "QT-8750",
    vendorPartner: "Pro HVAC Solutions",
    serviceRequested: "Chiller Overhaul",
    totalAmount: "$8,500",
    revisions: "v3",
    status: "accepted",
    dateSubmitted: "Oct 01, 2026",
  },
  {
    id: "QT-8742",
    recordId: "QT-8742",
    vendorPartner: "Reliable Plumbing",
    serviceRequested: "Restroom Renovation",
    totalAmount: "$24,000",
    revisions: "v1",
    status: "under_review",
    dateSubmitted: "Sep 28, 2026",
  },
  {
    id: "QT-8611",
    recordId: "QT-8611",
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
  const { canManageVendors } = useRoleAccess();
  const location = useLocation();
  const isVendorPortal = location.pathname.startsWith("/vendor/");
  const [search, setSearch] = useState("");
  const [liveQuotes, setLiveQuotes] = useState<QuotationItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadQuotes = async () => {
    setLoadError(null);
    try {
      const items = await apiClient.get<
        Array<{
          _id: string;
          quotationNumber: string;
          vendorId: string | { _id: string; name?: string };
          workOrderId: string | { _id: string; title?: string };
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
          recordId: item._id,
          vendorPartner:
            typeof item.vendorId === "string" ? item.vendorId : (item.vendorId.name ?? "—"),
          serviceRequested:
            typeof item.workOrderId === "string"
              ? `Work order ${item.workOrderId}`
              : (item.workOrderId.title ?? `Work order ${item.workOrderId._id}`),
          totalAmount: `${item.currency} ${(item.totalMinor / 100).toLocaleString()}`,
          revisions: `v${item.currentRevision}`,
          status: item.status as QuotationItem["status"],
          dateSubmitted: new Date(item.createdAt).toLocaleDateString(),
        })),
      );
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load quotations");
      setLiveQuotes([]);
    }
  };
  useEffect(() => {
    void loadQuotes();
  }, [isVendorPortal]);

  if (liveQuotes === null) return <PageLoader label="Loading quotations..." />;
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

  const updateQuotationStatus = async (
    quote: QuotationItem,
    status: "under_review" | "accepted" | "rejected",
  ) => {
    try {
      await apiClient.patch(`/quotations/${quote.recordId}/status`, { status });
      toast.success(`Quotation ${quote.id} updated`);
      await loadQuotes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update quotation");
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader
        title="Quotations"
        subtitle={isVendorPortal ? "Vendor submissions" : "Vendor bids"}
        hideQuickCreate
      />

      <div className="border-b border-border bg-card px-8 py-5">
        <PageIntro
          title="Quotations"
          description={
            isVendorPortal
              ? "Review submitted quotations and revision iterations."
              : "Evaluate vendor bids, compare revisions, and progress procurement decisions."
          }
        />
      </div>
      <div className="space-y-8 px-8 py-6">
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
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Revisions</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date Submitted</th>
                  {!isVendorPortal && <th className="px-6 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-indigo-500 font-mono">{q.id}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{q.vendorPartner}</td>
                    <td className="px-6 py-4 text-muted-foreground">{q.serviceRequested}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{q.totalAmount}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">{q.revisions}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{q.dateSubmitted}</td>
                    {!isVendorPortal && canManageVendors && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {q.status === "submitted" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void updateQuotationStatus(q, "under_review")}
                            >
                              Review
                            </Button>
                          )}
                          {(q.status === "submitted" || q.status === "under_review") && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => void updateQuotationStatus(q, "accepted")}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void updateQuotationStatus(q, "rejected")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison details remain unavailable until the live quotation API exposes bid comparisons. */}
        {
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Bid comparison details will appear here when the live quotation response includes
            competing bids.
          </div>
        }
      </div>
    </div>
  );
}
