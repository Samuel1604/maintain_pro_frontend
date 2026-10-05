import { create } from "zustand";

export type VerificationModalMode = "picker" | "combined" | "link" | "otp";

interface VerificationModalState {
  isModalOpen: boolean;
  mode: VerificationModalMode;
  autoDismissSeconds: number | null;

  open: (mode: VerificationModalMode, autoDismissSeconds?: number | null) => void;
  closeModal: () => void;
}

export const useVerificationModalStore = create<VerificationModalState>((set) => ({
  isModalOpen: false,
  mode: "picker",
  autoDismissSeconds: null,

  open: (mode, autoDismissSeconds = null) =>
    set({
      isModalOpen: true,
      mode,
      autoDismissSeconds,
    }),

  closeModal: () => set({ isModalOpen: false, autoDismissSeconds: null, mode: "picker" }),
}));
