export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE' },
};

// Default exchange rates relative to USD (1 USD = X target currency)
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  INR: 84.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 152.0,
  AED: 3.67,
};

export function getExchangeRate(
  targetCurrency: string,
  baseCurrency = 'USD',
  customRates?: Record<string, number>
): number {
  const target = (targetCurrency || 'USD').toUpperCase();
  const base = (baseCurrency || 'USD').toUpperCase();
  if (target === base) return 1.0;

  const rates = { ...DEFAULT_EXCHANGE_RATES, ...(customRates || {}) };
  const targetRate = rates[target] ?? 1.0;
  const baseRate = rates[base] ?? 1.0;

  if (baseRate <= 0) return 1.0;
  return targetRate / baseRate;
}

export function convertPrice(
  amountInBase: number,
  targetCurrency: string,
  baseCurrency = 'USD',
  customRates?: Record<string, number>
): number {
  const numericAmount = Number(amountInBase) || 0;
  const rate = getExchangeRate(targetCurrency, baseCurrency, customRates);
  return numericAmount * rate;
}

export function formatCurrencyPrice(
  amount: number,
  currencyCode: string,
  locale?: string
): string {
  const code = (currencyCode || 'USD').toUpperCase();
  const info = CURRENCY_MAP[code];
  const targetLocale = locale || info?.locale || (code === 'INR' ? 'en-IN' : 'en-US');
  const safeAmount = Math.max(0, Number(amount) || 0);

  try {
    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: Number.isInteger(safeAmount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    const symbol = info?.symbol || '$';
    return symbol + safeAmount.toFixed(2);
  }
}
