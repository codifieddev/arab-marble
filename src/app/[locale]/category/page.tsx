import { Metadata } from "next";
import { Suspense } from "react";
import { permanentRedirect } from "next/navigation";
import Component, { CategoryPageSkeleton } from "@/components/pages/CategoryPage";
import GetProductCategoryWise from "@/lib/GetAllDetails/GetProductCategoryWise";
import { getPageData } from "@/lib/getPageData";
import { resolvePermalinkAsync } from "@/lib/permalink/resolver";
import { loadPageData } from "@/components/cms/loader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale = "en" } = await params;
  const resolved = await resolvePermalinkAsync("/category", { locale });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arabmarble.ae";
  const data = (await getPageData("category")) || loadPageData("category");

  const title =
    data?.metaTitle?.[locale] ||
    data?.metaTitle?.["en"] ||
    (locale === "hi"
      ? "श्रेणी अनुसार खरीदें | PeeKeeper डॉग डायपर"
      : "Shop by Category | Arab Marble");
  const description =
    data?.metaDescription?.[locale] ||
    data?.metaDescription?.["en"] ||
    (locale === "hi"
      ? "अपने पालतू जानवर के लिए PeeKeeper एस्केप-प्रूफ डॉग डायपर, सस्पेंडर्स और एक्सेसरीज़ को श्रेणी अनुसार ब्राउज़ करें।"
      : "Explore Arab Marble collections of premium Italian, Spanish and natural stone slabs and tiles.");

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}${resolved.canonicalPath || "/product-category"}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale?: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale = "en" } = await params;
  const sp = searchParams ? await searchParams : {};
  const searchStr = new URLSearchParams(
    Object.entries(sp || {}).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((item) => [k, item]) : v !== undefined ? [[k, v]] : []
    )
  ).toString();
  const search = searchStr ? `?${searchStr}` : "";

  // Canonical Category Route Resolution:
  // If the tenant's canonical categoryBase is 'product-category' (or any other base),
  // permanently redirect /category to the canonical path to prevent duplicate URLs.
  const resolved = await resolvePermalinkAsync("/category", { locale, search });
  if (resolved.status === "redirect" && resolved.redirectUrl) {
    permanentRedirect(resolved.redirectUrl);
  }

  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <GetProductCategoryWise />
      <Component />
    </Suspense>
  );
}
