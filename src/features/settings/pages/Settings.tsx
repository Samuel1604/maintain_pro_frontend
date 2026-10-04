import { useEffect, useState } from "react";
import { AppHeader } from "@/components/navigation/Navbar";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  Users,
  Shield,
  Building,
  Bell,
  CreditCard,
  Layers,
  Search,
  Plus,
  MoreVertical,
  Check,
  CheckCircle2,
  Lock,
  ExternalLink,
  Mail,
  Calendar,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOrganizationSettings } from "@/hooks/useSettings";
import { useOrganizationProfile } from "@/features/organization/hooks/useOrganizationProfile";
import { uploadImage } from "@/api/uploads.api";
import { useActionConfirm } from "@/hooks/useActionConfirm";
import { apiClient } from "@/api/client";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageError } from "@/components/feedback/PageError";
import { InviteUserModal } from "@/features/auth/components/InviteUserModal";
import {
  notificationsApi,
  type NotificationPreferences,
} from "@/features/notifications/services/notifications.api";
import { useFacilities } from "@/features/facilities/hooks/useFacilities";
import { useSubscription, usePaymentMethods, usePaymentMethodMutations } from "@/features/billing/hooks/useBilling";
import type { PaymentMethodData } from "@/services/billingService";
import type { Facility } from "@/features/facilities/types/facility.types";

type SettingsFacility = Pick<Facility, "id" | "name" | "status"> & {
  description?: string;
  locationCount?: number;
};
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

type TabKey =
  | "organization"
  | "members"
  | "facilities"
  | "notifications"
  | "billing";

const NAV_ITEMS: { id: TabKey; label: string; icon: any }[] = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "members", label: "Members", icon: Users },
  { id: "facilities", label: "Facilities", icon: Building },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
];

type AccountMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  isVerified: boolean;
  avatar?: string;
};

function LiveMembersPanel({
  members,
  search,
  onSearch,
  loading,
  error,
  onRetry,
}: {
  members: AccountMember[];
  search: string;
  onSearch: (value: string) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const filtered = members.filter((member) =>
    `${member.firstName} ${member.lastName} ${member.email} ${member.role}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  if (loading)
    return (
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading organization members…</span>
        <PageLoader label="Loading organization members…" />
      </div>
    );
  if (error)
    return (
      <PageError
        title="Members unavailable"
        message={error}
        onRetry={onRetry}
      />
    );
  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold">Organization members</h3>
            <p className="text-[13px] text-muted-foreground">
              Live members attached to this organization.
            </p>
          </div>
          <Button
            onClick={() => setInviteOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Invite Member
          </Button>
        </div>
        <SearchInput
          placeholder="Search name or email..."
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="w-full sm:w-72"
        />
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No organization members found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-3.5 font-semibold">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {member.email}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="outline">
                        {member.role.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="outline">{member.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <InviteUserModal
        isOpen={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          onRetry();
        }}
      />
    </>
  );
}

export function OrganizationSettings() {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab =
    requestedTab === "members" ||
    requestedTab === "facilities" ||
    requestedTab === "notifications" ||
    requestedTab === "billing"
      ? requestedTab
      : "organization";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const navigate = useNavigate();
  const organizationSettings = useOrganizationSettings();
  const organizationProfile = useOrganizationProfile();
  const facilitiesQuery = useFacilities();
  const subscriptionQuery = useSubscription();
  const paymentMethodsQuery = usePaymentMethods();
  const currentUserQuery = useCurrentUser();
  const canManageBilling = currentUserQuery.data?.role === 'admin';
  const hasValidSubscription = subscriptionQuery.data?.status === 'active' || subscriptionQuery.data?.status === 'trial';
  const paymentMethod = paymentMethodsQuery.data?.find((item: PaymentMethodData) => item.isDefault) ?? paymentMethodsQuery.data?.[0];
  const paymentMethodMutations = usePaymentMethodMutations();
  const { requestConfirm, ActionConfirmDialog } = useActionConfirm();
  const [timezone, setTimezone] = useState("");
  const [locale, setLocale] = useState("");
  const [currency, setCurrency] = useState("");
  const [defaultWorkOrderPriority, setDefaultWorkOrderPriority] = useState<
    "low" | "medium" | "high" | "critical" | ""
  >("");
  const [defaultServiceRequestPriority, setDefaultServiceRequestPriority] =
    useState<"low" | "medium" | "high" | "critical" | "">("");

  // 1. Organization Form State
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [cityStateZip, setCityStateZip] = useState("");
  const [selectedThemeColor, setSelectedThemeColor] = useState("orange");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);

  // 2. Members Management State
  const [memberSearch, setMemberSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [members, setMembers] = useState<AccountMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const loadMembers = async () => {
    setMembersLoading(true);
    setMembersError(null);
    try {
      setMembers(await apiClient.get<AccountMember[]>("/users"));
    } catch (error) {
      setMembersError(
        error instanceof Error
          ? error.message
          : "Unable to load organization members",
      );
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "members") void loadMembers();
  }, [activeTab]);

  // 3. Notification Policies State
  const [notifPolicies, setNotifPolicies] = useState({
    newAssignmentEmail: true,
    newAssignmentInApp: true,
    statusChangeEmail: false,
    statusChangeInApp: true,
    slaWarningEmail: true,
    slaWarningInApp: true,
    overdueAlertEmail: true,
    overdueAlertInApp: false,
    newRequestSubmittedEmail: false,
    newRequestSubmittedInApp: true,
    statusUpdateEmail: true,
    statusUpdateInApp: true,
    escalationFlagEmail: true,
    escalationFlagInApp: true,
    upcomingScheduleEmail: true,
    upcomingScheduleInApp: false,
    missedTaskEmail: true,
    missedTaskInApp: true,
    completionConfirmationEmail: false,
    completionConfirmationInApp: true,
  });
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences | null>(null);
  const [notificationPreferencesError, setNotificationPreferencesError] =
    useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== "notifications") return;
    setNotificationPreferencesError(null);
    void notificationsApi
      .getPreferences()
      .then((preferences) => {
        const safePreferences = preferences ?? { channels: {} };
        setNotificationPreferences(safePreferences);
        const channels = safePreferences.channels ?? {};
        setNotifPolicies((current) => ({
          ...current,
          newAssignmentEmail:
            channels.work_order?.email ?? current.newAssignmentEmail,
          newAssignmentInApp:
            channels.work_order?.inApp ?? current.newAssignmentInApp,
          statusChangeEmail:
            channels.work_order?.email ?? current.statusChangeEmail,
          statusChangeInApp:
            channels.work_order?.inApp ?? current.statusChangeInApp,
          newRequestSubmittedEmail:
            channels.service_request?.email ?? current.newRequestSubmittedEmail,
          newRequestSubmittedInApp:
            channels.service_request?.inApp ?? current.newRequestSubmittedInApp,
          upcomingScheduleEmail:
            channels.maintenance?.email ?? current.upcomingScheduleEmail,
          upcomingScheduleInApp:
            channels.maintenance?.inApp ?? current.upcomingScheduleInApp,
          escalationFlagEmail:
            channels.escalation?.email ?? current.escalationFlagEmail,
          escalationFlagInApp:
            channels.escalation?.inApp ?? current.escalationFlagInApp,
        }));
      })
      .catch((error) => {
        setNotificationPreferencesError(
          error instanceof Error
            ? error.message
            : "Unable to load notification preferences",
        );
        toast.error("Unable to load notification preferences");
      });
  }, [activeTab]);

  // Handlers
  const handleSave = (msg: string) => {
    toast.success(msg);
  };

  useEffect(() => {
    const profile = organizationProfile.data;
    if (profile) {
      setOrgName(profile.name);
      setIndustry(profile.industry);
      setContactEmail(profile.email);
      setContactPhone(profile.phone);
      setLogoUrl(profile.logo ?? "");
      setAddressLine(profile.address?.street ?? "");
      setCityStateZip(
        [
          profile.address?.city,
          profile.address?.state,
          profile.address?.postalCode,
        ]
          .filter(Boolean)
          .join(", "),
      );
    }
  }, [organizationProfile.data]);

  useEffect(() => {
    const value = organizationSettings.data;
    if (!value) return;
    setTimezone(value.timezone);
    setLocale(value.locale);
    setCurrency(value.currency);
    setDefaultWorkOrderPriority(value.defaultWorkOrderPriority);
    setDefaultServiceRequestPriority(value.defaultServiceRequestPriority);
    setNotifPolicies((current) => ({
      ...current,
      ...value.notificationPolicies,
    }));
  }, [organizationSettings.data]);

  const saveOrganizationDefaults = async () => {
    try {
      await organizationSettings.update.mutateAsync({
        timezone: timezone || undefined,
        locale: locale || undefined,
        currency: currency || undefined,
        defaultWorkOrderPriority: defaultWorkOrderPriority || undefined,
        defaultServiceRequestPriority:
          defaultServiceRequestPriority || undefined,
      });
      if (organizationProfile.data) {
        try {
          await organizationProfile.update.mutateAsync({
            name: orgName,
            industry,
            email: contactEmail,
            phone: contactPhone,
            logo: logoUrl || undefined,
            address: { street: addressLine, city: cityStateZip },
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "profile request failed";
          toast.error(`Organization profile was not saved: ${message}`);
          return;
        }
      }
      toast.success("Organization settings saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "request failed";
      toast.error(`Unable to save organization settings: ${message}`);
    }
  };

  const handleLogoUpload = async (file?: File) => {
    if (!file) return;
    setLogoUploading(true);
    try {
      const uploaded = await uploadImage(file, "organization-logo");
      setLogoUrl(uploaded.secureUrl);
      await organizationProfile.update.mutateAsync({
        logo: uploaded.secureUrl,
      });
      toast.success("Organization logo uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to upload organization logo",
      );
    } finally {
      setLogoUploading(false);
    }
  };

  const togglePolicy = (key: keyof typeof notifPolicies) => {
    setNotifPolicies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveNotificationPolicies = async () => {
    try {
      const existing = notificationPreferences?.channels ?? {};
      const channel = (name: string, email: boolean, inApp: boolean) => ({
        push: existing[name]?.push ?? false,
        sms: existing[name]?.sms ?? false,
        email,
        inApp,
      });
      await Promise.all([
        organizationSettings.update.mutateAsync({
          notificationPolicies: notifPolicies,
        }),
        notificationsApi.updatePreferences({
                channels: {
                  ...existing,
                  work_order: channel(
                    "work_order",
                    notifPolicies.statusChangeEmail ||
                      notifPolicies.newAssignmentEmail,
                    notifPolicies.statusChangeInApp ||
                      notifPolicies.newAssignmentInApp,
                  ),
                  service_request: channel(
                    "service_request",
                    notifPolicies.newRequestSubmittedEmail ||
                      notifPolicies.statusUpdateEmail,
                    notifPolicies.newRequestSubmittedInApp ||
                      notifPolicies.statusUpdateInApp,
                  ),
                  maintenance: channel(
                    "maintenance",
                    notifPolicies.upcomingScheduleEmail ||
                      notifPolicies.missedTaskEmail ||
                      notifPolicies.completionConfirmationEmail,
                    notifPolicies.upcomingScheduleInApp ||
                      notifPolicies.missedTaskInApp ||
                      notifPolicies.completionConfirmationInApp,
                  ),
                  escalation: channel(
                    "escalation",
                    notifPolicies.escalationFlagEmail,
                    notifPolicies.escalationFlagInApp,
                  ),
                },
              }),
      ]);
      toast.success("Notification policies updated!");
    } catch {
      toast.error("Unable to save notification policies");
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      {ActionConfirmDialog}
      <AppHeader title="System Settings" subtitle="Settings" hideQuickCreate />

      <div className="px-8 py-6 space-y-6">
        {/* 2 Column Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar (3 cols) */}
          <div className="lg:col-span-3 rounded-xl border border-border bg-card p-2 shadow-sm space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-3 ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-500 font-bold"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <IconComponent className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Main Content Panel (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* 1. ORGANIZATION TAB */}
            {activeTab === "organization" && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Organization Profile
                  </h3>
                  <p className="text-[13px] text-muted-foreground">
                    Configure name, localization, contact data, and custom
                    branding rules.
                  </p>
                </div>

                <div className="space-y-4 text-[13px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        ORGANIZATION NAME
                      </Label>
                      <Input
                        placeholder="Organization name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        INDUSTRY
                      </Label>
                      <Input
                        placeholder="Industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        CONTACT EMAIL
                      </Label>
                      <Input
                        placeholder="name@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        CONTACT PHONE
                      </Label>
                      <Input
                        placeholder="Contact phone"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        ADDRESS LINE 1
                      </Label>
                      <Input
                        placeholder="Street address"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        CITY / STATE / ZIP
                      </Label>
                      <Input
                        placeholder="City, state, postal code"
                        value={cityStateZip}
                        onChange={(e) => setCityStateZip(e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  {/* Custom Branding & Identity */}
                  <div className="pt-4 border-t border-border space-y-4">
                    <div>
                      <h4 className="text-[13px] font-bold text-foreground">
                        Custom Branding & Identity
                      </h4>
                      <p className="text-[12px] text-muted-foreground">
                        Upload your company symbol and tweak default color
                        guidelines used on work orders and reports.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          COMPANY LOGO
                        </Label>
                        <div className="border-2 border-dashed border-border rounded-xl p-4 flex items-center gap-4 bg-muted/20">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt="Organization logo"
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-lg">
                              MP
                            </div>
                          )}
                          <div>
                            <label className="cursor-pointer text-[13px] font-bold text-foreground">
                              {logoUploading ? "Uploading…" : "Choose logo"}
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                className="hidden"
                                disabled={logoUploading}
                                onChange={(event) => {
                                  void handleLogoUpload(
                                    event.target.files?.[0],
                                  );
                                }}
                              />
                            </label>
                            <p className="text-[11px] text-muted-foreground">
                              PNG, JPG up to 5MB (Ideal size: 1:1 ratio)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          PRIMARY THEME COLOR
                        </Label>
                        <div className="flex items-center gap-3">
                          {[
                            { id: "orange", bg: "bg-orange-500" },
                            { id: "purple", bg: "bg-indigo-600" },
                            { id: "cyan", bg: "bg-cyan-500" },
                            { id: "emerald", bg: "bg-emerald-500" },
                            { id: "red", bg: "bg-rose-500" },
                            { id: "blue", bg: "bg-blue-600" },
                          ].map((color) => (
                            <button
                              key={color.id}
                              onClick={() => setSelectedThemeColor(color.id)}
                              className={`h-8 w-8 rounded-full ${
                                color.bg
                              } flex items-center justify-center transition-transform ${
                                selectedThemeColor === color.id
                                  ? "ring-2 ring-offset-2 ring-primary scale-110"
                                  : ""
                              }`}
                            >
                              {selectedThemeColor === color.id && (
                                <Check className="h-4 w-4 text-white" />
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground pt-1">
                          Orange/Coral Accent (Active)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border space-y-4">
                    <div>
                      <h4 className="text-[13px] font-bold text-foreground">
                        Operational Defaults
                      </h4>
                      <p className="text-[12px] text-muted-foreground">
                        These defaults are applied when new work orders and
                        service requests are created.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>TIMEZONE</Label>
                        <Input
                          placeholder="UTC"
                          value={timezone}
                          onChange={(event) => setTimezone(event.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>LOCALE</Label>
                        <Input
                          placeholder="en-NG"
                          value={locale}
                          onChange={(event) => setLocale(event.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>CURRENCY</Label>
                        <Input
                          placeholder="NGN"
                          maxLength={3}
                          value={currency}
                          onChange={(event) =>
                            setCurrency(event.target.value.toUpperCase())
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>DEFAULT WORK ORDER PRIORITY</Label>
                        <select
                          value={defaultWorkOrderPriority}
                          onChange={(event) =>
                            setDefaultWorkOrderPriority(
                              event.target
                                .value as typeof defaultWorkOrderPriority,
                            )
                          }
                          className="h-(--control-height) w-full rounded-(--radius-control) border border-input bg-background px-3 text-sm"
                        >
                          <option value="">Select priority</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>DEFAULT SERVICE REQUEST PRIORITY</Label>
                        <select
                          value={defaultServiceRequestPriority}
                          onChange={(event) =>
                            setDefaultServiceRequestPriority(
                              event.target
                                .value as typeof defaultServiceRequestPriority,
                            )
                          }
                          className="h-(--control-height) w-full rounded-(--radius-control) border border-input bg-background px-3 text-sm"
                        >
                          <option value="">Select priority</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-border">
                    <Button variant="outline" className="text-[13px]">
                      Cancel
                    </Button>
                    <Button
                      disabled={
                        organizationSettings.update.isPending ||
                        organizationProfile.update.isPending
                      }
                      onClick={saveOrganizationDefaults}
                      className="bg-primary hover:bg-primary-hover text-primary-foreground text-[13px] font-semibold"
                    >
                      Save Profile & Defaults
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MEMBERS MANAGEMENT TAB */}
            {activeTab === "members" && (
                <>
                  <LiveMembersPanel
                    members={members}
                    search={memberSearch}
                    onSearch={setMemberSearch}
                    loading={membersLoading}
                    error={membersError}
                    onRetry={() => void loadMembers()}
                  />
                  {/*
                Legacy members table retained temporarily for reference; the live members panel is the active view.
                */}
                  <div className="hidden">
                    {/* Stats row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-1">
                        <p className="text-[12px] text-muted-foreground font-semibold">
                          Total Members
                        </p>
                        <h3 className="text-2xl font-bold text-foreground">
                          48 Users
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Registered accounts
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-1">
                        <p className="text-[12px] text-muted-foreground font-semibold">
                          Active
                        </p>
                        <h3 className="text-2xl font-bold text-foreground">
                          42 Users
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Online past 30 days
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-1">
                        <p className="text-[12px] text-muted-foreground font-semibold">
                          Pending Invitations
                        </p>
                        <h3 className="text-2xl font-bold text-foreground">
                          6 Pending
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Awaiting invite accept
                        </p>
                      </div>
                    </div>

                    {/* Filter and Table */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-72">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search name or email..."
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            className="pl-9 h-9 text-[13px] bg-background border-border"
                          />
                        </div>
                        <Button
                          disabled={false}
                          onClick={() =>
                            toast.info(
                              "Team invitations are available from the Team workspace",
                            )
                          }
                          className="bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold w-full sm:w-auto"
                        >
                          <Plus className="h-4 w-4 mr-1.5" /> Invite Member
                        </Button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[13px]">
                          <thead>
                            <tr className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              <th className="px-4 py-3">Name</th>
                              <th className="px-4 py-3">Email Address</th>
                              <th className="px-4 py-3">Role Badge</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Joined Date</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {([] as Array<{
                              name: string;
                              email: string;
                              role: string;
                              status: string;
                              date: string;
                              initials: string;
                              color: string;
                            }>).map((m) => (
                              <tr key={m.email} className="hover:bg-muted/20">
                                <td className="px-4 py-3.5 flex items-center gap-3">
                                  <div
                                    className={`h-8 w-8 rounded-full ${m.color} text-white font-bold text-[11px] flex items-center justify-center shrink-0`}
                                  >
                                    {m.initials}
                                  </div>
                                  <span className="font-bold text-foreground">
                                    {m.name}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-muted-foreground">
                                  {m.email}
                                </td>
                                <td className="px-4 py-3.5">
                                  <Badge
                                    variant="outline"
                                    className="bg-muted text-foreground border-border font-semibold text-[11px]"
                                  >
                                    {m.role}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3.5">
                                  <StatusBadge status={m.status} />
                                </td>
                                <td className="px-4 py-3.5 text-muted-foreground">
                                  {m.date}
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground"
                                    aria-label={`Open menu for ${m.name}`}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between text-[12px] text-muted-foreground pt-3 border-t border-border">
                        <p>Showing 1-8 of 48 members</p>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[12px]"
                          >
                            Previous
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 text-[12px] bg-orange-500 text-white"
                          >
                            1
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[12px]"
                          >
                            2
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[12px]"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

            {/* 3. ROLES & PERMISSIONS TAB */}
            {false && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Predefined Access Levels
                  </h3>
                  <p className="text-[13px] text-muted-foreground">
                    Review current roles mapped against MaintainPro system
                    modules. Changes require owner authorization.
                  </p>
                </div>

                {[
                  {
                    title: "Admin",
                    desc: "Full configuration and administrative write permissions across all organization assets, facilities, service requests, and inventory modules.",
                    dotColor: "bg-orange-500",
                    modules: [
                      "Dashboard",
                      "Facilities",
                      "Assets",
                      "Work Orders",
                      "Service Requests",
                      "Preventive Maint",
                      "Inventory",
                      "Vendors",
                      "Marketplace",
                      "Reports",
                      "Settings",
                    ],
                    checked: [
                      "Dashboard",
                      "Facilities",
                      "Assets",
                      "Work Orders",
                      "Service Requests",
                      "Preventive Maint",
                      "Inventory",
                      "Vendors",
                      "Marketplace",
                      "Reports",
                      "Settings",
                    ],
                  },
                  {
                    title: "Facility Manager",
                    desc: "Configure locations, manage general preventative workflows, deploy engineers, inventory parameters, and edit standard reports.",
                    dotColor: "bg-blue-600",
                    modules: [
                      "Dashboard",
                      "Facilities",
                      "Assets",
                      "Work Orders",
                      "Service Requests",
                      "Preventive Maint",
                      "Inventory",
                      "Vendors",
                      "Marketplace",
                      "Reports",
                      "Settings",
                    ],
                    checked: [
                      "Dashboard",
                      "Facilities",
                      "Assets",
                      "Work Orders",
                      "Service Requests",
                      "Preventive Maint",
                      "Inventory",
                      "Vendors",
                      "Reports",
                    ],
                  },
                  {
                    title: "Finance",
                    desc: "Authorize contract dispatches, purchase approvals, marketplace operations, pricing audit trails, and financial reports.",
                    dotColor: "bg-indigo-600",
                    modules: [
                      "Dashboard",
                      "Facilities",
                      "Assets",
                      "Work Orders",
                      "Service Requests",
                      "Preventive Maint",
                      "Inventory",
                      "Vendors",
                      "Marketplace",
                      "Reports",
                      "Settings",
                    ],
                    checked: [
                      "Dashboard",
                      "Marketplace",
                      "Reports",
                      "Settings",
                    ],
                  },
                  {
                    title: "Staff",
                    desc: "Primary service requester role. Raise support requests, report general issues, and track active work order progress indicators.",
                    dotColor: "bg-emerald-600",
                    modules: [
                      "Dashboard",
                      "Facilities",
                      "Assets",
                      "Work Orders",
                      "Service Requests",
                      "Preventive Maint",
                      "Inventory",
                      "Vendors",
                      "Marketplace",
                      "Reports",
                      "Settings",
                    ],
                    checked: ["Dashboard", "Service Requests"],
                  },
                  {
                    title: "Technician",
                    desc: "Assigned technician workflow execution. Complete work orders, scan inventories used, edit diagnostic tasks.",
                    dotColor: "bg-amber-600",
                    modules: [
                      "Dashboard",
                      "Facilities",
                      "Assets",
                      "Work Orders",
                      "Service Requests",
                      "Preventive Maint",
                      "Inventory",
                      "Vendors",
                      "Marketplace",
                      "Reports",
                      "Settings",
                    ],
                    checked: [
                      "Dashboard",
                      "Assets",
                      "Work Orders",
                      "Preventive Maint",
                      "Inventory",
                    ],
                  },
                ].map((role) => (
                  <div
                    key={role.title}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${role.dotColor}`}
                        />
                        <h4 className="text-base font-bold text-foreground">
                          {role.title}
                        </h4>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-muted text-muted-foreground text-[10px] font-bold"
                      >
                        Read-Only System Role
                      </Badge>
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                      {role.desc}
                    </p>

                    <div className="pt-2 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        ACCESS MODULES CHECKLIST
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {role.modules.map((mod) => {
                          const isChecked = role.checked.includes(mod);
                          return (
                            <div
                              key={mod}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[12px] font-semibold ${
                                isChecked
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                  : "bg-muted/30 border-border text-muted-foreground opacity-60"
                              }`}
                            >
                              {isChecked ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />
                              )}
                              <span>{mod}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. FACILITIES TAB */}
            {activeTab === "facilities" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Facility Configuration
                    </h3>
                    <p className="text-[13px] text-muted-foreground">
                      Register, configure, and monitor physical operational
                      plants across your global organization.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/facilities")}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Add Facility
                  </Button>
                </div>

                <div className="space-y-4">
                  {((facilitiesQuery.data?.data ?? []) as SettingsFacility[]).map((facility) => (
                    <div
                      key={facility.name}
                      className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center font-bold">
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-foreground">
                              {facility.name}
                            </h4>
                            <p className="text-[12px] text-muted-foreground">
                              {facility.description ||
                                "Registered operational facility"}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={facility.status} />
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-border/60 text-[13px]">
                        <div className="flex gap-8">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              LOCATIONS
                            </p>
                            <p className="text-lg font-bold text-foreground">
                              {facility.locationCount ?? "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              MONITORED ASSETS
                            </p>
                            <p className="text-lg font-bold text-foreground">
                              —
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/facilities")}
                            className="text-[12px]"
                          >
                            Edit Facility
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => navigate("/locations")}
                            className="text-[12px] bg-slate-900 hover:bg-slate-800 text-white"
                          >
                            Manage Locations
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {facilitiesQuery.isLoading && (
                    <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                      Loading facilities…
                    </div>
                  )}
                  {facilitiesQuery.isError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive"
                    >
                      Facility data is unavailable. The facility list could not
                      be loaded from the live API.
                    </div>
                  )}
                  {!facilitiesQuery.isLoading &&
                    !facilitiesQuery.isError &&
                    (facilitiesQuery.data?.data ?? []).length === 0 && (
                      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                        No facilities have been added to this organization yet.
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* 5. BILLING TAB */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                {subscriptionQuery.isError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning"
                  >
                    Billing details could not be loaded from the live billing
                    service. Values below are unavailable.
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Billing & Subscription
                  </h3>
                  <p className="text-[13px] text-muted-foreground">
                    Manage your subscription package, corporate seat allowances,
                    and automated payment receipts.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Plan Card */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          CURRENT PLAN
                        </p>
                        <h4 className="text-xl font-bold text-foreground">
                          {subscriptionQuery.data?.plan
                            ? `${subscriptionQuery.data.plan} Plan`
                            : "Plan unavailable"}
                        </h4>
                      </div>
                      <StatusBadge
                        status={subscriptionQuery.data?.status?.toUpperCase() ?? "UNAVAILABLE"}
                      />
                    </div>

                    <div>
                      <span className="text-3xl font-extrabold text-foreground">
                        —
                      </span>
                      <span className="text-[13px] text-muted-foreground">
                        {" billing amount unavailable"}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-between text-[12px] border-t border-border/60">
                      <div>
                        <p className="text-muted-foreground">Seats Used</p>
                        <p className="font-bold text-foreground">
                          Unavailable
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Next Renewal</p>
                        <p className="font-bold text-foreground">
                          {subscriptionQuery.data?.updatedAt
                            ? new Date(
                                subscriptionQuery.data.updatedAt,
                              ).toLocaleDateString()
                            : "Unavailable"}
                        </p>
                      </div>
                    </div>
                    {canManageBilling && <Button variant="outline" className="w-full" onClick={() => navigate('/pricing')}>View plans and upgrade</Button>}
                  </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">REGISTERED PAYMENT METHOD</p>
                    <h4 className="text-lg font-bold text-foreground">
                      {paymentMethodsQuery.isLoading ? "Loading payment method…" : paymentMethod ? `${paymentMethod.brand} card` : subscriptionQuery.data?.provider ? `${subscriptionQuery.data.provider} checkout` : "No payment method recorded"}
                    </h4>
                    <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
                      {paymentMethod ? <><p className="text-[13px] font-bold text-foreground">•••• •••• •••• {paymentMethod.last4}</p><p className="text-[11px] text-muted-foreground">Expires {String(paymentMethod.expMonth).padStart(2, '0')} / {paymentMethod.expYear}</p></> : subscriptionQuery.data?.provider ? <p className="text-[13px] font-bold capitalize text-foreground">{subscriptionQuery.data.provider} provider checkout</p> : <p className="text-[13px] text-muted-foreground">No payment method has been recorded yet.</p>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 text-[13px]">
                    {paymentMethod ? <Button variant="ghost" className="text-rose-500 hover:text-rose-600 text-[12px]" onClick={() => requestConfirm({ title: "Remove payment method?", description: "This payment method will be removed from your organization billing profile.", confirmLabel: "Remove payment method", destructive: true, onConfirm: () => paymentMethodMutations.remove.mutate(paymentMethod.id, { onSuccess: () => toast.success("Payment method removed"), onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Unable to remove payment method") }) })}>Remove</Button> : null}
                    <Button disabled={!canManageBilling || hasValidSubscription} onClick={() => navigate('/checkout?plan=starter&audience=organization&cycle=monthly')} className="bg-primary text-primary-foreground text-[12px] font-semibold hover:bg-primary/90">
                      {hasValidSubscription ? "Payment method active" : paymentMethod ? "Change payment method" : "Add payment method"}
                    </Button>
                  </div>
                </div>

                </div>

                {/* Subscription Invoices History */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-foreground">
                      Subscription Invoices History
                    </h4>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-3">Billing Date</th>
                          <th className="px-4 py-3">
                            Standard Invoice Description
                          </th>
                          <th className="px-4 py-3">Amount (USD)</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">File Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {([] as Array<{
                          date: string;
                          desc: string;
                          amount: string;
                          status: string;
                        }>).map((inv) => (
                          <tr key={inv.date} className="hover:bg-muted/20">
                            <td className="px-4 py-3.5 text-muted-foreground font-semibold">
                              {inv.date}
                            </td>
                            <td className="px-4 py-3.5 text-foreground">
                              {inv.desc}
                            </td>
                            <td className="px-4 py-3.5 font-bold text-foreground">
                              {inv.amount}
                            </td>
                            <td className="px-4 py-3.5">
                              <StatusBadge status={inv.status} />
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toast.info(
                                    "Invoice PDF is available from the live invoice record",
                                  )
                                }
                                className="text-primary hover:text-primary/90 text-[12px] font-bold"
                              >
                                Download
                              </Button>
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td
                            colSpan={5}
                            className="p-8 text-center text-sm text-muted-foreground"
                          >
                            Subscription invoice history is not available from
                            the live billing API.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Notification Policies
                    </h3>
                    <p className="text-[13px] text-muted-foreground">
                      Configure standard alert routing, dispatch guidelines, and
                      digital subscription channels.
                    </p>
                  </div>
                  <Button
                    onClick={saveNotificationPolicies}
                    disabled={organizationSettings.update.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold"
                  >
                    Save Preferences
                  </Button>
                </div>

                {/* Work Orders Section */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <div>
                      <h4 className="text-[13px] font-bold text-foreground">
                        Work Orders Notification Rules
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-normal">
                        NOTIFICATION POLICY
                      </p>
                    </div>
                    <div className="flex gap-12 pr-4">
                      <span>EMAIL</span>
                      <span>IN-APP</span>
                    </div>
                  </div>

                  <div className="space-y-4 text-[13px] divide-y divide-border/60">
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="font-bold text-foreground">
                          New Assignment
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          Notify technician when a new work order is assigned
                        </p>
                      </div>
                      <div className="flex items-center gap-12 pr-2">
                        <Switch
                          checked={notifPolicies.newAssignmentEmail}
                          onCheckedChange={() =>
                            togglePolicy("newAssignmentEmail")
                          }
                        />
                        <Switch
                          checked={notifPolicies.newAssignmentInApp}
                          onCheckedChange={() =>
                            togglePolicy("newAssignmentInApp")
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <p className="font-bold text-foreground">
                          Status Change
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          Alert dispatchers and managers when progress is logged
                        </p>
                      </div>
                      <div className="flex items-center gap-12 pr-2">
                        <Switch
                          checked={notifPolicies.statusChangeEmail}
                          onCheckedChange={() =>
                            togglePolicy("statusChangeEmail")
                          }
                        />
                        <Switch
                          checked={notifPolicies.statusChangeInApp}
                          onCheckedChange={() =>
                            togglePolicy("statusChangeInApp")
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <p className="font-bold text-foreground">SLA Warning</p>
                        <p className="text-[12px] text-muted-foreground">
                          Urgent warning before response threshold expiration
                        </p>
                      </div>
                      <div className="flex items-center gap-12 pr-2">
                        <Switch
                          checked={notifPolicies.slaWarningEmail}
                          onCheckedChange={() =>
                            togglePolicy("slaWarningEmail")
                          }
                        />
                        <Switch
                          checked={notifPolicies.slaWarningInApp}
                          onCheckedChange={() =>
                            togglePolicy("slaWarningInApp")
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <p className="font-bold text-foreground">
                          Overdue Alert
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          Notify supervisors when scheduled tasks pass deadline
                        </p>
                      </div>
                      <div className="flex items-center gap-12 pr-2">
                        <Switch
                          checked={notifPolicies.overdueAlertEmail}
                          onCheckedChange={() =>
                            togglePolicy("overdueAlertEmail")
                          }
                        />
                        <Switch
                          checked={notifPolicies.overdueAlertInApp}
                          onCheckedChange={() =>
                            togglePolicy("overdueAlertInApp")
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Requests Section */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <div>
                      <h4 className="text-[13px] font-bold text-foreground">
                        Service Requests Notifications
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-normal">
                        NOTIFICATION POLICY
                      </p>
                    </div>
                    <div className="flex gap-12 pr-4">
                      <span>EMAIL</span>
                      <span>IN-APP</span>
                    </div>
                  </div>

                  <div className="space-y-4 text-[13px] divide-y divide-border/60">
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="font-bold text-foreground">
                          New Request Submitted
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          Notify facilities team when staff registers service
                          request
                        </p>
                      </div>
                      <div className="flex items-center gap-12 pr-2">
                        <Switch
                          checked={notifPolicies.newRequestSubmittedEmail}
                          onCheckedChange={() =>
                            togglePolicy("newRequestSubmittedEmail")
                          }
                        />
                        <Switch
                          checked={notifPolicies.newRequestSubmittedInApp}
                          onCheckedChange={() =>
                            togglePolicy("newRequestSubmittedInApp")
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <p className="font-bold text-foreground">
                          Status Update
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          Notify requesting staff member of ticket resolution
                          logs
                        </p>
                      </div>
                      <div className="flex items-center gap-12 pr-2">
                        <Switch
                          checked={notifPolicies.statusUpdateEmail}
                          onCheckedChange={() =>
                            togglePolicy("statusUpdateEmail")
                          }
                        />
                        <Switch
                          checked={notifPolicies.statusUpdateInApp}
                          onCheckedChange={() =>
                            togglePolicy("statusUpdateInApp")
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <p className="font-bold text-foreground">
                          Escalation Flag
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          SLA breach notification dispatched to administration
                          managers
                        </p>
                      </div>
                      <div className="flex items-center gap-12 pr-2">
                        <Switch
                          checked={notifPolicies.escalationFlagEmail}
                          onCheckedChange={() =>
                            togglePolicy("escalationFlagEmail")
                          }
                        />
                        <Switch
                          checked={notifPolicies.escalationFlagInApp}
                          onCheckedChange={() =>
                            togglePolicy("escalationFlagInApp")
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preventive Maintenance System Logs Section */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <div>
                      <h4 className="text-[13px] font-bold text-foreground">
                        Preventive Maintenance System logs
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-normal">
                        NOTIFICATION POLICY
                      </p>
                    </div>
                    <div className="flex gap-12 pr-4">
                      <span>EMAIL</span>
                      <span>IN-APP</span>
                    </div>
                  </div>

                  <div className="space-y-4 text-[13px] divide-y divide-border/60">
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="font-bold text-foreground">
                          Upcoming Schedule
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          7-day advanced overview of automated preventative
                          tasks
                        </p>
                      </div>
                      <div className="flex items-center gap-12 pr-2">
                        <Switch
                          checked={notifPolicies.upcomingScheduleEmail}
                          onCheckedChange={() =>
                            togglePolicy("upcomingScheduleEmail")
                          }
                        />
                        <Switch
                          checked={notifPolicies.upcomingScheduleInApp}
                          onCheckedChange={() =>
                            togglePolicy("upcomingScheduleInApp")
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <p className="font-bold text-foreground">Missed Task</p>
                        <p className="text-[12px] text-muted-foreground">
                          Immediate alert when routine service task fails
                          schedule check
                        </p>
                      </div>
                      <div className="flex items-center gap-12 pr-2">
                        <Switch
                          checked={notifPolicies.missedTaskEmail}
                          onCheckedChange={() =>
                            togglePolicy("missedTaskEmail")
                          }
                        />
                        <Switch
                          checked={notifPolicies.missedTaskInApp}
                          onCheckedChange={() =>
                            togglePolicy("missedTaskInApp")
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <p className="font-bold text-foreground">
                          Completion Confirmation
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          Standard status audit summary saved in regional
                          reporting
                        </p>
                      </div>
                      <div className="flex items-center gap-12 pr-2">
                        <Switch
                          checked={notifPolicies.completionConfirmationEmail}
                          onCheckedChange={() =>
                            togglePolicy("completionConfirmationEmail")
                          }
                        />
                        <Switch
                          checked={notifPolicies.completionConfirmationInApp}
                          onCheckedChange={() =>
                            togglePolicy("completionConfirmationInApp")
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. INTEGRATIONS TAB */}
            {false && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Integrations
                  </h3>
                  <p className="text-[13px] text-muted-foreground">
                    Connect and sync MaintainPro with essential corporate
                    services and productivity platforms.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* SMTP Mail Gateway */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center font-bold">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[15px] font-bold text-foreground">
                              SMTP Mail Gateway
                            </h4>
                            <StatusBadge status="ACTIVE" label="CONNECTED" />
                          </div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            COMMUNICATION
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" className="text-[13px]">
                        Configure
                      </Button>
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                      Custom mail routing configuration. Delivers instant
                      dispatch alarms and automated preventive scheduling
                      digests using private domains.
                    </p>
                  </div>

                  {/* Google Calendar */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center font-bold">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[15px] font-bold text-foreground">
                              Google Calendar
                            </h4>
                            <Badge
                              variant="outline"
                              className="bg-muted text-muted-foreground text-[10px] font-bold"
                            >
                              NOT CONNECTED
                            </Badge>
                          </div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            SCHEDULING SYNC
                          </p>
                        </div>
                      </div>
                      {/* TODO: no Google Calendar OAuth flow is wired yet. */}
                      <Button
                        onClick={() =>
                          toast.info("Google Calendar integration coming soon")
                        }
                        className="bg-foreground hover:bg-foreground/90 text-white text-[13px] font-semibold"
                      >
                        Connect Integration
                      </Button>
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                      Synchronize automated preventative maintenance tasks,
                      vendor schedules, and active technician assignments with
                      regional team calendars.
                    </p>
                  </div>

                  {/* Cloud Document Attachments */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center font-bold">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[15px] font-bold text-foreground">
                              Cloud Document Attachments
                            </h4>
                            <Badge
                              variant="outline"
                              className="bg-muted text-muted-foreground text-[10px] font-bold"
                            >
                              NOT CONNECTED
                            </Badge>
                          </div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            FILE STORAGE
                          </p>
                        </div>
                      </div>
                      {/* TODO: no cloud-storage OAuth flow is wired yet. */}
                      <Button
                        onClick={() =>
                          toast.info("Cloud storage integration coming soon")
                        }
                        className="bg-foreground hover:bg-foreground/90 text-white text-[13px] font-semibold"
                      >
                        Connect Integration
                      </Button>
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                      Connect external secure document storage to append
                      technical PDF manual guides, regional zoning certificates,
                      and audits directly onto work orders.
                    </p>
                  </div>

                  {/* Info footer box */}
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 flex items-center gap-3 text-[13px] text-indigo-400">
                    <div className="h-6 w-6 rounded-full border border-indigo-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                      ?
                    </div>
                    <span>
                      Additional integrations coming soon. Custom REST API
                      capabilities can be requested through enterprise tier
                      channels.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export const Settings = OrganizationSettings;
