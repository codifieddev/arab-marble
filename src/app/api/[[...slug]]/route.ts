import { proxyRequest } from "@/lib/apiProxy";
import { NextRequest, NextResponse } from "next/server";
import {
  resolveBrandLogo,
  resolveBrandFavicon,
  resolveBrandName,
} from "@/lib/brand/brand-resolver";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  return handleProxy(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  return handleProxy(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  return handleProxy(req, context);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  return handleProxy(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  return handleProxy(req, context);
}

async function handleProxy(req: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await context.params;
  
  if (!slug || slug.length === 0) {
    return NextResponse.json({ error: "Invalid API endpoint" }, { status: 404 });
  }

  const base = slug[0];
  const rest = slug.slice(1).join("/");

  // Special case: branding/current
  if (base === "branding" && (rest === "current" || rest === "")) {
    const tenantDb = (
      req.headers.get("x-tenant-db") ||
      process.env.TENANT_DB_NAME ||
      process.env.NEXT_PUBLIC_TENANT_DB ||
      "kp_arab_marble"
    ).trim();

    let rawApiUrl = (
      process.env.FASTAPI_URL ||
      "http://127.0.0.1:8000"
    ).trim().replace(/\/$/, "");
    if (!rawApiUrl.includes("localhost") && !rawApiUrl.includes("127.0.0.1") && rawApiUrl.startsWith("http://")) {
      rawApiUrl = rawApiUrl.replace(/^http:\/\//i, "https://");
    }
    const apiUrl = rawApiUrl;

    try {
      const res = await fetch(`${apiUrl}/platform/business-blueprint`, {
        headers: {
          "x-tenant-db": tenantDb,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const json = await res.json();
        const payload = json?.data?.payload || json?.data || json || {};

        return NextResponse.json(
          {
            branding: {
              logoUrl: resolveBrandLogo(payload),
              faviconUrl: resolveBrandFavicon(payload),
              brandName: resolveBrandName(payload),
              payload,
            },
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          }
        );
      }
    } catch (error: any) {
      console.warn("[api/branding/current] Error fetching fresh blueprint:", error?.message);
    }

    return NextResponse.json(
      {
        branding: {
          logoUrl: "/images/arab-marble-logo.svg",
          faviconUrl: "/favicon.ico",
          brandName: "Arab Marble",
          payload: null,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
  
  // Mapping logic
  let targetPath = slug.join("/");
  const addApiPrefix = false;

  if (base === "commerce" || base === "ecommerce") {
    targetPath = "commerce/" + rest;
  } else if (base === "pages") {
    targetPath = "cms/pages" + (rest ? "/" + rest : "");
  } else if (base === "comments") {
    targetPath = "publishing/page-reviews/comments" + (rest ? "/" + rest : "");
  } else if (base === "wishlist") {
    targetPath = "auth/customer/wishlist" + (rest ? "/" + rest : "");
  } else if (base === "auth") {
    if (rest === "signup") {
      targetPath = "auth/customer/register";
    } else if (rest === "logout") {
      targetPath = "auth/customer/logout";
    } else if (rest === "login") {
      const isExplicitAdmin = req.headers.get("x-auth-type") === "admin" || req.headers.get("x-admin-portal") === "true";
      targetPath = isExplicitAdmin ? "auth/login" : "auth/customer/login";
    } else if (rest === "me") {
      const isExplicitAdmin = req.headers.get("x-auth-type") === "admin" || req.headers.get("x-admin-portal") === "true";
      targetPath = isExplicitAdmin ? "auth/me" : "auth/customer/me";
    } else {
      targetPath = "auth/" + rest;
    }
  } else if (base === "form-data") {
    targetPath = "form-data";
  } else if (base === "peekeeper") {
    if (rest === "reviews" || rest.startsWith("reviews")) {
      targetPath = "commerce/" + rest;
    }
  }

  return proxyRequest(req, targetPath, { addApiPrefix });
}
