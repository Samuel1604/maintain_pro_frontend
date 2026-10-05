import { useLayoutEffect, useEffect } from "react";

import { useThemeStore } from "@/app/theme.store";

export function ThemeProvider() {
  const theme = useThemeStore((state) => state.theme);
  const checkAutoTheme = useThemeStore((state) => state.checkAutoTheme);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Periodically check local time every minute to switch theme if day turns into night or vice versa
  useEffect(() => {
    checkAutoTheme();
    const interval = setInterval(() => {
      checkAutoTheme();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkAutoTheme]);

  return null;
}
