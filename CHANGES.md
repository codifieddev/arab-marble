# Arab Marble — Changes & Migration Documentation

This document logs all modifications, additions, deletions, and architectural decisions made while cloning and adapting `peekeeper-tech` into `arab-marble` (`D:\projects\kalp\arab-marble`) as a catalog-type stone storefront for Abu Dhabi, UAE.

---

## 1. Summary of Architecture
- **Tenant**: `arab-marble` (Database: `kp_arab_marble`)
- **Product Model**: `catalog` type (no cart, no checkout, no pricing display, no stock deduction).
- **Core User Flow**: Category/Shop Browsing → Facet Filters (Color, Country, Size) → Lightbox Image Preview → Single Product Specification Sheet → "Enquire About This Product" button prefilling the Contact Us form (`/contact?subject=...`).
- **CMS Architecture**: Preserved Next.js 16 App Router, central permalink resolver (`resolvePermalinkAsync`), dynamic proxy (`/api/[[...slug]]`), and JSON fallback system (`src/lib/pages/*.json`).

---

## 2. Files Added

| File Path | Description |
|---|---|
| `src/lib/commerce/catalog-product-adapter.ts` | Normalizes commerce products into stone catalog models (`CatalogProduct`), extracts facet options (`extractFacetOptions`), and performs in-memory filtering (`filterCatalogProducts`). |
| `src/views/projects/ProjectsCategoryPage.tsx` | View for Projects by category (`Iconic`, `Latest Projects`, `Custom Projects`), rendering alternating text/image cards matching the provided reference screenshot. |
| `src/app/[locale]/projects/[category]/page.tsx` | Next.js route for categorized projects (e.g. `/projects/latest`, `/projects/iconic`). |
| `src/app/[locale]/projects/page.tsx` | Root projects route defaulting to `latest`. |
| `src/components/cms/sections/PromotionsSection.tsx` | CMS section rendering 2-column stone promotional cards with overlay details (matching reference screenshot). |
| `src/components/cms/sections/HomeTilesSection.tsx` | CMS section for the two side-by-side homepage action tiles (`PRODUCTS` and `PROJECTS`). |
| `src/components/cms/sections/StatementSection.tsx` | Minimal statement section ("Arab Marble has completed and executed works in Abu Dhabi, Dubai..."). |
| `src/lib/pages/promotionsPage.json` | JSON fallback data for the `/promotions` CMS page. |
| `public/images/arab-marble-logo.svg` | SVG brand logo for dark-on-white header (Arabic + English). |
| `public/images/arab-marble-logo-white.svg` | SVG brand logo for dark slate footer. |
| `scripts/seed.ts` | Idempotent automated database seeder for headers, footers, categories, 20 catalog products, and projects. |
| `scripts/.env.seed.example` | Example environment configuration for running seed scripts. |
| `scripts/README.md` | Instructions for database seeding. |
| `ANALYSIS_VERIFY.md` | Phase 0 verification against backend and admin codebases. |
| `CHANGES.md` | This change log. |

---

## 3. Files Modified

| File Path | Changes Made |
|---|---|
| `package.json` | Renamed project to `"arab-marble"`, added `"seed"` npm script, added `tsx` and `dotenv` devDependencies. |
| `.env` & `.env.example` | Updated tenant DB to `kp_arab_marble`, slug to `arab-marble`, configured Hostinger SMTP. |
| `src/components/layout/Header.tsx` | Redesigned navbar: brand logo, uppercase links (`HOME`, `PRODUCTS ▾`, `PROJECTS ▾`, `PROMOTIONS`, `CONTACT US`), dropdown menus with arrow indicators, removed cart button, wishlist button, and account login icons. |
| `src/components/layout/Footer.tsx` | Redesigned footer: 2-column layout with white logo on left, UAE contact details on right (`+971 2 555 4008`, `am@arabmarble.ae`), and black bottom bar ("Copyright © 2025 \| ARAB MARBLE \| All Rights Reserved" / "Designed & Managed by CODIFIED"). |
| `src/lib/pages/headerData.json` | Configured Arab Marble navigation hierarchy with dropdown children. |
| `src/lib/pages/footerData.json` | Configured Arab Marble contact info and credits. |
| `src/lib/pages/homePage.json` | Configured sections: "Create. Build. Design." Hero, "Who We are", completed projects statement, and PRODUCTS/PROJECTS tiles. |
| `src/views/contact/page.tsx` | Added Musaffah M9 Google Maps embed, phone/fax/email/address details on left, and Email Us form on right supporting `?subject=` prefill. |
| `src/lib/pages/contactPage.json` | Updated contact page metadata and hero config. |
| `src/components/pages/CategoryPage.tsx` | Replaced dog diaper layout with 4-column stone grid, Lightbox modal on image click, single product link on title, facet filters (All Colors, All Countries, All Sizes), and Load More button. |
| `src/views/shop/[slug]/page.tsx` | Converted to stone catalog specification sheet: high-res zoomable gallery, specifications table (Color, Country of Origin, Available Sizes, Finish), and "Enquire About This Product" button prefilling the contact form. Removed cart and checkout buttons. |
| `src/views/shop/page.tsx` & `src/lib/pages/shopPage.json` | Updated shop title and metadata to Arab Marble Products. |
| `src/components/cms/sections/ProductGridSection.tsx` | Cleaned up catalog cards to remove price badges, wishlist buttons, and star ratings. |
| `src/components/cms/sections/FeaturedProductsSection.tsx` | Replaced dog diaper flagship showcase with stone collection highlight. |
| `src/components/cms/sections/ProductDetailSection.tsx` | Replaced cart addition with product enquiry redirection. |
| `src/components/cms/loader/index.ts` | Cleaned up imports to only retain active pages (`home`, `shop`, `category`, `contact`, `product`, `promotions`). |
| `src/app/[locale]/[...slug]/page.tsx` | Removed deleted view imports, updated metadata fallbacks to Arab Marble. |
| `src/app/[locale]/product/[id]/page.tsx` & `shop/[slug]/page.tsx` | Updated SEO titles from "PeeKeeper" to "Arab Marble". |
| `src/app/[locale]/layout.tsx` & `StoreLayoutShell.tsx` | Removed `MobileBottomNav` and `CartDrawer`. |
| `src/lib/registry.ts` | Registered `promotions`, `home-tiles`, and `statement` blocks. |
| `src/app/api/contact/route.ts` | Updated to accept `{ name, email, subject, message }` in addition to split fields, with updated SMTP credentials. |

---

## 4. Files & Directories Deleted

- **Deleted Routes** (`src/app/[locale]/`):
  - `cart/`
  - `checkout/`
  - `wishlist/`
  - `account/`
  - `login/`
  - `signup/`
  - `orders/`
  - `search/`
  - `customer-reviews/`
  - `dog-diaper-size-guide/`
- **Deleted Views** (`src/views/`):
  - `cart/`
  - `checkout/`
  - `account/`
  - `wishlist/`
  - `customer-reviews/`
  - `sizing/`
  - `how-to-measure/`
  - `search/`
  - `faq/`
  - `privacy/`
  - `returns/`
  - `terms/`
  - `about/`
- **Deleted JSON Fallbacks** (`src/lib/pages/`):
  - `aboutPage.json`
  - `accountPage.json`
  - `cartPage.json`
  - `checkoutPage.json`
  - `customerReviewsPage.json`
  - `dogDiaperSizeGuidePage.json`
  - `faqPage.json`
  - `howToMeasurePage.json`
  - `ordersPage.json`
  - `privacyPage.json`
  - `profilePage.json`
  - `returnsPage.json`
  - `searchPage.json`
  - `termsPage.json`
  - `wishlistPage.json`

---

## 5. Architectural Findings & Decisions

1. **Backend Filtering Limitation**:
   - In `kalp-business-api/apps/api/app/repositories/commerce/products.py:13`, `repo.list({})` returns all products and an empty dictionary `{}` for filters.
   - **Solution**: We implemented hybrid filtering in `src/lib/commerce/catalog-product-adapter.ts`. While query parameters are forwarded to the API, client-side/in-memory facet extraction and filtering ensure instant, accurate filtering across All Colors, All Countries, and All Sizes without breaking if the backend returns unfiltered sets.
2. **Catalog Product Schema Compatibility**:
   - `kalp-admin`'s `ProductForm.tsx` requires `pricing.price` and `pricing.currency` even for catalog products. Our seed script sends `pricing: { price: 0, currency: "AED" }` to prevent schema validation failures in FastAPI (`CreateCommerceProductRequest`).
3. **Redux Store Safety**:
   - Unused slices (`cart`, `auth`, `wishlist`) remain registered in the Redux store so that legacy internal hooks or store initialization do not crash, but all user-facing UI triggers (cart drawer, account icons, wishlist toggles) have been cleanly removed from the UI.

