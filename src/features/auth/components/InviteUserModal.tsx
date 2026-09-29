import { useEffect, useRef, useState } from "react";
import { UserPlus, X, Copy, Check, AlertTriangle, ShieldAlert } from "lucide-react";
import { invitationApi, type TempInvitationResult } from "@/api/invitation.api";
import { useAuthStore } from "@/app/store";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilityId?: string;
  facilityName?: string;
}

export function InviteUserModal({ isOpen, onClose, facilityId, facilityName }: InviteUserModalProps) {
  const actorRole = useAuthStore((s) => s.user?.role);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState(
    actorRole === "vendor_lead" ? "vendor_manager" : "facility_manager",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<TempInvitationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Filter allowed roles based on actor
  const availableRoles =
    actorRole === "vendor_lead"
      ? [
          { value: "vendor_manager", label: "Vendor Manager" },
          { value: "vendor_technician", label: "Vendor Technician" },
        ]
      : [
          { value: "facility_manager", label: "Facility Manager" },
          { value: "technician", label: "Technician" },
          { value: "finance", label: "Finance" },
          { value: "staff", label: "Staff" },
        ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !firstName || !lastName || !role) return;

    setLoading(true);
    setError(null);

    invitationApi
      .createTempInvitation({ email, firstName, lastName, role, ...(facilityId ? { facilityId } : {}) })
      .then((res) => {
        // res.data or res direct based on API client wrapper
        const data = (res as any)?.data ?? res;
        setCreatedResult(data);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || "Failed to create invitation";
        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleCopy() {
    if (!createdResult) return;
    const text = `Email: ${createdResult.email}\nTemporary Password: ${createdResult.temporaryPassword}\nNote: Password expires in 15 minutes.`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 3000);
    });
  }

  function handleResetAndClose() {
    setEmail("");
    setFirstName("");
    setLastName("");
    setError(null);
    setCreatedResult(null);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
      }}
      onClick={handleResetAndClose}
    >
      <div
        style={{
          background: "var(--card)",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "500px",
          margin: "0 16px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserPlus size={20} color="var(--primary-foreground)" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--primary-foreground)" }}>
                {facilityName ? `Invite Facility Manager for ${facilityName}` : "Invite New User"}
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                Generate 15-minute temporary credentials
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--primary-foreground)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px 28px" }}>
          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "color-mix(in oklch, var(--destructive) 10%, transparent)",
                border: "1px solid color-mix(in oklch, var(--destructive) 30%, transparent)",
                color: "var(--destructive)",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          {!createdResult ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--foreground)",
                    }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--foreground)",
                    }}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "var(--foreground)",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "var(--foreground)",
                  }}
                >
                  Assigned Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    fontSize: "0.9rem",
                    background: "var(--background)",
                  }}
                >
                  {availableRoles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "8px",
                  padding: "11px 16px",
                  borderRadius: "6px",
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Generating Credentials..." : "Generate Invitation"}
              </button>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "color-mix(in oklch, var(--warning) 12%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--warning) 35%, transparent)",
                  color: "var(--warning)",
                  fontSize: "0.8125rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>Important:</strong> Save or copy these temporary credentials. If the user does not login within <strong>15 minutes</strong>, the account will be automatically purged.
                </div>
              </div>

              <div
                style={{
                  background: "var(--muted)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", fontWeight: 700 }}>
                    User Email
                  </span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--foreground)" }}>
                    {createdResult.email}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", fontWeight: 700 }}>
                    Temporary Password
                  </span>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      color: "var(--primary)",
                      letterSpacing: "1px",
                    }}
                  >
                    {createdResult.temporaryPassword}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1.5px solid var(--primary)",
                  background: copied ? "color-mix(in oklch, var(--success) 12%, transparent)" : "transparent",
                  color: copied ? "var(--success)" : "var(--primary)",
                  borderColor: copied ? "var(--success)" : "var(--primary)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied Credentials to Clipboard!" : "Copy Credentials"}
              </button>

              <button
                onClick={handleResetAndClose}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  background: "var(--foreground)",
                  color: "var(--background)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
