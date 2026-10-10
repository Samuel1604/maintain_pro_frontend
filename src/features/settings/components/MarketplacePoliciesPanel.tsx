import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useFacilities, useFacilityMutations } from "@/features/facilities/hooks/useFacilities";

type Priority = "low" | "medium" | "high" | "critical";
type Policy = {
  id: string;
  priority: Priority;
  maxDistanceKm: number;
  enabled: boolean;
};

const priorities: Priority[] = ["low", "medium", "high", "critical"];

export function MarketplacePoliciesPanel() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [priority, setPriority] = useState<Priority>("low");
  const [distance, setDistance] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const facilitiesQuery = useFacilities();
  const facilityMutations = useFacilityMutations();
  const facilities = facilitiesQuery.data?.data ?? [];
  const [facilityId, setFacilityId] = useState("");
  const selectedFacility = facilities.find((facility) => facility.id === facilityId);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    if (!facilityId && facilities[0]) setFacilityId(facilities[0].id);
  }, [facilities, facilityId]);

  useEffect(() => {
    if (selectedFacility) {
      setLatitude(String(selectedFacility.coordinates.coordinates[1]));
      setLongitude(String(selectedFacility.coordinates.coordinates[0]));
    }
  }, [selectedFacility]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error("Location services are not available");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast.error("Unable to determine your current location");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  const saveFacilityLocation = async () => {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (
      !facilityId ||
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      toast.error("Enter valid facility coordinates");
      return;
    }
    try {
      await facilityMutations.update.mutateAsync({
        id: facilityId,
        payload: { latitude: lat, longitude: lng },
      });
      toast.success("Marketplace facility location saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save facility location");
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      setPolicies(
        await apiClient.get<Policy[]>("/organizations/me/marketplace/geographic-policies"),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load marketplace policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    const maxDistanceKm = Number.parseFloat(distance);
    if (!Number.isFinite(maxDistanceKm) || maxDistanceKm < 0) {
      toast.error("Enter a valid maximum distance in kilometres");
      return;
    }
    setSaving(true);
    try {
      const created = await apiClient.post<Policy>(
        "/organizations/me/marketplace/geographic-policies",
        { priority, maxDistanceKm, enabled: true },
      );
      setPolicies((current) => [...current, created]);
      setDistance("");
      toast.success(`${priority} marketplace policy activated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save marketplace policy");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (policy: Policy) => {
    try {
      await apiClient.post(
        `/organizations/me/marketplace/geographic-policies/${policy.id}/deactivate`,
      );
      setPolicies((current) =>
        current.map((item) => (item.id === policy.id ? { ...item, enabled: false } : item)),
      );
      toast.success(`${policy.priority} marketplace policy deactivated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to deactivate policy");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-bold">Marketplace facility location</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Set the facility coordinates used to match vendor opportunities.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3 sm:items-end">
          <div className="space-y-1.5">
            <Label>Facility</Label>
            <select
              value={facilityId}
              onChange={(event) => setFacilityId(event.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Latitude</Label>
            <Input value={latitude} onChange={(event) => setLatitude(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Longitude</Label>
            <Input value={longitude} onChange={(event) => setLongitude(event.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={useCurrentLocation} disabled={locating}>
            {locating ? "Locating…" : "Use my current location"}
          </Button>
          <Button
            onClick={() => void saveFacilityLocation()}
            disabled={facilityMutations.update.isPending}
          >
            Save location
          </Button>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-bold">Marketplace geographic policies</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Set the maximum distance vendors may travel for marketplace work at each priority.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item[0].toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Maximum distance (km)</Label>
            <Input
              inputMode="decimal"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
              placeholder="e.g. 50"
            />
          </div>
          <Button onClick={() => void save()} disabled={saving}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add policy
          </Button>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-bold">Active priority policies</h3>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading policies…</p>
        ) : policies.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No geographic policies configured yet.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {policies.map((policy) => (
              <div key={policy.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <span className="font-semibold capitalize">{policy.priority}</span>
                  <span className="ml-3 text-muted-foreground">
                    within {policy.maxDistanceKm} km
                  </span>
                </div>
                {policy.enabled ? (
                  <Button variant="ghost" size="sm" onClick={() => void deactivate(policy)}>
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Deactivate
                  </Button>
                ) : (
                  <span className="text-muted-foreground">Inactive</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
