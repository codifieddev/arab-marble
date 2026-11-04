# Arab Marble Seed Scripts

This directory contains database seeding utilities for the `arab-marble` tenant.

## Prerequisites

1. Ensure `kalp-business-api` is running on `http://127.0.0.1:8000`.
2. Ensure the tenant `arab-marble` has been created or onboarded in the system.
3. Configure authentication parameters in your environment or in `.env`:
   - `SEED_API_URL` (default: `http://127.0.0.1:8000`)
   - `SEED_TENANT_SLUG` (default: `arab-marble`)
   - `SEED_ADMIN_EMAIL` (default: `raghav@gmail.com`)
   - `SEED_ADMIN_PASSWORD` (default: `Admin@123456`)
   - Alternatively, provide `SEED_BEARER_TOKEN`.

## Running the Seed

```bash
# Inside d:\projects\kalp\arab-marble
npm run seed
```

## Seed Contents

The seed script is **idempotent** (safe to run multiple times without duplicating entries). It seeds:
1. **CMS Header** (`POST /cms/headers`): Navigation items matching the storefront structure (HOME, PRODUCTS with subcategories, PROJECTS with subcategories, PROMOTIONS, CONTACT US).
2. **CMS Footer** (`POST /cms/footers`): 2-column footer with white logo, UAE contact details (+971 2 555 4008, am@arabmarble.ae), and copyright statement.
3. **Commerce Categories** (`POST /commerce/categories`):
   - Marble
   - Granite
   - Natural Stones
   - Artificial Stones
4. **Commerce Products** (`POST /commerce/products`):
   - 20 catalog-type products (e.g. Omani Beige, Crema Marfil, Dark Emperador, Calacatta Oro, etc.) with `type: "catalog"`, specifications (Color, Country of Origin, Available Sizes, Finish), zero price placeholder, and inquiry readiness.
5. **CMS Projects** (`POST /cms/projects`):
   - Landmark architectural projects (Boulevard Heights, Burj Vista, Clemenceau Medical Center, The Address - Fountain Views, Emirates Palace, etc.) categorized under `Latest Projects`, `Iconic`, and `Custom Projects`.

