import { cache } from "react";
import type { Page } from "./store/pages/pageType";

type ApiRecord = Record<string, unknown>;

interface BlueprintPayload extends ApiRecord {
  permalinkDetails?: Record<string, string>;
}

interface BlueprintDocument extends ApiRecord {
  id?: string;
  _id?: string;
  document_key?: string;
  tenant_id?: string;
  tenant_slug?: string;
  payload?: BlueprintPayload;
  public_theme?: unknown;
  public_navigation?: unknown;
  brandAssets?: unknown;
  permalinkDetails?: unknown;
  commerce?: unknown;
  tenant?: { id?: string; slug?: string };
  metadata?: { blueprintVersion?: string | number };
  experience?: {
    public?: { theme?: unknown; navigationProfile?: unknown };
  };
  verticals?: { commerce?: { configuration?: unknown } };
  seo?: { permalinks?: unknown };
  version?: string | number;
}

const FASTAPI_URL = (process.env.FASTAPI_URL || "http://127.0.0.1:8000").replace(
  /\/$/,
  "",
);

function apiHeaders(): HeadersInit {
  const databaseName = process.env.TENANT_DB_NAME || process.env.DB_NAME || process.env.NEXT_PUBLIC_TENANT_DB;
  const tenantSlug = process.env.TENANT_SLUG || process.env.NEXT_PUBLIC_TENANT_SLUG || "arab-marble";

  return {
    "Content-Type": "application/json",
    ...(databaseName ? { "x-tenant-db": databaseName } : {}),
    ...(tenantSlug ? { "x-tenant-slug": tenantSlug } : {}),
  };
}

async function fetchApi<T>(path: string, revalidate = 0): Promise<T | null> {
  try {
    const response = await fetch(`${FASTAPI_URL}/${path}`, {
      headers: apiHeaders(),
      next: { revalidate },
    });

    if (!response.ok) return null;

    const body = (await response.json()) as ApiRecord;
    return (body.data !== undefined ? body.data : body) as T;
  } catch (error) {
    console.error(`API request failed for ${path}`, error);
    return null;
  }
}

export const getPageData = cache(async (slug: string): Promise<Page | null> => {
  const data = await fetchApi<Page | Page[]>(
    `api/cms/pages?slug=${encodeURIComponent(slug)}`,
  );
  return Array.isArray(data)
    ? data.find((page) => page.slug === slug) ?? null
    : data;
});

export const getSingleProduct = cache(async (id: string) => {
  const encodedId = encodeURIComponent(id);
  return (
    (await fetchApi<ApiRecord>(`commerce/products/slug/${encodedId}`, 60)) ??
    (await fetchApi<ApiRecord>(`commerce/products/${encodedId}`, 60))
  );
});

export const getBusinessBlueprint = cache(
  async (): Promise<BlueprintDocument | null> => {
    const blueprint = await fetchApi<BlueprintDocument>(
      "platform/business-blueprint",
      60,
    );
    if (!blueprint) return null;
    if (blueprint.payload) return blueprint;

    const publicExperience = blueprint.experience?.public || {};
    const commerce =
      blueprint.verticals?.commerce?.configuration || blueprint.commerce || {};

    return {
      ...blueprint,
      tenant_slug: blueprint.tenant?.slug || blueprint.tenant_slug,
      id: blueprint.id || blueprint._id,
      document_key: blueprint.document_key || "blueprint-v2",
      payload: {
        ...blueprint,
        tenant_id: blueprint.tenant?.id || blueprint.tenant_id,
        tenant_slug: blueprint.tenant?.slug || blueprint.tenant_slug,
        version: blueprint.metadata?.blueprintVersion || blueprint.version,
        public_theme: blueprint.public_theme || publicExperience.theme,
        brandAssets: blueprint.brandAssets || publicExperience.theme,
        public_navigation:
          blueprint.public_navigation || publicExperience.navigationProfile,
        permalinkDetails: (
          blueprint.permalinkDetails || blueprint.seo?.permalinks
        ) as Record<string, string> | undefined,
        commerce,
      },
    };
  },
);
