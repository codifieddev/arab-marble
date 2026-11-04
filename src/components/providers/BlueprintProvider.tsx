'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import {
  fetchBlueprintThunk,
  selectActiveTheme,
  selectThemeContext,
  selectBlueprintLastFetched,
  selectBlueprintLoading,
  selectBlueprint,
  setThemeContext,
  setBlueprint,
} from '@/lib/store/blueprint';
import { setEditMode } from '@/lib/store/pages/pagesSlice';
import { selectLocalization } from '@/lib/store/blueprint';
import { initializeCurrency } from '@/lib/store/currency/currencySlice';
import { fetchAllPages } from '@/lib/store/pages/pageThunk';
import applyTheme from '@/lib/applyTheme';
import { setRuntimePermalinkConfig } from '@/lib/permalink/url-helper';
import { resolveBrandFavicon, applyFaviconToDocument } from '@/lib/brand/brand-resolver';

interface BlueprintProviderProps {
  children: ReactNode;
  context?: 'public' | 'admin';
  initialPermalinkConfig?: any;
  initialBrandAssets?: {
    logoUrl?: string;
    faviconUrl?: string;
    brandName?: string;
  };
}

const STALE_THRESHOLD = 30 * 1000; // 30s threshold

export default function BlueprintProvider({
  children,
  context = 'public',
  initialPermalinkConfig,
  initialBrandAssets,
}: BlueprintProviderProps) {
  if (initialPermalinkConfig) {
    setRuntimePermalinkConfig(initialPermalinkConfig);
  }
  const dispatch = useAppDispatch();
  const blueprint = useAppSelector(selectBlueprint);
  const activeTheme = useAppSelector(selectActiveTheme);
  const themeContext = useAppSelector(selectThemeContext);
  const lastFetched = useAppSelector(selectBlueprintLastFetched);
  const isLoading = useAppSelector(selectBlueprintLoading);
  const hasFetched = useRef(false);
  const localization = useAppSelector(selectLocalization);

  // Apply initial favicon from server immediately on mount
  useEffect(() => {
    if (initialBrandAssets?.faviconUrl) {
      applyFaviconToDocument(initialBrandAssets.faviconUrl);
    }
  }, [initialBrandAssets?.faviconUrl]);

  // Seed initial blueprint from SSR brandAssets so Redux has it immediately
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && (initialBrandAssets as any)?.payload) {
      seeded.current = true;
      dispatch(setBlueprint((initialBrandAssets as any).payload));
    }
  }, [dispatch, initialBrandAssets]);

  // Sync favicon whenever blueprint state updates
  useEffect(() => {
    if (blueprint) {
      const dynamicFavicon = resolveBrandFavicon(blueprint);
      if (dynamicFavicon) {
        applyFaviconToDocument(dynamicFavicon);
      }
    }
  }, [blueprint]);

  const lastBrandingRefresh = useRef<number>(Date.now());
  const BRANDING_THROTTLE_MS = 30000;

  // Keep branding in sync with real-time focus & visibility events (e.g. returning from admin tab)
  useEffect(() => {
    const refreshBranding = (force = false) => {
      const now = Date.now();
      if (!force && now - lastBrandingRefresh.current < BRANDING_THROTTLE_MS) {
        return;
      }
      lastBrandingRefresh.current = now;

      fetch(`/api/branding/current?t=${now}`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.branding) {
            if (data.branding.faviconUrl) {
              applyFaviconToDocument(data.branding.faviconUrl);
            }
            if (data.branding.payload) {
              dispatch(setBlueprint(data.branding.payload));
            }
          }
        })
        .catch(() => undefined);
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshBranding(false);
      }
    };

    const onFocus = () => {
      refreshBranding(false);
    };

    const onBrandUpdated = (e: any) => {
      if (e?.detail?.faviconUrl) {
        applyFaviconToDocument(e.detail.faviconUrl);
      }
      refreshBranding(true);
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('kalp-brand-updated' as any, onBrandUpdated);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('kalp-brand-updated' as any, onBrandUpdated);
    };
  }, [dispatch]);

  useEffect(() => {
    if (localization) {
      const defaultCurrency = localization.defaultCurrency || 'USD';
      const rawCurrencies = (localization as any).currencies || (localization as any).activeCurrencies || [];
      const allowedCurrencies = Array.isArray(rawCurrencies)
        ? rawCurrencies
            .filter((c: any) => typeof c === 'string' || c.enabled !== false)
            .map((c: any) => (typeof c === 'string' ? c : c.code))
            .filter(Boolean)
        : [defaultCurrency];

      dispatch(initializeCurrency({ defaultCurrency, allowedCurrencies }));
    }
  }, [dispatch, localization]);

  useEffect(() => {
    if (themeContext !== context) {
      dispatch(setThemeContext(context));
    }
  }, [dispatch, themeContext, context]);

  useEffect(() => {
    if (hasFetched.current) return;
    const shouldFetch = !lastFetched || (Date.now() - new Date(lastFetched).getTime()) > STALE_THRESHOLD;
    if (shouldFetch && !isLoading) {
      hasFetched.current = true;
      dispatch(fetchBlueprintThunk());
      dispatch(fetchAllPages());
    }
  }, [dispatch, lastFetched, isLoading]);

  useEffect(() => {
    if (activeTheme) {
      applyTheme(activeTheme, themeContext);
    }
  }, [activeTheme, themeContext]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const editParam = urlParams.get('edit');
      if (editParam === 'true') {
        dispatch(setEditMode(true));
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}
