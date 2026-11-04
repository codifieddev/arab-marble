# E-Commerce Features & Updates Required for Peekeeper-Tech

> **Source:** Comparison of `peekeeper-tech` (current) vs `nestcraft-living/Untitled` (target e-commerce app)
> **Date:** July 11, 2026
> **Note:** This list covers all dynamic features needed — static page content is excluded unless the underlying infrastructure is missing.

---

## 1. 📦 STATE MANAGEMENT — Missing Redux Slices & Store Structure

### Add to Redux Store (`src/redux/`)

| Slice | Status | Description |
|-------|--------|-------------|
| `authSlice` | ✅ Exists | — |
| `cartSlice` | ✅ Exists (basic) | Needs async thunks (fetchCart, addToCartAsync, updateQuantityAsync, removeFromCartAsync, clearCartAsync) |
| `wishlistSlice` | ✅ Exists (basic) | Needs async thunks |
| `pagesSlice` | ✅ Exists | — |
| `blueprintSlice` | ✅ Exists | — |
| `productsSlice` | ❌ Missing | Full product CRUD with variants, options, gallery management |
| `categoriesSlice` | ❌ Missing | Category CRUD with types (product/portfolio/blog) |
| `attributesSlice` | ❌ Missing | Attribute sets management |
| `ordersSlice` | ❌ Missing | Order tracking, history |
| `usersSlice` | ❌ Missing | User management |
| `menusSlice` | ❌ Missing | Menu management |
| `formsSlice` | ❌ Missing | Form builder management |
| `brandingSlice` | ❌ Missing | Tenant branding |
| `websiteDetailSlice` | ❌ Missing | Website settings |
| `commentsSlice` | ❌ Missing | Comments/annotations |
| `businessBlueprintSlice` | ❌ Missing | Business blueprints |
| **Admin Slices** | | |
| `adminCategoriesSlice` | ❌ Missing | Admin category state |
| `adminOrdersSlice` | ❌ Missing | Admin order state |
| `adminVariantsSlice` | ❌ Missing | Variant management |
| `adminAttributesSlice` | ❌ Missing | Admin attributes state |
| `adminTenantsSlice` | ❌ Missing | Multi-tenant management |

### Redux Hooks
- Create typed hooks: `useAppDispatch`, `useAppSelector`, `useAppStore`

---

## 2. 🔐 AUTHENTICATION SYSTEM

### Pages & Routes
| Feature | Details |
|---------|---------|
| **Login page** | `/login` — form with email/password, JWT token management |
| **Signup page** | `/signup` — registration form |
| **Auth API** | `POST /api/login`, `POST /api/signup` — JWT-based with cookies |
| **Auth utility** | JWT verification, cookie management, `admin_token` + tenant-specific `auth_token_{tenantId}` |
| **PKCE flow** | OAuth PKCE code verifier + challenge generation (`lib/pkce.ts`) |
| **Auth middleware** | Route protection for admin, role-based access (customer vs tenant_admin) |
| **Session management** | Cookie-based auth with `authenticateAdmin()` server-side helper |

### Auth Thunks
- `loginThunk` — async login with credentials
- `logoutThunk` — async logout + cookie cleanup
- `getUserThunk` — fetch current user
- `updateProfileThunk` — update user profile

---

## 3. 🛒 CART SYSTEM (Enhanced)

### Current: Basic local cart → Target: Full async cart

| Feature | Description |
|---------|-------------|
| **Async cart thunks** | `fetchCart`, `addToCartAsync`, `updateQuantityAsync`, `removeFromCartAsync`, `clearCartAsync` |
| **Cart API** | `GET/POST/PUT/DELETE /api/ecommerce/cart` |
| **Cart types** | Full `CartItem` with `selectedOptions`, `selectedVariant`, `cartItemId` |
| **Server sync** | Cart synced to backend, not just localStorage |
| **Cart authority** | Kalp Business API via `/api/commerce/cart` |

---

## 4. ❤️ WISHLIST SYSTEM (Enhanced)

### Current: Basic local wishlist → Target: Full wishlist

| Feature | Description |
|---------|-------------|
| **Wishlist page** | `/wishlist` with full client component |
| **Wishlist thunks** | Add/remove/clear with server sync |
| **Wishlist API** | REST endpoints for wishlist management |
| **Persistent storage** | localStorage + server-side sync |

---

## 5. 📋 ORDER MANAGEMENT

### Pages & Components
| Feature | Details |
|---------|---------|
| **Orders page** | `/orders` — list all user orders |
| **Order detail page** | `/orders/[id]` — single order view |
| **Account page** | `/account` — user profile + orders overview |
| **Orders client component** | `OrdersPageClient.tsx` — full page UI |
| **Account client component** | `AccountPageClient.tsx` — user dashboard |

### API & Services
| Feature | Details |
|---------|---------|
| **Orders API** | `GET /api/commerce/orders`, `GET /api/commerce/orders/[id]` |
| **Order types** | Full `Order`, `OrderItem`, `OrderPricing`, `OrderAddress`, `OrderPayment` interfaces |
| **Order service** | `lib/services/orders.ts` — `getOrders()`, `getOrderById()` |

### Admin Order Management
| Feature | Details |
|---------|---------|
| **Admin orders page** | `/admin/orders` — list all orders |
| **Admin order detail** | `/admin/orders/[id]` — manage order |
| **Order status tracking** | `fulfillmentStatus`, `statusHistory` |
| **Order admin slice** | `adminOrdersSlice` |

---

## 6. 🏪 PRODUCT MANAGEMENT

### Admin Product Studio
| Feature | Details |
|---------|---------|
| **Admin products page** | `/admin/products` — product listing |
| **New product page** | `/admin/products/new` — create product |
| **Edit product page** | `/admin/products/[id]` — edit product |
| **Product studio components** | |
| → `GeneralInformation.tsx` | Name, SKU, slug, description, status |
| → `OptionConfiguration.tsx` | Product options with variant generation |
| → `VariantMatrix.tsx` | Variant grid with SKU/price/stock per option combination |
| → `PricingInventory.tsx` | Price, compare-at, cost, tax, inventory tracking |
| → `VisualMedia.tsx` | Gallery management, primary image |
| → `PublicationSidebar.tsx` | Save/publish workflows |
| → `Common.tsx` | Shared utilities |
| → `Toast.tsx` | Notification feedback |
| **Product form components** | `CreateProductForm.tsx`, `EditProductForm.tsx`, `SimpleProductForm.tsx` |
| **Data import modal** | `DataImportModal.tsx`, `ImportModal.tsx` — bulk product import |

### Product Types & Utilities
| Feature | Description |
|---------|-------------|
| `ProductFormState` | Full product shape with options, variants, gallery, pricing |
| `ProductOption` | Option with label, values, variant usage toggle |
| `VariantRow` | Variant with SKU, price, stock, option values |
| `ProductGalleryItem` | Gallery item with URL, alt, order |
| `RelatedProduct` | Related product reference |
| **Utility functions** | `slugify()`, `sanitizeKey()`, `composeVariantKey()`, `buildCombinationTitle()`, `buildVariantCombinations()`, `generateVariantsFromOptions()`, `parseGallery()`, `readFileAsDataUrl()` |

### Product API Routes
| Route | Methods |
|-------|---------|
| `/api/ecommerce/products` | GET, POST |
| `/api/ecommerce/products/[id]` | GET, PUT, DELETE |
| `/api/ecommerce/products/bulk` | POST (bulk import) |
| `/api/ecommerce/upload` | POST (media upload) |

---

## 7. 📂 CATEGORY MANAGEMENT

### Admin Pages
| Feature | Details |
|---------|---------|
| **Admin categories page** | `/admin/categories` — manage categories |
| **Categories types** | `product`, `portfolio`, `blog` |
| **Category record shape** | name, slug, type, parentId, description, banner, meta |

### Category API Routes
| Route | Methods |
|-------|---------|
| `/api/ecommerce/categories` | GET, POST |
| `/api/ecommerce/categories/bulk` | POST (bulk import) |
| `/api/ecommerce/categories/[id]` | PUT, DELETE |

### Category Components
| Feature | Description |
|---------|-------------|
| `category/accordionSection` | Accordion-style category display |
| `category/pageHead` | Category page header |
| `category/Pagination.tsx` | Product grid pagination |
| `category/PriceRangeFilter.tsx` | Price-based product filtering |

---

## 8. 🎛️ ADMIN DASHBOARD

### Core Infrastructure
| Feature | Details |
|---------|---------|
| **Admin layout** | `/admin` — protected layout with sidebar |
| **Sidebar component** | `app-sidebar.tsx` — navigation sidebar |
| **Admin bar** | `AdminBar.tsx` — top bar |
| **Route protection** | JWT verification, customer role redirect |

### Dashboard Page (`/admin`)
| Feature | Details |
|---------|---------|
| **Stats cards** | Total Products, Categories, Orders, Attributes with trends |
| **Revenue chart** | Area chart with recharts (`ResponsiveContainer`, `AreaChart`) |
| **Activity feed** | Recent system activity list |
| **Status indicators** | Live connection, database sync status |

### Admin Sub-modules
| Module | Route | Description |
|--------|-------|-------------|
| **Products** | `/admin/products` | Product listing + create/edit/import |
| **Categories** | `/admin/categories` | Category CRUD |
| **Orders** | `/admin/orders` | Order management + fulfillment |
| **Customers** | `/admin/customers` | Customer profiles + addresses |
| **Users** | `/admin/users` | User management (create/edit) |
| **Pages** | `/admin/pages` | Page builder/CMS |
| **Forms** | `/admin/forms` | Form builder (create/edit forms) |
| **Form Submissions** | `/admin/form-submissions` | View form submissions |
| **Attributes** | `/admin/attributes` | Attribute sets management |
| **Variants** | `/admin/variants` | Variant management |
| **Branding** | `/admin/branding` | Tenant branding, country/language config |
| **Theme** | `/admin/theme` | Theme manager |
| **Media** | `/admin/media` | Media library |
| **Sync** | `/admin/sync` | Data synchronization |
| **Account Settings** | `/admin/account-settings` | Account configuration |
| **Menu Management** | Via CMS | Menu CRUD |

### Admin Components
| Category | Components |
|----------|------------|
| **Products** | `ProductStudio.tsx`, `studio/GeneralInformation.tsx`, `studio/VariantMatrix.tsx`, `studio/PricingInventory.tsx`, `studio/OptionConfiguration.tsx`, `studio/VisualMedia.tsx`, `studio/PublicationSidebar.tsx`, `studio/Common.tsx`, `studio/Toast.tsx` |
| **Customers** | `CustomerForm.tsx`, `AddressForm.tsx` |
| **CMS** | `PageEditor.tsx`, `ContentItem.tsx`, `SectionBlock.tsx` |
| **Forms** | `FormBuilder.tsx` |
| **Media** | `MediaManager.tsx`, `MediaLibraryModal.tsx` |
| **Branding** | `CountrySearchModal.tsx`, `languageMapping.ts` |
| **Users** | `UserForm.tsx` |

---

## 9. 📝 CMS / PAGE BUILDER

### Current → Target Enhancements
| Feature | Description |
|---------|-------------|
| **Page Editor** | Full admin page editor (`PageEditor.tsx`, `ContentItem.tsx`, `SectionBlock.tsx`) |
| **Page Loader** | Dynamic page loading by slug (`PageLoader.tsx`) |
| **Dynamic page rendering** | `GetAllPages.tsx`, `FetchAllData.tsx`, `UpdateCurrentPage.tsx` |
| **CMS sections** | Menu management via `cms/menus/` |
| **Editor utils** | `editorUtils.ts` — field save by sectionId + fieldPath |
| **CMS utils** | `cmsUtils.ts` — `getSection()`, `getV()` helpers |

### API Routes
| Route | Methods |
|-------|---------|
| `/api/pages` | GET, POST |
| `/api/pages/[id]` | GET, PUT, DELETE |

---

## 10. 🗄️ DATABASE LAYER

### API Persistence
| Feature | Details |
|---------|---------|
| **API proxy** | `lib/apiProxy.ts` forwards same-origin requests to Kalp Business API |
| **Tenant authority** | The server adds the configured tenant database name to proxied requests |
| **Persistence owner** | Kalp Business API owns CMS, catalog, cart, order, and blueprint persistence |
| **Frontend database driver** | None |

---

## 11. 💳 PAYMENT GATEWAY

### Gateway Architecture
| Feature | Details |
|---------|---------|
| **Abstract gateway class** | `PaymentGateway` — `loadscript()`, `initiatePayment()`, `buildOrderPaymentBlock()` |
| **Razorpay integration** | `RazorpayGateway` — script loading, checkout modal, payment handler |
| **Gateway registry** | `getGateway(id)` — extensible plugin system |
| **Order payload types** | `OrderPayload`, `OrderPayment`, `OrderItem`, `Address`, `ShippingMethod` |

### Payment Methods
- `cod` (Cash on Delivery)
- `razorpay` (Online payments)
- Extensible: stripe, paypal slots available

---

## 12. 🎨 UI COMPONENT LIBRARY

### Missing shadcn/ui Components
| Component | Status |
|-----------|--------|
| `button.tsx` | ❌ Missing |
| `card.tsx` | ❌ Missing |
| `badge.tsx` | ❌ Missing |
| `input.tsx` | ❌ Missing |
| `textarea.tsx` | ❌ Missing |
| `select.tsx` | ❌ Missing |
| `checkbox.tsx` | ❌ Missing |
| `switch.tsx` | ❌ Missing |
| `label.tsx` | ❌ Missing |
| `separator.tsx` | ❌ Missing |
| `tabs.tsx` | ❌ Missing |
| `dialog.tsx` | ❌ Missing |
| `sheet.tsx` | ❌ Missing |
| `dropdown-menu.tsx` | ❌ Missing |
| `tooltip.tsx` | ❌ Missing |
| `breadcrumb.tsx` | ❌ Missing |
| `sidebar.tsx` | ❌ Missing |
| `table.tsx` | ❌ Missing |
| `skeleton.tsx` | ❌ Missing |
| `chart.tsx` | ❌ Missing (recharts wrapper) |
| `ErrorFallback.tsx` | ❌ Missing |
| `PageSkeleton.tsx` | ❌ Missing |

### Additional UI Libraries
| Library | Purpose |
|---------|---------|
| `motion` (framer-motion) | Animations |
| `recharts` | Charts (admin dashboard) |
| `sonner` | Toast notifications |
| `lucide-react` | Icons |
| `class-variance-authority` | Component variants |
| `tailwind-merge` / `clsx` | Class merging |

---

## 13. 🏠 HOMEPAGE SECTIONS

### Missing Homepage Component Sections
| Section | Components | Data |
|---------|-----------|------|
| **Hero** | `Hero.tsx`, `MainHeroSlider.tsx` | Slider-based hero |
| **Collections** | `Collections.tsx` | `collectionsData.ts` |
| **Product Slider** | `ProductSlider.tsx` | `productSliderData.ts` |
| **Featured Banner** | `FeaturedBanner.tsx` | `featuredBannerData.ts` |
| **USP** | `USP.tsx` | `uspData.ts` |
| **Testimonials** | `Testimonials.tsx` | `testimonialsData.ts` |
| **FAQ** | `FAQ.tsx` | `faqData.ts` |
| **Blog** | `Blog.tsx` | `blogData.ts` |
| **Newsletter** | `Newsletter.tsx` | `newsletterData.ts` |
| **Service Section** | `Service.tsx` | `serviceData.ts` |
| **Shop by Room** | `ShopByRoom.tsx` | `shopByRoomData.ts` |
| **Instagram Gallery** | `InstagramGallery.tsx`, `InstagramPostEmbed.tsx` | `instagramData.ts` |
| **Logo Strip** | `LogoStrip.tsx` | — |
| **Craft Section** | `Craft.tsx` | `craftData.ts` |

### E-commerce Template Sections (for dynamic e-commerce page)
| Section | Components | Data |
|---------|-----------|------|
| **Hero Section** | `ecommerce/heroSection/HeroSection.tsx` | `heroSectionData.ts` |
| **Testimonials** | `ecommerce/testimonials/Testimonials.tsx` | `testimonialsData.ts` |
| **Newsletter** | `ecommerce/newsletterSection/NewsletterSection.tsx` | `newsletterSectionData.ts` |
| **FAQ** | `ecommerce/faqSection/FaqSection.tsx` | `faqSectionData.ts` |
| **Product Grid** | `ecommerce/productGrid/ProductGrid.tsx` | `productGridData.ts` |
| **CTA Banner** | `ecommerce/ctaBanner/CtaBanner.tsx` | `ctaBannerData.ts` |
| **Category Grid** | `ecommerce/categoryGrid/CategoryGrid.tsx` | `categoryGridData.ts` |
| **Featured Collections** | `ecommerce/featuredCollections/FeaturedCollections.tsx` | `featuredCollectionsData.ts` |
| **Dynamic Renderer** | `ecommerce/DynamicRenderer.tsx` | Section registry |
| **E-commerce Registry** | `ecommerce/ecommerceRegistry.tsx` | Section type → Component mapping |
| **Server Component** | `EcommercePageServer.tsx` | Server-side page rendering |

---

## 14. ➡️ ABOUT PAGE SECTIONS

| Section | Directory |
|---------|-----------|
| About Nestcraft | `aboutpage/aboutNestcraft/` |
| Design Philosophy | `aboutpage/designPhilosophy/` |
| Our Process | `aboutpage/ourProcess/` |
| Difference | `aboutpage/difference/` |
| Our Story | `aboutpage/ourStory/` |
| Why Choose Us | `aboutpage/whyChooseUs/` |
| Stats Section | `aboutpage/statsSection/` |

---

## 15. 📧 CONTACT PAGE SECTIONS

| Section | Directory |
|---------|-----------|
| Contact Form | `contactpage/contactForm/` |
| FAQ | `contactpage/faq/` |
| Contact Hero | `contactpage/contactHero/` |

---

## 16. 🔧 INFRASTRUCTURE & API

### New API Route Structure
```
/api/
├── [[...slug]]/route.ts         ← Dynamic API proxy (FastAPI backend)
├── auth/
│   ├── login/route.ts
│   ├── signup/route.ts
│   └── logout/route.ts
├── ecommerce/
│   ├── products/route.ts + [id]/ + bulk/
│   ├── categories/route.ts + bulk/
│   ├── cart/route.ts
│   ├── orders/route.ts + [id]/
│   ├── variants/route.ts
│   ├── attributes/route.ts + bulk/
│   └── upload/route.ts
├── admin/
│   ├── website/route.ts
│   ├── tenants/route.ts
│   └── media/route.ts
├── pages/route.ts + [id]/
├── comments/route.ts
└── contact/route.ts
```

### API Proxy
- `lib/apiProxy.ts` — routes API requests to FastAPI backend
- Handles: header forwarding, body relay, cookie passthrough
- Tenant-aware via `x-tenant-db` header

### Environment Variables
| Variable | Purpose |
|----------|---------|
| `TENANT_DB_NAME` | Tenant-specific database name |
| `NEXT_PUBLIC_TENANT_ID` | Public tenant identifier |
| `JWT_SECRET` | JWT signing secret |
| `FASTAPI_URL` | Backend API URL |
| `OWN_URL` | Self-referencing URL for API calls |
| `NEXT_PUBLIC_API_BASE_URL` | Public API base URL |

---

## 17. 🎪 BRANDING & THEME

| Feature | Details |
|---------|---------|
| **Branding Initializer** | `BrandingInitializer.tsx` — loads tenant config on app start |
| **Theme Initializer** | `ThemeInitializer.tsx` — applies theme CSS variables |
| **Theme Manager** | Admin page `/admin/theme` — `ThemeManager.tsx` |
| **Branding admin** | Country search, language mapping |
| **Tenant registry** | `getTenantRegistry()` — loads branding from backend |

---

## 18. 🧩 ANNOTATION PLUGIN

| Feature | Details |
|---------|---------|
| **AnnotatorPlugin** | In-page annotation system |
| **Marker** | Selection marker component |
| **Comment store** | Redux store for comments |
| **Comment management** | Add, resolve, delete comments |
| **API** | `POST /api/comments` |
| **UI Styles** | `style.css` — annotation overlay styling |

---

## 19. 🔄 DATA PROVIDERS & FETCHING

### Data Fetching Components
| Component | Purpose |
|-----------|---------|
| `GetAllDetails/GetAllProducts.tsx` | Fetch all products on app init |
| `GetAllDetails/GetAllCategories.tsx` | Fetch all categories |
| `GetAllDetails/GetAllAttributes.tsx` | Fetch all attribute sets |
| `GetAllDetails/GetAllForms.tsx` | Fetch all forms |
| `GetAllDetails/GetUser.tsx` | Initialize user state |
| `GetAllDetails/GetCart.tsx` | Initialize cart from server |
| `GetAllDetails/GetSingleProduct.tsx` | Fetch single product |
| `GetAllDetails/GetProductCategoryWise.tsx` | Products by category |
| `FetchAllData.tsx` | Composite data fetcher |

---

## 20. 📦 NEW DEPENDENCIES

Add to `package.json`:

```json
{
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "bcryptjs": "^3.0.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cookie": "^1.1.1",
    "jsonwebtoken": "^9.0.3",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "radix-ui": "^1.4.3",
    "react-hook-form": "^7.71.2",
    "recharts": "^2.15.4",
    "shadcn": "^4.1.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.3.6",
    "zustand": "^5.0.12"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.14",
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie": "^0.6.0",
    "@types/jsonwebtoken": "^9.0.10"
  }
}
```

---

## 21. 📄 NEW PAGES

### Frontend Pages
| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/signup` | Signup page |
| `/blog` | Blog listing page |
| `/services` | Services page |
| `/ecommerce` | E-commerce dynamic page |
| `/category/[id]` | Category listing page |
| `/product/[id]` | Product detail page (dynamic route) |

### Admin Pages
| Route | Description |
|-------|-------------|
| `/admin/products` | Product listing |
| `/admin/products/new` | Create product |
| `/admin/products/[id]` | Edit product |
| `/admin/categories` | Category management |
| `/admin/orders` | Order listing |
| `/admin/orders/[id]` | Order detail |
| `/admin/customers` | Customer listing |
| `/admin/customers/new` | Create customer |
| `/admin/customers/[id]` | Edit customer |
| `/admin/users` | User management |
| `/admin/users/new` | Create user |
| `/admin/users/[id]` | Edit user |
| `/admin/pages` | Page management |
| `/admin/pages/new` | Create page |
| `/admin/pages/[id]` | Edit page |
| `/admin/forms` | Form builder |
| `/admin/forms/new` | Create form |
| `/admin/forms/[id]` | Edit form |
| `/admin/form-submissions` | View submissions |
| `/admin/attributes` | Attribute sets |
| `/admin/variants` | Variant management |
| `/admin/branding` | Branding settings |
| `/admin/theme` | Theme manager |
| `/admin/media` | Media library |
| `/admin/sync` | Data sync |
| `/admin/account-settings` | Account settings |

---

## 22. 🏗️ PROJECT STRUCTURE CHANGES

### New Directories to Create
```
components/ui/                      ← shadcn components
components/ecommerce/               ← E-commerce page sections
components/homepage/                ← Homepage sections
components/aboutpage/               ← About page sections
components/contactpage/             ← Contact page sections
components/auth/                    ← Auth components
components/products/                ← Product form components
components/category/                ← Category components
components/branding/                ← Branding initializer
components/theme/                   ← Theme initializer
components/admin/products/studio/   ← Product studio components
components/admin/cms/               ← Admin CMS components
components/admin/customers/         ← Admin customer components
components/admin/forms/             ← Admin form builder
components/admin/media/             ← Admin media library
components/admin/branding/          ← Admin branding
components/admin/users/             ← Admin user forms
components/annotationPlugin/        ← Annotation system
components/pages/                   ← Page rendering components
components/cms/menus/               ← Menu management
components/businessBluePrints/      ← Business blueprint init
components/wesiteDetail/            ← Website detail init
lib/store/                          ← Full redux store structure
lib/paymentgateway/                 ← Payment gateway architecture
lib/services/                       ← Order service
lib/admin-products/                 ← Product utilities
lib/GetAllDetails/                  ← Data fetching components
hooks/                              ← Custom hooks
data/                               ← Data files
docs/                               ← Documentation
```

---

## Summary

This project requires a **significant feature expansion** to reach full e-commerce capability. The core areas needing the most work are:

1. **🔐 Authentication** — Complete login/signup with JWT + cookie management
2. **📦 Admin Dashboard** — Full admin panel with 15+ management modules
3. **🛒 Cart & Wishlist** — Async server-synced cart and wishlist
4. **🏪 Product & Category Management** — CRUD with variants, options, galleries
5. **📋 Order System** — Order tracking, history, admin management
6. **💳 Payment Gateway** — Razorpay integration (extensible)
7. **🗄️ Persistence** — Kalp Business API + server-controlled tenant routing
8. **🎨 UI Library** — shadcn/ui components, sidebar, charts, toast, animations
9. **🏠 Homepage Sections** — 15+ section types (hero, collections, blog, etc.)
10. **📝 CMS** — Full page builder with editor

