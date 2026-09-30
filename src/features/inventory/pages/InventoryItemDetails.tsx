import { useEffect, useState } from "react";
import { ArrowLeft, Package, Pencil, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "@/components/navigation/Navbar";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageError } from "@/components/feedback/PageError";
import { EmptyState } from "@/components/feedback/EmptyState";
import { KPICard } from "@/features/dashboard/components/StatCard";
import { facilitiesApi } from "@/features/facilities/api/facilities.api";
import { locationsApi } from "@/features/locations/api/locations.api";
import { EditInventoryItemDialog } from "../components/EditInventoryItemDialog";
import {
  inventoryService,
  type InventoryBalance,
  type InventoryCategory,
  type InventoryHistoryRecord,
  type InventoryItemRecord,
  type StockLocation,
} from "../services/inventory.service";

export function InventoryItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<InventoryItemRecord | null>(null);
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([]);
  const [history, setHistory] = useState<InventoryHistoryRecord[]>([]);
  const [facilityName, setFacilityName] = useState("Not specified");
  const [locationName, setLocationName] = useState("Not specified");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [
        items,
        itemBalances,
        itemCategories,
        itemLocations,
        itemHistory,
        facilityResponse,
        locations,
      ] = await Promise.all([
        inventoryService.listItems(),
        inventoryService.balances({ itemId: id }),
        inventoryService.categories(),
        inventoryService.listLocations(),
        inventoryService.history({ itemId: id }),
        facilitiesApi.list({ limit: 100 }),
        locationsApi.list(),
      ]);
      const found = items.find((entry) => entry.id === id || entry._id === id) ?? null;
      setItem(found);
      setBalances(itemBalances);
      setCategories(itemCategories);
      setStockLocations(itemLocations);
      setHistory(itemHistory);
      setFacilityName(
        facilityResponse.data.find((entry) => entry.id === found?.facilityId)?.name ??
          "Not specified",
      );
      setLocationName(
        locations.find((entry) => entry.id === found?.locationId)?.name ?? "Not specified",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error("Unable to load inventory item"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [id]);
  useEffect(() => {
    if (!item?.facilityId && !item?.locationId) return;
    const facilityId =
      typeof item.facilityId === "string"
        ? item.facilityId
        : String((item.facilityId as unknown as { _id?: string })?._id ?? "");
    const locationId =
      typeof item.locationId === "string"
        ? item.locationId
        : String((item.locationId as unknown as { _id?: string })?._id ?? "");
    if (facilityId)
      void facilitiesApi
        .get(facilityId)
        .then((facility) => setFacilityName(facility.name))
        .catch(() => undefined);
    if (locationId)
      void locationsApi
        .get(locationId)
        .then((location) => setLocationName(location.name))
        .catch(() => undefined);
  }, [item]);
  if (loading) return <PageLoader label="Loading inventory item..." />;
  if (error) return <PageError message={error.message} onRetry={() => void load()} />;
  if (!item)
    return (
      <EmptyState
        icon={Package}
        title="Inventory item not found"
        description="This item may have been archived or removed."
      />
    );
  const total = balances.reduce((sum, balance) => sum + balance.quantity, 0);
  const available = balances.reduce((sum, balance) => sum + balance.availableQuantity, 0);
  const category =
    categories.find((entry) => entry.id === item.categoryId)?.name ?? "Uncategorized";
  const stockLocationName = (stockLocationId: string) =>
    stockLocations.find((location) => location.id === stockLocationId)?.name ??
    "Unknown stock location";
  return (
    <div className="min-h-full bg-background text-foreground">
      <AppHeader title="Inventory Item Detail" hideQuickCreate />
      <div className="border-b border-border bg-card px-8 py-5">
        <div className="flex items-center justify-between gap-4">
          <PageIntro
            title={item.name}
            description="Review stock levels, replenishment thresholds, and warehouse balances."
          />
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={() => void load()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setEditOpen(true)} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit item
            </Button>
          </div>
        </div>
      </div>
      <main className="min-h-full bg-muted/30 p-8">
        <div className="space-y-6">
          <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back to inventory
          </Button>
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
                <h2 className="mt-1 text-lg font-semibold">Item summary</h2>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Category</dt>
                <dd className="mt-1 font-medium">{category}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Facility</dt>
                <dd className="mt-1 font-medium">{facilityName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Location</dt>
                <dd className="mt-1 font-medium">{locationName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Unit of measure</dt>
                <dd className="mt-1 font-medium capitalize">{item.unitOfMeasure}</dd>
              </div>
            </dl>
            {item.description && (
              <p className="mt-6 border-t border-border pt-5 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            )}
          </section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="On hand"
              value={total}
              changeLabel={`${item.unitOfMeasure} in stock`}
              icon="assets"
            />
            <KPICard
              title="Available"
              value={available}
              changeLabel="Ready to issue"
              icon="completed"
            />
            <KPICard
              title="Minimum stock"
              value={item.minimumStockLevel}
              changeLabel="Safety threshold"
              icon="warning"
              variant="warning"
            />
            <KPICard
              title="Reorder level"
              value={item.reorderLevel}
              changeLabel="Replenishment trigger"
              icon="overdue"
              variant="danger"
            />
          </div>
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Stock by location</h2>
            {balances.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No stock has been received for this item.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-border">
                {balances.map((balance) => (
                  <div
                    key={`${balance.stockLocationId}-${balance.updatedAt}`}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="font-medium">
                      {stockLocationName(balance.stockLocationId)}
                    </span>
                    <span className="text-muted-foreground">
                      {balance.quantity} on hand · {balance.availableQuantity} available
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Inventory history</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Every receipt, issue, adjustment, and transfer recorded for this item.
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {history.length} {history.length === 1 ? "movement" : "movements"}
              </span>
            </div>
            {history.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No stock movements recorded for this item.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-border">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium capitalize">{entry.type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {stockLocationName(entry.stockLocationId)} ·{" "}
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {entry.quantity} {entry.unitOfMeasure}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <EditInventoryItemDialog
        item={item}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => void load()}
      />
    </div>
  );
}
export default InventoryItemDetails;
