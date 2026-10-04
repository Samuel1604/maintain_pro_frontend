import { useEffect, useState } from "react";
import { Crown, Mail, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { AppHeader as Navbar } from "@/components/navigation/Navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/app/store";
import { useActionConfirm } from "@/hooks/useActionConfirm";
import { FeedbackAlert } from "@/components/feedback/FeedbackAlert";

import { invitationService } from "@/services/invitation.service";
import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

const MEMBER_ROLES = [
  { label: "Vendor Technician", value: "vendor_technician" },
  { label: "Vendor Manager", value: "vendor_manager" },
];
type VendorTeamMember = { id: string; name: string; email: string; role: string; status: string; isTeamLead?: boolean; invitationId?: string };

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function VendorTeam() {
  const user = useAuthStore((s) => s.user);
  const { requestConfirm, ActionConfirmDialog } = useActionConfirm();

  const [apiMembers, setApiMembers] = useState<VendorTeamMember[]>([]);
  const members = apiMembers;

  const teamLead: VendorTeamMember = {
    id: user?.id ?? "vendor-lead",
    name: `${user?.firstName ?? "Team"} ${user?.lastName ?? "Lead"}`,
    email: user?.email ?? "",
    role: "Team Lead",
    status: "active",
    isTeamLead: true,
  };

  const [activeInvitations, setActiveInvitations] = useState<
    Record<
      string,
      {
        url: string;
        tempPassword?: string;
        emailSent: boolean;
        createdAt: number;
        firstName: string;
        lastName: string;
        role: string;
        invitationId?: string;
      }
    >
  >({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<{
    message: string;
    variant: "warning" | "error";
  } | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: MEMBER_ROLES[0].value,
  });
  const [inviteResultData, setInviteResultData] = useState<{
    url?: string;
    tempPassword?: string;
    email?: string;
    emailSent?: boolean;
  } | null>(null);

  const allMembers = [teamLead, ...members];
  useEffect(() => {
    void apiClient
      .get<
        Array<{
          id?: string;
          _id?: string;
          firstName?: string;
          lastName?: string;
          name?: string;
          email: string;
          role: string;
          isActive?: boolean;
        }>
      >(ENDPOINTS.USERS)
      .then((result) => {
        setApiMembers(
          (result ?? []).map(
            (member) =>
              ({
                id: member.id ?? member._id ?? member.email,
                name:
                  member.name ??
                  (`${member.firstName ?? ""} ${
                    member.lastName ?? ""
                  }`.trim() ||
                    member.email),
                email: member.email,
                role: member.role,
                status: member.isActive === false ? "inactive" : "active",
                isTeamLead: member.role === "vendor_lead",
              } as VendorTeamMember),
          ),
        );
      })
      .catch(() => toast.error("Unable to load vendor team"));
  }, []);

  const handleReInvite = async (
    member: VendorTeamMember & { invitationId?: string },
  ) => {
    const existing = activeInvitations[member.email.toLowerCase()];
    const isWithin15Mins =
      existing && Date.now() - existing.createdAt < 15 * 60 * 1000;

    // If credentials are still within 15 mins, just pop up the existing modal
    if (isWithin15Mins && existing) {
      const minsLeft = Math.ceil(
        (15 * 60 * 1000 - (Date.now() - existing.createdAt)) / 60000,
      );
      setForm({
        firstName: existing.firstName || member.name.split(" ")[0] || "User",
        lastName:
          existing.lastName ||
          member.name.split(" ").slice(1).join(" ") ||
          "Member",
        email: member.email,
        role: existing.role || MEMBER_ROLES[0].value,
      });
      setInviteResultData({
        url: existing.url,
        tempPassword: existing.tempPassword,
        email: member.email,
        emailSent: existing.emailSent,
      });
      setDialogOpen(true);
      toast.info(`Credentials still valid — expires in ${minsLeft} min`);
      return;
    }

    // Expired (or first time from session restart): call backend resendInvitation if we have the ID
    const invId = member.invitationId || existing?.invitationId;
    const nameParts = member.name.trim().split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "Member";
    const roleValue =
      MEMBER_ROLES.find((r) => r.label === member.role)?.value ||
      MEMBER_ROLES[0].value;

    try {
      setIsSubmitting(true);
      let result: Awaited<
        ReturnType<typeof invitationService.resendInvitation>
      >;
      if (invId) {
        result = await invitationService.resendInvitation(invId);
      } else {
        result = await invitationService.sendInvitation({
          email: member.email,
          firstName,
          lastName,
          role: roleValue,
        });
      }

      const generatedUrl =
        result.invitationUrl ||
        `${window.location.origin}/accept-invitation?token=${
          result.invitationToken || ""
        }`;
      const tempPassword = result.temporaryPassword;
      const emailSent = result.emailSent ?? false;

      const record = {
        url: generatedUrl,
        tempPassword,
        emailSent,
        createdAt: Date.now(),
        firstName,
        lastName,
        role: member.role,
        invitationId: result._id || invId,
      };

      setActiveInvitations((prev) => ({
        ...prev,
        [member.email.toLowerCase()]: record,
      }));
      setForm({ firstName, lastName, email: member.email, role: roleValue });
      setInviteResultData({
        url: generatedUrl,
        tempPassword,
        email: member.email,
        emailSent,
      });
      setDialogOpen(true);
      toast.success(`Fresh 15-minute invitation generated for ${member.email}`);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to re-invite";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.firstName || !form.email) return;
    const name = `${form.firstName} ${form.lastName}`.trim();
    const exists = allMembers.some(
      (m) => m.email.toLowerCase() === form.email.toLowerCase(),
    );
    if (exists && !inviteResultData) {
      setFormError({
        message: "A team member with this email already exists",
        variant: "warning",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await invitationService.sendInvitation({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
      });

      const generatedUrl =
        (result as any).invitationUrl ||
        `${window.location.origin}/accept-invitation?token=${
          (result as any).invitationToken || ""
        }`;
      const tempPassword = (result as any).temporaryPassword;
      const emailSent = (result as any).emailSent ?? false;

      const invitationId = result._id;

      const record = {
        url: generatedUrl,
        tempPassword,
        emailSent,
        createdAt: Date.now(),
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        invitationId,
      };

      setActiveInvitations((prev) => ({
        ...prev,
        [form.email.toLowerCase()]: record,
      }));

      setInviteResultData({
        url: generatedUrl,
        tempPassword,
        email: form.email,
        emailSent,
      });

      setApiMembers((current) => [...current, { id: invitationId || `invited-${Date.now()}`, invitationId, name, email: form.email, role: form.role, status: "invited" }]);

      if (emailSent) {
        toast.success(`Invitation email sent to ${form.email}`);
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          role: MEMBER_ROLES[0].value,
        });
        setDialogOpen(false);
      } else {
        toast.info(
          `No mail delivery service configured. Displaying temp credentials for ${form.email}`,
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send invitation";
      setFormError({ message: errorMessage, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = (member: VendorTeamMember) => {
    requestConfirm({
      title: "Remove team member?",
      description: `${member.name} will lose access to your vendor portal.`,
      confirmLabel: "Remove",
      destructive: true,
      onConfirm: () => {
        toast.info("Team member removal is not available yet");
      },
    });
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      {ActionConfirmDialog}
      <Navbar title="Team Management" hideQuickCreate />

      <div className="px-4 sm:px-8 py-6 space-y-6">
        <PageHeader
          className="rounded-xl border border-border"
          title="Team Management"
          subtitle="Manage technician dispatches and system permission scopes"
          actions={
            <Button
              onClick={() => {
                setInviteResultData(null);
                setDialogOpen(true);
              }}
              className="flex w-full items-center justify-center gap-2 text-[13px] font-semibold sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Invite Team Member
            </Button>
          }
        />

        {/* ── Permission Scopes Cards ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-[13px] font-bold text-foreground">
              Vendor Lead
            </h3>
            <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
              Primary tenant owner. Full access to marketplace, bids, and
              financial operations.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-[13px] font-bold text-foreground">
              Vendor Manager
            </h3>
            <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
              Operations and assignment head. Can assign work orders and
              dispatch technicians.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-[13px] font-bold text-foreground">
              Vendor Technician
            </h3>
            <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
              Field execution roles. Access restricted specifically to assigned
              dispatches and safety protocols.
            </p>
          </div>
        </div>

        {/* ── Info Notice ── */}
        <div className="flex items-start gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-[13px] text-blue-400 dark:text-blue-300">
          <span className="font-semibold">Invitation Flow:</span> Vendor
          Lead/Manager can invite Vendor Managers and Technicians. Invites are
          dispatched via email sign-off.
        </div>

        {/* ── Team Table ── */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="hidden px-6 py-3.5 sm:table-cell">
                    Email Address
                  </th>
                  <th className="px-6 py-3.5">System Role</th>
                  <th className="px-3 py-3.5 sm:px-6">Status</th>
                  <th className="hidden px-6 py-3.5 lg:table-cell">
                    Active WOs
                  </th>
                  <th className="hidden px-6 py-3.5 lg:table-cell">
                    Joined Date
                  </th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {allMembers.map((member, idx) => {
                  const activeInv =
                    activeInvitations[member.email.toLowerCase()];
                  const isWithin15Mins =
                    activeInv &&
                    Date.now() - activeInv.createdAt < 15 * 60 * 1000;
                  const isInvited = member.status === "invited";

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-3 py-4 font-semibold text-foreground sm:px-6">
                        {member.name}
                      </td>
                      <td className="hidden px-6 py-4 text-muted-foreground sm:table-cell">
                        {member.email || "—"}
                      </td>
                      <td className="px-3 py-4 sm:px-6">
                        {member.isTeamLead ? (
                          <span className="inline-block rounded px-2.5 py-1 text-[11px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            Team Lead
                          </span>
                        ) : (
                          <Select
                            value={
                              member.role.toLowerCase().includes("manager")
                                ? "vendor_manager"
                                : "vendor_technician"
                            }
                            onValueChange={(newRoleValue) => {
                              const newRoleLabel =
                                newRoleValue === "vendor_manager"
                                  ? "Vendor Manager"
                                  : "Vendor Technician";
                              toast.info("Updating team roles is not available yet");
                            }}
                          >
                            <SelectTrigger className="h-8 w-[112px] text-[12px] font-medium bg-background border-border sm:w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vendor_manager">
                                Vendor Manager
                              </SelectItem>
                              <SelectItem value="vendor_technician">
                                Vendor Technician
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="px-3 py-4 sm:px-6">
                        <StatusBadge
                          status={isInvited ? "PENDING" : "ACTIVE"}
                        />
                      </td>
                      <td className="hidden px-6 py-4 text-muted-foreground lg:table-cell">
                        {isInvited ? "—" : `${idx % 3} assigned`}
                      </td>
                      <td className="hidden px-6 py-4 text-muted-foreground lg:table-cell">
                        {isInvited ? "Pending Auth" : `Jan 12, 2024`}
                      </td>
                      <td className="px-3 py-4 text-right sm:px-6">
                        {member.isTeamLead ? (
                          <span className="text-[12px] font-medium text-muted-foreground">
                            Owner
                          </span>
                        ) : isInvited ? (
                          <button
                            onClick={() => handleReInvite(member as any)}
                            className="font-semibold text-warning hover:underline text-[12px]"
                          >
                            Resend
                          </button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(member)}
                            className="h-8 px-2 text-destructive hover:bg-destructive/10 text-[12px] font-semibold"
                          >
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (open) {
            setFormError(null);
          } else {
            setInviteResultData(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-3 pt-1">
            {formError && (
              <FeedbackAlert variant={formError.variant}>
                {formError.message}
              </FeedbackAlert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">First name *</Label>
                <Input
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Last name</Label>
                <Input
                  placeholder="Smith"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Work email *</Label>
              <Input
                type="email"
                placeholder="jane@yourcompany.com"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMBER_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                An invitation email will be dispatched. If no mail provider is
                wired, on-screen credentials will be displayed here (valid for
                15 minutes).
              </p>
            </div>

            {inviteResultData && !inviteResultData.emailSent && (
              <div className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">
                    Temporary Member Credentials
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                    Expires in 15 mins
                  </span>
                </div>

                <div className="text-xs space-y-2 bg-background/90 p-2.5 rounded-lg border border-amber-500/20">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Email:</span>
                    <span className="font-medium text-foreground font-mono">
                      {inviteResultData.email}
                    </span>
                  </div>

                  {inviteResultData.tempPassword && (
                    <div className="flex justify-between items-center text-muted-foreground pt-2 border-t border-border/40">
                      <span>Temp Password:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="bg-muted px-2 py-0.5 rounded font-mono border border-border text-foreground font-bold">
                          {inviteResultData.tempPassword}
                        </code>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-6 px-2 text-[11px]"
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              inviteResultData.tempPassword!,
                            );
                            toast.success("Temporary password copied!");
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}

                  {inviteResultData.url && (
                    <div className="flex flex-col gap-1 pt-2 border-t border-border/40">
                      <span className="text-muted-foreground">
                        Accept Link:
                      </span>
                      <div className="flex gap-1.5">
                        <Input
                          readOnly
                          value={inviteResultData.url}
                          className="text-xs font-mono bg-background border-amber-500/20 h-7"
                        />
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] h-7 px-2"
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              inviteResultData.url!,
                            );
                            toast.success("Invitation link copied!");
                          }}
                        >
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {inviteResultData ? "Done" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={!form.firstName || !form.email || isSubmitting}
              >
                {isSubmitting
                  ? "Sending..."
                  : inviteResultData
                  ? "Invite Another"
                  : "Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
