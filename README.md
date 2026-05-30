# India Budget Tracker

A civic transparency portal for exploring Indian government budgets — across states, departments, schemes, and fiscal health indicators.

Live data covers **10 states + Union of India** for fiscal years 2022-23 through 2024-25.

---

## Features

- **State dashboards** — browse budget totals and year-on-year growth for each state
- **Department drill-down** — see how each state allocates spending across departments
- **Scheme-level detail** — budget estimates, revised estimates, and actuals for individual schemes
- **Fiscal health panel** — revenue receipts, tax revenue, fiscal deficit, revenue deficit, and outstanding debt
- **Sankey flow chart** — visualise money flowing from receipts through departments
- **Tender explorer** — vendor-level spending data (where available)
- **Search** — find departments or schemes across any state

## States with Data

| State | 2024-25 Budget | Region |
|---|---|---|
| Union of India (Central) | ₹48,00,000 cr | Central |
| Maharashtra | ₹5,52,000 cr | West |
| Tamil Nadu | ₹4,12,504 cr | South |
| Rajasthan | ₹3,34,796 cr | North |
| Madhya Pradesh | ₹3,26,381 cr | Central |
| Gujarat | ₹3,32,000 cr | West |
| Karnataka | ₹3,35,000 cr | South |
| Odisha | ₹2,43,908 cr | East |
| Bihar | ₹2,56,333 cr | East |
| Telangana | ₹1,77,210 cr | South |

## Tech Stack

- **Frontend** — Next.js 14 (App Router), TypeScript
- **Database** — Amazon DynamoDB (single-table design)
- **Charts** — Recharts
- **Hosting** — runs on port 9000 in dev (`next dev -p 9000`)

## Data Sources

Fiscal figures are sourced from:
- [Open Budgets India](https://openbudgetsindia.org) — state budget documents
- [PRS Legislative Research](https://prsindia.org/budgets/states) — budget analyses per state
- [RBI State Finances](https://rbi.org.in/Scripts/AnnualPublications.aspx?head=State+Finances) — fiscal health indicators

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local DynamoDB)
- AWS CLI configured (for deployed DynamoDB)

### Local Setup

```bash
# Install dependencies
npm install

# Start local DynamoDB
docker-compose up -d

# Create tables
node scripts/create-tables-v2.js

# Seed all states
node scripts/seed-v2.js

# Seed a single state
node scripts/seed-v2.js --state=telangana

# Start dev server
npm run dev
```

The app runs at `http://localhost:9000`.

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
DYNAMODB_ENDPOINT=http://localhost:8000   # omit for AWS
DYNAMODB_TABLE=IndiaBudget
AWS_REGION=us-east-1
```

## Project Structure

```
src/
  app/
    [state]/              # State overview page
    [state]/[year]/       # Year dashboard (departments, charts, fiscal health)
    [state]/[year]/dept/[id]/   # Department detail + schemes
    api/                  # Route handlers (budget, departments, schemes, tenders)
  components/             # Chart and UI components
  lib/                    # DynamoDB client, query helpers, state definitions
  types/                  # Zod schemas
scripts/
  seed-v2.js              # Seeds all state budget data into DynamoDB
  create-tables-v2.js     # Creates DynamoDB tables and indexes
```

## Available State Codes (for seeding)

`telangana` · `maharashtra` · `karnataka` · `rajasthan` · `tamil-nadu` · `gujarat` · `madhya-pradesh` · `bihar` · `odisha` · `central`
