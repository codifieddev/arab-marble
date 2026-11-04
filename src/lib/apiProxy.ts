import { NextRequest, NextResponse } from "next/server";
import { getConfiguredDatabaseName } from "@/lib/database-authority";

export function resolveBackendBaseUrl(): string {
  let url = (process.env.FASTAPI_URL || "http://127.0.0.1:8000").trim().replace(/\/$/, "");
  if (
    !url.includes("localhost") &&
    !url.includes("127.0.0.1") &&
    url.startsWith("http://")
  ) {
    url = url.replace(/^http:\/\//i, "https://");
  }
  return url;
}

const FASTAPI_URL = resolveBackendBaseUrl();

async function getTenantHeaders(): Promise<Record<string, string>> {
  return { "Content-Type": "application/json" };
}

export async function fetchWithTenant(url: string, options: RequestInit = {}): Promise<unknown> {
  const tenantHeaders = await getTenantHeaders();
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      ...tenantHeaders,
      ...(options.headers as Record<string, string> || {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function proxyRequest(
  req: NextRequest,
  targetPath: string,
  options: { addApiPrefix?: boolean } = {},
) {
  let databaseName: string;
  try {
    databaseName = getConfiguredDatabaseName();
  } catch {
    return NextResponse.json(
      { success: false, error: "Server configuration is unavailable" },
      { status: 500 },
    );
  }

  const searchParams = req.nextUrl.searchParams.toString();
  const baseBackendUrl = options.addApiPrefix
    ? `${FASTAPI_URL}/api`
    : FASTAPI_URL;
  const url = `${baseBackendUrl}/${targetPath}${searchParams ? `?${searchParams}` : ""}`;

  const headers = new Headers();

  const headersToForward = [
    "authorization",
    "cookie",
    "content-type",
    "accept",
    "tenant-slug",
    "tenant_slug",
    "x-tenant-slug",
    "x-tenant-db",
    "auth-token",
    "x-auth-type",
    "x-admin-portal",
    "idempotency-key",
  ];

  headersToForward.forEach((headerName) => {
    const value = req.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  });

  headers.set("x-tenant-db", databaseName);
  if (!headers.has("x-tenant-slug")) {
    headers.set("x-tenant-slug", process.env.NEXT_PUBLIC_TENANT_SLUG || "arab-marble");
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: headers,
    redirect: "manual",
  };

  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    try {
      const contentType = req.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const body = await req.json();
        fetchOptions.body = JSON.stringify(body);
      } else {
        fetchOptions.body = await req.blob();
      }
    } catch {}
  }

  try {
    let response = await fetch(url, fetchOptions);

    if ([301, 302, 307, 308].includes(response.status) && response.headers.get("location")) {
      const redirectLocation = response.headers.get("location")!;
      const redirectUrl = new URL(redirectLocation, url).toString();
      response = await fetch(redirectUrl, {
        ...fetchOptions,
        redirect: "follow",
      });
    }
    let nextResponse: NextResponse;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      nextResponse = NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      if (!response.ok) {
        nextResponse = NextResponse.json(
          {
            success: false,
            error: text || `Backend returned status ${response.status}`,
            message: text || `Backend returned status ${response.status}`,
            detail: text || `Backend returned status ${response.status}`,
          },
          { status: response.status }
        );
      } else {
        nextResponse = new NextResponse(text, {
          status: response.status,
          headers: { "Content-Type": contentType || "text/plain" },
        });
      }
    }

    const setCookies =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : response.headers.get("set-cookie")
          ? [response.headers.get("set-cookie")!]
          : [];

    const isSecureRequest =
      req.nextUrl.protocol === "https:" ||
      req.headers.get("x-forwarded-proto") === "https";

    setCookies.forEach((cookie) => {
      const parts = cookie.split(";").map((p) => p.trim());
      const [nameValue, ...attrParts] = parts;
      if (!nameValue) return;
      const eqIndex = nameValue.indexOf("=");
      if (eqIndex === -1) return;
      const name = nameValue.substring(0, eqIndex);
      const value = nameValue.substring(eqIndex + 1);
      const options: Parameters<typeof nextResponse.cookies.set>[2] = { path: "/" };
      attrParts.forEach((attr) => {
        const lowerAttr = attr.toLowerCase();
        if (lowerAttr.startsWith("max-age=")) options.maxAge = parseInt(attr.substring(8), 10);
        else if (lowerAttr.startsWith("path=")) options.path = attr.substring(5);
        else if (lowerAttr === "httponly") options.httpOnly = true;
        else if (lowerAttr === "secure") options.secure = true;
        else if (lowerAttr.startsWith("samesite=")) {
          const sameSiteValue = attr.substring(9).toLowerCase();
          if (sameSiteValue === "lax") options.sameSite = "lax";
          else if (sameSiteValue === "strict") options.sameSite = "strict";
          else if (sameSiteValue === "none") options.sameSite = "none";
        }
      });
      if (!isSecureRequest) {
        options.secure = false;
        if (options.sameSite === "none") options.sameSite = "lax";
      }
      nextResponse.cookies.set(name, value, options);
    });

    return nextResponse;
  } catch (error) {
    console.error(`[Proxy Error] ${url}:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to connect to backend service" },
      { status: 500 },
    );
  }
}
