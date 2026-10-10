import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, ChevronLeft, ChevronRight, Eye, Pencil, MapPin } from "lucide-react";
import { useFacilities, useFacilityMutations } from "../hooks/useFacilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, StatusBadge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageError } from "@/components/feedback/PageError";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useOrganization } from "@/features/organization/hooks/useOrganization";
import { usePortalPath } from "@/hooks/usePortal";
import { AppHeader } from "@/components/navigation/Navbar";
import { toast } from "sonner";
import type { Facility, FacilitiesResponse } from "../types/facility.types";
import { Pagination } from "@/components/ui/pagination";
import { PageIntro } from "@/components/layout/PageIntro";
import { InviteUserModal } from "@/features/auth/components/InviteUserModal";

export function FacilitiesPage() {
  const navigate = useNavigate();
  const { data: apiData, isLoading, isError, refetch } = useFacilities();
  const user = useCurrentUser();
  const organization = useOrganization();
  const mutations = useFacilityMutations();
  const facilitiesPath = usePortalPath("facilities");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManagerInvite, setShowManagerInvite] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Form State
  const [formName, setFormName] = useState("");
  const [formStreet, setFormStreet] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formCountry, setFormCountry] = useState("");
  const [formLatitude, setFormLatitude] = useState("");
  const [formLongitude, setFormLongitude] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formManagerName, setFormManagerName] = useState("");
  const [formPrimaryPhone, setFormPrimaryPhone] = useState("");
  const [formEmergencyContact, setFormEmergencyContact] = useState("");
  const [locating, setLocating] = useState(false);

  const canManage = user.data?.role === "admin" || user.data?.role === "facility_manager";

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location services are not available in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormLatitude(position.coords.latitude.toFixed(6));
        setFormLongitude(position.coords.longitude.toFixed(6));
        setLocating(false);
        toast.success("Facility coordinates updated from your current location");
      },
      (error) => {
        setLocating(false);
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? "Location access was denied. Enter coordinates manually or allow location access."
            : "Unable to determine your current location",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy]);

  if (isLoading) return <PageLoader label="Loading facilities..." />;
  if (isError)
    return (
      <PageError
        title="Facilities unavailable"
        message="Unable to fetch facilities. Please try again."
        onRetry={() => void refetch()}
      />
    );

  const rawFacilities: Facility[] = Array.isArray(apiData)
    ? apiData
    : (apiData as FacilitiesResponse | undefined)?.data || [];

  const displayedRows = rawFacilities.map((f: Facility) => ({
    id: f.id,
    name: f.name,
    address:
      `${f.address.street || ""} ${f.address.city || ""}, ${f.address.state || ""}`.trim() ||
      "No address configured",
    status: f.status,
    locations: f.locationCount ?? 0,
    assets: f.assetCount ?? 0,
    openWos: f.openWorkOrderCount ?? 0,
  }));

  const filteredRows = displayedRows.filter((item) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchSearch =
      !normalizedSearch ||
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.address.toLowerCase().includes(normalizedSearch);
    const matchStatus =
      statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (sortBy === "openWos") return b.openWos - a.openWos;
    if (sortBy === "assets") return b.assets - a.assets;
    return a.name.localeCompare(b.name);
  });
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const visibleRows = sortedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFacilityForm = () => {
    setFormName("");
    setFormStreet("");
    setFormCity("");
    setFormState("");
    setFormCountry("");
    setFormLatitude("");
    setFormLongitude("");
    setFormDescription("");
    setFormManagerName("");
    setFormPrimaryPhone("");
    setFormEmergencyContact("");
  };

  const populateFacilityForm = (facility: Facility) => {
    setFormName(facility.name);
    setFormStreet(facility.address.street || "");
    setFormCity(facility.address.city || "");
    setFormState(facility.address.state || "");
    setFormCountry(facility.address.country || "");
    setFormLatitude(String(facility.coordinates.coordinates[1]));
    setFormLongitude(String(facility.coordinates.coordinates[0]));
    setFormDescription(facility.description || "");
    setFormManagerName(facility.managerName || "");
    setFormPrimaryPhone(facility.primaryPhone || "");
    setFormEmergencyContact(facility.emergencyContact || "");
  };

  async function handleCreateFacility() {
    const latitude = Number(formLatitude);
    const longitude = Number(formLongitude);
    if (
      !organization.data ||
      !formName.trim() ||
      formStreet.trim().length < 3 ||
      formCity.trim().length < 2 ||
      formState.trim().length < 2 ||
      !formCountry.trim() ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      toast.error("Enter a complete address, country, and valid facility coordinates");
      return;
    }
    try {
      await mutations.create.mutateAsync({
        organizationId: organization.data.id,
        name: formName.trim(),
        address: { street: formStreet, city: formCity, state: formState, country: formCountry },
        latitude,
        longitude,
        description: formDescription.trim() || undefined,
        primaryPhone: formPrimaryPhone.trim() || undefined,
        emergencyContact: formEmergencyContact.trim() || undefined,
      });
      toast.success(`Facility "${formName}" created successfully`);
      resetFacilityForm();
      setShowAddModal(false);
    } catch {
      toast.error("Failed to create facility");
    }
  }

  async function handleUpdateFacility() {
    const latitude = Number(formLatitude);
    const longitude = Number(formLongitude);
    if (
      !editingFacility ||
      !formName.trim() ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      toast.error("Enter valid facility coordinates");
      return;
    }
    try {
      await mutations.update.mutateAsync({
        id: editingFacility.id,
        payload: {
          name: formName.trim(),
          address: {
            street: formStreet,
            city: formCity,
            state: formState,
            postalCode: editingFacility.address.postalCode,
            country: formCountry || editingFacility.address.country,
          },
          latitude,
          longitude,
          description: formDescription.trim() || undefined,
          primaryPhone: formPrimaryPhone.trim() || undefined,
          emergencyContact: formEmergencyContact.trim() || undefined,
        },
      });
      toast.success(`Facility "${formName}" updated successfully`);
      setEditingFacility(null);
    } catch {
      toast.error("Failed to update facility");
    }
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader title="Facilities" hideQuickCreate />
      {/* ── Top Header / Breadcrumb ── */}
      <div className="border-b border-border bg-card px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <PageIntro
              title="Facilities"
              description="Manage your real estate footprint, compliance, and overall asset allocations."
            />
          </div>

          {canManage && (
            <Button
              onClick={() => {
                resetFacilityForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Facility
            </Button>
          )}
        </div>

        {/* ── Filter Bar ── */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search: HQ Office..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-lg border-0 bg-muted/40 pl-9 text-[13px] shadow-none focus:bg-card"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-36 rounded-lg border-0 bg-muted/40 text-[13px] shadow-none">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-40 rounded-lg border-0 bg-muted/40 text-[13px] shadow-none">
              <SelectValue placeholder="Sorted by: Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sorted by: Name</SelectItem>
              <SelectItem value="openWos">Sorted by: Open WOs</SelectItem>
              <SelectItem value="assets">Sorted by: Assets</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Facilities Data Table ── */}
      <div className="p-8">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">Facility Name</th>
                <th className="px-6 py-3.5">Address</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Locations</th>
                <th className="px-6 py-3.5 text-center">Assets</th>
                <th className="px-6 py-3.5 text-center">Open WOs</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {rawFacilities.length === 0
                        ? "No facilities have been added yet"
                        : "No facilities match your filters"}
                    </p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                      {rawFacilities.length === 0
                        ? "Add your first facility to start organizing locations, assets, work orders, and maintenance activity."
                        : "Try clearing your search or changing the status filter to find the facility you need."}
                    </p>
                    {rawFacilities.length === 0 && canManage && (
                      <Button
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                          resetFacilityForm();
                          setShowAddModal(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Facility
                      </Button>
                    )}
                  </td>
                </tr>
              )}
              {visibleRows.map((facility) => {
                return (
                  <tr key={facility.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{facility.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{facility.address}</td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={
                          facility.status === "suspended"
                            ? "SUSPENDED"
                            : facility.status.toUpperCase()
                        }
                      />
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-muted-foreground">
                      {facility.locations ?? "No locations"}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-muted-foreground">
                      {facility.assets ?? "No assets"}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-destructive">
                      {facility.openWos ?? "No open work orders"}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`${facilitiesPath}/${facility.id}`)}
                          className="h-8 rounded-md bg-muted px-3 text-[12px] font-semibold text-foreground hover:bg-accent"
                        >
                          View
                        </Button>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const f = rawFacilities.find((item) => item.id === facility.id);
                              if (f) {
                                setEditingFacility(f);
                                populateFacilityForm(f);
                              }
                            }}
                            className="h-8 w-8 p-0 text-primary"
                            title="Edit facility"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ── Table Footer / Pagination ── */}
          <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4 text-[13px] text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {sortedRows.length ? (page - 1) * PAGE_SIZE + 1 : 0}-
                {Math.min(page * PAGE_SIZE, sortedRows.length)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{sortedRows.length}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <Pagination page={page} totalPages={pageCount} onPageChange={setPage} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Facility Dialog Modal ── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="!max-w-4xl w-[calc(100vw-2rem)] !h-[calc(100dvh-2rem)] !max-h-[calc(100dvh-2rem)] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Add New Facility
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add the facility details and operating context for your organization.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-2 text-[13px]">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">Facility Name *</Label>
              <Input
                placeholder="e.g. West Campus Innovation Hub"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">Street Address</Label>
              <Input
                placeholder="e.g. 100 Main Street"
                value={formStreet}
                onChange={(e) => setFormStreet(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">City</Label>
                <Input
                  placeholder="e.g. New York"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  State / Province
                </Label>
                <Input
                  placeholder="e.g. NY"
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">Country *</Label>
                <Input value={formCountry} onChange={(e) => setFormCountry(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">Latitude *</Label>
                <Input value={formLatitude} onChange={(e) => setFormLatitude(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">Longitude *</Label>
                <Input value={formLongitude} onChange={(e) => setFormLongitude(e.target.value)} />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={useCurrentLocation}
              disabled={locating}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {locating ? "Locating…" : "Use my current location"}
            </Button>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">
                Facility Description
              </Label>
              <textarea
                placeholder="Describe the facility scope, usage, or key operational notes"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Facility Manager
                </Label>
                <Button type="button" variant="outline" disabled className="w-full justify-start">
                  Invite after facility creation
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">Primary Phone</Label>
                <Input
                  value={formPrimaryPhone}
                  onChange={(e) => setFormPrimaryPhone(e.target.value)}
                  placeholder="Primary phone"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Emergency Contact
                </Label>
                <Input
                  value={formEmergencyContact}
                  onChange={(e) => setFormEmergencyContact(e.target.value)}
                  placeholder="Emergency contact"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateFacility}
              disabled={
                !formName.trim() ||
                formStreet.trim().length < 3 ||
                formCity.trim().length < 2 ||
                formState.trim().length < 2 ||
                formCountry.trim().length < 2 ||
                !formLatitude.trim() ||
                !formLongitude.trim() ||
                mutations.create.isPending
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create Facility
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingFacility)}
        onOpenChange={(open) => !open && setEditingFacility(null)}
      >
        <DialogContent className="!max-w-4xl w-[calc(100vw-2rem)] !h-[calc(100dvh-2rem)] !max-h-[calc(100dvh-2rem)] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Edit Facility</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Update facility details and operating context.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-2 text-[13px]">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">Facility Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">Street Address</Label>
              <Input value={formStreet} onChange={(e) => setFormStreet(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="City"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
              />
              <Input
                placeholder="State / Province"
                value={formState}
                onChange={(e) => setFormState(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={useCurrentLocation}
              disabled={locating}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {locating ? "Locating…" : "Use my current location"}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">Latitude *</Label>
                <Input value={formLatitude} onChange={(e) => setFormLatitude(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">Longitude *</Label>
                <Input value={formLongitude} onChange={(e) => setFormLongitude(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">
                Facility Description
              </Label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Facility Manager
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowManagerInvite(true)}
                  className="w-full justify-start"
                >
                  Invite Facility Manager
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">Primary Phone</Label>
                <Input
                  value={formPrimaryPhone}
                  onChange={(e) => setFormPrimaryPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Emergency Contact
                </Label>
                <Input
                  value={formEmergencyContact}
                  onChange={(e) => setFormEmergencyContact(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFacility(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleUpdateFacility()}
              disabled={!formName.trim() || mutations.update.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <InviteUserModal
        isOpen={showManagerInvite}
        onClose={() => setShowManagerInvite(false)}
        facilityId={editingFacility?.id}
        facilityName={editingFacility?.name}
      />
    </div>
  );
}
