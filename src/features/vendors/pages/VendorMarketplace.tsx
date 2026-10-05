import { useEffect, useState } from "react";
import {
  Search,
  Star,
  MapPin,
  Building,
  ShieldCheck,
  PhoneCall,
  ExternalLink,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/navigation/Navbar";
import { toast } from "sonner";
import { cn } from "@/utils/helpers";
import { apiClient } from "@/api/client";
import { Skeleton, SkeletonCard } from "@/components/feedback/Skeletons";
import { organizationVendorsApi } from "../api/organizationVendors.api";
import { PageIntro } from "@/components/layout/PageIntro";

interface MarketplaceVendor {
  id: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  slaCompliance: number;
  serviceCategories: string[];
  description: string;
  certifications: string[];
  insuranceLimit: string;
  avgDispatchTime: string;
  activeContracts: Array<{ id: string; title: string; amount: string }>;
}

const MARKETPLACE_VENDORS: MarketplaceVendor[] = [
  {
    id: "m1",
    name: "Apex Elevator Co.",
    location: "Seattle, WA",
    distance: "15.3 mi away",
    rating: 4.8,
    slaCompliance: 98.4,
    serviceCategories: [
      "Elevator, Escalator, HVAC, Plumbing...",
      "Predictive Maintenance",
      "IoT Diagnostics",
    ],
    description:
      "Certified high-rise lift maintenance, annual certifications, and predictive diagnostics. Apex Elevator Co. provides complete life-cycle elevator, escalator, and moving walk engineering services.",
    certifications: ["OSHA-30", "ASME A17.1", "QEI-1"],
    insuranceLimit: "$10,000,000 General Liability",
    avgDispatchTime: "14 mins (Emergency)",
    activeContracts: [
      {
        id: "CON-4029",
        title: "ASME Annual Certification",
        amount: "$12,400/yr",
      },
      {
        id: "CON-1192",
        title: "24/7 Elevator Preventive Plan",
        amount: "$3,800/mo",
      },
    ],
  },
  {
    id: "m2",
    name: "CleanSpace Janitorial",
    location: "Seattle, WA",
    distance: "15.3 mi away",
    rating: 4.4,
    slaCompliance: 93.0,
    serviceCategories: ["Janitorial", "Deep Clean", "Sanitation"],
    description:
      "Commercial facility cleaning, medical grade sanitation, and post-construction deep clean services.",
    certifications: ["ISSA CMM", "CDC Sanitation Certified"],
    insuranceLimit: "$5,000,000 General Liability",
    avgDispatchTime: "45 mins",
    activeContracts: [],
  },
  {
    id: "m3",
    name: "Pro HVAC Solutions",
    location: "Tacoma, WA",
    distance: "22.1 mi away",
    rating: 4.7,
    slaCompliance: 95.1,
    serviceCategories: ["HVAC Systems", "Chiller Repair", "Ventilation"],
    description:
      "Commercial refrigeration, industrial chiller repair, and automated building management integration.",
    certifications: ["EPA Universal", "NATE Certified"],
    insuranceLimit: "$7,500,000 General Liability",
    avgDispatchTime: "25 mins",
    activeContracts: [
      {
        id: "CON-8831",
        title: "Quarterly Chiller Maintenance",
        amount: "$6,500/mo",
      },
    ],
  },
];

export function VendorMarketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [proximity, setProximity] = useState("all");
  const [slaFilter, setSlaFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<MarketplaceVendor | null>(null);
  const [rfqVendor, setRfqVendor] = useState<MarketplaceVendor | null>(null);
  const [rfqDetails, setRfqDetails] = useState("");
  const [liveVendors, setLiveVendors] = useState<MarketplaceVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    void organizationVendorsApi
      .marketplace({ limit: 100 })
      .then((result) =>
        setLiveVendors(
          (result.data ?? []).map((vendor) => ({
            id: vendor.id,
            name: vendor.name,
            location:
              [vendor.address?.city, vendor.address?.state].filter(Boolean).join(", ") ||
              "Location not provided",
            distance: "Distance not provided",
            rating: vendor.averageRating ?? 0,
            slaCompliance: 0,
            serviceCategories: vendor.serviceCategories ?? [],
            description:
              "Vendor profile details are available through the vendor relationship workflow.",
            certifications: vendor.certifications ?? [],
            insuranceLimit: "Not provided",
            avgDispatchTime: "Not provided",
            activeContracts: [],
          })),
        ),
      )
      .catch((error) =>
        setLoadError(
          error instanceof Error ? error.message : "The vendor marketplace could not be loaded.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-full bg-background text-foreground">
        <AppHeader title="Marketplace" subtitle="Vendors" hideQuickCreate />
        <main className="space-y-6 px-6 py-6 lg:px-8">
          <span className="sr-only">Loading marketplace vendors…</span>
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-96 max-w-full" />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div>
                <Skeleton className="mb-2 h-3 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="mb-2 h-3 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="mb-2 h-3 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="mt-5 h-10 w-full" />
            </div>
          </div>
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </main>
      </div>
    );
  const filteredVendors = liveVendors.filter((v) => {
    if (
      search &&
      !v.name.toLowerCase().includes(search.toLowerCase()) &&
      !v.description.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (
      category !== "all" &&
      !v.serviceCategories.some((item) => item.toLowerCase().includes(category))
    )
      return false;
    if (proximity !== "all" && Number.parseFloat(v.distance) > Number(proximity)) return false;
    if (slaFilter !== "all" && v.slaCompliance < Number(slaFilter)) return false;
    return true;
  });
  const marketplaceCategories = [
    ...new Set(liveVendors.flatMap((vendor) => vendor.serviceCategories)),
  ].sort();

  const handleRequestRelationship = async (vendor: MarketplaceVendor) => {
    try {
      await organizationVendorsApi.requestRelationship(vendor.id);
      toast.success(`Relationship request sent to ${vendor.name}`);
      setRfqVendor(null);
      setRfqDetails("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send vendor request");
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader title="Marketplace" subtitle="Vendors" hideQuickCreate />

      <div className="border-b border-border bg-card px-8 py-5">
        {loadError ? (
          <div
            role="alert"
            className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning"
          >
            <p className="font-semibold">Marketplace data could not be loaded.</p>
            <p className="mt-1 text-muted-foreground">
              {loadError} You can still use the marketplace filters and retry from the page.
            </p>
          </div>
        ) : null}
        {/* Page Title & Subtitle */}
        <div className="flex items-center justify-between">
          <PageIntro
            title="Vendor Marketplace"
            description="Discover, evaluate, and connect with certified facility maintenance operators."
          />
        </div>

        {/* ── Filter Bar ── */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="min-w-0 space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Service Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full border-border text-[13px] bg-background text-foreground">
                  <SelectValue placeholder="Elevator, Escalator, HVAC, Plumbing..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Elevator, Escalator, HVAC, Plumbing...</SelectItem>
                  {marketplaceCategories.map((item) => (
                    <SelectItem key={item} value={item.toLowerCase()}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-0 space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Location & Proximity
              </Label>
              <Select value={proximity} onValueChange={setProximity}>
                <SelectTrigger className="w-full border-border text-[13px] bg-background text-foreground">
                  <SelectValue placeholder="Within 25 miles of HQ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any distance</SelectItem>
                  <SelectItem value="10">Within 10 miles</SelectItem>
                  <SelectItem value="25">Within 25 miles of HQ</SelectItem>
                  <SelectItem value="50">Within 50 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-0 space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Minimum SLA Rating
              </Label>
              <Select value={slaFilter} onValueChange={setSlaFilter}>
                <SelectTrigger className="w-full border-border text-[13px] bg-background text-foreground">
                  <SelectValue placeholder="90% + SLA compliance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Rating</SelectItem>
                  <SelectItem value="90">90% + SLA compliance</SelectItem>
                  <SelectItem value="95">95% + SLA compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-0">
              <Button
                type="button"
                onClick={() => undefined}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-semibold h-[38px] rounded-lg"
              >
                Filter Results
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6 lg:px-8">
        {/* ── Detail View (If Selected) or Vendor List ── */}
        {selectedVendor ? (
          <div className="space-y-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedVendor(null)}
              className="text-muted-foreground border-border text-xs"
            >
              ← Back to Marketplace Directory
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {selectedVendor.name}
                </h2>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {selectedVendor.description.slice(0, 85)}...
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Info (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-[15px] font-bold text-foreground mb-2">Service Overview</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      {selectedVendor.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-muted-foreground">
                        Certifications
                      </p>
                      <p className="text-[13px] font-semibold text-foreground mt-1">
                        {selectedVendor.certifications.join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase text-muted-foreground">
                        Insurance Limit
                      </p>
                      <p className="text-[13px] font-semibold text-foreground mt-1">
                        {selectedVendor.insuranceLimit}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase text-muted-foreground">
                        Avg Dispatch Time
                      </p>
                      <p className="text-[13px] font-semibold text-foreground mt-1">
                        {selectedVendor.avgDispatchTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SLA Statistics */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <h3 className="text-[15px] font-bold text-foreground">
                    SLA Performance Statistics
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Emergency Response Rate (Within 30 mins)",
                        val: 98,
                      },
                      { label: "Standard Work Order Resolution Time", val: 94 },
                      {
                        label: "ASME Compliance Certification Success",
                        val: 100,
                      },
                      { label: "First-Time Fix Ratio", val: 89 },
                    ].map((st) => (
                      <div key={st.label} className="space-y-1.5">
                        <div className="flex justify-between text-[13px]">
                          <span className="text-muted-foreground font-medium">{st.label}</span>
                          <span className="font-bold text-foreground">{st.val}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-accent/40 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${st.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Actions & Active Contracts (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                  <p className="text-[11px] font-bold uppercase text-muted-foreground">
                    Direct Actions
                  </p>
                  <h4 className="text-[14px] font-bold text-foreground">Send RFQ or Contact</h4>
                  <Button
                    onClick={() => void handleRequestRelationship(selectedVendor)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[13px]"
                  >
                    Connect vendor
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                    title="Contact details are available after a vendor relationship is accepted"
                    className="w-full border-border text-foreground font-semibold text-[13px]"
                  >
                    Call Dispatch System
                  </Button>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                  <h4 className="text-[14px] font-bold text-foreground">Active Contracts</h4>
                  {selectedVendor.activeContracts.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No active contracts linked.
                    </p>
                  ) : (
                    selectedVendor.activeContracts.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-lg border border-border bg-accent/30 p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-[13px] font-bold text-foreground">{c.title}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{c.id}</p>
                        </div>
                        <span className="text-[12px] font-bold text-success">{c.amount}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Marketplace vendors</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredVendors.length} {filteredVendors.length === 1 ? "vendor" : "vendors"}{" "}
                  match your criteria.
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {liveVendors.length} available
              </span>
            </div>
            {filteredVendors.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
                <Building className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="font-medium text-foreground">
                  {liveVendors.length === 0
                    ? "No marketplace vendors are available"
                    : "No vendors match your search or filters"}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  {liveVendors.length === 0
                    ? "No vendor profiles are currently available for discovery in this marketplace."
                    : "Try broadening your search or relaxing the service, proximity, or SLA filters."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-primary flex items-center justify-center font-bold shrink-0">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-[16px] font-bold text-foreground">{vendor.name}</h3>
                          <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span>{vendor.location}</span>
                            <span>•</span>
                            <span>{vendor.distance}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[13px] font-bold text-foreground">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        {vendor.rating}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {vendor.serviceCategories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded bg-accent/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground border border-border/50"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                      <span className="text-[13px] text-muted-foreground">
                        SLA Compliance:{" "}
                        <strong className="text-foreground">{vendor.slaCompliance}%</strong>
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleRequestRelationship(vendor)}
                          className="border-border text-foreground text-[12px] font-semibold h-8 px-4"
                        >
                          Connect vendor
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setSelectedVendor(vendor)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] font-semibold h-8 px-4"
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RFQ Dialog */}
      <Dialog open={!!rfqVendor} onOpenChange={() => setRfqVendor(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Request Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-[13px] text-muted-foreground">
              Requesting a vendor relationship with{" "}
              <strong className="text-foreground">{rfqVendor?.name}</strong>
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Notes (optional)</Label>
              <Textarea
                placeholder="Describe your maintenance requirement, facility location, and target timeline..."
                rows={4}
                value={rfqDetails}
                onChange={(e) => setRfqDetails(e.target.value)}
                className="bg-background text-foreground border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRfqVendor(null)}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={() => rfqVendor && void handleRequestRelationship(rfqVendor)}
              className="bg-primary text-primary-foreground"
            >
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
