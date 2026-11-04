# Analysis Verification & Implementation Plan: Arab Marble

**Target:** `D:\projects\kalp\arab-marble`  
**Reference Storefront:** `D:\projects\kalp\peekeeper-tech`  
**Backend:** `D:\projects\kalp\kalp-business-api` (`http://127.0.0.1:8000`)  
**Admin:** `D:\projects\kalp\kalp-admin` (Port `5177`)  

---

## Part 1 — Verified Findings from Code

### 1. Exact `CreateCommerceProductRequest` & `kalp-admin` Catalog Payload
- **Backend Schema:** Located in [`kalp-business-api/apps/api/app/schemas/commerce/products.py:83-118`](file:///d:/projects/kalp/kalp-business-api/apps/api/app/schemas/commerce/products.py#L83-L118):
  - `name: str (1-255 chars)`
  - `slug: str (1-120 chars)`
  - `sku: str | None = None (max 120 chars)`
  - `description: str | None = None`
  - `status: str = "active"` (`draft`, `active`, `archived`)
  - `type: str = "physical"` (can be `"catalog"`, `"variant"`, `"simple"`)
  - `categoryIds: list[str] = []`
  - `primaryCategoryId: str | None = None`
  - `attributeSetIds: list[str] = []`
  - `productAttributes: list[CommerceAttributeValueRequest] = []` (`attributeId`, `value`)
  - `pricing: PricingRequest = { price: 0, compareAtPrice: None, costPerItem: None, chargeTax: True, trackQuantity: True }`
  - `options: list[ProductOptionRequest] = []` (`key`, `label`, `values`, `selectedValues`, `useForVariants`, `draftValue`, `attributeSetId`)
  - `variants: list[CreateCommerceVariantRequest] = []` (`id`, `title`, `sku`, `price`, `stock`, `currency`, `compareAtPrice`, `imageId`, `status`, `optionValues`, `attributeValues`)
  - `gallery: list[ProductGalleryItemRequest] = []` (`id`, `url`, `alt`, `order`)
  - `primaryImageId: str | None = None`
  - `tags: list[str] = []`
- **What `kalp-admin`'s `ProductForm.tsx` Sends for `type: "catalog"`** ([`kalp-admin/components/commerce/products/ProductForm.tsx:395-416`](file:///d:/projects/kalp/kalp-admin/components/commerce/products/ProductForm.tsx#L395-L416)):
  - `pricing: { price: 0, compareAtPrice: 0, costPerItem: 0, chargeTax: false, trackQuantity: false, stock: 0 }`
  - `price: 0`
  - `variants`: filtered to only `{ id, title, sku, status }` (all prices and stock numbers stripped)
  - `options`: preserved in full (both `useForVariants: true` and `useForVariants: false`)
  - `productAttributes`: mapped from options that have `selectedValues`

---

### 2. How `f_<key>=value` Filtering Works
- **Route Definition:** In [`kalp-business-api/apps/api/app/api/routes/commerce/products.py:33-38`](file:///d:/projects/kalp/kalp-business-api/apps/api/app/api/routes/commerce/products.py#L33-L38):
  ```python
  variant_filters = []
  for key, value in request.query_params.items():
      if key.startswith("f_"):
          variant_filters.append({
              "options": {"$elemMatch": {"key": key[2:], "selectedValues": {"$in": value.split(",")}}}
          })
  ```
- **CRITICAL BACKEND CODE FINDING (Differs from `SYSTEM_ANALYSIS.md`):**
  - While `routes/commerce/products.py` parses `f_*` into `variant_filters` and forwards it, [`apps/api/app/repositories/commerce/products.py:13`](file:///d:/projects/kalp/kalp-business-api/apps/api/app/repositories/commerce/products.py#L13) executes:
    `items = await repo.list({})`
  - The repository accepts `**filters: Any` but ignores them and performs an unconstrained `{}` find on `commerce_products`.
  - In MongoDB, `$in` is case-sensitive.
  - `options[].key` is matched against `key[2:]` (e.g. `f_color` matches `key == "color"`).
  - `useForVariants: false` options are stored in the product's `options` array, so when MongoDB is queried they are matched.
  - `category`: Route accepts `category: str | None`, but the repository also currently omits applying it to `repo.list({})`.
- **Architectural Solution for Storefront:**
  - The storefront will send query parameters (`?category=<slug>&f_color=...&f_country=...&f_size=...`) for API compatibility.
  - The storefront views will **also apply in-memory filtering** over the returned products. This guarantees 100% reliable filter behavior on the UI regardless of backend repository filter bypasses.

---

### 3. What `GET /commerce/products` Returns in `filters`
- In [`apps/api/app/repositories/commerce/products.py:50`](file:///d:/projects/kalp/kalp-business-api/apps/api/app/repositories/commerce/products.py#L50):
  `return {"data": results, "total": total, "filters": {}}`
- The `filters` key returns an empty dict `{}`. It does **not** return facets per category.
- **Storefront Strategy:** The filter dropdowns (All Colors, All Countries, All Sizes) **must derive their available option values dynamically** from the fetched product set for the active category.

---

### 4. `GET /cms/projects` and Extra Fields
- Located in [`apps/api/app/api/routes/cms/supplemental_content.py:51-82`](file:///d:/projects/kalp/kalp-business-api/apps/api/app/api/routes/cms/supplemental_content.py#L51-L82):
  - `_list_content("projects", session)` executes:
    `database["cms_projects"].find({}).sort("createdAt", -1).to_list(length=500)`
  - Does **not** support query filtering by category. Returns all projects in `cms_projects`.
  - `_create_content` does `doc = dict(payload)` with no schema restrictions.
  - Extra fields such as `location`, `gallery`, `client`, `completionDate`, `category`, and `stats` are **fully preserved and returned**.
- **Storefront Strategy:** Client/server code will filter the returned project list by `project.category` (`Iconic`, `Latest Projects`, `Custom Projects`).

---

### 5. `GET/POST /cms/headers` and `/cms/footers` Schemas
- In [`apps/api/app/schemas/cms.py:119-156`](file:///d:/projects/kalp/kalp-business-api/apps/api/app/schemas/cms.py#L119-L156):
  - `HeaderMenuItem` includes: `label` (string or LocalizedText), `path: str | None`, `icon: str | None`, `target: str | None`, `children: list[HeaderMenuItem] | None`.
  - Both `HeaderCreate` and `FooterCreate` have `model_config = ConfigDict(extra="allow")`.
  - `Header.tsx` lines 220–229 inspect `headerConfig?.menu` with fallback to `headerData.json`. Dropdown menus are rendered from `item.children`.
  - `Footer.tsx` lines 220–270 inspect `footerConfig?.quickLinksColumns`, `contact`, `socialLinks`, `bottomBar` with fallback to `footerData.json`.

---

### 6. `GET/POST/PUT /cms/pages` & Resolution
- In [`apps/api/app/schemas/cms.py:28-55`](file:///d:/projects/kalp/kalp-business-api/apps/api/app/schemas/cms.py#L28-L55):
  - `PageCreate`: `title: LocalizedText`, `slug: str`, `content: list[PageBlock]`, `isPublished: bool = True`, `metaTitle`, `metaDescription`, `status: "published"`.
- In [`src/app/[locale]/[...slug]/page.tsx:303-363`](file:///d:/projects/kalp/peekeeper-tech/src/app/[locale]/[...slug]/page.tsx#L303-L363):
  - Dynamic catch-all checks `resolvePermalinkAsync()`.
  - If not in DB, it calls `loadPageData(slugKey) || loadPageData(fallbackSlug)`.
  - Renders `<CmsPage slug={slugKey} />`.
  - Thus, `promotions` and `contact` pages work seamlessly as CMS pages backed by `promotionsPage.json` and `contactPage.json`.

---

### 7. `POST /media` and Cloudinary Configuration
- In [`apps/api/app/api/routes/media/upload.py:40-60`](file:///d:/projects/kalp/kalp-business-api/apps/api/app/api/routes/media/upload.py#L40-L60):
  - Reads `mediaConfiguration.cloudinary` from `business_blueprints`.
  - If not configured, file upload throws an error.
  - Local static image assets in `public/images/products/` and `public/images/` with relative URLs are the approved zero-risk approach when Cloudinary is not yet configured for the new tenant.

---

### 8. Authentication for Scripts
- Endpoint: `POST /auth/login`
- Request Body: `{"email": "...", "password": "...", "tenant_slug": "arab-marble"}`
- Response Body: `{"access_token": "...", "expires_at": "...", "session": {...}}`
- Script token extraction: `const token = data.access_token;`
- Injected Headers: `Authorization: Bearer ${token}`, `x-tenant-db: kp_arab_marble`, `x-tenant-slug: arab-marble`.

---

### 9. Map of Files with Cart / Checkout / Diaper Specifics
- **Cart/Checkout/Wishlist UI:**
  - `src/components/layout/Header.tsx` (cart count, cart drawer trigger, currency switcher, user account link)
  - `src/components/cart/CartDrawer.tsx`
  - `src/app/[locale]/cart/page.tsx`
  - `src/app/[locale]/checkout/page.tsx`
  - `src/app/[locale]/wishlist/page.tsx`
  - `src/app/[locale]/account/*`
  - `src/views/checkout/CheckoutPage.tsx`
- **Diaper Sizing & Peekeeper Details:**
  - `src/views/sizing/dog-diaper-size-guide/*`
  - `src/app/[locale]/dog-diaper-size-guide/page.tsx`
  - `src/views/shop/[slug]/sections/NetBagAccessory.tsx`
  - `src/lib/commerce/peekeeper-product-adapter.ts`
  - `src/lib/peekeeper-shop-data.ts`
  - Sizing branches in `src/app/[locale]/[...slug]/page.tsx`

---

### 10. Category Route `/[locale]/category/[id]`
- The parameter is called `[id]`, but [`src/app/[locale]/category/[id]/page.tsx:67-78`](file:///d:/projects/kalp/peekeeper-tech/src/app/[locale]/category/[id]/page.tsx#L67-L78) resolves:
  `const resolved = await resolvePermalinkAsync(`/category/${id}`, { locale, search });`
  `const categorySlug = resolved.slug || id;`
- It works transparently with either a category slug (e.g. `marble`, `granite`) or a MongoDB ObjectId string.

---

## Part 2 — Implementation Plan

### Step 1: Environment & Project Name
- Update `package.json`: `"name": "arab-marble"`.
- Set `.env` with exact requested parameters:
  - `TENANT_DB_NAME="kp_arab_marble"`
  - `NEXT_PUBLIC_TENANT_DB="kp_arab_marble"`
  - `NEXT_PUBLIC_TENANT_SLUG="arab-marble"`
  - `NEXT_PUBLIC_ADMIN_URL="http://localhost:5177"`
  - `NEXT_PUBLIC_PROD_ADMIN_URL="https://zerolive.kalptree.xyz"`
  - `FASTAPI_URL="http://127.0.0.1:8000"`
  - `SMTP_HOST="smtp.hostinger.com"`
  - `SMTP_PORT=465`
  - `SMTP_USER="zero@kalptree.xyz"`
  - `SMTP_PASS="@ETFt74j"`
  - `ADMIN_EMAIL="raghav@gmail.com"`
  - `NEXT_PUBLIC_TENANT_ID=""`
- Ensure `.env` is in `.gitignore`.

### Step 2: Clean Out Unneeded Views & Code
- Remove routes:
  - `src/app/[locale]/cart/`
  - `src/app/[locale]/checkout/`
  - `src/app/[locale]/wishlist/`
  - `src/app/[locale]/account/`
  - `src/app/[locale]/login/`
  - `src/app/[locale]/signup/`
  - `src/app/[locale]/search/`
  - `src/app/[locale]/customer-reviews/`
  - `src/app/[locale]/dog-diaper-size-guide/`
  - `src/app/[locale]/product/[id]/` (redirect to `shop/[slug]`)
  - Remove unused fallback JSON files (`cartPage.json`, `checkoutPage.json`, `wishlistPage.json`, `accountPage.json`, `profilePage.json`, `ordersPage.json`, `dogDiaperSizeGuidePage.json`, `customerReviewsPage.json`, `faqPage.json`, `termsPage.json`, `privacyPage.json`, `returnsPage.json`, `aboutPage.json`).
- Remove sizing sections in `src/views/sizing/`.
- Clean `src/app/[locale]/[...slug]/page.tsx` to strip branches for `customer-reviews`, `dog-diaper-size-guide`, and hardcoded diaper metadata.

### Step 3: Implement Catalog Product Adapter
- Create `src/lib/commerce/catalog-product-adapter.ts`:
  - Dynamically extracts specs (Color, Country, Available Sizes, Finish, Description) from `product.options` and `product.productAttributes`.
  - No pricing, stock, or diaper-specific swatches.
  - Safe against missing or empty variants.

### Step 4: Add New Pages & Views
- **Projects by Category:** Create `src/app/[locale]/projects/[category]/page.tsx` and view component `src/views/projects/ProjectsCategoryPage.tsx`. Fetches `GET /cms/projects`, filters by category string, and renders alternating cards with image slider.
- **Promotions Page:** Add `src/lib/pages/promotionsPage.json` and register `promotions` in `src/components/cms/loader/index.ts`. Add `PromotionsGridSection` in `SectionRenderer`.

### Step 5: Redesign Header & Footer
- **Header (`src/components/layout/Header.tsx`):**
  - Brand Logo: "العربي للرخام / Arab Marble" with local SVG fallback.
  - Navigation: `HOME` · `PRODUCTS ▾` (Marble, Granite, Natural Stones, Artificial Stones) · `PROJECTS ▾` (Iconic, Latest Projects, Custom Projects) · `PROMOTIONS` · `CONTACT US`.
  - Remove cart drawer button, cart count badge, wishlist button, currency switch dropdown, and account icon.
  - Update `src/lib/pages/headerData.json` to match.
- **Footer (`src/components/layout/Footer.tsx`):**
  - Dark grey background (`#4a4a4a`).
  - White logo on left.
  - Contact Us on right (Phone: +971 2 555 4008, Fax: +971 2 555 4005, Email: am@arabmarble.ae).
  - Black bottom bar with copyright and "Designed & Managed by CODIFIED".
  - Update `src/lib/pages/footerData.json` to match.

### Step 6: Adapt Home, Shop, Category, Product, & Contact Pages
- **Home:** Update `homePage.json` with Hero "Create. Build. Design.", "Who We Are", centered statement, and two tiles (`PRODUCTS` and `PROJECTS`).
- **Shop / Products:** Hero "PRODUCTS", 4 category tiles, full catalog grid.
- **Category Page:** Hero banner + category name, filter bar (**All Colors**, **All Countries**, **All Sizes**), 4-column grid, lightbox on image click, single product on name click.
- **Single Product Page (`shop/[slug]`):** Catalog sheet layout, gallery + lightbox, spec table, "Enquire About This Product" button prefilling contact form subject.
- **Contact Us:** Google Map embed for Musaffah M9, contact info left, Email Us form right submitting to `/api/contact` with `?subject=` prefill.

### Step 7: Seed Script
- Create `arab-marble/scripts/seed.ts` (and `scripts/.env.seed.example`):
  - Idempotent API calls.
  - Creates 4 categories (Marble, Granite, Natural Stones, Artificial Stones).
  - Creates 20 catalog products with `type: "catalog"`, specifications in `options` and `productAttributes`, and size variants.
  - Creates projects for Iconic, Latest Projects, and Custom Projects.
  - Creates header, footer, and pages (`home`, `shop`, `contact`, `promotions`).
  - Post-seed validation summary.
- Add `npm run seed` to `package.json`.
- Add `scripts/README.md`.

### Step 8: Build Verification
- Execute `pnpm install` / `npm install`, `typecheck`, and `npm run build`.
- Verify zero TypeScript or lint errors.

