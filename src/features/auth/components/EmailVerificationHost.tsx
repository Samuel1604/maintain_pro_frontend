import { EmailVerificationModal } from "./EmailVerificationModal";
import { useVerificationModalStore } from "../store/useVerificationModalStore";

export function EmailVerificationHost() {
  const isModalOpen = useVerificationModalStore((s) => s.isModalOpen);

  if (!isModalOpen) {
    return null;
  }

  return <EmailVerificationModal />;
}
