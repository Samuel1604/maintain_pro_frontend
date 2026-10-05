import { useMemo } from "react";

export interface TimeGreeting {
  greeting: string;
  emoji: string;
  period: "morning" | "afternoon" | "evening" | "night";
}

/**
 * Returns a time-aware greeting message and animated hand wave gesture
 * based on the user's current device location local time.
 */
export function getTimeGreeting(customName?: string): { greeting: string; period: string } {
  const hour = new Date().getHours();

  let greetingText = "Good morning";
  let period = "morning";

  if (hour >= 5 && hour < 12) {
    greetingText = "Good morning";
    period = "morning";
  } else if (hour >= 12 && hour < 17) {
    greetingText = "Good afternoon";
    period = "afternoon";
  } else if (hour >= 17 && hour < 22) {
    greetingText = "Good evening";
    period = "evening";
  } else {
    greetingText = "Good night";
    period = "night";
  }

  const namePart = customName ? `, ${customName}` : "";
  return {
    greeting: `${greetingText}${namePart}`,
    period,
  };
}

/**
 * Hook that returns the time-based greeting and hand wave gesture
 */
export function useTimeGreeting(userName?: string) {
  return useMemo(() => getTimeGreeting(userName), [userName]);
}
