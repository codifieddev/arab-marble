'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
} from 'lucide-react';

import { toast } from 'sonner';

import { generateCodeChallenge, generateCodeVerifier } from '@/lib/pkce';

import { useAppDispatch } from '@/lib/store/hooks';

import { setCredentials } from '@/lib/store/auth/authSlice';
export default function TenantAdminLoginSection() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || 'arab-marble';
  const tenantDb =
    process.env.NEXT_PUBLIC_TENANT_DB ||
    process.env.TENANT_DB_NAME ||
    'kp_arab_marble';
  const getAdminBaseUrl = () => {
    const configuredUrl = process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
    const prodUrl = (process.env.NEXT_PUBLIC_PROD_ADMIN_URL || 'https://zerolive.kalptree.xyz').trim();
    if (configuredUrl && !configuredUrl.includes('localhost') && !configuredUrl.includes('127.0.0.1')) {
      return configuredUrl;
    }
    if (typeof window !== 'undefined') {
      const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      if (isLocal) {
        return configuredUrl || 'http://localhost:5177';
      }
      return prodUrl;
    }
    if (process.env.NODE_ENV === 'production') {
      return prodUrl.replace(/^http:\/\//i, 'https://');
    }
    return configuredUrl || 'http://localhost:5177';
  };
  const adminBaseUrl = getAdminBaseUrl().replace(/\/+$/, '');

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'http:' &&
      !['localhost', '127.0.0.1'].includes(window.location.hostname)
    ) {
      window.location.replace(window.location.href.replace(/^http:/, 'https:'));
    }
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setLoading(true);
    // Synchronously open a new tab during the click event to prevent browser popup blocking
    let adminTab: Window | null = null;
    try {
      adminTab = window.open('about:blank', '_blank');
    } catch {
      // ignore popup restriction
    }
    try {
      // Step 1: Authenticate with Kalp Business API via Next.js proxy
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-db': tenantDb,
          'x-tenant-slug': tenantSlug,
          'x-auth-type': 'admin',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          tenant_slug: tenantSlug,
        }),
      });
      let loginData: any = {};
      try {
        loginData = await loginRes.json();
      } catch {
        const rawText = await loginRes.text().catch(() => '');
        throw new Error(rawText || `Authentication failed (HTTP ${loginRes.status})`);
      }
      if (!loginRes.ok || !loginData.access_token) {
        throw new Error(
          loginData.detail ||
            loginData.message ||
            loginData.error ||
            'Invalid credentials or unauthorized access for this store.',
        );
      }
      const token = loginData.access_token;
      const user = loginData.session || loginData.user || {
        email: email.trim(),
        role: 'tenant_admin',
        tenant_id: loginData.session?.tenant_id || tenantDb,
      };
      // Step 2: Establish local cookies & storage so admin is logged in locally
      const maxAge = 60 * 60 * 24 * 30; // 30 days
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const secFlag = isHttps ? '; Secure' : '';
      document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secFlag}`;
      document.cookie = `${tenantDb}_auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secFlag}`;
      document.cookie = `auth_token_${tenantDb}=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secFlag}`;
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch(setCredentials({ user, token }));
      } catch (storageErr) {
        console.warn('Storage sync failed:', storageErr);
      }
      // Step 3: Generate PKCE Verifier and Challenge for SSO handoff to Kalp-Admin
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      // Step 4: Call SSO Create endpoint
      const redirectUri = `${adminBaseUrl}/auth/callback`;
      const ssoRes = await fetch('/api/auth/sso/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-tenant-db': tenantDb,
          'x-tenant-slug': tenantSlug,
        },
        body: JSON.stringify({
          redirectUri,
          codeChallenge,
          codeVerifier,
        }),
      });
      let ssoData: any = {};
      try {
        ssoData = await ssoRes.json();
      } catch {
        const rawText = await ssoRes.text().catch(() => '');
        console.warn('SSO create raw response:', rawText);
      }
      if (!ssoRes.ok || !ssoData.success || !ssoData.code) {
        if (adminTab && !adminTab.closed) {
          try { adminTab.close(); } catch {}
        }
        toast.success('Signed in locally as Admin!');
        router.push('/');
        return;
      }
      toast.success('Signed in successfully! Opening admin dashboard in a new tab...');
      const callbackUrl = `${redirectUri}?code=${encodeURIComponent(ssoData.code)}`;
      if (adminTab && !adminTab.closed) {
        adminTab.location.href = callbackUrl;
        try {
          adminTab.focus();
        } catch {}
      } else {
        window.open(callbackUrl, '_blank');
      }
      setLoading(false);
      router.push('/');
          } catch (err: any) {
      if (adminTab && !adminTab.closed) {
        try { adminTab.close(); } catch {}
      }
      console.error('[AdminLogin] Error:', err);
      const msg = err.message || 'Login failed. Please verify your credentials.';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div
      style={{ backgroundColor: '#F8F9FA' }}
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 font-sans antialiased text-[#1A1A1A]"
    >
      {/* Compact Center Card */}
      <div
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
        className="max-w-[420px] w-full rounded-2xl border shadow-xl shadow-black/5 p-6 sm:p-8"
      >
        {/* Header with Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity">
            <img
              src="/images/arab-marble-logo.svg"
              alt="Arab Marble"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Admin Login
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-medium">
            Enter your credentials to access Arab Marble admin panel
          </p>
        </div>
        {/* Error Alert */}
        {error && (
          <div
            style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', color: '#B91C1C' }}
            className="p-3 mb-4 flex items-center gap-2 text-xs font-semibold rounded-xl border"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
            <span className="truncate">{error}</span>
          </div>
        )}
        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5 block">
              Admin Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-black transition-colors">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  backgroundColor: '#FAFAF9',
                  borderColor: '#E5E7EB',
                  color: '#1A1A1A',
                }}
                className="w-full flex h-10.5 rounded-xl border pl-9 pr-3 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 disabled:opacity-50"
                placeholder="arabmarble@gmail.com"
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5 block">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-black transition-colors">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  backgroundColor: '#FAFAF9',
                  borderColor: '#E5E7EB',
                  color: '#1A1A1A',
                }}
                className="w-full flex h-10.5 rounded-xl border pl-9 pr-10 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 disabled:opacity-50"
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#171717',
              color: '#FFFFFF',
            }}
            className="w-full flex h-11 mt-5 items-center justify-center rounded-xl text-xs sm:text-sm font-black shadow-md shadow-black/20 transition-all hover:bg-black active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
        {/* Bottom Nav Links */}
        <div
          style={{ borderColor: '#F0E6D8' }}
          className="mt-6 pt-4 border-t flex items-center justify-between text-xs text-neutral-500"
        >
          <Link
            href="/"
            className="hover:text-black font-bold transition-colors"
          >
            ← Storefront
          </Link>
          <span className="text-neutral-400 font-medium">Arab Marble Est.</span>
        </div>
      </div>
    </div>
  );
}