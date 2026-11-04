'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { loginThunk, clearAuthError } from '@/lib/store/auth/authSlice';
import { Eye, EyeOff, LogIn, AlertCircle, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { generateCodeChallenge, generateCodeVerifier } from '@/lib/pkce';

export default function LoginFormSection() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || searchParams?.get('returnUrl') || '/';
  const { isAuthenticated, loading: isLoading, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.push(redirectPath);
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => { dispatch(clearAuthError()); };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      const response = await dispatch(loginThunk({ email: email.trim(), password })).unwrap();
      console.log("lofin users-->", response)
      if (response.user) {
        if (response.user.role === "customer") {
          router.push(redirectPath);
        } else if (response.user.role === "tenant_admin") {
          const codeVerifier = generateCodeVerifier();
          const codeChallenge = await generateCodeChallenge(codeVerifier);
          const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || "prod";
          const redirectUri =
            environment === "dev"
              ? `${window.location.origin}/auth/callback`
              : "http://kalptree.xyz/auth/callback";

          const res = await fetch("/api/auth/sso/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ codeChallenge, codeVerifier, redirectUri }),
            credentials: "include",
          });

          const ssoResponse = await res.json();
          if (ssoResponse.success) {
            window.open(redirectUri + `?code=${ssoResponse.code}`, "_blank");
            router.push("/");
          }
        }
      }
    } catch (err: any) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background font-sans">
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/premium-puppy-diapers/dachshund-pink-home-lifestyle.webp.png"
          alt="PeeKeeper Product"
          className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in duration-1000"
        />
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12 relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-8">
              {/* <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-black text-lg">
                PK
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter text-primary">
                PeeKeeper
              </span> */}

              <img src="/peekeeper-logo-new-1.png" width={200} height={200} />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-3 leading-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to continue to your account.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-6 flex items-center gap-2 text-xs font-bold text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ backgroundColor: '#ffffff' }}
                  className="w-full flex h-12 rounded-xl border border-border bg-white pl-11 pr-4 text-sm font-medium text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground block">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ backgroundColor: '#ffffff' }}
                  className="w-full flex h-12 rounded-xl border border-border bg-white pl-11 pr-12 text-sm font-medium text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label
                htmlFor="remember"
                className="text-xs font-semibold text-muted-foreground cursor-pointer"
              >
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: 'var(--primary)' }}
              className="w-full flex h-12 mt-6 items-center justify-center rounded-xl text-white px-4 py-2 text-sm font-black transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none gap-2"
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" /> Signing In...</>
              ) : (
                <>
                  Sign In
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              New to PeeKeeper?{' '}
              <Link
                href={redirectPath !== '/' ? `/signup?redirect=${encodeURIComponent(redirectPath)}` : '/signup'}
                className="text-primary font-black hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

    
    </div>
  );
}
