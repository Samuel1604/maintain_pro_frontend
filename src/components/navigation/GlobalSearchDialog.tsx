import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Wrench,
  Building2,
  Package,
  Users,
  FileText,
  ArrowRight,
  Sparkles,
  History,
  CornerDownLeft,
  X,
  Filter,
} from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePortalPath } from "@/hooks/usePortal";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { cn } from "@/utils/helpers";
import { apiClient } from "@/api/client";

interface BackendSearchResult {
  id: string;
  title: string;
  category: string;
  type: string;
  segment: string;
  badge: string;
  desc: string;
}

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchCategoryFilter =
  | "all"
  | "work-orders"
  | "facilities"
  | "locations"
  | "assets"
  | "service-requests"
  | "preventive-maintenance"
  | "inventory"
  | "vendors"
  | "reports";

const SEARCH_INDEX = [] as Array<BackendSearchResult & { icon: typeof Wrench }>;
/*
  { id: 'WO-8422', title: 'Elevator Cab #3 Chiller Pump Failure', category: 'Work Orders', type: 'work-orders', icon: Wrench, segment: 'work-orders/WO-8422', badge: 'Critical', badgeBg: '#fee2e2', badgeColor: '#ef4444', desc: 'Schindler 5500 Elevator • Floor 4 Mechanics Room' },
  { id: 'WO-7994', title: 'Semi-Annual Safety Cable Tension Check', category: 'Work Orders', type: 'work-orders', icon: Wrench, segment: 'work-orders/WO-7994', badge: 'Medium', badgeBg: '#fef3c7', badgeColor: '#d97706', desc: 'Freight Elevator Freight-1 • Loading Dock B' },
  { id: 'WO-4810', title: 'Main Roof Patch & Waterproofing', category: 'Work Orders', type: 'work-orders', icon: Wrench, segment: 'work-orders/WO-4810', badge: 'In Progress', badgeBg: '#dbeafe', badgeColor: '#2563eb', desc: 'West Campus Roof Access • Building A' },
  { id: 'WO-4921', title: 'HVAC Air Filter Replacement Audit', category: 'Work Orders', type: 'work-orders', icon: Wrench, segment: 'work-orders/WO-4921', badge: 'Scheduled', badgeBg: '#e0e7ff', badgeColor: '#4f46e5', desc: 'Main HQ Tower • Floors 1 - 12' },
  
  { id: 'FAC-01', title: 'Main Office HQ Tower', category: 'Facilities', type: 'facilities', icon: Building2, segment: 'facilities/FAC-01', badge: 'Operational', badgeBg: '#dcfce7', badgeColor: '#16a34a', desc: 'Primary administrative and corporate headquarters' },
  { id: 'FAC-02', title: 'West Campus Technology Hub', category: 'Facilities', type: 'facilities', icon: Building2, segment: 'facilities/FAC-02', badge: 'Operational', badgeBg: '#dcfce7', badgeColor: '#16a34a', desc: 'R&D facility and server infrastructure' },
  { id: 'FAC-03', title: 'North Logistics Hub', category: 'Facilities', type: 'facilities', icon: Building2, segment: 'facilities/FAC-03', badge: 'Under Maint.', badgeBg: '#fef3c7', badgeColor: '#d97706', desc: 'Central distribution and loading center' },

  { id: 'AST-5500', title: 'Schindler 5500 Elevator - Cab 3', category: 'Assets', type: 'assets', icon: Package, segment: 'assets/AST-5500', badge: 'Operational', badgeBg: '#dcfce7', badgeColor: '#16a34a', desc: 'Vertical Transport • Main HQ Mechanics' },
  { id: 'AST-CHILLER', title: 'Chiller Subsystem Pump #4', category: 'Assets', type: 'assets', icon: Package, segment: 'assets/AST-CHILLER', badge: 'Needs Service', badgeBg: '#fee2e2', badgeColor: '#ef4444', desc: 'Climate Control • Basement Mechanical Room' },
  { id: 'AST-GEN-01', title: 'Emergency Generator 500kW', category: 'Assets', type: 'assets', icon: Package, segment: 'assets/AST-GEN-01', badge: 'Standby', badgeBg: '#f1f5f9', badgeColor: '#475569', desc: 'Power Backup • North Logistics Yard' },

  { id: 'VND-APEX', title: 'Apex Elevator Co.', category: 'Vendors', type: 'vendors', icon: Users, segment: 'vendors', badge: '98.2% SLA', badgeBg: '#dcfce7', badgeColor: '#16a34a', desc: 'Vertical Transport & Elevator Specialist' },
  { id: 'VND-HVAC', title: 'Pro HVAC Solutions', category: 'Vendors', type: 'vendors', icon: Users, segment: 'vendors', badge: '91.0% SLA', badgeBg: '#fef3c7', badgeColor: '#d97706', desc: 'Commercial HVAC & Air Quality Contractor' },
  { id: 'VND-PLUMB', title: 'Reliable Plumbing Services', category: 'Vendors', type: 'vendors', icon: Users, segment: 'vendors', badge: '86.4% SLA', badgeBg: '#fee2e2', badgeColor: '#ef4444', desc: 'Water, Drainage & Waste Infrastructure' },

  { id: 'REP-Q3', title: 'Q3 Financial Maintenance Audit', category: 'Reports', type: 'reports', icon: FileText, segment: 'reports', badge: 'Completed', badgeBg: '#dcfce7', badgeColor: '#16a34a', desc: 'Quarterly organization expense and SLA analysis' },
  { id: 'REP-SLA', title: 'Monthly Vendor SLA Performance', category: 'Reports', type: 'reports', icon: FileText, segment: 'reports', badge: 'Monthly', badgeBg: '#e0e7ff', badgeColor: '#4f46e5', desc: 'Comprehensive compliance report for active contracts' },
*/

const CATEGORY_FILTERS: { id: SearchCategoryFilter; label: string }[] = [
  { id: "all", label: "All Results" },
  { id: "work-orders", label: "Work Orders" },
  { id: "facilities", label: "Facilities" },
  { id: "locations", label: "Locations" },
  { id: "assets", label: "Assets" },
  { id: "service-requests", label: "Service Requests" },
  { id: "preventive-maintenance", label: "PM Schedules" },
  { id: "inventory", label: "Inventory" },
  { id: "vendors", label: "Vendors" },
  { id: "reports", label: "Reports" },
];

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SearchCategoryFilter>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const getPath = usePortalPath;
  const inputRef = useRef<HTMLInputElement>(null);
  const [liveSearchIndex, setLiveSearchIndex] = useState<Array<(typeof SEARCH_INDEX)[number]>>([]);
  const { canAccessAssets, canAccessReports, canViewVendors, canAccessLocations } = useRoleAccess();

  useEffect(() => {
    if (!query.trim()) {
      setLiveSearchIndex([]);
      return;
    }
    const controller = new AbortController();
    void apiClient
      .get<BackendSearchResult[]>("/search", {
        params: { q: query.trim(), limit: 20 },
        signal: controller.signal,
      })
      .then((response) =>
        setLiveSearchIndex(
          response.map((item) => ({
            ...item,
            icon:
              item.type === "assets" || item.type === "inventory"
                ? Package
                : item.type === "facilities" || item.type === "locations"
                  ? Building2
                  : item.type === "vendors"
                    ? Users
                    : item.type === "reports"
                      ? FileText
                      : Wrench,
          })) as Array<(typeof SEARCH_INDEX)[number]>,
        ),
      )
      .catch(() => {
        if (!controller.signal.aborted) setLiveSearchIndex([]);
      });
    return () => controller.abort();
  }, [query]);

  // Auto focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveFilter("all");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filtered result calculation
  const filteredResults = useMemo(() => {
    const searchIndex = liveSearchIndex;
    return searchIndex.filter((item) => {
      const canSeeCategory =
        item.type === "assets"
          ? canAccessAssets
          : item.type === "reports"
            ? canAccessReports
            : item.type === "vendors"
              ? canViewVendors
              : item.type === "facilities" || item.type === "locations"
                ? canAccessLocations
                : true;
      if (!canSeeCategory) return false;
      const matchesCategory = activeFilter === "all" || item.type === activeFilter;
      if (!matchesCategory) return false;

      if (!query.trim()) return true;

      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      );
    });
  }, [
    query,
    activeFilter,
    canAccessAssets,
    canAccessReports,
    canViewVendors,
    canAccessLocations,
    liveSearchIndex,
  ]);

  // Keyboard navigation inside search results (Up/Down arrows + Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
      } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredResults[selectedIndex].segment);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredResults, selectedIndex]);

  const handleSelect = (segment: string) => {
    onOpenChange(false);
    setQuery("");
    navigate(getPath(segment));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-4xl w-[92vw] !h-[85vh] !max-h-[750px] p-0 gap-0 overflow-hidden rounded-2xl border border-border shadow-2xl bg-card text-card-foreground flex flex-col"
      >
        <DialogTitle className="sr-only">Global System Search</DialogTitle>

        {/* ── Search Input Header ── */}
        <div className="relative flex items-center border-b border-border px-5 py-4 bg-card shrink-0">
          <Search className="h-6 w-6 text-primary shrink-0 mr-3" />
          <input
            ref={inputRef}
            aria-label="Search system records"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search work orders, assets, facilities, vendors, reports..."
            className="w-full border-0 bg-transparent p-0 text-base sm:text-lg font-medium text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            aria-label="Close search"
            onClick={() => onOpenChange(false)}
            className="ml-3 hidden sm:inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2.5 py-1 font-mono text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            ESC
          </button>
        </div>

        {/* ── Category Filter Pills ── */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-muted/30 px-5 py-2.5 scrollbar-none shrink-0">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0 mr-1" />
          {CATEGORY_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id);
                  setSelectedIndex(0);
                }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* ── Main Modal Content: Split View for Search Results & Interactive Insights ── */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Search Results List Column */}
          <div className="md:col-span-7 overflow-y-auto p-3 space-y-1 bg-card">
            {filteredResults.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <Sparkles className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-base font-semibold text-foreground">
                  No matching live records found
                </p>
                <p className="text-xs text-muted-foreground">
                  Try another search or use the relevant list page for more filters.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    {query ? (
                      "Search Results"
                    ) : (
                      <>
                        <History className="h-3.5 w-3.5" /> Quick Access & Recent Items
                      </>
                    )}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {filteredResults.length} records
                  </span>
                </div>

                {filteredResults.map((item, index) => {
                  const IconComponent = item.icon;
                  const isSelected = selectedIndex === index;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.segment)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left transition-all group",
                        isSelected ? "bg-muted/80 ring-1 ring-border" : "hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted/60 border-border text-primary",
                          )}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground truncate">
                              {item.title}
                            </span>
                            <span className="text-xs font-mono font-semibold text-muted-foreground">
                              {item.id}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-1">{item.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary">
                          {item.badge}
                        </span>
                        <CornerDownLeft
                          className={cn(
                            "h-4 w-4 text-primary transition-opacity",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Search Preview Panel Column */}
          <div className="hidden md:flex md:col-span-5 flex-col justify-between p-5 bg-muted/15 space-y-4">
            {filteredResults[selectedIndex] ? (
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Preview & Metrics
                  </span>
                  <h3 className="mt-1 text-lg font-extrabold text-foreground">
                    {filteredResults[selectedIndex].title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {filteredResults[selectedIndex].desc}
                  </p>
                </div>

                {/* SVG Visual Activity Analytics Chart */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Monthly Activity Trend</span>
                    <span className="text-emerald-500 font-bold">+18.4%</span>
                  </div>
                  <div className="h-28 w-full flex items-end justify-between gap-1 pt-2">
                    {[40, 65, 30, 85, 55, 90, 75, 95].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div
                          className="w-full bg-primary/80 group-hover:bg-primary rounded-t transition-all"
                          style={{ height: `${val}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>System Record ID</span>
                    <span className="font-mono font-bold text-foreground">
                      {filteredResults[selectedIndex].id}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Category</span>
                    <span className="font-semibold text-foreground">
                      {filteredResults[selectedIndex].category}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-border text-xs text-muted-foreground">
              Press{" "}
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-foreground font-bold">
                ↵
              </kbd>{" "}
              to open record
            </div>
          </div>
        </div>

        {/* ── Modal Footer Guidelines & Shortcuts ── */}
        <div className="border-t border-border bg-card px-5 py-3.5 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                ↑
              </kbd>
              <kbd className="rounded border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                ↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                ↵
              </kbd>
              <span>Open</span>
            </span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs">
            Press{" "}
            <kbd className="rounded border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
              ⌘K
            </kbd>{" "}
            to open anytime
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
