"use client";

import {
  CategoryRecord,
} from "@/lib/store/categories/categoriesSlices";
import React, { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import Link from "next/link";
import { getEntityUrl } from "@/lib/permalink/url-helper";

interface PageHeadProps {
  currentCategory: CategoryRecord | null;
  productCount: number;
  section?: any;
}

interface TreeCategory extends CategoryRecord {
  children: TreeCategory[];
}

const PageHead = ({
  currentCategory,
  productCount,
  section: propSection,
}: PageHeadProps) => {
  const pathname = usePathname();
  const currentPages = useAppSelector((state) => state.pages.currentPages);

  const category = useParams();
  const id = category.id;

  const { allCategories } = useAppSelector(
    (state) => state.adminCategories,
  );

  const parent = id !== "all" ? allCategories.find((d) => d.slug == id) : "all";

  const tree = useMemo(() => {
    const map = new Map<string, TreeCategory>();
    const roots: TreeCategory[] = [];

    allCategories.forEach((c) => {
      const id = c._id || c.id;
      if (id) map.set(id, { ...c, children: [] });
    });

    map.forEach((c) => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children.push(c);
      } else {
        roots.push(c);
      }
    });

    return roots;
  }, [allCategories]);

  const similar =
    parent != "all"
      ? parent?.parentId != null
        ? parent.parentId
        : parent?.id
      : null;

  const isShopPage = useMemo(() => {
    return pathname.split("/").filter(Boolean).includes("shop");
  }, [pathname]);

  const finalAllChildren = similar
    ? tree.find((d) => d.id == similar)
    : isShopPage
    ? { children: tree }
    : tree[0];

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "hi") return "hi";
    return "en";
  }, [pathname]);

  const { totalProducts } = useAppSelector((state) => state.products);

  const getCurrentSection = useMemo(() => {
    if (!currentPages) return;
    return currentPages.content?.find(
      (page: any) => page?.adminTitle === "Category Page Head" || page?.type === "category-page-head",
    );
  }, [currentPages]);

  const section = propSection || getCurrentSection;
  const p = section?.props || {};

  const defaultFallbackDesc =
    lang === "hi"
      ? "हमारे एस्केप-प्रूफ डॉग डायपर, सस्पेंडर्स और प्रीमियम पेट हाइजीन समाधानों का संग्रह देखें। आराम, टिकाऊपन और लीक-मुक्त सुरक्षा के लिए डिज़ाइन किया गया।"
      : "Explore our collection of escape-proof dog diapers, suspenders, and premium pet hygiene solutions. Designed for comfort, durability, and leak-free protection.";

  const getLocalized = (val: any, fallback: string = ""): string => {
    if (!val) return fallback;
    if (typeof val === "object") {
      return val[lang] || val.en || fallback;
    }
    return String(val);
  };

  const badge =
    p.badge?.[lang] ||
    p.badge?.en ||
    (currentCategory ? (lang === "hi" ? "श्रेणी" : "Category") : (lang === "hi" ? "कलेक्शन" : "Collection"));

  const heading =
    p.heading?.[lang] ||
    p.heading?.en ||
    (currentCategory
      ? (getLocalized((currentCategory as any).title, currentCategory.name || ""))
      : (lang === "hi" ? "डॉग डायपर और एक्सेसरीज़" : "Dog Diapers & Accessories"));

  const description =
    p.description?.[lang] ||
    p.description?.en ||
    (currentCategory
      ? (getLocalized((currentCategory as any).description, defaultFallbackDesc))
      : defaultFallbackDesc);

  const displayBadge = isShopPage
    ? (lang === "hi" ? "कलेक्शन" : "Collection")
    : (p.badge?.[lang] || p.badge?.en || badge);

  const displayTitle = isShopPage
    ? (lang === "hi" ? "सभी उत्पाद" : "Shop All")
    : parent && parent !== "all"
    ? (getLocalized((parent as any).title, (parent as any).name || ""))
    : (currentCategory
      ? (getLocalized((currentCategory as any).title, currentCategory.name || heading))
      : heading);

  const displayDescription = isShopPage
    ? defaultFallbackDesc
    : parent && parent !== "all"
    ? (getLocalized((parent as any).description, defaultFallbackDesc))
    : description;

  const countSuffix =
    totalProducts === 1
      ? (p.productCountSuffixSingle?.[lang] || (lang === "hi" ? "उत्पाद" : "Product"))
      : (p.productsCountSuffix?.[lang] || (lang === "hi" ? "उत्पाद" : "Products"));

  return (
    <section className="pagehead py-8 sm:py-10 border-b border-[var(--border)]">
      <div className="pagehead-inner flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="pagehead-content max-w-3xl">
          <span className="text-[var(--primary)] tracking-[3px] uppercase text-[11px] font-black mb-2 inline-block">
            {displayBadge}
          </span>
          <h1 className="text-[34px] sm:text-[44px] font-heading font-black leading-[1.1] tracking-tight text-[var(--text)]">
            {displayTitle}
          </h1>
          <p className="text-[var(--text-secondary)] font-medium mt-3 max-w-[70ch] leading-relaxed text-sm sm:text-base">
            {displayDescription}
          </p>

          <div className="flex flex-wrap gap-2.5 mt-4">
            {finalAllChildren &&
              finalAllChildren.children &&
              finalAllChildren.children.length > 0 &&
              finalAllChildren.children.map((sub: any, idx: number) => {
                const subTitle =
                  typeof sub === "string"
                    ? sub
                    : sub.props?.label?.[lang] ||
                      sub.props?.label?.en ||
                      sub.props?.title?.[lang] ||
                      sub.props?.title?.en ||
                      (typeof sub.title === "object" ? sub.title[lang] || sub.title.en : sub.title) ||
                      sub.name ||
                      "";
                if (!subTitle) return null;
                return (
                  <Link
                    key={idx}
                    href={getEntityUrl({ type: "category", slug: sub.slug, id: sub._id || sub.id }, lang)}
                    className="h-9 px-4 rounded-full border border-[var(--border)] bg-white text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--accent-soft)] transition-all flex items-center justify-center shadow-xs"
                  >
                    {subTitle}
                  </Link>
                );
              })}
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap justify-start lg:justify-end ml-auto shrink-0">
          <div className="px-4 py-2 rounded-full border border-[var(--border)] bg-white text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-pulse" />
            <span>{totalProducts} {countSuffix}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageHead;
