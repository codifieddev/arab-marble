import type { Page } from "@/lib/store/pages/pageType";
import homePage from "@/lib/pages/homePage.json";
import shopPage from "@/lib/pages/shopPage.json";
import categoryPage from "@/lib/pages/categoryPage.json";
import contactPage from "@/lib/pages/contactPage.json";
import productPage from "@/lib/pages/productPage.json";
import promotionsPage from "@/lib/pages/promotionsPage.json";

const pages: Record<string, Page> = {
  home: homePage as Page,
  shop: shopPage as Page,
  category: categoryPage as Page,
  contact: contactPage as Page,
  product: productPage as Page,
  promotions: promotionsPage as Page,
};

export const PAGE_SLUGS = Object.keys(pages);

const clonePage = (page: Page): Page => JSON.parse(JSON.stringify(page));

export function loadPageData(slug: string): Page | null {
  const page = pages[slug];
  return page ? clonePage(page) : null;
}

export function loadAllPages(): Record<string, Page> {
  return Object.fromEntries(
    Object.entries(pages).map(([slug, page]) => [slug, clonePage(page)]),
  );
}
