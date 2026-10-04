export const COUNTRY_CURRENCY: Record<string, string> = {
  NG: 'NGN', GH: 'GHS', KE: 'KES', ZA: 'ZAR', CI: 'XOF',
  US: 'USD', CA: 'USD', GB: 'GBP', IE: 'EUR', FR: 'EUR', DE: 'EUR',
  ES: 'EUR', IT: 'EUR', PT: 'EUR', NL: 'EUR', BE: 'EUR', JP: 'JPY',
};

export const DEFAULT_DISPLAY_CURRENCY = 'NGN';

export function currencyFromLocale(locale?: string): string {
  const region = locale?.match(/[-_]([A-Z]{2})$/i)?.[1]?.toUpperCase();
  return (region && COUNTRY_CURRENCY[region]) || DEFAULT_DISPLAY_CURRENCY;
}

export function formatMoney(amountMinor: number, currency: string): string {
  const normalized = currency.trim().toUpperCase();
  const fractionDigits = ['JPY', 'XOF'].includes(normalized) ? 0 : 2;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: normalized,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amountMinor / 10 ** fractionDigits);
}

export function formatMajorMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.trim().toUpperCase(),
  }).format(amount);
}

