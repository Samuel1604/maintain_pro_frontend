import { useEffect, useState } from "react";
import { Crown, Mail, Plus, Users } from "lucide-react";
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
import { FeedbackAlert } from "@/components/feedback/FeedbackAlert";

import { invitationService } from "@/services/invitation.service";
import { httpClient } from "@/api/httpClient";
import { ENDPOINTS } from "@/api/endpoints";

const MEMBER_ROLES = [
  { label: "Vendor Technician", value: "vendor_technician" },
  { label: "Vendor Manager", value: "vendor_manager" },
];
type VendorTeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isTeamLead?: boolean;
  invitationId?: string;
  activeWorkOrders?: number;
  joinedAt?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function VendorTeam({ embedded = false }: { embedded?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const memberRoles = user?.role === "vendor_manager" ? [MEMBER_ROLES[0]] : MEMBER_ROLES;

  const [apiMembers, setApiMembers] = useState<VendorTeamMember[]>([]);
  const members = apiMembers;

  const teamLead: VendorTeamMember = {
    id: user?.id ?? "vendor-lead",
    name: `${user?.firstName ?? "Team"} ${user?.lastName ?? "Lead"}`,
    email: user?.email ?? "",
    role: "Team Lead",
    status: "active",
    isTeamLead: true,
    joinedAt: user?.createdAt,
  };

  const [activeInvitations, setActiveInvitations] = useState<
    Record<
      string,
      {
        url: string;
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
    email?: string;
    emailSent?: boolean;
  } | null>(null);

  const allMembers = [
    teamLead,
    ...members.filter(
      (member) =>
        member.id !== teamLead.id && member.email.toLowerCase() !== teamLead.email.toLowerCase(),
    ),
  ];
  useEffect(() => {
    void httpClient
      .get<
        | Array<{
            id?: string;
            _id?: string;
            firstName?: string;
            lastName?: string;
            name?: string;
            email: string;
            role: string;
            isActive?: boolean;
            createdAt?: string;
          }>
        | {
            data?: Array<{
              id?: string;
              _id?: string;
              firstName?: string;
              lastName?: string;
              name?: string;
              email: string;
              role: string;
              isActive?: boolean;
              createdAt?: string;
            }>;
          }
      >(ENDPOINTS.USERS)
      .then((result) => {
        const records = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
            ? result.data
            : [];
        setApiMembers(
          records.map(
            (member) =>
              ({
                id: member.id ?? member._id ?? member.email,
                name:
                  member.name ??
                  (`${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || member.email),
                email: member.email,
                role: member.role,
                status: member.isActive === false ? "inactive" : "active",
                isTeamLead: member.role === "vendor_lead",
                joinedAt: member.createdAt,
              }) as VendorTeamMember,
          ),
        );
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Unknown server error";
        toast.error(`Unable to load vendor team: ${message}`);
      });
  }, []);

  const handleReInvite = async (member: VendorTeamMember & { invitationId?: string }) => {
    const existing = activeInvitations[member.email.toLowerCase()];
    const isWithin15Mins = existing && Date.now() - existing.createdAt < 15 * 60 * 1000;

    // If credentials are still within 15 mins, just pop up the existing modal
    if (isWithin15Mins && existing) {
      const minsLeft = Math.ceil((15 * 60 * 1000 - (Date.now() - existing.createdAt)) / 60000);
      setForm({
        firstName: existing.firstName || member.name.split(" ")[0] || "User",
        lastName: existing.lastName || member.name.split(" ").slice(1).join(" ") || "Member",
        email: member.email,
        role: existing.role || MEMBER_ROLES[0].value,
      });
      setInviteResultData({
        url: existing.url,
        email: member.email,
        emailSent: existing.emailSent,
      });
      setDialogOpen(true);
      toast.info(`Credentials still valid — expires in ${minsLeft} min`);
      return;
    }

    // Expired (or first time from session restart): call backend resendInvitation if we have the ID
    const invId =
      user?.role === "vendor_lead" ? member.invitationId || existing?.invitationId : undefined;
    const nameParts = member.name.trim().split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "Member";
    const roleValue =
      MEMBER_ROLES.find((r) => r.label === member.role)?.value || MEMBER_ROLES[0].value;

    try {
      setIsSubmitting(true);
      let result: Awaited<ReturnType<typeof invitationService.resendInvitation>>;
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
        `${window.location.origin}/accept-invitation?token=${result.invitationToken || ""}`;
      const emailSent = result.emailSent ?? false;

      const record = {
        url: generatedUrl,
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
        email: member.email,
        emailSent,
      });
      setDialogOpen(true);
      toast.success(`Fresh 15-minute invitation generated for ${member.email}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to re-invite";
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
    const exists = allMembers.some((m) => m.email.toLowerCase() === form.email.toLowerCase());
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
      const emailSent = (result as any).emailSent ?? false;

      const invitationId = result._id;

      const record = {
        url: generatedUrl,
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
        email: form.email,
        emailSent,
      });

      setApiMembers((current) => [
        ...current,
        {
          id: invitationId || `invited-${Date.now()}`,
          invitationId,
          name,
          email: form.email,
          role: form.role,
          status: "invited",
        },
      ]);

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
      const errorMessage = err instanceof Error ? err.message : "Failed to send invitation";
      setFormError({ message: errorMessage, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      {!embedded && <Navbar title="Team Management" hideQuickCreate />}

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
            <h3 className="text-[13px] font-bold text-foreground">Vendor Lead</h3>
            <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
              Primary tenant owner. Full access to marketplace, bids, and financial operations.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-[13px] font-bold text-foreground">Vendor Manager</h3>
            <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
              Operations and assignment head. Can assign work orders and dispatch technicians.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-[13px] font-bold text-foreground">Vendor Technician</h3>
            <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
              Field execution roles. Access restricted specifically to assigned dispatches and
              safety protocols.
            </p>
          </div>
        </div>

        {/* ── Info Notice ── */}
        <div className="flex items-start gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-[13px] text-blue-400 dark:text-blue-300">
          <span className="font-semibold">Invitation Flow:</span> Vendor Lead/Manager can invite
          Vendor Managers and Technicians. Invites are dispatched via email sign-off.
        </div>

        {/* ── Team Table ── */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="hidden px-6 py-3.5 sm:table-cell">Email Address</th>
                  <th className="px-6 py-3.5">System Role</th>
                  <th className="px-3 py-3.5 sm:px-6">Status</th>
                  <th className="hidden px-6 py-3.5 lg:table-cell">Active WOs</th>
                  <th className="hidden px-6 py-3.5 lg:table-cell">Joined Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {allMembers.map((member, idx) => {
                  const activeInv = activeInvitations[member.email.toLowerCase()];
                  const isWithin15Mins =
                    activeInv && Date.now() - activeInv.createdAt < 15 * 60 * 1000;
                  const isInvited = member.status === "invited";

                  return (
                    <tr key={member.id} className="hover:bg-muted/20 transition-colors">
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
                          <Badge variant="outline">{member.role.replaceAll("_", " ")}</Badge>
                        )}
                      </td>
                      <td className="px-3 py-4 sm:px-6">
                        <StatusBadge status={isInvited ? "PENDING" : "ACTIVE"} />
                      </td>
                      <td className="hidden px-6 py-4 text-muted-foreground lg:table-cell">
                        {isInvited ? "—" : (member.activeWorkOrders ?? "—")}
                      </td>
                      <td className="hidden px-6 py-4 text-muted-foreground lg:table-cell">
                        {isInvited
                          ? "Pending Auth"
                          : member.joinedAt
                            ? new Date(member.joinedAt).toLocaleDateString()
                            : "—"}
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
                          <span className="text-[12px] font-medium text-muted-foreground">
                            Managed by administrator
                          </span>
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
              <FeedbackAlert variant={formError.variant}>{formError.message}</FeedbackAlert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">First name *</Label>
                <Input
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Last name</Label>
                <Input
                  placeholder="Smith"
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Work email *</Label>
              <Input
                type="email"
                placeholder="jane@yourcompany.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {memberRoles.map((r) => (
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
                Temporary login details are sent directly to the invitee. They are never shown in
                this portal.
              </p>
            </div>

            {inviteResultData && !inviteResultData.emailSent && (
              <div className="mt-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                The invitation was created, but the login email could not be delivered. The
                temporary password is not available to the inviter. Ask the invitee to contact an
                administrator before retrying the invitation.
              </div>
            )}

            {inviteResultData && inviteResultData.emailSent && (
              <div className="mt-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-200">
                Temporary login details were sent directly to {inviteResultData.email}.
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {inviteResultData ? "Done" : "Cancel"}
              </Button>
              <Button type="submit" disabled={!form.firstName || !form.email || isSubmitting}>
                {isSubmitting ? "Sending..." : inviteResultData ? "Invite Another" : "Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
