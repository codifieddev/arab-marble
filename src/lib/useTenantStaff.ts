'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import type { RootState } from '@/lib/store/store';
import { isAuthorizedTenantStaff } from '@/lib/auth-tenant';

export function useTenantStaff(): boolean {
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return false;
  return isAuthorizedTenantStaff(user, isAuthenticated);
}
