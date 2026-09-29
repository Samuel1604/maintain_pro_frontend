import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Eye,
  Key,
  Shield,
  User as UserIcon,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/navigation/Navbar";
import { useAuthStore } from "@/app/store";
import { useUserSettings } from "@/hooks/useSettings";
import { uploadImage } from "@/api/uploads.api";
import { userApi } from "@/api/user.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserRole } from "@/types/user.types";
import { useActionConfirm } from "@/hooks/useActionConfirm";
import { authService } from "@/services/auth.service";

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  facility_manager: "Facility Manager",
  technician: "Technician",
  vendor_lead: "Vendor Lead",
  vendor_manager: "Vendor Manager",
  vendor_technician: "Vendor Technician",
  staff: "Staff",
  finance: "Finance",
};

export function UserProfile() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const userSettings = useUserSettings();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { requestConfirm, ActionConfirmDialog } = useActionConfirm();
  const [sessions, setSessions] = useState<Array<{ id: string; userAgent?: string; ipAddress?: string; location?: string; current?: boolean; lastSeenAt?: string }>>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileErrors, setProfileErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [emailWorkOrders, setEmailWorkOrders] = useState(true);
  const [emailMaintenance, setEmailMaintenance] = useState(true);
  const [emailApprovals, setEmailApprovals] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState<"DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD">("YYYY-MM-DD");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");
  const [accessibility, setAccessibility] = useState({ reducedMotion: false, highContrast: false, screenReaderAnnouncements: true });

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhone(user.phone ?? "");
    setDepartment(user.department ?? "");
  }, [user]);

  useEffect(() => {
    const value = userSettings.data;
    if (!value) return;
    setTimezone(value.timezone); setLanguage(value.language); setDateFormat(value.dateFormat); setTimeFormat(value.timeFormat); setAccessibility(value.accessibility);
  }, [userSettings.data]);

  useEffect(() => {
    void authService.sessions().then(setSessions).catch(() => toast.error("Unable to load active sessions"));
  }, []);

  const sessionRows = sessions.map((session) => ({
    ...session,
    device: session.userAgent || 'Browser session',
    ip: session.ipAddress ? `IP: ${session.ipAddress}` : 'IP unavailable',
    loc: session.location ? `Location: ${session.location}` : 'Location unavailable',
    time: session.lastSeenAt ? new Date(session.lastSeenAt).toLocaleString() : 'Recently active',
  }));

  const revokeSession = (sessionId: string) => {
    void authService.revokeSession(sessionId).then(() => {
      setSessions((current) => current.filter((session) => session.id !== sessionId));
      toast.success('Session revoked');
    }).catch(() => toast.error('Unable to revoke session'));
  };

  if (!user) return null;

  const initials =
    [user.firstName, user.lastName]
      .map((name) => name?.[0] ?? "")
      .join("")
      .toUpperCase() || "U";

  const handleSaveProfile = () => {
    const nextErrors: { firstName?: string; lastName?: string } = {};
    if (!firstName.trim()) nextErrors.firstName = "First name is required";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required";
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || undefined,
      department: department.trim() || undefined,
    });
    toast.success("Profile updated");
  };

  const handleChangePassword = async () => {
    const nextErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    if (!currentPassword)
      nextErrors.currentPassword = "Enter your current password";
    if (!newPassword) {
      nextErrors.newPassword = "Enter a new password";
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = "New password must be at least 8 characters";
    }
    if (newPassword !== confirmPassword)
      nextErrors.confirmPassword = "New passwords do not match";

    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      toast.success("Password updated");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update password"); }
  };

  const handleSavePreferences = async () => {
    try { await userSettings.update.mutateAsync({ timezone, language, dateFormat, timeFormat, accessibility }); toast.success("Personal preferences saved"); }
    catch { toast.error("Unable to save personal preferences"); }
  };

  const handleResetPreferences = async () => {
    const defaults = { timezone: "UTC", language: "en", dateFormat: "YYYY-MM-DD" as const, timeFormat: "24h" as const, accessibility: { reducedMotion: false, highContrast: false, screenReaderAnnouncements: true } };
    setTimezone(defaults.timezone); setLanguage(defaults.language); setDateFormat(defaults.dateFormat); setTimeFormat(defaults.timeFormat); setAccessibility(defaults.accessibility);
    try { await userSettings.update.mutateAsync(defaults); toast.success("Preferences reset"); }
    catch { toast.error("Unable to reset preferences"); }
  };

  const [jobTitle, setJobTitle] = useState("Organization Admin");
  const [bioNotes, setBioNotes] = useState(
    "Managing facilities, vendor dispatch, and maintenance schedules across all regional campuses. Contact for high-level operations clearance."
  );

  return (
    <div className="flex flex-col bg-background min-h-screen">
      {ActionConfirmDialog}
      <AppHeader
        title="Account Settings"
        subtitle="Update your personal information, profile photo, and public job details."
        hideQuickCreate
      />

      <div className="p-6 max-w-7xl w-full mx-auto">
        <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8 items-start">
          <TabsList className="flex flex-col h-auto w-full md:w-64 bg-card border border-border rounded-2xl p-2 gap-1 shrink-0 shadow-sm">
            <TabsTrigger
              value="profile"
              className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-[13px] font-bold data-[state=active]:bg-indigo-600/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-indigo-500/20 dark:data-[state=active]:text-indigo-400"
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-[13px] font-bold data-[state=active]:bg-indigo-600/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-indigo-500/20 dark:data-[state=active]:text-indigo-400"
            >
              <Key className="h-4 w-4" />
              Security & Sessions
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-[13px] font-bold data-[state=active]:bg-indigo-600/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-indigo-500/20 dark:data-[state=active]:text-indigo-400"
            >
              <Bell className="h-4 w-4" />
              Notification Preferences
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-[13px] font-bold data-[state=active]:bg-indigo-600/10 data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-indigo-500/20 dark:data-[state=active]:text-indigo-400"
            >
              <Eye className="h-4 w-4" />
              Appearance & Accessibility
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 w-full">
            {/* 1. PROFILE TAB */}
            <TabsContent value="profile" className="mt-0 space-y-6">
              <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">My Profile</h3>
                  <p className="text-[13px] text-muted-foreground">
                    This information will be visible to team members across your facility networks.
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <p className="text-[12px] font-bold text-foreground mb-3">Profile Picture</p>
                  <div className="flex items-center gap-4">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 800 * 1024) {
                          setPhotoError("Image must be max size 800K");
                          return;
                        }
                        setPhotoError(null);
                        void (async () => {
                          try {
                            const avatar = (await uploadImage(file, "profile-avatar")).secureUrl;
                            updateUser(await userApi.updateMe({ avatar }));
                            toast.success("Profile photo updated");
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Unable to upload profile photo");
                          }
                        })();
                      }}
                    />
                    <Avatar className="h-16 w-16 rounded-full bg-indigo-600 text-white font-bold text-lg">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold px-4 py-2 h-auto rounded-lg"
                        >
                          Upload New Image
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => requestConfirm({
                            title: "Remove profile photo?",
                            description: "Your current profile photo will be removed from your account.",
                            confirmLabel: "Remove photo",
                            destructive: true,
                            onConfirm: () => updateUser({ avatar: undefined }),
                          })}
                          className="text-rose-500 hover:text-rose-600 border-border text-[12px] font-semibold px-3 py-2 h-auto rounded-lg"
                        >
                          Remove
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">FIRST NAME</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">LAST NAME</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      EMAIL ADDRESS (READ-ONLY) <Key className="h-3 w-3 text-muted-foreground" />
                    </Label>
                    <Input
                      id="email"
                      value={user.email ?? "samuel.dane@maintainpro.io"}
                      disabled
                      className="bg-muted/40 rounded-xl font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">PHONE NUMBER</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone || "+1 (555) 019-2834"}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">JOB TITLE</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bioNotes" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">BIO & NOTES</Label>
                  <textarea
                    id="bioNotes"
                    rows={4}
                    value={bioNotes}
                    onChange={(e) => setBioNotes(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-border/60">
                  <Button variant="outline" className="rounded-xl text-[13px]">Cancel</Button>
                  <Button onClick={handleSaveProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-bold px-5">Save Changes</Button>
                </div>
              </Card>
            </TabsContent>

            {/* 2. SECURITY & SESSIONS TAB */}
            <TabsContent value="security" className="mt-0 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Security & Sessions</h3>
                <p className="text-[13px] text-muted-foreground">
                  Protect your workspace credentials, enable two-factor validation, and monitor active logins.
                </p>
              </div>

              {/* Change Password Card */}
              <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h4 className="text-base font-bold text-foreground">Change Password</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">CURRENT PASSWORD</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">NEW PASSWORD</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">CONFIRM NEW PASSWORD</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button onClick={handleChangePassword} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-bold px-5">
                    Update Password
                  </Button>
                </div>
              </Card>

              {/* Two-Factor Authentication (2FA) Card */}
              <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-foreground">Two-Factor Authentication (2FA)</h4>
                    <StatusBadge status="ACTIVE" label="ENABLED" />
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    Add an extra layer of protection to your credentials by verifying via mobile auth app.
                  </p>
                </div>

                <Switch defaultChecked />
              </Card>

              {/* Active Sessions Card */}
              <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div>
                  <h4 className="text-base font-bold text-foreground">Active Sessions</h4>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    Currently authenticated devices with access to your profile.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {sessionRows.map((s) => (
                    <div key={s.device} className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{s.device}</span>
                            {s.current && (
                              <Badge variant="outline" className="bg-info-muted text-info border-info/20 text-[9px] font-bold">
                                Current Session
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {s.ip} • {s.loc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-[12px] text-muted-foreground">{s.time}</span>
                        {!s.current && (
                          <Button variant="outline" size="sm" onClick={() => revokeSession(s.id)} className="text-destructive hover:text-destructive/90 border-border text-[12px] font-semibold">
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* 3. NOTIFICATION PREFERENCES TAB */}
            <TabsContent value="preferences" className="mt-0 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">My Notification Preferences</h3>
                <p className="text-[13px] text-muted-foreground">
                  Tweak personal overrides for specific facility activities, assignment alerts, and system warnings.
                </p>
              </div>

              <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-3 text-[13px]">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span className="font-semibold">These preferences override organization defaults for your account only.</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-3">CATEGORY & EVENT</th>
                        <th className="py-3 text-center w-28">EMAIL</th>
                        <th className="py-3 text-center w-28">IN-APP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {[
                        { cat: 'Work Orders', desc: 'Notify when a work order assigned to you gets updated or completed.', email: true, app: true },
                        { cat: 'Service Requests', desc: 'Alert when a new request is logged inside your managed facilities.', email: true, app: true },
                        { cat: 'Preventive Maintenance', desc: 'Schedules, tasks upcoming lists, and routine system logs.', email: true, app: true },
                        { cat: 'Inventory Alerts', desc: 'Warnings when spare parts drop below minimal safety stock.', email: false, app: true },
                        { cat: 'Vendors & Contacts', desc: 'Technician dispatches, annual contract notices, and compliance ratings.', email: true, app: false },
                        { cat: 'Billing & Finances', desc: 'Contract estimates, purchase confirmations, and invoice approvals.', email: false, app: true },
                        { cat: 'Security Actions', desc: 'New login alerts, credential resets, or privilege alterations.', email: true, app: true },
                      ].map((row) => (
                        <tr key={row.cat} className="hover:bg-muted/20">
                          <td className="py-4 pr-4">
                            <p className="font-bold text-foreground">{row.cat}</p>
                            <p className="text-[12px] text-muted-foreground">{row.desc}</p>
                          </td>
                          <td className="py-4 text-center">
                            <Switch defaultChecked={row.email} />
                          </td>
                          <td className="py-4 text-center">
                            <Switch defaultChecked={row.app} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-border/60">
                  <Button variant="outline" onClick={() => void handleResetPreferences()} disabled={userSettings.update.isPending} className="rounded-xl text-[13px]">Reset</Button>
                  <Button onClick={() => void handleSavePreferences()} disabled={userSettings.update.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-bold px-5">Save Preferences</Button>
                </div>
              </Card>
            </TabsContent>

            {/* 4. APPEARANCE & ACCESSIBILITY TAB */}
            <TabsContent value="appearance" className="mt-0 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Appearance & Accessibility</h3>
                <p className="text-[13px] text-muted-foreground">
                  Customize your screen view guidelines, timezone defaults, localization values, and reading layouts.
                </p>
              </div>

              {/* Theme & Style Card */}
              <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h4 className="text-base font-bold text-foreground">Theme & Style</h4>
                </div>

                <div className="space-y-4">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">DEFAULT INTERFACE THEME</Label>
                  <div className="flex flex-wrap gap-6 text-[13px] font-semibold">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="themeRadio" defaultChecked className="accent-indigo-600" />
                      <span>Light Theme</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="themeRadio" className="accent-indigo-600" />
                      <span>Dark Theme</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="themeRadio" className="accent-indigo-600" />
                      <span>Follow System Default</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">LANGUAGE</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="en-GB">English (United Kingdom)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">TIMEZONE</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">UTC-5 Eastern Standard Time (EST)</SelectItem>
                        <SelectItem value="America/Chicago">UTC-6 Central Standard Time (CST)</SelectItem>
                        <SelectItem value="America/Los_Angeles">UTC-8 Pacific Standard Time (PST)</SelectItem>
                        <SelectItem value="UTC">UTC Universal Coordinated Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">DATE FORMAT</Label>
                    <Select value={dateFormat} onValueChange={(value) => setDateFormat(value as typeof dateFormat)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Date Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM / DD / YYYY (Standard US)</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD / MM / YYYY (European)</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY - MM - DD (ISO)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">TIME FORMAT</Label>
                    <Select value={timeFormat} onValueChange={(value) => setTimeFormat(value as typeof timeFormat)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Time Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour time</SelectItem>
                        <SelectItem value="24h">24-hour time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Accessibility Parameters Card */}
              <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h4 className="text-base font-bold text-foreground">Accessibility Parameters</h4>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground text-[13px]">Reduced Motion</p>
                      <p className="text-[12px] text-muted-foreground">Disable dashboard animations, transition glows, and sidebar sliding effects.</p>
                    </div>
                    <Switch checked={accessibility.reducedMotion} onCheckedChange={(reducedMotion) => setAccessibility((value) => ({ ...value, reducedMotion }))} />
                  </div>

                  <div className="flex items-center justify-between border-t border-border/60 pt-4">
                    <div>
                      <p className="font-bold text-foreground text-[13px]">High Contrast Mode</p>
                      <p className="text-[12px] text-muted-foreground">Tweak interface borders and text weights to fulfill AA visual contrast ratio guidelines.</p>
                    </div>
                    <Switch checked={accessibility.highContrast} onCheckedChange={(highContrast) => setAccessibility((value) => ({ ...value, highContrast }))} />
                  </div>

                  <div className="flex items-center justify-between border-t border-border/60 pt-4">
                    <div>
                      <p className="font-bold text-foreground text-[13px]">Screen Reader Announcements</p>
                      <p className="text-[12px] text-muted-foreground">Prompt automatic ARIA role speech tags when critical work orders or alerts load.</p>
                    </div>
                    <Switch checked={accessibility.screenReaderAnnouncements} onCheckedChange={(screenReaderAnnouncements) => setAccessibility((value) => ({ ...value, screenReaderAnnouncements }))} />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-border/60">
                  <Button variant="outline" className="rounded-xl text-[13px]">Cancel</Button>
                  <Button disabled={userSettings.update.isPending} onClick={handleSavePreferences} className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl text-[13px] font-bold px-5">Save Settings</Button>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
