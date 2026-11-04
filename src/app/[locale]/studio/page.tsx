"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Loader2, LogOut, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function StudioPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";

    const adminBaseUrl = (() => {
    const configuredUrl = process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
    const prodUrl = (process.env.NEXT_PUBLIC_PROD_ADMIN_URL || 'https://zerolive.kalptree.xyz').trim();
    if (configuredUrl && !configuredUrl.includes('localhost') && !configuredUrl.includes('127.0.0.1')) {
      return configuredUrl;
    }
    if (typeof window !== 'undefined') {
      const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      if (isLocal) return configuredUrl || 'http://localhost:5177';
      return prodUrl;
    }
    if (process.env.NODE_ENV === 'production') return prodUrl;
    return configuredUrl || 'http://localhost:5177';
  })().replace(/\/+$/, '');

  const [authStatus, setAuthStatus] = useState<"checking" | "authorized" | "denied" | "unauthenticated">("checking");
  const [denialReason, setDenialReason] = useState<{ title: string; message: string; isCustomer?: boolean } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function verifyStudioAccess() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch("/api/auth/me", {
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          if (isMounted) {
            setAuthStatus("unauthenticated");
            toast.error("Please sign in with your store admin account to access Studio.");
            router.push("/kalptree?redirect=/studio");
          }
          return;
        }

        const data = await res.json();
        const user = data.session || data.user || data;
        const role = (user?.role || "").toLowerCase();

        if (isMounted) {
          setCurrentUser(user);
        }

        // 1. Must NOT be a customer
        if (role === "customer") {
          if (isMounted) {
            setAuthStatus("denied");
            setDenialReason({
              title: "Customer Access Restricted",
              message: "Kalp Studio is reserved for store administrators and authorized management personnel. Customer accounts do not have access to visual editing tools.",
              isCustomer: true,
            });
          }
          return;
        }

        // 2. Must belong to the same tenant or be a platform administrator
        const expectedTenantId = process.env.NEXT_PUBLIC_TENANT_ID || "cc820af3-85ed-437e-8bc9-2836fefe3353";
        const expectedDb = process.env.NEXT_PUBLIC_TENANT_DB || "kp_arab_marble";
        const expectedSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || "arab-marble";

        const isPlatformAdmin =
          role === "platform_admin" ||
          role === "platform_owner" ||
          role === "super_admin";

        const userTenantId = String(user?.tenant_id || user?.tenantId || "");
        const userDb = String(user?.dbname || user?.db_name || user?.tenant_db || "");
        const userSlug = String(user?.tenant_slug || user?.slug || "");

        const isMatchingTenant =
          userTenantId === expectedTenantId ||
          userDb.toLowerCase() === expectedDb.toLowerCase() ||
          userSlug.toLowerCase() === expectedSlug.toLowerCase();

        if (!isPlatformAdmin && !isMatchingTenant) {
          if (isMounted) {
            setAuthStatus("denied");
            setDenialReason({
              title: "Tenant Access Mismatch",
              message: "Your account is an administrator for a different organization. You can only access Kalp Studio with an account registered under the Arab Marble tenant.",
              isCustomer: false,
            });
          }
          return;
        }

        // Access Granted
        if (isMounted) {
          setAuthStatus("authorized");
        }
      } catch (err) {
        console.error("[Studio Auth Verification Error]:", err);
        if (isMounted) {
          setAuthStatus("unauthenticated");
          router.push("/kalptree?redirect=/studio");
        }
      }
    }

    verifyStudioAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Mount Studio once authorized
  useEffect(() => {
    if (authStatus !== "authorized") return;

    const mountStudio = () => {
      const studio = (window as any).KalpStudio?.mount
        ? (window as any).KalpStudio
        : (window as any).KalpStudio?.default;
      if (studio?.mount) {
        studio.mount({
          tenantDb:
            process.env.NEXT_PUBLIC_TENANT_DB ||
            process.env.NEXT_PUBLIC_TENANT_DB_NAME ||
            "kp_arab_marble",
          initialSlug: "home",
          locale,
          apiBaseUrl:
            typeof window !== "undefined"
              ? window.location.origin
              : "http://localhost:3000",
        });
      }
    };

    if ((window as any).KalpStudio) {
      mountStudio();
    } else {
      const interval = setInterval(() => {
        if ((window as any).KalpStudio) {
          mountStudio();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      const studio = (window as any).KalpStudio?.unmount
        ? (window as any).KalpStudio
        : (window as any).KalpStudio?.default;
      studio?.unmount();
    };
  }, [authStatus, locale]);

  const handleSwitchAccount = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/kalptree?redirect=/studio";
  };

  // 1. Loading State
  if (authStatus === "checking" || authStatus === "unauthenticated") {
    return (
      <div className="h-screen w-screen bg-[#09090b] flex flex-col items-center justify-center text-white font-sans selection:bg-emerald-500/30">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/[0.03] border border-white/10 max-w-sm text-center backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">Verifying Studio Access</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Validating administrator role and tenant authorization for Arab Marble...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Access Denied State (Customer or Tenant Mismatch)
  if (authStatus === "denied") {
    return (
      <div className="h-screen w-screen bg-[#090d0b] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden selection:bg-emerald-500/30">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-[#111714] border border-rose-500/20 rounded-2xl p-8 relative z-10 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-inner">
            <ShieldAlert size={28} />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 block mb-1">
              Unauthorized Access
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              {denialReason?.title || "Access Denied"}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {denialReason?.message}
            </p>
          </div>

          {currentUser?.email && (
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 text-left text-xs flex items-center justify-between">
              <span className="text-slate-400">Current User:</span>
              <span className="font-mono font-bold text-slate-200 truncate max-w-[200px]">
                {currentUser.email} ({currentUser.role || "unknown"})
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={handleSwitchAccount}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-[#0d6533] to-emerald-600 text-white font-bold text-xs shadow-lg shadow-[#0d6533]/30 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span>Switch to Store Admin Account</span>
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 font-semibold text-xs hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <ArrowLeft size={14} />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized State: Mount KalpStudio
  return (
    <div className="h-screen w-screen bg-[#09090b] relative">
      {/* Floating Exit Button */}
      <div className="absolute top-3 right-4 z-50 flex items-center gap-2">
        <Link
          href={`${adminBaseUrl}/peekeeper/cms/pages`}
          className="px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black border border-white/10 text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95"
          title="Return to Kalp Admin Console"
        >
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Exit to Kalp Admin</span>
        </Link>
        <Link
          href="/"
          className="px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black border border-white/10 text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95"
          title="Return to Storefront"
        >
          <ArrowLeft size={13} />
          <span>Store</span>
        </Link>
      </div>

      <Script
        src="https://studio.kalptree.xyz/kalp-studio.v1.js"
        strategy="afterInteractive"
        onLoad={() => {
          const studio = (window as any).KalpStudio?.mount
            ? (window as any).KalpStudio
            : (window as any).KalpStudio?.default;
          studio?.mount({
            tenantDb:
              process.env.NEXT_PUBLIC_TENANT_DB ||
              process.env.NEXT_PUBLIC_TENANT_DB_NAME ||
              "kp_arab_marble",
            initialSlug: "home",
            locale,
            apiBaseUrl:
              typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3000",
          });
        }}
      />
      <div id="kalp-studio-root" className="h-full w-full" />
    </div>
  );
}
