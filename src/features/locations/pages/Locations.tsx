import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, StatusBadge } from "@/components/ui/badge";
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
import { useLocationsApi, useLocationMutations } from "@/features/locations/hooks/useLocationsApi";
import { useFacilities } from "@/features/facilities/hooks/useFacilities";
import { usePortalPath } from "@/hooks/usePortal";
import { AppHeader } from "@/components/navigation/Navbar";
import { PageIntro } from "@/components/layout/PageIntro";
import { toast } from "sonner";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageError } from "@/components/feedback/PageError";
import type { Location as ApiLocation } from "@/features/locations/types/location.types";
import type { Facility } from "@/features/facilities/types/facility.types";
import { Pagination } from "@/components/ui/pagination";
import { EditLocationDialog } from "@/features/locations/components/EditLocationDialog";
import type { Location as CommonLocation } from "@/types/common.types";

export function Locations() {
  const navigate = useNavigate();
  const locationsQuery = useLocationsApi();
  const facilitiesQuery = useFacilities();
  const { create } = useLocationMutations();
  const locationsPath = usePortalPath("locations");

  const [search, setSearch] = useState("");
  const [facilityFilter, setFacilityFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<CommonLocation | null>(null);
  const [editLocationOpen, setEditLocationOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("ROOM");
  const [formFloor, setFormFloor] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formRoomNumber, setFormRoomNumber] = useState("");
  const [formParentId, setFormParentId] = useState("");
  const [formFacilityId, setFormFacilityId] = useState("");

  useEffect(() => {
    setPage(1);
  }, [search, facilityFilter, zoneFilter, statusFilter]);

  const apiLocations = locationsQuery.data || [];
  const facilities = (facilitiesQuery.data as unknown as { data?: Facility[] })?.data || [];
  const displayedLocations = apiLocations.map((l: ApiLocation) => ({
    id: l.id,
    name: l.name,
    facilityId: l.facilityId,
    facility:
      facilities.find((facility: Facility) => facility.id === l.facilityId)?.name ||
      "Facility unavailable",
    floorZone: l.floor || l.description || "Not specified",
    assets: l.assetCount ?? 0,
    openWos: l.openWorkOrderCount ?? 0,
    status: l.status.toUpperCase(),
  }));
  const editableLocations: CommonLocation[] = apiLocations.map((location) => ({
    ...location,
    createdAt: new Date(location.createdAt),
    updatedAt: new Date(location.updatedAt),
    type:
      location.type.toLowerCase() === "area" || location.type.toLowerCase() === "zone"
        ? "zone"
        : (location.type.toLowerCase() as CommonLocation["type"]),
    status: location.status,
  }));

  const filtered = displayedLocations.filter((item: (typeof displayedLocations)[number]) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.facility.toLowerCase().includes(search.toLowerCase());
    const matchFacility = facilityFilter === "all" || item.facilityId === facilityFilter;
    const matchZone =
      zoneFilter === "all" || item.floorZone.toLowerCase().includes(zoneFilter.toLowerCase());
    const matchStatus =
      statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchFacility && matchZone && matchStatus;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  if (locationsQuery.isLoading || facilitiesQuery.isLoading)
    return <PageLoader label="Loading locations..." />;
  if (locationsQuery.isError)
    return (
      <PageError
        title="Locations unavailable"
        message="Unable to fetch locations. Please try again."
        onRetry={() => void locationsQuery.refetch()}
      />
    );

  async function handleAddLocation() {
    if (!formName.trim()) return;
    try {
      await create.mutateAsync({
        facilityId: formFacilityId,
        name: formName.trim(),
        type: formType as ApiLocation["type"],
        floor: formFloor.trim() || undefined,
        code: formCode.trim() || undefined,
        roomNumber: formRoomNumber.trim() || undefined,
        description: formDescription.trim() || undefined,
        status: "active",
        parentId: formParentId.trim()
          ? (editableLocations.find(
              (location) => location.name.toLowerCase() === formParentId.trim().toLowerCase(),
            )?.id ?? null)
          : null,
      });
      toast.success(`Location "${formName}" created successfully`);
      setFormName("");
      setFormFloor("");
      setFormDescription("");
      setFormCode("");
      setFormRoomNumber("");
      setFormParentId("");
      setFormFacilityId("");
      setShowAddModal(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create location");
    }
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader title="Locations" hideQuickCreate />
      {/* ── Top Header / Breadcrumbs ── */}
      <div className="border-b border-border bg-card px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <PageIntro
              title="Locations"
              description="Organize facilities into clear operational spaces so assets, requests, and work orders stay connected."
            />
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </div>

        {/* ── Filter Bar ── */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-lg border-0 bg-muted/40 pl-9 text-[13px] shadow-none focus:bg-card"
            />
          </div>

          <Select value={facilityFilter} onValueChange={setFacilityFilter}>
            <SelectTrigger className="h-9 w-44 rounded-lg border-0 bg-muted/40 text-[13px] shadow-none">
              <SelectValue placeholder="Facility: HQ Office" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Facility: All</SelectItem>
              {facilities.map((facility: Facility) => (
                <SelectItem key={facility.id} value={facility.id}>
                  {facility.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={zoneFilter} onValueChange={setZoneFilter}>
            <SelectTrigger className="h-9 w-36 rounded-lg border-0 bg-muted/40 text-[13px] shadow-none">
              <SelectValue placeholder="Zone/Floor: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Zone/Floor: All</SelectItem>
              <SelectItem value="floor">Floor</SelectItem>
              <SelectItem value="basement">Basement</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-36 rounded-lg border-0 bg-muted/40 text-[13px] shadow-none">
              <SelectValue placeholder="Status: Active" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="p-8">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">Location Name</th>
                <th className="px-6 py-3.5">Facility</th>
                <th className="px-6 py-3.5">Floor / Zone</th>
                <th className="px-6 py-3.5 text-center">Assets</th>
                <th className="px-6 py-3.5 text-center">Open WOs</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    {search ||
                    facilityFilter !== "all" ||
                    zoneFilter !== "all" ||
                    statusFilter !== "all"
                      ? "No locations match your filters."
                      : "No locations yet. Create one to get started."}
                  </td>
                </tr>
              ) : (
                visible.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{item.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{item.facility}</td>
                      <td className="px-6 py-4 text-muted-foreground">{item.floorZone}</td>
                      <td className="px-6 py-4 text-center font-medium text-muted-foreground">
                        {item.assets ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-bold ${(item.openWos ?? 0) > 0 ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {item.openWos ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`${locationsPath}/${item.id}`)}
                            className="h-8 rounded-md bg-muted px-3 text-[12px] font-semibold text-foreground hover:bg-accent"
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const selected =
                                editableLocations.find((location) => location.id === item.id) ??
                                null;
                              setEditingLocation(selected);
                              setEditLocationOpen(Boolean(selected));
                            }}
                            className="h-8 w-8 p-0 text-primary"
                            title="Edit location"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* ── Table Footer / Pagination ── */}
          <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4 text-[13px] text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}-
                {Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{filtered.length}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <Pagination page={page} totalPages={pageCount} onPageChange={setPage} />
            </div>
            <EditLocationDialog
              location={editingLocation}
              locations={editableLocations}
              open={editLocationOpen}
              onOpenChange={(open) => {
                setEditLocationOpen(open);
                if (!open) setEditingLocation(null);
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Add Location Dialog Modal ── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="!max-w-4xl w-[calc(100vw-2rem)] !h-[calc(100dvh-2rem)] !max-h-[calc(100dvh-2rem)] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Add New Location
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Define the facility area, level, and details so work can be assigned accurately.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-2 text-[13px]">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">Facility *</Label>
              <Select value={formFacilityId} onValueChange={setFormFacilityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility: Facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">Location Name *</Label>
              <Input
                placeholder="e.g. Server Room B"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">Type</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROOM">Room</SelectItem>
                    <SelectItem value="BUILDING">Building</SelectItem>
                    <SelectItem value="FLOOR">Floor</SelectItem>
                    <SelectItem value="AREA">Zone / Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Floor / Zone Description
                </Label>
                <Input
                  placeholder="e.g. Floor 4, Suite 410"
                  value={formFloor}
                  onChange={(e) => setFormFloor(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">Location Code</Label>
                <Input
                  placeholder="e.g. SR-B"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">Room Number</Label>
                <Input
                  placeholder="e.g. 410"
                  value={formRoomNumber}
                  onChange={(e) => setFormRoomNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">Parent Location</Label>
                <Input
                  list="parent-location-options"
                  placeholder="e.g. Main Building (optional)"
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                />
                <datalist id="parent-location-options">
                  {editableLocations.map((location) => (
                    <option key={location.id} value={location.name} />
                  ))}
                </datalist>
                <p className="text-[11px] text-muted-foreground">
                  Leave blank for a top-level location.
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">Description</Label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe this location"
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddLocation}
              disabled={!formName.trim() || !formFacilityId}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
