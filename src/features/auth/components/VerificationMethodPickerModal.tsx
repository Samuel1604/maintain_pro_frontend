import { Mail, KeyRound, X } from "lucide-react";
import { useVerificationModalStore } from "../store/useVerificationModalStore";

export function VerificationMethodPickerModal() {
  const isModalOpen = useVerificationModalStore((s) => s.isModalOpen);
  const closeModal = useVerificationModalStore((s) => s.closeModal);
  const open = useVerificationModalStore((s) => s.open);

  if (!isModalOpen) return null;

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
      onClick={closeModal}
    >
      <div
        style={{
          background: "var(--card)",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "440px",
          margin: "0 16px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--foreground)",
              }}
            >
              Choose Verification Method
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.8125rem",
                color: "var(--muted-foreground)",
              }}
            >
              Select how you would like to verify your email address
            </p>
          </div>
          <button
            onClick={closeModal}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "var(--muted-foreground)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Method 1: Magic Link */}
          <button
            onClick={() => open("link")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1.5px solid var(--border)",
              background: "var(--background)",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "var(--primary-muted)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--foreground)" }}>
                Verification Link
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)", marginTop: "2px" }}>
                Generate a 1-click verification link directly on your screen
              </div>
            </div>
          </button>

          {/* Method 2: OTP Code */}
          <button
            onClick={() => open("otp")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1.5px solid var(--border)",
              background: "var(--background)",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "var(--primary-muted)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--foreground)" }}>
                6-Digit OTP Code
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)", marginTop: "2px" }}>
                Receive a numeric code and enter it directly in the application
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
