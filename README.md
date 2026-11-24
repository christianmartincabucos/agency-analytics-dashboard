# Afterglow Agency Analytics

A read-only analytics dashboard for an OnlyFans agency using Angular 22, Angular Material 22, Chart.js, and a Node.js/Express BFF. Infloww credentials are read only by the server. The browser receives aggregated dashboard values and never receives the API key or agency OID.

## Run locally

Requires Node.js 22+.

```sh
npm install
cp .env.example .env
# Add your Infloww read-only API key and agency OID to .env
npm start
```

Open [http://localhost:4200](http://localhost:4200). Angular serves the UI and proxies `/api` requests to the Node service on port 4444. If credentials are not configured, the service serves clearly labeled sample data so the dashboard can be previewed without contacting Infloww.

For a production-style local run:

```sh
npm run build
npm run serve
```

The Express service serves the built Angular app on [http://localhost:4444](http://localhost:4444).

## Live API integration

The BFF currently reads:

| Dashboard data | Infloww endpoint |
| --- | --- |
| Creator roster | `GET /v1/creators?platformCode=OnlyFans` |
| Earnings and daily trend | `GET /v1/transactions` |
| Active fan counts | `GET /v1/creator-report/fans/count` |
| Chatter revenue | `GET /v1/employee-report/employee-sales-summary` |
| Chatter messages and PPV unlocks | `GET /v1/employee-report/employee-chat-summary` |
| Tracking, trial and campaign links | `GET /v1/links` |
| Employee roster | `GET /v1/employees` |

Requests use `Authorization: <API key>` and `x-oid: <agency OID>`, matching the Infloww API reference. The configured base URL defaults to `https://openapi.infloww.com`. Pagination follows response cursors; date ranges are split into at most 31-day windows; creator report calls are grouped into batches of at most 10 IDs; 429 and 5xx responses retry with backoff. Endpoint failures are returned as warnings while other dashboard sections continue loading. Dashboard responses are cached in memory for five minutes by range.

Only `GET` is accepted under `/api`. The server has no write proxy. Adjust `AMOUNT_DIVISOR` only if the account's API amount units differ from cents. The API can omit metrics based on permissions or reporting availability; missing values render as zero/empty states. Live period comparisons are marked unavailable until a previous-period comparison is implemented; demo percentages are illustrative.

## Project structure

- `src/app/design-system/atoms/` — foundational brand, status, and avatar primitives
- `src/app/design-system/molecules/` — metric card, navigation item, and date-range selector
- `src/app/design-system/organisms/` — sidebar, header, KPI overview, revenue insights, creator table, team and marketing panels, and data notices
- `src/app/design-system/templates/` — reusable analytics shell that places organisms into the page layout
- `src/app/pages/` — dashboard page with live data loading, state, and navigation
- `shared/` — API view models and a range-aware demo fixture shared by the browser and BFF
- `src/styles/dashboard.scss` — shared dashboard visual system styles
- `src/app/` — standalone Angular components using Signals and OnPush change detection
- `server/index.ts` — Express API proxy, endpoint aggregation, retry, pagination and cache
- `.env.example` — safe configuration template; actual credentials belong in ignored `.env`
- `proxy.conf.json` — local Angular-to-Express API proxy

The UI hierarchy follows [Brad Frost’s Atomic Design stages](https://atomicdesign.bradfrost.com/chapter-2/): atoms form molecules, molecules and atoms assemble into organisms, templates arrange those sections, and the dashboard page supplies real or demo data.

## Unit tests

Run `npm test` for the Angular/Vitest suite. It covers creator sorting and search, 7/30/90-day range selection and request parameters, range-specific data shapes, navigation, refresh controls, status notices, and promotion conversion rates.

## API references

- [Infloww OpenAPI documentation](https://infloww-openapi.stoplight.io/)
- [Infloww API base URL](https://openapi.infloww.com/v1)

This workspace does not have a configured remote Git repository or hosting account. The app can be run locally using the commands above; deploy the Node service and built `dist/agency-analytics/browser` directory together to publish a live demo.
