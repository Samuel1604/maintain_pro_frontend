import { EmailVerificationModal } from "./EmailVerificationModal";
import { VerificationMethodPickerModal } from "./VerificationMethodPickerModal";
import { useVerificationModalStore } from "../store/useVerificationModalStore";

export function EmailVerificationHost() {
  const isModalOpen = useVerificationModalStore((s) => s.isModalOpen);
  const mode = useVerificationModalStore((s) => s.mode);

  if (!isModalOpen) {
    return null;
  }

  if (mode === "picker") return <VerificationMethodPickerModal />;

  return <EmailVerificationModal />; // Handles 'link', 'otp', and 'combined'
}
