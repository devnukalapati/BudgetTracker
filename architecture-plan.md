# Telangana Budget Tracker — Architecture & Implementation Plan

## Context
Public civic transparency website showing Telangana government budget flows (2022–2025): State → Dept → Scheme → Vendor. Node.js only (no Python, no Airflow). Runs on EC2, deployable to Lambda. Port **9000**. Git-initialized with GitHub Actions CI/CD.

---

## Revised Technology Stack

| Layer | Tool | Replaces |
|-------|------|---------|
| Frontend + API | Next.js 14 (App Router) | FastAPI + separate Next.js |
| Database | DynamoDB | PostgreSQL + ltree |
| Ingest pipeline | Node.js scripts (csv-parse + axios) | Python/Airflow/pdfplumber |
| Deployment | EC2 (`node server.js`) + Lambda (AWS Lambda Web Adapter) | ECS Fargate |
| CI/CD | GitHub Actions | Manual |
| Port | **9000** | 3000 |

---

## AWS Deployment Architecture

```
CloudFront (CDN)
    |
API Gateway HTTP API
    |
Lambda (Next.js standalone + AWS Lambda Web Adapter)
    OR
EC2 (node .next/standalone/server.js on port 9000)
    |
DynamoDB (BudgetAllocations, Departments, Years)
    |
S3 Bucket (raw CSV source files, versioned)
```

- **Frontend + API**: Next.js `output: 'standalone'` — single artifact for both EC2 and Lambda
- **Database**: DynamoDB (no RDS, no VPC complexity)
- **Storage**: S3 for raw CSVs with versioning
- **CI/CD**: GitHub Actions → rsync to EC2 on merge to main

---

## File Structure

```
/
├── .git/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # lint + type-check on PR
│       └── deploy-ec2.yml             # build + deploy to EC2 on push to main
├── architecture-plan.md               # this file
├── package.json
├── next.config.js                     # output: 'standalone'
├── tsconfig.json
├── .env.example
├── .env.local                         # gitignored
├── .gitignore
├── docker-compose.yml                 # DynamoDB Local (port 8000), app (port 9000)
├── scripts/
│   └── create-tables.js              # one-time DynamoDB table provisioning
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                   # "/" — year selector + 3-year bar chart
    │   ├── [year]/
    │   │   ├── page.tsx               # Sankey flow + dept treemap
    │   │   └── dept/[id]/page.tsx     # Scheme table + YoY chart
    │   └── api/
    │       ├── budget/years/route.ts
    │       ├── departments/route.ts   # ?year=
    │       ├── schemes/route.ts       # ?year=&deptId=
    │       └── ingest/route.ts        # POST — triggers CSV scraper
    ├── components/
    │   ├── YearComparison.tsx         # Recharts BarChart (client)
    │   ├── SankeyChart.tsx            # d3-sankey, next/dynamic ssr:false
    │   ├── DeptTreemap.tsx            # Recharts Treemap (client)
    │   ├── YoYChart.tsx               # Recharts BarChart per dept (client)
    │   ├── UtilizationBadge.tsx       # colored pill: % of budget spent
    │   ├── SearchBar.tsx              # client-side dept/scheme filter
    │   └── FreshnessBanner.tsx        # "Data last updated" + source link
    ├── lib/
    │   ├── dynamodb.ts                # DynamoDBDocumentClient singleton
    │   ├── budget-queries.ts          # getYears, getDepartments, getSchemes, getDeptAllYears
    │   └── ingest/
    │       ├── index.ts               # orchestrator: fetch → parse → BatchWrite
    │       ├── sources.ts             # year → CSV URL map (openbudgetsindia.org)
    │       └── transform.ts           # CSV row → DynamoDB item, slugify dept_id
    └── types/
        └── budget.ts                  # Year, Department, BudgetAllocation interfaces
```

---

## DynamoDB Schema

### Table: `BudgetAllocations`

| Attribute | Type | Notes |
|-----------|------|-------|
| `PK` | S | `YEAR#2024-25` |
| `SK` | S | `DEPT#<dept_id>#SCHEME#<scheme_id>` |
| `dept_id` | S | Plain slug, stored for GSI |
| `dept_name` | S | Display name |
| `scheme_name` | S | Display name |
| `budget_estimate` | N | BE figure (₹ crore) |
| `revised_estimate` | N | RE figure |
| `actual_spent` | N | Actuals (0 for future years) |
| `source_url` | S | Citation link to original CSV |

**GSI `DeptIndex`**: PK=`dept_id`, SK=`PK` (year) — powers year-over-year dept drill-down

### Table: `Departments`

| Attribute | Type | Notes |
|-----------|------|-------|
| `PK` | S | `YEAR#2024-25` |
| `SK` | S | `DEPT#<dept_id>` |
| `dept_id` | S | |
| `name` | S | Display name |
| `total_budget` | N | Sum of budget_estimate for year |

### Table: `Years`

| Attribute | Type | Notes |
|-----------|------|-------|
| `PK` | S | `YEARS` (literal constant) |
| `SK` | S | `2024-25` |
| `total_budget` | N | Entire state budget |
| `ingested_at` | S | ISO timestamp |

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/budget/years` | List all ingested years |
| GET | `/api/departments?year=` | Departments + totals for a year |
| GET | `/api/schemes?year=&deptId=` | Schemes for a dept+year |
| POST | `/api/ingest` | Trigger CSV download + DynamoDB load |

All routes: `export const dynamic = 'force-dynamic'` to prevent stale build-time caching.

---

## Frontend Pages

| Route | Component | Data |
|-------|-----------|------|
| `/` | Landing | Hero headline + search bar + `<YearComparison>` bar chart + year selector |
| `/[year]` | Year overview | Freshness banner + `<DeptTreemap>` (primary) + Sankey toggle (secondary) |
| `/[year]/dept/[id]` | Dept drill-down | Utilization summary + scheme table with badges + `<YoYChart>` + CSV download |

---

## Product Requirements (Phase 1 Additions)

Four additions that move the site from a developer demo to a usable civic tool. No new API routes or schema changes needed — all implemented in the UI layer.

### 1. Hero Headline on Landing (`src/app/page.tsx`)

The landing page must open with a single human-readable statement before any chart or selector:

```
Telangana's 2024-25 Budget: ₹3,24,234 crore
Explore how taxpayer money flows from the state to every department and scheme.
```

- Pull `total_budget` from the most recent `Years` entry (already in schema)
- Format as `₹X,XX,XXX crore` using Indian number formatting (`toLocaleString('en-IN')`)
- Render as an `<h1>` above the year selector — visible without scrolling on mobile

**Why**: A first-time visitor has no context. This single sentence tells them what the site is and why it matters before they touch anything.

---

### 2. Utilization Badge (`src/components/UtilizationBadge.tsx`)

A colored pill showing `(actual_spent ÷ budget_estimate) × 100` on every scheme row and department summary.

```
< 50%   → red    "38% utilized"   (severe underspend — funds stalled)
50–80%  → amber  "67% utilized"   (partial execution)
> 80%   → green  "91% utilized"   (on track)
0%      → gray   "No spend data"  (future year or missing actuals)
```

Implementation:
- Pure client component, no API call — computed from props already fetched
- Used in `src/app/[year]/dept/[id]/page.tsx` scheme table and dept summary header
- `actual_spent = 0` when data not yet available — show gray "No spend data" not a red 0%

**Why**: The single most civic-relevant insight this site can show. A scheme with ₹500 crore allocated and ₹80 crore spent is a story. Surfaces it without requiring the user to do any math.

---

### 3. Global Search Bar (`src/components/SearchBar.tsx`)

Client-side filter across department and scheme names. No new API endpoint — filters the already-loaded list in memory.

```
[Search departments and schemes...        🔍]
```

- Renders on the landing page and the year overview page
- On the landing page: searches department names, navigates to `/[year]/dept/[id]` on select
- On the year overview: filters the visible treemap cells and a results list below
- Implementation: `useState` + `.filter()` on the departments array (max ~50 items — entirely in memory, no debounce needed)
- Keyboard accessible: `↑↓` to navigate results, `Enter` to select, `Esc` to close

**Why**: Journalists and advocates arrive with a specific scheme or department in mind. Without search they cannot find it without knowing the hierarchy. This is a day-1 user need.

---

### 4. Data Freshness Banner (`src/components/FreshnessBanner.tsx`)

A single line at the top of every page (below the nav, above content) showing when data was last ingested and the source.

```
Data last updated: 15 March 2025  ·  Source: OpenBudgetsIndia  ·  [View source ↗]
```

- Reads `ingested_at` from the `Years` table entry for the current year (already in schema)
- `ingested_at` is an ISO timestamp — format as `DD Month YYYY` for display
- `source_url` links to the original CSV on openbudgetsindia.org (stored per row in `BudgetAllocations`, use the first row's URL for the banner)
- Show on `/[year]` and `/[year]/dept/[id]` — not needed on the landing page

**Why**: Users will not trust data they cannot verify. A visible timestamp and source link converts a skeptical visitor into a believer. The field already exists in the schema — this is a two-hour UI addition.

---

## Port Configuration

Port **9000** everywhere:

- `package.json` dev script: `next dev -p 9000`
- `package.json` start script: `PORT=9000 node .next/standalone/server.js`
- `.env.example`: `PORT=9000`
- `docker-compose.yml`: app service exposes `9000:9000`
- Lambda env vars: `PORT=9000`, `AWS_LWA_PORT=9000`
- GitHub Actions health check: `curl http://<EC2_HOST>:9000/api/budget/years`

---

## `next.config.js`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['csv-parse'],
  },
}
module.exports = nextConfig
```

`output: 'standalone'` bundles only used `node_modules` into `.next/standalone/` — makes `node server.js` self-contained on EC2 and zippable for Lambda.

`serverComponentsExternalPackages: ['csv-parse']` required — csv-parse uses Node.js streams that crash Next.js's bundle analyzer.

---

## `docker-compose.yml`

```yaml
services:
  dynamodb-local:
    image: amazon/dynamodb-local:latest
    ports:
      - "8000:8000"
    command: "-jar DynamoDBLocal.jar -sharedDb -inMemory"
```

`-sharedDb` prevents the common gotcha where different AWS regions see empty tables.

---

## GitHub Actions Workflows

### `ci.yml` — runs on every PR
```yaml
on: [pull_request]
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with: { node-version: '20' }
  - run: npm ci
  - run: npx tsc --noEmit
  - run: npm run build
```

### `deploy-ec2.yml` — runs on push to main
```yaml
on:
  push:
    branches: [main]
steps:
  - checkout + setup-node + npm ci + npm run build
  - rsync .next/standalone/, .next/static/, public/ to EC2 via SSH
  - SSH: pm2 restart budget-tracker (or systemd reload)
  - Health check: curl http://${{ secrets.EC2_HOST }}:9000/api/budget/years
```

**GitHub Secrets required**: `EC2_HOST`, `EC2_SSH_KEY`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

---

## Deployment

### EC2
```bash
npm run build
PORT=9000 node .next/standalone/server.js
# with pm2:
pm2 start .next/standalone/server.js --name budget-tracker -- -p 9000
```

### Lambda
1. Attach [AWS Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter) layer
2. Zip: `zip -r function.zip .next/standalone/ .next/static/ public/`
3. Lambda env vars:
   - `PORT=9000`
   - `AWS_LWA_PORT=9000`
   - `AWS_LAMBDA_EXEC_WRAPPER=/opt/bootstrap`
4. Wire API Gateway HTTP API → Lambda with `/{proxy+}` catch-all

---

## Key Implementation Notes

### Ingest pipeline (`src/lib/ingest/`)

- **`sources.ts`**: Hardcode CSV URLs from openbudgetsindia.org (discover UUIDs manually — they are stable once published). Multiple CSVs per year (one per demand/grant).
- **`transform.ts`**: Column alias map per year (column names differ, e.g. "BE 2024-25" vs "Budget Estimate"). `dept_id = slugify(dept_name)` — must be **stable across all years and re-ingests** (normalize: strip punctuation → lowercase → replace spaces with `-`).
- **`index.ts`**: `BatchWriteItem` in chunks of 25 (DynamoDB limit). Retry `UnprocessedItems` with exponential backoff, max 3 retries. After all rows: aggregate totals → write `Departments` + `Years` tables.
- **Lambda ingest**: `await runIngest()` synchronously (Lambda freezes process after response is sent; fire-and-forget doesn't work). Set Lambda timeout to 15 min.

### Visualizations

- **SankeyChart**: `next/dynamic({ ssr: false })` — d3-sankey accesses `document` during layout. Filter to top 15 depts by budget; group rest as "Others" (50+ depts is unreadable).
- **DeptTreemap**: Recharts Treemap, clicking a cell navigates to `/[year]/dept/[id]` via `useRouter`.

### DynamoDB local dev

- `.env.local`: `DYNAMODB_ENDPOINT=http://localhost:8000`
- `lib/dynamodb.ts`: if `DYNAMODB_ENDPOINT` is set, use it; otherwise SDK uses real AWS endpoint + default credential chain (IAM role on EC2/Lambda — never hardcode credentials).

---

## `package.json` Scripts

```json
{
  "scripts": {
    "dev": "next dev -p 9000",
    "build": "next build",
    "start": "PORT=9000 node .next/standalone/server.js",
    "create-tables": "node scripts/create-tables.js"
  }
}
```

---

## Dependencies

```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "18.x",
    "react-dom": "18.x",
    "@aws-sdk/client-dynamodb": "^3.x",
    "@aws-sdk/lib-dynamodb": "^3.x",
    "csv-parse": "^5.x",
    "recharts": "^2.x",
    "d3-sankey": "^0.12.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "@types/node": "^20.x",
    "@types/d3-sankey": "^0.12.x"
  }
}
```

---

## Build Order

1. `git init` + `.gitignore` + initial commit
2. `package.json` + `npm install`
3. `next.config.js`, `tsconfig.json`, `.env.example`
4. `docker-compose.yml`
5. `scripts/create-tables.js` → `docker-compose up -d` + `npm run create-tables`
6. `src/lib/dynamodb.ts` — verify connects to DynamoDB Local
7. `src/types/budget.ts`
8. `src/lib/ingest/sources.ts` — find CSV URLs on openbudgetsindia.org
9. `src/lib/ingest/transform.ts` — download sample CSV, build column alias map
10. `src/lib/ingest/index.ts` — orchestrator with batched writes + retry
11. `src/app/api/ingest/route.ts` → test: `curl -X POST localhost:9000/api/ingest`
12. `src/lib/budget-queries.ts`
13. API routes (years, departments, schemes) → test with curl on port 9000
14. UI components + pages (landing → year view → dept drill-down)
15. `.github/workflows/ci.yml` + `deploy-ec2.yml`
16. Push to GitHub → verify CI passes

---

## Verification Checklist

- [ ] `curl -X POST localhost:9000/api/ingest` → 202; DynamoDB Local tables populated
- [ ] `curl localhost:9000/api/budget/years` → array of 3 year objects
- [ ] `curl "localhost:9000/api/departments?year=2024-25"` → dept list with totals
- [ ] Landing page renders hero headline with correct `total_budget` from most recent year
- [ ] Search bar on landing filters department names; selecting one navigates correctly
- [ ] Landing page bar chart renders with 3 years of data
- [ ] `/2024-25` treemap renders as primary view; Sankey available via toggle
- [ ] `/2024-25` freshness banner shows correct `ingested_at` date and source link
- [ ] `/2024-25/dept/<id>` scheme table shows utilization badges with correct colors
- [ ] Utilization badge shows gray "No spend data" when `actual_spent = 0`
- [ ] CSV download link on dept page returns valid CSV
- [ ] `/2024-25/dept/<id>` YoY chart renders
- [ ] Sankey correctness: sum of dept values = `Years.total_budget`
- [ ] `npm run build` passes (no TS errors, standalone output exists)
- [ ] GitHub Actions CI green on PR
- [ ] Deploy workflow SSHes to EC2 and health-check passes on port 9000

---

## Data Sources (Phased)

### Phase 1 — MVP (Weeks 1–6)
- **OpenBudgetsIndia CSVs** — Tier 1, structured, Node.js csv-parse
- Years: 2022-23, 2023-24, 2024-25
- Deliverable: Sankey budget hierarchy visualization

### Phase 2 — Vendor & Contract Layer (Weeks 7–12)
- eProcurement portal scraper (tender.telangana.gov.in)
- PFMS data for centrally sponsored schemes
- New DynamoDB tables: `Vendors`, `Contracts`

### Phase 3 — Beneficiary & Transaction Level (Weeks 13–20)
- MGNREGA portal: district → worker payment data
- Anomaly detection: flag over-budget schemes, stalled funds

### Phase 4 — Multi-State Expansion
- Same DynamoDB schema, new state prefix in PK (e.g. `STATE#maharashtra#YEAR#2024-25`)

---

## Compliance & Data Policy

- Bank account numbers: excluded entirely from UI
- Vendor PAN: display only for public entities
- Every data point cites `source_url` linking to original government document
- No scraping of authenticated/private portals — public data only
- Read-only visualization — no RTI filing feature
