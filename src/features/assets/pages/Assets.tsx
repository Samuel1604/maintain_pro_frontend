import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageError } from "@/components/feedback/PageError";
import { usePortalPath } from "@/hooks/usePortal";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useAssets } from "../hooks/useAssets";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store";
import { useFacilities } from "@/features/facilities/hooks/useFacilities";
import { useLocationsApi } from "@/features/locations/hooks/useLocationsApi";
import { useBackendAssetMutations } from "../hooks/useAssetsApi";

import { AppHeader } from "@/components/navigation/Navbar";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageIntro } from "@/components/layout/PageIntro";
import { displayLabel, displayReference } from "@/utils/display-ids";
import type { Location } from "@/features/locations/types/location.types";
import type { Facility } from "@/features/facilities/types/facility.types";

const ASSET_CATEGORIES = [
  "hardware",
  "infrastructure",
  "other",
] as const;
const ASSET_STATUSES = [
  "active",
  "inactive",
  "under_maintenance",
  "retired",
] as const;
const ASSET_CURRENCIES = ["NGN", "USD", "GBP", "EUR"] as const;

export function Assets() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assetsPath = usePortalPath("assets");
  const facilitiesPath = usePortalPath("facilities");
  const { canManageAssets } = useRoleAccess();
  const user = useAuthStore((state) => state.user);
  const {
    data: facilitiesResponse,
    isLoading: facilitiesLoading,
    isError: facilitiesError,
  } = useFacilities();
  const { data: locationsResponse } = useLocationsApi();
  const assetMutations = useBackendAssetMutations();
  const facilityId = user?.facilityId ?? facilitiesResponse?.data?.[0]?.id;
  const queryFacilityId = facilityId;
  const facilityLocations = (locationsResponse ?? []).filter(
    (location: Location) => !facilityId || location.facilityId === facilityId,
  );

  const locationFromQuery = searchParams.get("location");
  const {
    assets: apiAssets,
    isLoading,
    error,
    refetch,
    setFilters,
  } = useAssets({
    ...(locationFromQuery ? { locationId: locationFromQuery } : {}),
    ...(queryFacilityId ? { facilityId: queryFacilityId } : {}),
  });
  useEffect(() => {
    if (queryFacilityId)
      setFilters((current) => ({ ...current, facilityId: queryFacilityId }));
  }, [queryFacilityId, setFilters]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    assetTag: "",
    name: "",
    facilityId: "",
    locationId: "",
    category: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    installationDate: "",
    estimatedValue: "",
    currency: "NGN",
    description: "",
  });
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, conditionFilter, statusFilter]);

  if (facilitiesLoading) return <PageLoader label="Loading facilities..." />;

  if (facilitiesError)
    return (
      <div className="min-h-full bg-background text-foreground">
        <AppHeader title="Assets" hideQuickCreate />
        <main className="p-8">
          <PageIntro
            title="Assets"
            description="Track equipment, ownership, condition, location, and maintenance history in one registry."
          />
          <div className="h-5" />
          <PageError
            message="Unable to load facilities for the asset registry."
            onRetry={() => window.location.reload()}
          />
        </main>
      </div>
    );

  if (!facilityId)
    return (
      <div className="min-h-full bg-background text-foreground">
        <AppHeader title="Assets" hideQuickCreate />
        <main className="p-8">
          <PageIntro
            title="Assets"
            description="Track equipment, ownership, condition, location, and maintenance history in one registry."
          />
          <div className="h-5" />
          <div
            role="status"
            className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center"
          >
            <h2 className="text-base font-semibold text-foreground">
              Facility context required
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Select or configure a facility before viewing and registering
              assets. Assets must belong to a facility so their locations,
              maintenance history, and work orders remain properly connected.
            </p>
            <Button className="mt-5" onClick={() => navigate(facilitiesPath)}>
              Open Facilities
            </Button>
          </div>
        </main>
      </div>
    );

  if (isLoading) return <PageLoader label="Loading assets..." />;
  if (error) return <PageError message={error.message} onRetry={refetch} />;

  const displayRows = apiAssets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    assetTag: asset.assetTag,
    category: asset.category,
    locationName:
        locationsResponse?.find((location: Location) => location.id === asset.locationId)
        ?.name ?? "—",
    facility:
      facilitiesResponse?.data?.find(
        (facility: Facility) => facility.id === asset.facilityId,
      )?.name ??
      facilitiesResponse?.data?.[0]?.name ??
      "Unknown facility",
    status: asset.status,
    condition: asset.condition
      ? `${asset.condition.charAt(0).toUpperCase()}${asset.condition.slice(1)}`
      : "Unknown",
  }));

  const filtered = displayRows.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.assetTag.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    const matchCondition =
      conditionFilter === "all" ||
      item.condition.toLowerCase() === conditionFilter.toLowerCase();
    return matchSearch && matchCategory && matchStatus && matchCondition;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedRows = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  function getConditionStyle(condition: string) {
    if (condition === "Excellent") return "text-success font-semibold";
    if (condition === "Good") return "text-muted-foreground font-medium";
    if (condition === "Fair") return "text-warning font-medium";
    if (condition === "Poor") return "text-destructive font-semibold";
    return "text-muted-foreground";
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader title="Assets" hideQuickCreate />
      {/* ── Top Header / Breadcrumb ── */}
      <div className="border-b border-border bg-card px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <PageIntro
              title="Assets"
              description="Track equipment, ownership, condition, location, and maintenance history in one registry."
            />
            {!facilityId && (
              <p className="mt-2 text-sm font-medium text-warning">
                A facility context is required before assets can be registered.
              </p>
            )}
          </div>

          {canManageAssets && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          )}
        </div>

        {/* ── Filter Bar ── */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="w-64">
            <SearchInput
              placeholder="Search: HVAC Chiller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-lg border-0 bg-muted/40 text-[13px] shadow-none"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-40 rounded-lg border-0 bg-muted/40 text-[13px] shadow-none">
              <SelectValue placeholder="Category: HVAC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Category: All</SelectItem>
              {ASSET_CATEGORIES.map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="capitalize"
                >
                  {displayLabel(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="h-9 w-36 rounded-lg border-0 bg-muted/40 text-[13px] shadow-none">
              <SelectValue placeholder="Condition: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Condition: All</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-44 rounded-lg border-0 bg-muted/40 text-[13px] shadow-none">
              <SelectValue placeholder="Status: Operational" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              {ASSET_STATUSES.map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="p-8">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Asset Name / ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No assets match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {paginatedRows.map((item) => {
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-bold text-foreground">{item.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        {displayReference('AST', item.assetTag)}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {displayLabel(item.category)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.locationName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.facility}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell
                      className={`text-[13px] ${getConditionStyle(
                        item.condition,
                      )}`}
                    >
                      {item.condition}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `${assetsPath}/${encodeURIComponent(
                              item.assetTag,
                            )}`,
                          )
                        }
                        className="h-8 rounded-md bg-muted px-3 text-[12px] font-semibold text-foreground hover:bg-accent"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* ── Table Footer / Pagination ── */}
          <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4 text-[13px] text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {paginatedRows.length ? (page - 1) * PAGE_SIZE + 1 : 0}-
                {Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              entries
            </div>
            <div className="flex items-center gap-1.5">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Asset Modal ── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="!max-w-4xl w-[calc(100vw-2rem)] !h-[calc(100dvh-2rem)] !max-h-[calc(100dvh-2rem)] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Register New Asset
            </DialogTitle>
            <p className="text-sm text-muted-foreground">Record the asset details needed for tracking, maintenance, and reporting.</p>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2 text-[13px]">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">
                Asset Name *
              </Label>
              <Input
                placeholder="e.g. HVAC Chiller Unit #3"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">
                Linked Location *
              </Label>
              <Select
                value={form.locationId}
                onValueChange={(v) => setForm((p) => ({ ...p, locationId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mandatory location" />
                </SelectTrigger>
                <SelectContent>
                  {facilityLocations.map((location: Location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">
                Asset Tag *
              </Label>
              <Input
                placeholder="e.g. AST-10024"
                value={form.assetTag}
                onChange={(e) =>
                  setForm((p) => ({ ...p, assetTag: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">
                Manufacturer
              </Label>
              <Input
                placeholder="e.g. Carrier Systems"
                value={form.manufacturer}
                onChange={(e) =>
                  setForm((p) => ({ ...p, manufacturer: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">
                Model Number
              </Label>
              <Input
                placeholder="e.g. Aquasnap 30RAP"
                value={form.model}
                onChange={(e) =>
                  setForm((p) => ({ ...p, model: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">
                Serial Number
              </Label>
              <Input
                placeholder="e.g. CARR-4810239-X"
                value={form.serialNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, serialNumber: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">
                Category *
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_CATEGORIES.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="capitalize"
                    >
                    {displayLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="asset-purchase-date" className="text-[12px] font-semibold text-foreground">Purchase Date *</Label>
              <Input id="asset-purchase-date" type="date" value={form.purchaseDate} onChange={(e) => setForm((p) => ({ ...p, purchaseDate: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="asset-installation-date" className="text-[12px] font-semibold text-foreground">Installation Date *</Label>
              <Input id="asset-installation-date" type="date" value={form.installationDate} onChange={(e) => setForm((p) => ({ ...p, installationDate: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="asset-estimated-value" className="text-[12px] font-semibold text-foreground">Estimated Value *</Label>
              <Input id="asset-estimated-value" type="number" min="0" step="0.01" placeholder="0.00" value={form.estimatedValue} onChange={(e) => setForm((p) => ({ ...p, estimatedValue: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">Currency *</Label>
              <Select value={form.currency} onValueChange={(value) => setForm((p) => ({ ...p, currency: value }))}>
                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>{ASSET_CURRENCIES.map((currency) => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">
                Description / Notes
              </Label>
              <Textarea
                rows={2}
                placeholder="Optional notes about this asset..."
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                !form.name ||
                !form.locationId ||
                !form.assetTag ||
                !form.category ||
                !form.purchaseDate ||
                !form.installationDate ||
                !form.estimatedValue ||
                assetMutations.create.isPending
              }
              onClick={async () => {
                try {
                  if (!facilityId) {
                    toast.error(
                      "A facility context is required before registering an asset.",
                    );
                    return;
                  }
                  await assetMutations.create.mutateAsync({
                    facilityId,
                    locationId: form.locationId,
                    assetTag: form.assetTag.trim(),
                    name: form.name.trim(),
                    description: form.description || undefined,
                    category:
                      form.category as (typeof ASSET_CATEGORIES)[number],
                    manufacturer: form.manufacturer || undefined,
                    modelNumber: form.model || undefined,
                    serialNumber: form.serialNumber || undefined,
                    status: "active",
                    condition: "good",
                    ownership: "owned",
                    purchaseDate: form.purchaseDate,
                    installationDate: form.installationDate,
                    estimatedValue: Number(form.estimatedValue),
                    currency: form.currency,
                  });
                  toast.success(`Asset "${form.name}" registered successfully`);
                  await refetch();
                  setShowAddModal(false);
                  setForm({
                    assetTag: "",
                    name: "",
                    facilityId: "",
                    locationId: "",
                    category: "",
                    manufacturer: "",
                    model: "",
                    serialNumber: "",
                    purchaseDate: "",
                    installationDate: "",
                    estimatedValue: "",
                    currency: "NGN",
                    description: "",
                  });
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Unable to register asset",
                  );
                }
              }}
              className="bg-primary text-primary-foreground"
            >
              {assetMutations.create.isPending
                ? "Registering…"
                : "Register Asset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
