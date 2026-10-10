import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  Building,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { SkeletonCard, SkeletonTable } from "@/components/feedback/Skeletons";
import { useActionConfirm } from "@/hooks/useActionConfirm";
import { AppHeader } from "@/components/navigation/Navbar";
import { ViewVendorDialog } from "@/features/vendors/components/ViewVendorDialog";
import type { Vendor } from "@/types/common.types";
import { formatDate, getDaysUntil } from "@/utils/formatDate";
import { cn } from "@/utils/helpers";
import type { VendorStatus } from "@/types/common.types";
import { toast } from "sonner";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { organizationVendorsService } from "../services/organizationVendors.service";
import { PageIntro } from "@/components/layout/PageIntro";

const SERVICE_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "HVAC",
  "Cleaning",
  "Pest Control",
  "Fire Safety",
  "Elevator",
  "Security",
  "Gas",
  "Sewage",
  "General",
];

function RatingStars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.floor(value)
              ? "text-amber-400 fill-amber-400"
              : i < value
                ? "text-amber-400 fill-amber-400/40"
                : "text-muted-foreground",
          )}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

export function Vendors() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestConfirm, ActionConfirmDialog } = useActionConfirm();
  const { canManageVendors } = useRoleAccess();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("grid");
  const [page, setPage] = useState(1);
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null);
  const [deactivateVendor, setDeactivateVendor] = useState<Vendor | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    serviceCategories: [] as string[],
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
    contractStart: "",
    contractEnd: "",
    contractValue: "",
    slaResponseTime: "",
    slaResolutionTime: "",
    taxId: "",
    notes: "",
  });

  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [vendorLoadError, setVendorLoadError] = useState<string | null>(null);
  const [vendorsLoading, setVendorsLoading] = useState(true);

  useEffect(() => {
    if (location.pathname.endsWith("/vendors/new")) {
      navigate("../vendors/marketplace", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    setVendorsLoading(true);
    setVendorLoadError(null);
    void organizationVendorsService
      .list()
      .then((result) => {
        setAllVendors(
          (result ?? []).map((vendor) => ({
            id: vendor.vendorId,
            name: vendor.name,
            category: vendor.serviceCategories[0] ?? "General",
            serviceCategories: vendor.serviceCategories,
            email: vendor.email,
            phone: vendor.phone,
            rating: vendor.averageRating ?? 0,
            status: vendor.status as Vendor["status"],
            completedJobs: vendor.completedJobs ?? 0,
            contractStart: undefined,
            contractEnd: undefined,
          })),
        );
      })
      .catch((error) => {
        setAllVendors([]);
        setVendorLoadError(
          error instanceof Error
            ? error.message
            : "Vendor partnerships could not be loaded from the live service.",
        );
      })
      .finally(() => setVendorsLoading(false));
  }, []);

  const vendors = useMemo(
    () =>
      allVendors.filter((v) => {
        if (statusFilter !== "all" && v.status !== statusFilter) return false;
        if (categoryFilter !== "all" && !v.serviceCategories?.includes(categoryFilter))
          return false;
        if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [allVendors, search, categoryFilter, statusFilter],
  );
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(vendors.length / pageSize));
  const pagedVendors = vendors.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  const stats = {
    total: allVendors.length,
    active: allVendors.filter((v) => v.status === "active").length,
    expiringSoon: allVendors.filter(
      (v) => v.contractEnd && getDaysUntil(v.contractEnd) <= 30 && getDaysUntil(v.contractEnd) >= 0,
    ).length,
    avgRating: allVendors.length
      ? (allVendors.reduce((s, v) => s + v.rating, 0) / allVendors.length).toFixed(1)
      : "—",
    totalSpend: allVendors.reduce((s, v) => s + (v.totalSpend || 0), 0),
  };

  return (
    <div className="flex flex-col bg-background">
      {ActionConfirmDialog}
      <ViewVendorDialog
        vendor={viewVendor}
        open={!!viewVendor}
        onOpenChange={(o) => !o && setViewVendor(null)}
        onEdit={
          canManageVendors
            ? () => {
                if (viewVendor) {
                  setEditVendor(viewVendor);
                  setViewVendor(null);
                }
              }
            : undefined
        }
      />
      <ConfirmDialog
        open={!!deactivateVendor}
        onOpenChange={(o) => !o && setDeactivateVendor(null)}
        title="Deactivate vendor?"
        description={deactivateVendor ? `${deactivateVendor.name} will be marked inactive.` : ""}
        confirmLabel="Deactivate"
        destructive
        warning="The vendor will no longer be available for new assignments until reactivated."
        onConfirm={() => {
          if (deactivateVendor) {
            void organizationVendorsService
              .changeStatus(deactivateVendor.id, "inactive")
              .then(() => {
                toast.success(`${deactivateVendor.name} deactivated`);
                setAllVendors((items) =>
                  items.map((item) =>
                    item.id === deactivateVendor.id ? { ...item, status: "inactive" } : item,
                  ),
                );
              })
              .catch(() => toast.error("Unable to deactivate vendor"));
          }
          setDeactivateVendor(null);
        }}
      />
      <AppHeader title="Vendors" hideQuickCreate />

      <div className="min-h-full bg-background text-foreground">
        <div className="border-b border-border bg-card px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <PageIntro
                title="Vendors"
                description="Manage vendor partnerships, service agreements, performance, and operational coverage."
              />
            </div>
            {canManageVendors && (
              <Button
                onClick={() => navigate("../vendors/marketplace")}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Discover Vendors
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-6 px-8 py-6">
          {vendorLoadError && (
            <div
              role="alert"
              className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning"
            >
              <p className="font-semibold">Vendor partnerships are unavailable</p>
              <p className="mt-1">
                The live service did not return vendor relationships for this organization. Refresh
                after vendor access is configured, or onboard a vendor to begin.
              </p>
            </div>
          )}

          {vendorsLoading ? (
            <div role="status" aria-live="polite" className="space-y-4">
              <span className="sr-only">Loading vendor partnerships…</span>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <SkeletonTable rows={6} columns={6} />
            </div>
          ) : (
            <>
              {/* ── Filter Controls Container ── */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex gap-4 flex-wrap items-center">
                  <SearchInput
                    aria-label="Search vendors"
                    placeholder="Search vendors…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    className="ml-auto"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-muted-foreground">Status:</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[160px] h-[36px] text-[13px] border-border bg-card font-medium">
                        <SelectValue placeholder="**All Partners**" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Partners</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="removed">Removed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-muted-foreground">
                      Service Category:
                    </span>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[160px] h-[36px] text-[13px] border-border bg-card font-medium">
                        <SelectValue placeholder="**Select**" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {SERVICE_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted border border-border mb-4">
                  <TabsTrigger value="grid">Cards</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                  <TabsTrigger value="performance" className="gap-2">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Performance
                  </TabsTrigger>
                </TabsList>

                {/* Grid */}
                <TabsContent value="grid" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {pagedVendors.map((v) => {
                      const contractDays = v.contractEnd ? getDaysUntil(v.contractEnd) : null;
                      const contractExpiring =
                        contractDays !== null && contractDays <= 30 && contractDays >= 0;
                      const contractExpired = contractDays !== null && contractDays < 0;
                      return (
                        <Card
                          key={v.id}
                          className={cn(
                            "bg-card border-border hover:border-primary/30 transition-colors",
                            contractExpiring && "border-amber-400/30",
                          )}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-medium text-foreground">{v.name}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{v.category}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={v.status} />
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      aria-label={`Actions for vendor ${v.name}`}
                                    >
                                      <MoreVertical className="h-3.5 w-3.5" aria-hidden />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setViewVendor(v)}>
                                      View Details
                                    </DropdownMenuItem>
                                    {canManageVendors && (
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => setDeactivateVendor(v)}
                                      >
                                        Deactivate
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <RatingStars value={v.rating} />

                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                {v.email}
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {v.phone}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {v.serviceCategories?.slice(0, 3).map((c) => (
                                <Badge key={c} variant="outline" className="text-[10px]">
                                  {c}
                                </Badge>
                              ))}
                              {(v.serviceCategories?.length || 0) > 3 && (
                                <Badge variant="outline" className="text-[10px]">
                                  +{v.serviceCategories!.length - 3}
                                </Badge>
                              )}
                            </div>

                            {v.contractEnd && (
                              <div
                                className={cn(
                                  "flex items-center gap-2 p-2 rounded-md text-xs",
                                  contractExpired
                                    ? "bg-red-400/10 text-red-400"
                                    : contractExpiring
                                      ? "bg-amber-400/10 text-amber-400"
                                      : "bg-muted text-muted-foreground",
                                )}
                              >
                                {contractExpired || contractExpiring ? (
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                Contract{" "}
                                {contractExpired
                                  ? "expired"
                                  : contractExpiring
                                    ? `expires in ${contractDays}d`
                                    : `until ${formatDate(v.contractEnd)}`}
                              </div>
                            )}

                            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border text-center">
                              {[
                                { label: "Jobs", value: v.completedJobs || 0 },
                                { label: "Pending", value: v.pendingJobs || 0 },
                                {
                                  label: "Spend",
                                  value: "—",
                                },
                              ].map((m) => (
                                <div key={m.label}>
                                  <p className="text-sm font-semibold text-foreground">{m.value}</p>
                                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {vendors.length === 0 && (
                      <div className="col-span-3 text-center py-16 text-muted-foreground">
                        <Building className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium text-foreground">
                          {allVendors.length === 0
                            ? "No vendor partnerships yet"
                            : "No vendors match your filters"}
                        </p>
                        <p className="mx-auto mt-2 max-w-md text-sm">
                          {allVendors.length === 0
                            ? "Vendor partnerships will appear here once your organization connects with service providers."
                            : "Try clearing your search or changing the category and status filters."}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Table */}
                <TabsContent value="table" className="mt-0">
                  <Card className="bg-card border-border">
                    <div className="data-table-wrap">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            {[
                              "Vendor",
                              "Category",
                              "Rating",
                              "Contract Status",
                              "Jobs",
                              "Spend",
                              "Status",
                              "Actions",
                            ].map((h) => (
                              <TableHead key={h} className="text-muted-foreground text-xs">
                                {h}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagedVendors.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="p-12 text-center">
                                <p className="font-medium text-foreground">
                                  {allVendors.length === 0
                                    ? "No vendor partnerships yet"
                                    : "No vendors match your filters"}
                                </p>
                                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                                  {allVendors.length === 0
                                    ? "Vendor partnerships will appear here once your organization connects with service providers."
                                    : "Try clearing your search or changing the category and status filters."}
                                </p>
                              </TableCell>
                            </TableRow>
                          )}
                          {pagedVendors.map((v) => {
                            const contractDays = v.contractEnd ? getDaysUntil(v.contractEnd) : null;
                            return (
                              <TableRow key={v.id} className="border-border">
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">{v.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {v.contactPerson || v.email}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {v.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <RatingStars value={v.rating} />
                                </TableCell>
                                <TableCell>
                                  {v.contractEnd ? (
                                    <span
                                      className={cn(
                                        "text-xs",
                                        contractDays !== null && contractDays < 0
                                          ? "text-red-400"
                                          : contractDays !== null && contractDays <= 30
                                            ? "text-amber-400"
                                            : "text-muted-foreground",
                                      )}
                                    >
                                      {contractDays !== null && contractDays < 0
                                        ? "Expired"
                                        : contractDays !== null && contractDays <= 30
                                          ? `${contractDays}d left`
                                          : formatDate(v.contractEnd)}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">{v.completedJobs || 0}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">—</span>
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={v.status} />
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        aria-label={`Actions for vendor ${v.name}`}
                                      >
                                        <MoreVertical className="h-4 w-4" aria-hidden />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setViewVendor(v)}>
                                        View Details
                                      </DropdownMenuItem>
                                      {canManageVendors && (
                                        <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => setDeactivateVendor(v)}
                                        >
                                          Deactivate
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </TabsContent>

                {/* Performance */}
                <TabsContent value="performance" className="mt-0 space-y-4">
                  {vendors.filter((v) => v.status === "active").length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
                      <TrendingUp className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                      <p className="font-medium text-foreground">No performance data available</p>
                      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                        {allVendors.length === 0
                          ? "Performance metrics will appear after your organization adds vendor partnerships."
                          : "Performance metrics are available for active vendors. Activate a partnership to begin tracking results."}
                      </p>
                    </div>
                  ) : (
                    vendors
                      .filter((v) => v.status === "active")
                      .map((v) => (
                        <Card key={v.id} className="bg-card border-border">
                          <CardContent className="flex items-center justify-between gap-4 p-4">
                            <div>
                              <h3 className="font-medium">{v.name}</h3>
                              <p className="text-xs text-muted-foreground">{v.category}</p>
                              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Completed jobs: {v.completedJobs ?? "—"}</span>
                                <RatingStars value={v.rating} />
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => navigate(v.id)}>
                              View live metrics
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="!max-w-4xl w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Register a service partner and capture the information needed for operations.
              </p>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              {[
                {
                  label: "Company Name *",
                  key: "name",
                  placeholder: "e.g. CoolTech HVAC Services",
                },
                {
                  label: "Contact Person",
                  key: "contactPerson",
                  placeholder: "e.g. John Smith",
                },
                {
                  label: "Email *",
                  key: "email",
                  placeholder: "vendor@example.com",
                  type: "email",
                },
                {
                  label: "Phone *",
                  key: "phone",
                  placeholder: "+1 (555) 000-0000",
                },
                {
                  label: "Tax ID / Registration",
                  key: "taxId",
                  placeholder: "e.g. 12-3456789",
                },
                {
                  label: "Contract Value ($)",
                  key: "contractValue",
                  placeholder: "0.00",
                  type: "number",
                },
                { label: "Contract Start", key: "contractStart", type: "date" },
                { label: "Contract End", key: "contractEnd", type: "date" },
                {
                  label: "SLA Response Time (hours)",
                  key: "slaResponseTime",
                  placeholder: "4",
                  type: "number",
                },
                {
                  label: "SLA Resolution Time (hours)",
                  key: "slaResolutionTime",
                  placeholder: "24",
                  type: "number",
                },
              ].map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs">{f.label}</Label>
                  <Input
                    type={f.type || "text"}
                    placeholder={f.placeholder}
                    value={(form as Record<string, string | string[]>)[f.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-xs">Primary Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Address</Label>
                <Input
                  placeholder="Street address"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Textarea
                  placeholder="Any special terms, notes or requirements..."
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  requestConfirm({
                    title: "Add vendor?",
                    description: `Add ${form.name} to your vendor directory?`,
                    confirmLabel: "Add vendor",
                    onConfirm: async () => {
                      toast.error(
                        "Live vendor onboarding requires selecting a registered marketplace vendor first.",
                      );
                    },
                  })
                }
                disabled={!form.name || !form.email || !form.phone}
              >
                Add Vendor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
