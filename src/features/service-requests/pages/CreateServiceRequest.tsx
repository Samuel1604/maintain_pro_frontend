import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Upload,
  FileText,
  X,
  CheckCircle2,
  Copy,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/feedback/FieldError";
import { facilitiesApi } from "@/features/facilities/api/facilities.api";
import { locationsApi } from "@/features/locations/api/locations.api";
import { assetsApi } from "@/features/assets/api/assets.api";
import { useAuthStore } from "@/app/store";
import { usePortalPath } from "@/hooks/usePortal";
import { displayReference } from "@/utils/display-ids";
import {
  serviceRequestsService,
  type CreateServiceRequestInput,
} from "../services/serviceRequests.service";
import { uploadFile } from "@/api/uploads.api";

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export function CreateServiceRequest({
  embedded = false,
  onComplete,
}: {
  embedded?: boolean;
  onComplete?: () => void;
}) {
  const navigate = useNavigate();
  const path = usePortalPath("service-requests");
  const user = useAuthStore((state) => state.user);

  const [facilities, setFacilities] = useState<Array<{ id: string; name: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [assets, setAssets] = useState<Array<{ id: string; name: string; assetTag: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    facilityId: "",
    locationId: "",
    assetId: "",
    title: "",
    description: "",
    serviceCategory: "",
    priority: "medium" as CreateServiceRequestInput["priority"],
  });

  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void facilitiesApi
      .list({ page: 1, limit: 100 })
      .then((result) => {
        setFacilities(result.data);
        if (result.data.length === 1)
          setForm((current) => ({ ...current, facilityId: result.data[0].id }));
      })
      .catch(() => setLoadError("Unable to load facilities."));
  }, []);

  useEffect(() => {
    if (!form.facilityId) {
      setLocations([]);
      return;
    }
    void locationsApi
      .listByFacility(form.facilityId)
      .then(setLocations)
      .catch(() => setLoadError("Unable to load locations."));
  }, [form.facilityId]);

  useEffect(() => {
    if (!form.locationId) {
      setAssets([]);
      return;
    }
    void assetsApi
      .list({ locationId: form.locationId, page: 1, limit: 100 })
      .then((result) =>
        setAssets(
          (result.data ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            assetTag: item.assetTag,
          })),
        ),
      )
      .catch(() => setLoadError("Unable to load assets."));
  }, [form.locationId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingAttachments(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) =>
          uploadFile(file, {
            purpose: "service-request-attachment",
            facilityId: form.facilityId,
          }),
        ),
      );
      setAttachments((prev) => [
        ...prev,
        ...uploaded.map((file) => ({
          id: file.id,
          name: file.originalName,
          size: file.size ?? 0,
          type: file.mimeType ?? "application/octet-stream",
          url: file.secureUrl,
        })),
      ]);
      toast.success(`Attached ${uploaded.length} file(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload attachment(s)");
    } finally {
      setUploadingAttachments(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.facilityId) newErrors.facilityId = "Please select a facility.";
    if (!form.locationId) newErrors.locationId = "Please select a location.";
    if (!form.assetId) newErrors.assetId = "Please select the affected asset.";
    if (form.title.trim().length < 2)
      newErrors.title = "Issue title must be at least 2 characters.";
    if (form.serviceCategory.trim().length < 2)
      newErrors.serviceCategory = "Please select a category.";
    if (form.description.trim().length < 5)
      newErrors.description = "Description must be at least 5 characters.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the highlighted errors before submitting.");
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const result = await serviceRequestsService.create({
        ...form,
        organizationId: user?.organizationId || "",
        title: form.title.trim(),
        description: form.description.trim(),
      });

      const reqId =
        (result as { id?: string; _id?: string }).id ||
        (result as { id?: string; _id?: string })._id;
      if (!reqId) throw new Error("Service request was created without an identifier");
      if (attachments.length > 0) {
        await Promise.all(
          attachments.map((attachment) =>
            serviceRequestsService.addAttachment(reqId, attachment.id),
          ),
        );
      }
      setCreatedRequestId(displayReference("SR", reqId));
      window.setTimeout(() => setCreatedRequestId(null), 3000);
      toast.success("Service request submitted successfully!");
    } catch {
      toast.error("Unable to submit service request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingId = () => {
    if (createdRequestId) {
      navigator.clipboard.writeText(createdRequestId);
      toast.success("Tracking ID copied to clipboard");
    }
  };

  // Post-submit Confirmation Screen
  if (createdRequestId) {
    return (
      <div className="min-h-full bg-background text-foreground">
        {!embedded && (
          <AppHeader
            title="Request Submitted"
            subtitle="Service Request Confirmation"
            hideQuickCreate
          />
        )}
        <main className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 text-center shadow-lg space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Service Request Received!</h1>
              <p className="text-sm text-muted-foreground">
                Your maintenance request has been logged and assigned to the facility management
                team for triage.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-medium text-muted-foreground">
                  Tracking ID
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-xs gap-1.5 cursor-pointer"
                  onClick={copyTrackingId}
                >
                  {createdRequestId}
                  <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </Badge>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs uppercase font-medium text-muted-foreground">Title</span>
                <span className="text-sm font-semibold truncate max-w-[250px]">{form.title}</span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs uppercase font-medium text-muted-foreground">
                  Category & Priority
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {form.serviceCategory}
                  </Badge>
                  <Badge
                    variant={
                      form.priority === "critical" || form.priority === "high"
                        ? "destructive"
                        : "outline"
                    }
                    className="capitalize text-xs"
                  >
                    {form.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => (embedded && onComplete ? onComplete() : navigate(path))}
              >
                View All Requests
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setCreatedRequestId(null);
                  setForm({
                    facilityId: "",
                    locationId: "",
                    assetId: "",
                    title: "",
                    description: "",
                    serviceCategory: "",
                    priority: "medium",
                  });
                  setAttachments([]);
                  setErrors({});
                }}
              >
                Submit Another Request
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      {!embedded && (
        <AppHeader
          title="New Service Request"
          subtitle="Report a maintenance issue"
          hideQuickCreate
        />
      )}
      <main
        className={embedded ? "min-h-0 overflow-y-auto p-0" : "mx-auto max-w-3xl p-4 sm:p-6 lg:p-8"}
      >
        {!embedded && (
          <Button variant="ghost" className="mb-5 gap-2" onClick={() => navigate(path)}>
            <ArrowLeft className="h-4 w-4" /> Back to requests
          </Button>
        )}

        <form
          onSubmit={submit}
          className={
            embedded
              ? "space-y-6 rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/10 p-5 shadow-sm sm:p-6"
              : "space-y-6 rounded-xl border border-border bg-card p-5 sm:p-7 shadow-sm"
          }
        >
          <div>
            <h1 className="text-xl font-bold tracking-tight">Report an Issue</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Provide details about the issue so the facilities team can triage and resolve it
              promptly.
            </p>
          </div>

          {loadError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{loadError}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="select-facility">Facility *</Label>
              <Select
                value={form.facilityId}
                onValueChange={(value) => {
                  setForm((current) => ({
                    ...current,
                    facilityId: value,
                    locationId: "",
                    assetId: "",
                  }));
                  setErrors((prev) => ({
                    ...prev,
                    facilityId: "",
                    locationId: "",
                  }));
                }}
              >
                <SelectTrigger id="select-facility" aria-invalid={!!errors.facilityId}>
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
              <FieldError id="facilityId-error" message={errors.facilityId} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="select-location">Location / Area *</Label>
              <Select
                value={form.locationId}
                onValueChange={(value) => {
                  setForm((current) => ({
                    ...current,
                    locationId: value,
                    assetId: "",
                  }));
                  setErrors((prev) => ({ ...prev, locationId: "" }));
                }}
                disabled={!form.facilityId}
              >
                <SelectTrigger id="select-location" aria-invalid={!!errors.locationId}>
                  <SelectValue
                    placeholder={form.facilityId ? "Select location" : "Choose a facility first"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="locationId-error" message={errors.locationId} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="select-asset">Affected Asset *</Label>
            <Select
              value={form.assetId}
              onValueChange={(value) => {
                setForm((current) => ({ ...current, assetId: value }));
                setErrors((prev) => ({ ...prev, assetId: "" }));
              }}
              disabled={!form.locationId}
            >
              <SelectTrigger id="select-asset" aria-invalid={!!errors.assetId}>
                <SelectValue
                  placeholder={
                    form.locationId
                      ? assets.length
                        ? "Select the affected asset"
                        : "No assets registered for this location"
                      : "Choose a location first"
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
            <FieldError id="assetId-error" message={errors.assetId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-title">Issue Title *</Label>
            <Input
              id="request-title"
              value={form.title}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }));
                setErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="e.g. Air conditioner leaking in 3rd floor conference room"
              aria-invalid={!!errors.title}
            />
            <FieldError id="title-error" message={errors.title} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="select-category">Category *</Label>
              <Select
                value={form.serviceCategory}
                onValueChange={(value) => {
                  setForm((current) => ({
                    ...current,
                    serviceCategory: value,
                  }));
                  setErrors((prev) => ({ ...prev, serviceCategory: "" }));
                }}
              >
                <SelectTrigger id="select-category" aria-invalid={!!errors.serviceCategory}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "hvac",
                    "electrical",
                    "plumbing",
                    "security",
                    "cleaning",
                    "structural",
                    "other",
                  ].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value[0].toUpperCase() + value.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="category-error" message={errors.serviceCategory} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="select-priority">Urgency / Priority *</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    priority: value as CreateServiceRequestInput["priority"],
                  }))
                }
              >
                <SelectTrigger id="select-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — Routine maintenance</SelectItem>
                  <SelectItem value="medium">Medium — Operational impact</SelectItem>
                  <SelectItem value="high">High — Urgent attention needed</SelectItem>
                  <SelectItem value="critical">Critical — Emergency / Safety risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="request-description">Detailed Description *</Label>
              <span className="text-xs text-muted-foreground">
                {form.description.length} / 1000 characters
              </span>
            </div>
            <Textarea
              id="request-description"
              value={form.description}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }));
                setErrors((prev) => ({ ...prev, description: "" }));
              }}
              placeholder="Describe what happened, when it started, symptoms observed, and any safety hazards."
              rows={5}
              maxLength={1000}
              aria-invalid={!!errors.description}
            />
            <FieldError id="description-error" message={errors.description} />
          </div>

          {/* Attachments Upload Zone */}
          <div className="space-y-3">
            <Label>Photo & Document Attachments</Label>
            <div
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center hover:bg-muted/40 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {uploadingAttachments ? "Uploading files…" : "Click to upload photos or files"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 10MB each</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                disabled={uploadingAttachments}
                onChange={handleFileUpload}
              />
            </div>

            {attachments.length > 0 && (
              <ul className="space-y-2 pt-1">
                {attachments.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <span className="font-medium truncate">{file.name}</span>
                      <span className="text-muted-foreground">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeAttachment(file.id)}
                      aria-label={`Remove attachment ${file.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => (embedded && onComplete ? onComplete() : navigate(path))}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateServiceRequest;
