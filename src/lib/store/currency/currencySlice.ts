import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { CURRENCY_MAP, DEFAULT_EXCHANGE_RATES } from '@/lib/currency/currency';

export interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
  enabled?: boolean;
}

interface CurrencyState {
  currentCurrency: string | null;
}

const initialState: CurrencyState = {
  currentCurrency: null,
};

export const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<string>) => {
      const code = action.payload.toUpperCase();
      state.currentCurrency = code;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('arab_marble_selected_currency', code);
        } catch {}
      }
    },
    initializeCurrency: (
      state,
      action: PayloadAction<{ defaultCurrency: string; allowedCurrencies: string[] }>
    ) => {
      const { defaultCurrency, allowedCurrencies } = action.payload;
      const def = (defaultCurrency || 'USD').toUpperCase();
      const allowed = (allowedCurrencies || []).map((c) => c.toUpperCase());

      // If user had a previously stored currency, verify it is still allowed
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('arab_marble_selected_currency')?.toUpperCase();
          if (stored && (allowed.length === 0 || allowed.includes(stored))) {
            state.currentCurrency = stored;
            return;
          }
        } catch {}
      }

      // If currentCurrency is already set and allowed, keep it
      if (state.currentCurrency && (allowed.length === 0 || allowed.includes(state.currentCurrency))) {
        return;
      }

      state.currentCurrency = def;
    },
  },
});

export const { setCurrency, initializeCurrency } = currencySlice.actions;

// Selectors
export const selectBaseCurrency = (state: RootState): string => {
  return (
    state.blueprint.payload?.localization?.defaultCurrency ||
    state.blueprint.payload?.verticals?.commerce?.configuration?.pricing?.baseCurrency ||
    'USD'
  ).toUpperCase();
};

export const selectEnabledCurrencies = createSelector(
  [
    (state: RootState) => state.blueprint.payload?.localization,
    selectBaseCurrency,
  ],
  (loc, baseCurrency): CurrencyItem[] => {
    const rawCurrencies = loc?.currencies || loc?.activeCurrencies || [];

    if (!Array.isArray(rawCurrencies) || rawCurrencies.length === 0) {
      const info = CURRENCY_MAP[baseCurrency] || { symbol: '$', name: 'US Dollar' };
      return [{ code: baseCurrency, symbol: info.symbol, name: info.name, enabled: true }];
    }

    const enabled = rawCurrencies
      .filter((c: any) => (typeof c === 'string' ? true : c.enabled !== false))
      .map((c: any) => {
        const code = (typeof c === 'string' ? c : c.code || '').toUpperCase();
        const meta = CURRENCY_MAP[code];
        const symbol = (typeof c === 'object' && c.symbol) || meta?.symbol || '$';
        const name = (typeof c === 'object' && c.name) || meta?.name || code;
        return { code, symbol, name, enabled: true };
      })
      .filter((c) => Boolean(c.code));

    if (enabled.length === 0) {
      const info = CURRENCY_MAP[baseCurrency] || { symbol: '$', name: 'US Dollar' };
      return [{ code: baseCurrency, symbol: info.symbol, name: info.name, enabled: true }];
    }

    return enabled;
  }
);

export const selectShouldShowCurrencySwitcher = (state: RootState): boolean => {
  const enabled = selectEnabledCurrencies(state);
  return enabled.length > 1;
};

export const selectActiveCurrency = (state: RootState): string => {
  const base = selectBaseCurrency(state);
  if (state.currency?.currentCurrency) {
    return state.currency.currentCurrency;
  }
  return base;
};

export const selectCustomExchangeRates = (state: RootState): Record<string, number> | undefined => {
  return (state.blueprint.payload?.localization as any)?.exchangeRates;
};

export default currencySlice.reducer;
