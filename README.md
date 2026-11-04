# PeeKeeper Store

PeeKeeper Store is a multi-tenant Next.js 16 ecommerce storefront. Products, categories, cart, orders, CMS pages, forms, branding, and account data are loaded from the Kalptree API through same-origin Next.js route handlers.

## Requirements

- Node.js 20.9 or newer
- pnpm with the checked-in `pnpm-lock.yaml`
- Access to the Kalptree API

## Local Setup

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Open `http://localhost:3000`. On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `FASTAPI_URL` | Yes | Server-only Kalptree API base URL. |
| `TENANT_DB_NAME` | Yes | Authoritative tenant database header used by server proxies. |
| `NEXT_PUBLIC_TENANT_DB` | Studio only | Tenant identifier passed to the hosted Studio client. |
| `NEXT_PUBLIC_TENANT_DB_NAME` | Studio only | Compatibility alias for the hosted Studio client. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Contact form only | SMTP transport configuration. |
| `ADMIN_EMAIL` | Contact form only | Contact-form recipient. |

Do not expose backend credentials through `NEXT_PUBLIC_*` variables. Browser code should call `/api/*`; the server proxy attaches the authoritative tenant database.

## Quality Checks

```bash
pnpm check
pnpm build
```

`pnpm check` regenerates Next.js route types, runs strict TypeScript validation, and runs ESLint. Production builds also enforce TypeScript errors.

## Architecture

- `src/app`: App Router pages and server API routes
- `src/components`: Storefront, CMS, admin, and shared UI components
- `src/lib/apiProxy.ts`: Same-origin proxy and tenant-header boundary
- `src/lib/store`: Redux Toolkit feature state and API thunks
- `src/lib/services`: Typed server/client data services
- `src/views`: Route-level ecommerce experiences
