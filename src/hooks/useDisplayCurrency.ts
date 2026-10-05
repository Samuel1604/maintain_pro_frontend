import { useMemo } from "react";
import { useOrganizationSettings } from "./useSettings";
import { useAuthStore } from "@/app/store";
import {
  currencyFromLocale,
  DEFAULT_DISPLAY_CURRENCY,
  formatMajorMoney,
  formatMoney,
} from "@/lib/money";

export function useDisplayCurrency() {
  const role = useAuthStore((state) => state.user?.role);
  const detectedCurrency = useAuthStore((state) => state.user?.displayCurrency);
  const settings = useOrganizationSettings(
    role !== "vendor_lead" && role !== "vendor_manager" && role !== "vendor_technician",
  );
  const currency = useMemo(() => {
    const configured = detectedCurrency || settings.data?.currency?.trim().toUpperCase();
    if (configured) return configured;
    return currencyFromLocale(typeof navigator === "undefined" ? undefined : navigator.language);
  }, [detectedCurrency, settings.data?.currency]);

  return {
    currency: currency || DEFAULT_DISPLAY_CURRENCY,
    isLoading: settings.isLoading,
    formatMinor: (amountMinor: number, sourceCurrency = currency) =>
      formatMoney(amountMinor, sourceCurrency),
    formatMajor: (amount: number, sourceCurrency = currency) =>
      formatMajorMoney(amount, sourceCurrency),
  };
}
