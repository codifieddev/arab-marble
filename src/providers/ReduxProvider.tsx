'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store/store';
import { fetchMeThunk, setAuth, logoutLocal, isTokenExpired, clearLocalStorageAuth } from '@/lib/store/auth/authSlice';

interface ReduxProviderProps {
  children: ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    // 1. Rehydrate auth state on refresh only if a valid, unexpired token exists
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('token') || localStorage.getItem('auth_token'))
      : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (token) {
      if (isTokenExpired(token)) {
        clearLocalStorageAuth();
        store.dispatch(logoutLocal());
      } else {
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            store.dispatch(setAuth({ access_token: token, expires_at: '', session: user }));
          } catch {
            // ignore JSON parse error
          }
        }
        // Always revalidate with backend /api/auth/me
        store.dispatch(fetchMeThunk());
      }
    } else {
      clearLocalStorageAuth();
    }

    // 2. Global listener for 401 unauthorized responses
    const handleUnauthorized = () => {
      clearLocalStorageAuth();
      store.dispatch(logoutLocal());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
      }
    };
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
