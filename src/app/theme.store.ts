import { create } from "zustand";

export type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  isAutoMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme, isManual?: boolean) => void;
  checkAutoTheme: () => void;
}

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

/**
 * Calculates whether current local time should be light mode (6:00 AM - 6:00 PM)
 * or dark mode (6:00 PM - 6:00 AM).
 */
export function getAutoThemeByLocationTime(): Theme {
  if (typeof window === "undefined") return "light";
  const hour = new Date().getHours();
  // Daytime: 6 AM to 6 PM (18) -> light theme
  // Nighttime: 6 PM to 6 AM -> dark theme
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

function readInitialTheme(): { theme: Theme; isAutoMode: boolean } {
  if (typeof localStorage !== "undefined") {
    const manualStored = localStorage.getItem("theme_manual");
    if (manualStored === "true") {
      const stored = localStorage.getItem("theme");
      if (isTheme(stored)) {
        return { theme: stored, isAutoMode: false };
      }
    }
  }

  // Default to automatic location-time based theme
  return { theme: getAutoThemeByLocationTime(), isAutoMode: true };
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  ...readInitialTheme(),

  setTheme: (theme, isManual = true) => {
    if (isManual) {
      localStorage.setItem("theme_manual", "true");
      localStorage.setItem("theme", theme);
    }
    set({ theme, isAutoMode: !isManual });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme_manual", "true");
    localStorage.setItem("theme", nextTheme);
    set({ theme: nextTheme, isAutoMode: false });
  },

  checkAutoTheme: () => {
    if (get().isAutoMode) {
      const autoTheme = getAutoThemeByLocationTime();
      if (get().theme !== autoTheme) {
        set({ theme: autoTheme });
      }
    }
  },
}));
