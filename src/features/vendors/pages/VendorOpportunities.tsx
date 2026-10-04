import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge, StatusBadge, PriorityBadge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/navigation/Navbar";
import { workOrdersService } from "@/features/work-orders/services/workOrders.service";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageError } from "@/components/feedback/PageError";
import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { PageHeader } from "@/components/ui/page-header";

export interface OpportunityRow {
  id: string;
  organization: string;
  serviceCategory: string;
  categoryDetail: string;
  locationProximity: string;
  proximityDetail: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  slaRequirement: string;
  status: "open" | "completed" | "cancelled" | "assigned" | "in_progress" | "on_hold";
}


export function VendorOpportunities() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [proximityFilter, setProximityFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [slaFilter, setSlaFilter] = useState("all");
  const [apiOpportunities, setApiOpportunities] = useState<OpportunityRow[]>(
    [],
  );
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const loadVendorOpportunities = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const result = await workOrdersService.listMarketplace({ limit: 100 });
      setApiOpportunities(
        result.data.map((item) => ({
          id: item.id,
          organization: "Organization opportunity",
          serviceCategory: item.category,
          categoryDetail: item.description,
          locationProximity: item.locationName || "—",
          proximityDetail: "—",
          priority: item.priority.toUpperCase() as OpportunityRow["priority"],
          slaRequirement: "See SLA details",
          status: (item.status || "open") as OpportunityRow["status"],
        })),
      );
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Unable to load opportunities",
      );
    } finally {
      setApiLoading(false);
    }
  };
  useEffect(() => {
    void loadVendorOpportunities();
  }, []);
  const [selectedOpp, setSelectedOpp] = useState<OpportunityRow | null>(null);
  const [bidAmount, setBidAmount] = useState("4500");
  const [bidDuration, setBidDuration] = useState("3");
  const [bidNotes, setBidNotes] = useState("");

  const filtered = useMemo(() => {
    return apiOpportunities.filter(
      (item) => {
        const matchSearch =
          item.id.toLowerCase().includes(search.toLowerCase()) ||
          item.organization.toLowerCase().includes(search.toLowerCase()) ||
          item.serviceCategory.toLowerCase().includes(search.toLowerCase());
        const matchCategory =
          categoryFilter === "all" ||
          item.serviceCategory
            .toLowerCase()
            .includes(categoryFilter.toLowerCase());
        const matchPriority =
          priorityFilter === "all" ||
          item.priority.toLowerCase() === priorityFilter.toLowerCase();
        const matchSla =
          slaFilter === "all" ||
          item.slaRequirement.toLowerCase().includes(slaFilter.toLowerCase());

        return matchSearch && matchCategory && matchPriority && matchSla;
      },
    );
  }, [apiOpportunities, search, categoryFilter, priorityFilter, slaFilter]);

  if (apiLoading) return <PageLoader label="Loading opportunities..." />;
  if (apiError)
    return (
      <PageError
        title="Opportunities unavailable"
        message={apiError}
        onRetry={() => void loadVendorOpportunities()}
      />
    );

  const handleSubmitBid = async () => {
    if (!selectedOpp) return;
    const amount = Number(bidAmount);
    const durationDays = Number(bidDuration);
    if (
      !Number.isFinite(amount) ||
      amount < 0 ||
      !Number.isFinite(durationDays) ||
      durationDays <= 0
    ) {
      toast.error("Enter a valid bid amount and duration.");
      return;
    }
    try {
      const application = await apiClient.post<{ id?: string; _id?: string }>(
        ENDPOINTS.VENDOR_APPLICATIONS.CREATE,
        {
          workOrderId: selectedOpp.id,
          note: bidNotes || undefined,
        },
      );
      const applicationId = application.id ?? application._id;
      if (!applicationId)
        throw new Error("The application was created without an identifier.");
      await apiClient.post(ENDPOINTS.QUOTATIONS.CREATE, {
        vendorApplicationId: applicationId,
        laborCost: amount,
        materialCost: 0,
        estimatedDurationHours: durationDays * 8,
        notes: bidNotes || undefined,
      });
      toast.success(`Bid submitted for ${selectedOpp.id}`);
      setSelectedOpp(null);
      setBidNotes("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit bid.",
      );
    }
  };

  return (
    <div className="flex flex-col bg-background min-h-full text-foreground">
      <AppHeader title="Opportunities" hideQuickCreate />
      <div className="p-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Top Title Bar */}
        <PageHeader
          className="rounded-xl border border-border"
          title="Marketplace Opportunities"
          subtitle="Available maintenance contracts on the MaintainPro marketplace. Apply to start service."
        />

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search marketplace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-[13px] rounded-xl border-border bg-background"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 min-w-[200px] rounded-xl border-border text-[13px] bg-card">
              <SelectValue placeholder="Category: Elevator & Pumps" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Category: All Categories</SelectItem>
              <SelectItem value="elevator">Elevator Maintenance</SelectItem>
              <SelectItem value="hvac">HVAC Systems</SelectItem>
              <SelectItem value="conveyor">Conveyor Systems</SelectItem>
              <SelectItem value="electrical">Electrical Grid</SelectItem>
              <SelectItem value="dock">Dock Levelers</SelectItem>
            </SelectContent>
          </Select>

          <Select value={proximityFilter} onValueChange={setProximityFilter}>
            <SelectTrigger className="h-9 min-w-[170px] rounded-xl border-border text-[13px] bg-card">
              <SelectValue placeholder="Proximity: < 15 miles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Proximity: All Distances</SelectItem>
              <SelectItem value="5">&lt; 5 miles</SelectItem>
              <SelectItem value="15">&lt; 15 miles</SelectItem>
              <SelectItem value="30">&lt; 30 miles</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 min-w-[190px] rounded-xl border-border text-[13px] bg-card">
              <SelectValue placeholder="Priority: High & Critical" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Priority: All</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={slaFilter} onValueChange={setSlaFilter}>
            <SelectTrigger className="h-9 min-w-[170px] rounded-xl border-border text-[13px] bg-card">
              <SelectValue placeholder="SLA: < 4h Response" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">SLA: Any</SelectItem>
              <SelectItem value="1h">&lt; 1h Response</SelectItem>
              <SelectItem value="2h">&lt; 2h Response</SelectItem>
              <SelectItem value="4h">&lt; 4h Response</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">Organization</th>
                  <th className="py-3.5 px-5">Service Category</th>
                  <th className="py-3.5 px-5">Location &amp; Proximity</th>
                  <th className="py-3.5 px-5">Priority</th>
                  <th className="py-3.5 px-5">SLA Requirement</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-4 px-5 font-bold text-indigo-500">
                      {item.id}
                    </td>
                    <td className="py-4 px-5 font-bold text-foreground">
                      {item.organization}
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold text-foreground">
                        {item.serviceCategory}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.categoryDetail}
                      </p>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-foreground">
                        {item.locationProximity}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        ({item.proximityDetail})
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="py-4 px-5 font-medium text-foreground">
                      {item.slaRequirement}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      {item.status === "open" ? (
                        <Button
                          onClick={() => setSelectedOpp(item)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[12px] h-8 px-4 rounded-xl shadow-sm"
                        >
                          Apply Bid
                        </Button>
                      ) : (
                        <span className="text-[12px] text-muted-foreground font-medium">
                          Archived
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border px-5 py-3.5 text-[13px] text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-bold text-foreground">
                {filtered.length}
              </span>{" "}
              opportunities
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <Dialog open={!!selectedOpp} onOpenChange={() => setSelectedOpp(null)}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl text-foreground">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold text-foreground">
              Submit Proposal Bid
            </DialogTitle>
            <p className="text-[12px] text-muted-foreground">
              Opportunity: {selectedOpp?.id} - {selectedOpp?.serviceCategory}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[12px] font-bold text-foreground">
                  Bid Amount ($)
                </Label>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="h-9 rounded-xl border-border text-[13px] bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[12px] font-bold text-foreground">
                  Duration (Days)
                </Label>
                <Input
                  type="number"
                  value={bidDuration}
                  onChange={(e) => setBidDuration(e.target.value)}
                  className="h-9 rounded-xl border-border text-[13px] bg-background"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[12px] font-bold text-foreground">
                Proposal Notes &amp; Terms
              </Label>
              <Textarea
                placeholder="Include certification credentials, SLA response guarantee..."
                rows={3}
                value={bidNotes}
                onChange={(e) => setBidNotes(e.target.value)}
                className="rounded-xl border-border text-[13px] bg-background"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedOpp(null)}
              className="rounded-xl text-[13px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBid}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[13px] font-bold"
            >
              Submit Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
