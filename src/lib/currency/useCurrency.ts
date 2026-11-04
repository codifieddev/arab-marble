import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  setCurrency as setCurrencyAction,
  selectActiveCurrency,
  selectBaseCurrency,
  selectEnabledCurrencies,
  selectShouldShowCurrencySwitcher,
  selectCustomExchangeRates,
} from '@/lib/store/currency/currencySlice';
import {
  CURRENCY_MAP,
  convertPrice as convertPriceHelper,
  formatCurrencyPrice,
  getExchangeRate,
} from './currency';

export function useCurrency() {
  const dispatch = useAppDispatch();
  const activeCurrency = useAppSelector(selectActiveCurrency);
  const baseCurrency = useAppSelector(selectBaseCurrency);
  const enabledCurrencies = useAppSelector(selectEnabledCurrencies);
  const shouldShowSwitcher = useAppSelector(selectShouldShowCurrencySwitcher);
  const customRates = useAppSelector(selectCustomExchangeRates);

  const currencyInfo = useMemo(() => {
    return (
      CURRENCY_MAP[activeCurrency] || {
        code: activeCurrency,
        symbol: activeCurrency === 'INR' ? '₹' : '$',
        name: activeCurrency,
        locale: activeCurrency === 'INR' ? 'en-IN' : 'en-US',
      }
    );
  }, [activeCurrency]);

  const rate = useMemo(() => {
    return getExchangeRate(activeCurrency, baseCurrency, customRates);
  }, [activeCurrency, baseCurrency, customRates]);

  const convertPrice = useCallback(
    (amountInBase: number): number => {
      return convertPriceHelper(amountInBase, activeCurrency, baseCurrency, customRates);
    },
    [activeCurrency, baseCurrency, customRates]
  );

  const formatPrice = useCallback(
    (amountInBase: number): string => {
      const converted = convertPriceHelper(amountInBase, activeCurrency, baseCurrency, customRates);
      return formatCurrencyPrice(converted, activeCurrency, currencyInfo.locale);
    },
    [activeCurrency, baseCurrency, customRates, currencyInfo.locale]
  );

  const setCurrency = useCallback(
    (code: string) => {
      dispatch(setCurrencyAction(code));
    },
    [dispatch]
  );

  return {
    currency: activeCurrency,
    symbol: currencyInfo.symbol,
    currencyInfo,
    baseCurrency,
    rate,
    enabledCurrencies,
    shouldShowSwitcher,
    convertPrice,
    formatPrice,
    setCurrency,
  };
}
