import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { AppHeader as Navbar } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Calendar as CalendarIcon, Loader2, Upload, X } from "lucide-react";
import { workOrdersService } from "../services/workOrders.service";
import { facilitiesApi } from "@/features/facilities/api/facilities.api";
import { locationsApi } from "@/features/locations/api/locations.api";
import { assetsApi } from "@/features/assets/api/assets.api";
import { format } from "date-fns";
import { cn } from "@/utils/helpers";
import { useAuthStore } from "@/app/store";
import { usePortalPath } from "@/hooks/usePortal";
import { toast } from "sonner";

export function CreateWorkOrder({
  embedded = false,
  onComplete,
}: {
  embedded?: boolean;
  onComplete?: () => void;
}) {
  const navigate = useNavigate();
  const workOrdersPath = usePortalPath("work-orders");
  const [isLoading, setIsLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date>();
  const user = useAuthStore((state) => state.user);
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string }>>([]);
  const [locations, setLocations] = useState<
    Array<{ id: string; name: string; facilityId: string }>
  >([]);
  const [assets, setAssets] = useState<
    Array<{ id: string; assetTag: string; name: string; locationId: string }>
  >([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isManager = user?.role === "facility_manager" || user?.role === "admin";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    facilityId: "",
    locationId: "",
    assetId: "",
    estimatedCost: "",
    fulfillmentType: "marketplace" as "internal" | "marketplace",
  });

  useEffect(() => {
    void facilitiesApi
      .list({ page: 1, limit: 100 })
      .then((result) => {
        setFacilities(result.data);
        if (result.data.length === 1)
          setFormData((current) => ({ ...current, facilityId: result.data[0].id }));
      })
      .catch(() => setLoadError("Unable to load facilities"));
  }, []);

  useEffect(() => {
    if (!formData.facilityId) {
      setLocations([]);
      setAssets([]);
      return;
    }
    setLoadError(null);
    void locationsApi
      .listByFacility(formData.facilityId)
      .then(setLocations)
      .catch(() => setLoadError("Unable to load locations"));
  }, [formData.facilityId]);

  useEffect(() => {
    if (!formData.locationId) {
      setAssets([]);
      return;
    }
    void assetsApi
      .list({ locationId: formData.locationId, page: 1, limit: 100 })
      .then((result) =>
        setAssets(
          (result.data ?? []).map((asset) => ({
            id: asset.id,
            assetTag: asset.assetTag,
            name: asset.name,
            locationId: asset.locationId ?? "",
          })),
        ),
      )
      .catch(() => setLoadError("Unable to load assets"));
  }, [formData.locationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = [
      ["title", formData.title],
      ["description", formData.description],
      ["facility", formData.facilityId],
      ["location", formData.locationId],
      ["asset", formData.assetId],
      ["category", formData.category],
      ["priority", formData.priority],
    ]
      .filter(([, value]) => !value.trim())
      .map(([label]) => label);
    if (missing.length) {
      setValidationError(
        `Complete the required fields before creating this work order: ${missing.join(", ")}.`,
      );
      return;
    }
    setValidationError(null);
    setIsLoading(true);
    try {
      await workOrdersService.create({
        organizationId: user?.organizationId ?? "",
        facilityId: formData.facilityId,
        locationId: formData.locationId,
        assetId: formData.assetId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority || "medium",
        dueDate: dueDate?.toISOString(),
        fulfillmentType: formData.fulfillmentType,
      });
      toast.success("Work order created successfully");
      if (embedded && onComplete) onComplete();
      else navigate(workOrdersPath);
    } catch {
      toast.error("Unable to create work order");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    "HVAC",
    "Electrical",
    "Plumbing",
    "Elevator",
    "Structural",
    "Safety",
    "Security",
    "Cleaning",
    "Landscaping",
    "Other",
  ];

  return (
    <>
      {!embedded && (
        <Navbar
          title="New Work Order"
          subtitle="Create a new maintenance work order"
          hideQuickCreate
        />
      )}

      <div className={embedded ? "min-h-0 overflow-y-auto pb-2 pr-2" : "page-body pb-8"}>
        {!embedded && (
          <Link
            to={workOrdersPath}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Work Orders
          </Link>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className={
            embedded
              ? "space-y-6 rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/10 p-5 shadow-sm sm:p-6"
              : "space-y-6"
          }
        >
          {validationError && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {validationError}
            </div>
          )}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                  <CardDescription>Enter the work order details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Facility *</Label>
                    <Select
                      value={formData.facilityId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, facilityId: value, locationId: "", assetId: "" })
                      }
                    >
                      <SelectTrigger className="bg-secondary">
                        <SelectValue placeholder="Select facility" />
                      </SelectTrigger>
                      <SelectContent>
                        {facilities.map((facility) => (
                          <SelectItem key={facility.id} value={facility.id}>
                            {facility.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., HVAC System Failure - Building A"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed description of the issue..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                      className="min-h-[120px] bg-secondary resize-none"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="bg-secondary">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat.toLowerCase()}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority *</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger className="bg-secondary">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-status-critical" />
                              Critical
                            </span>
                          </SelectItem>
                          <SelectItem value="high">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-status-high" />
                              High
                            </span>
                          </SelectItem>
                          <SelectItem value="medium">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-status-active" />
                              Medium
                            </span>
                          </SelectItem>
                          <SelectItem value="low">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                              Low
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Asset */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Location & Asset</CardTitle>
                  <CardDescription>Specify where the work needs to be done</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Select
                      value={formData.locationId}
                      disabled={!formData.facilityId}
                      onValueChange={(value) => setFormData({ ...formData, locationId: value })}
                    >
                      <SelectTrigger className="bg-secondary">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Asset *</Label>
                    <Select
                      value={formData.assetId}
                      onValueChange={(value) => setFormData({ ...formData, assetId: value })}
                    >
                      <SelectTrigger className="bg-secondary">
                        <SelectValue
                          placeholder={
                            formData.locationId
                              ? assets.length
                                ? "Select asset"
                                : "No assets registered for this location"
                              : "Select a location first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name} ({asset.assetTag})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              {loadError && <p className="text-sm text-destructive">{loadError}</p>}

              {/* Photos */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Photos</CardTitle>
                  <CardDescription>Upload photos of the issue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Select Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Assignment - Only for Managers */}
              {isManager && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Assignment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Execution route</Label>
                      <Select
                        value={formData.fulfillmentType}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            fulfillmentType: value as "internal" | "marketplace",
                          })
                        }
                      >
                        <SelectTrigger className="bg-secondary">
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="marketplace">Vendor marketplace</SelectItem>
                          <SelectItem value="internal">Internal technician</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-secondary",
                              !dueDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={setDueDate}
                            captionLayout="label"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cost - Only for Managers */}
              {isManager && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Cost Estimate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="cost">Estimated Cost ($)</Label>
                      <Input
                        id="cost"
                        type="number"
                        placeholder="0.00"
                        value={formData.estimatedCost}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estimatedCost: e.target.value,
                          })
                        }
                        className="bg-secondary"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card className="bg-card border-border">
                <CardContent className="pt-6 space-y-3">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Work Order"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(workOrdersPath)}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
