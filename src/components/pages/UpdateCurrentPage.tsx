"use client";

import { useAppDispatch } from "@/lib/store/hooks";
import { useEffect } from "react";
import GetAllPages from "./GetAllPages";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { usePathname } from "next/navigation";
import { setCurrentPages } from "@/lib/store/pages/pagesSlice";
import { loadPageData } from "@/components/cms/loader";

const UpdateCurrentPage = () => {
  const { allPages, currentPages, isAllPageFetched } = useSelector((state: RootState) => state.pages);
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!pathname) return;

    // Normalize slug: strip locale prefix (/hi/, /en/) and leading/trailing slashes
    let normalized = pathname
      .replace(/^\/(?:hi|en)(?=\/|$)/, "")
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");

    if (!normalized || normalized === "") {
      normalized = "home";
    }

    // Map category routes/permalinks to 'category' CMS page
    if (
      normalized === "category" ||
      normalized === "product-category" ||
      normalized.startsWith("category/") ||
      normalized.startsWith("product-category/")
    ) {
      normalized = "category";
    }

    // Map product routes/permalinks to 'product' CMS page
    if (
      normalized === "product" ||
      normalized.startsWith("pr/") ||
      normalized.startsWith("products/") ||
      (normalized.startsWith("shop/") && normalized !== "shop")
    ) {
      normalized = "product";
    }

    // If currentPages is already set for this normalized slug and has content, do NOT overwrite with older data!
    if (
      currentPages &&
      currentPages.slug === normalized &&
      Array.isArray(currentPages.content) &&
      currentPages.content.length > 0
    ) {
      return;
    }

    // Only populate currentPages from allPages if allPages have been fetched from backend DB!
    // Never pre-populate with static fallback disk JSON before backend data arrives!
    if (isAllPageFetched) {
      const data =
        allPages && allPages.length > 0
          ? allPages.find((page: any) => page.slug === normalized)
          : null;

      if (data && Array.isArray(data.content) && data.content.length > 0) {
        dispatch(setCurrentPages(data));
      }
    }
  }, [allPages, currentPages, pathname, isAllPageFetched, dispatch]);

  return <GetAllPages />;
};

export default UpdateCurrentPage;
