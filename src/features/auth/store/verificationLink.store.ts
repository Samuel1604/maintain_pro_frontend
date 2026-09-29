import { create } from "zustand";
import { authService } from "@/services/auth.service";

interface VerificationLinkState {
  expiresAt: number | null; // epoch ms
  isGenerating: boolean;

  // returns if still valid, otherwise generates a fresh link request
  getOrGenerate: (
    email: string,
    maxValiditySeconds?: number,
  ) => Promise<{ expiresInSeconds?: number }>;
  forceGenerate: (
    email: string,
    maxValiditySeconds?: number,
  ) => Promise<{ expiresInSeconds?: number }>;
  clear: () => void;
}

export const useVerificationLinkStore = create<VerificationLinkState>(
  (set, get) => ({
    expiresAt: null,
    isGenerating: false,

    getOrGenerate: async (email: string, maxValiditySeconds?: number) => {
      const { expiresAt, isGenerating } = get();
      if (expiresAt && Date.now() < expiresAt) {
        return {
          expiresInSeconds: Math.max(
            0,
            Math.ceil((expiresAt - Date.now()) / 1000),
          ),
        };
      }
      if (isGenerating) {
        // wait for current generation to finish
        // simple polling loop to avoid complexity
        for (let i = 0; i < 20; i++) {
          await new Promise((r) => setTimeout(r, 150));
          const s = get();
          if (!s.isGenerating) break;
        }
        const s = get();
        if (s.expiresAt && Date.now() < s.expiresAt) {
          return {
            expiresInSeconds: Math.max(
              0,
              Math.ceil((s.expiresAt - Date.now()) / 1000),
            ),
          };
        }
      }

      return get().forceGenerate(email, maxValiditySeconds);
    },

    forceGenerate: async (email: string, maxValiditySeconds?: number) => {
      set({ isGenerating: true });
      try {
        const res = await authService.regenerateVerificationLink({ email });
        // response shape: { expiresInSeconds } or nested in data
        const expiresIn =
          (res as any)?.expiresInSeconds ??
          (res as any)?.data?.expiresInSeconds ??
          null;
        const effectiveSeconds = expiresIn
          ? maxValiditySeconds
            ? Math.min(expiresIn, maxValiditySeconds)
            : expiresIn
          : (maxValiditySeconds ?? null);
        const expiresAt = effectiveSeconds
          ? Date.now() + effectiveSeconds * 1000
          : null;
        set({ expiresAt, isGenerating: false });
        return { expiresInSeconds: effectiveSeconds };
      } catch (err) {
        set({ isGenerating: false });
        throw err;
      }
    },

    clear: () => set({ expiresAt: null }),
  }),
);

export default useVerificationLinkStore;
