# civic-web

AfricanShops civic web app — civic verticals only (civic-tax, security/SOC,
youth sports, governance, healthcare, social welfare, digital education), plus
the shared auth/finance-wallet/KYC/profile modules every vertical needs.
Forked from `customer-web` (the marketplace app) on 2026-07-25 and stripped of
all business/marketplace modules — see `feature/strip-customer-modules` for
the full diff.

This repo has **no backend of its own**. It talks to the same shared gateway
every other AfricanShops frontend uses (`africanshops-microservices`), just a
different subset of the services behind it.

## Local dev setup

1. Start the backend, scoped to civic (from a checkout of
   `africanshops-microservices`, not this repo):

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile civic up
   ```

   This starts the gateway + `civictax`, `soc`, `governance`, `healthcare`,
   `youthsports`, `digitaleducation`, `social-media`, plus the shared
   `auth-service`/`fintech`/`ledger`/`places`/`redis`/`postgres-civic` — not
   the full 21-service platform. See `docker-compose-guide.md` in that repo
   for the other available profiles (`bookings`, `products`, `food`,
   `property`, `social`, `all`) if you need to bring up a business vertical
   alongside civic for a cross-cutting test.

2. Install and run this app:

   ```bash
   yarn install
   yarn dev
   ```

   Runs on **http://localhost:3002** (not 3000 — `customer-web`,
   `control-dashboard`, and `shop-dashboard` all default to 3000, so this is
   deliberately different to let civic-web run alongside any of them during
   dev). `.env` already points `VITE_API_BASE_URL_PROD` at the gateway
   (`http://localhost:8000`).

## Known gaps (not yet built)

- No real landing page — `/` redirects to `/sign-in` (see the strip PR's own
  notes).
- Shared auth/finance-v2/KYC/profile code is currently a **duplicate**, not
  shared, with `customer-web` — both repos forked from the same original
  codebase and now diverge independently. A shared-package extraction is a
  separate, not-yet-scoped follow-up; until then, a fix to shared code in one
  repo does not automatically apply to the other.
