import type { User } from '@/lib/store/auth/authSlice';
import { isTokenExpired } from '@/lib/store/auth/authSlice';

export function isAuthorizedTenantStaff(user: any, isAuthenticated?: boolean): boolean {
  if (!user) return false;
  if (isAuthenticated === false) return false;
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('token') || window.localStorage.getItem('auth_token');
    if (token && isTokenExpired(token)) return false;
  }

  const role = String(user.role || '').toLowerCase().trim();

  // 1. Must NOT be a customer or empty role
  if (!role || role === 'customer' || role === 'guest') {
    return false;
  }

  // 2. Platform / super admin has global access
  const isPlatformAdmin =
    role === 'platform_admin' ||
    role === 'platform_owner' ||
    role === 'super_admin' ||
    role === 'superadmin';

  if (isPlatformAdmin) {
    return true;
  }

  // 3. Must have an administrative / staff role
  const isStaffRole = [
    'admin',
    'tenant_admin',
    'tenant-admin',
    'staff',
    'tenant_staff',
    'tenant-staff',
    'owner',
    'manager',
  ].includes(role) || Boolean(user.isTenantOwner);

  if (!isStaffRole) {
    return false;
  }

  // 4. Must belong specifically to this tenant (arab-marble)
  const expectedTenantId = (process.env.NEXT_PUBLIC_TENANT_ID || '').toLowerCase();
  const expectedDb = (process.env.NEXT_PUBLIC_TENANT_DB || 'kp_arab_marble').toLowerCase();
  const expectedSlug = (process.env.NEXT_PUBLIC_TENANT_SLUG || 'arab-marble').toLowerCase();

  const userTenantId = String(user.tenant_id || user.tenantId || '').toLowerCase().trim();
  const userDb = String(user.dbname || user.db_name || user.tenant_db || user.tenantDb || '').toLowerCase().trim();
  const userSlug = String(user.tenant_slug || user.tenantSlug || user.slug || '').toLowerCase().trim();

  if (userTenantId === 'platform_control') {
    return true;
  }

  const isMatchingTenant =
    (userTenantId && (userTenantId === expectedTenantId || userTenantId === expectedSlug || userTenantId === expectedDb)) ||
    (userDb && userDb === expectedDb) ||
    (userSlug && userSlug === expectedSlug) ||
    userTenantId.includes('arab-marble') ||
    userTenantId.includes('arab_marble') ||
    userSlug.includes('arab-marble') ||
    userSlug.includes('arab_marble');

  if (isMatchingTenant) {
    return true;
  }

  // Fallback check in localStorage for selected_tenant (e.g. if synced from admin)
  if (typeof window !== 'undefined') {
    try {
      const storedTenant = window.localStorage.getItem('selected_tenant');
      if (storedTenant) {
        const parsed = JSON.parse(storedTenant);
        const sSlug = String(parsed?.slug || parsed?.mongo_db_name || (typeof parsed === 'string' ? parsed : '')).toLowerCase();
        if (sSlug === expectedSlug || sSlug === expectedDb || sSlug.includes('arab-marble') || sSlug.includes('arab_marble')) {
          return true;
        }
      }
    } catch {
      // ignore
    }
  }

  return false;
}
