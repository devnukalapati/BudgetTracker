# Telangana Budget Tracker — Product Requirements

## Vision
A public civic transparency website that shows citizens where Telangana's taxpayer money goes — from state-level allocation down to department, scheme, and eventually vendor level. Plain-language, mobile-accessible, data-cited, and useful to a non-expert on first visit.

---

## Target Users

### 1. Curious Citizen
No budget literacy. Arrives from a news story or social share. Wants one clear answer fast: "How much did the government spend on education this year?" Needs plain English, mobile-first experience, and an obvious entry point.

### 2. Journalist / Researcher
Technically comfortable. Arrives with a specific scheme or department in mind. Wants to compare allocations vs actuals, spot anomalies, download raw data, and share deep-links in articles.

### 3. Policy Advocate / NGO Worker
Tracks specific departments or schemes year over year. Wants to quickly see utilization rates, identify underspent schemes, and compare across years.

---

## User Journey (Phase 1)

```
Landing (/)
  Hero headline: "Telangana's 2024-25 Budget: ₹3,24,234 crore"
  Search bar: "Search departments and schemes..."
  3-year bar chart (YearComparison)
  Year selector: 2022-23 | 2023-24 | 2024-25
        |
        ↓
Year Overview (/[year])
  Freshness banner: "Data last updated: 15 March 2025 · Source: OpenBudgetsIndia"
  Department Treemap (primary view — size = budget)
  [Toggle: Show Sankey flow] (secondary, desktop only)
        |
        ↓
Department Page (/[year]/dept/[id])
  Summary: Total allocated · Total spent · Utilization badge
  Schemes table with per-scheme utilization badges
  Year-over-year comparison chart
  [Download CSV]
```

---

## Page-by-Page Requirements

### Landing Page (`/`)

**Must have:**
- Hero `<h1>` headline with the most recent year's total budget in ₹ crore (Indian number format)
  - Example: *"Telangana's 2024-25 Budget: ₹3,24,234 crore — explore where it goes"*
  - Pulls `total_budget` from the `Years` table, most recent `SK`
  - Formatted with `toLocaleString('en-IN')`
- Global search bar (see Search Bar requirement below)
- 3-year bar chart comparing total budget across 2022-23, 2023-24, 2024-25
- Year selector navigating to `/[year]`

**Must not have:**
- No Sankey diagram on the landing page — too complex for a first impression
- No raw numbers without context

---

### Year Overview (`/[year]`)

**Must have:**
- Data freshness banner (see Freshness Banner requirement below)
- Department Treemap as the **primary** visualization
  - Each rectangle = one department; size proportional to `total_budget`
  - Clicking a cell navigates to `/[year]/dept/[id]`
  - Label shows dept name + total in ₹ crore
- Sankey diagram as **optional secondary** view
  - Hidden by default, revealed by a "Show flow diagram" toggle
  - Desktop only — hidden on viewport < 768px
  - Filtered to top 15 departments by budget; remainder grouped as "Others"

**Must not have:**
- Sankey as the default/primary view

---

### Department Drill-Down (`/[year]/dept/[id]`)

**Must have:**
- Department summary header:
  - Name, year, total allocated (BE), total spent (Actuals), overall utilization badge
- Schemes table with columns: Scheme Name | Budget Estimate | Revised Estimate | Actual Spent | Utilization
  - Each row has a utilization badge (see Utilization Badge requirement)
- Year-over-year bar chart for this department across all available years
- CSV download link: `/api/schemes?year=X&deptId=Y&format=csv`
- Source citation: link to original government document for each data point

---

## Component Requirements

### Hero Headline

- Location: `src/app/page.tsx` — rendered as `<h1>`, above all charts
- Data: `total_budget` from `Years` table, most recent year's entry
- Format: `₹X,XX,XXX crore` using `toLocaleString('en-IN')`
- Subtext: one plain-English sentence explaining the site's purpose
- Must be visible without scrolling on a 375px wide mobile screen

---

### Utilization Badge (`src/components/UtilizationBadge.tsx`)

Displays budget utilization rate as a colored pill. Computed entirely client-side from props — no additional API call.

**Formula:** `Math.round((actual_spent / budget_estimate) * 100)`

**Color thresholds:**

| Range | Color | Label | Meaning |
|-------|-------|-------|---------|
| `actual_spent = 0` or missing | Gray | "No spend data" | Future year or data not yet available |
| < 50% | Red | "X% utilized" | Severe underspend — funds stalled |
| 50–80% | Amber | "X% utilized" | Partial execution |
| > 80% | Green | "X% utilized" | On track |

**Rules:**
- When `actual_spent = 0`, always show gray "No spend data" — never show red "0% utilized"
- Used in: dept page summary header, scheme table rows

---

### Search Bar (`src/components/SearchBar.tsx`)

Client-side filter across department names. No new API endpoint required.

**Behaviour:**
- Renders on landing page and year overview page
- Filters the in-memory department list (~50 items max) using `.filter()` on `name`
- Dropdown shows matching department names as selectable results
- Selecting a result navigates to `/[year]/dept/[id]`
- On the year overview page, also filters the visible treemap cells

**Accessibility:**
- `↑` / `↓` keys navigate results
- `Enter` selects the focused result
- `Esc` closes the dropdown
- `role="combobox"` + `aria-expanded` on the input

**Must not:**
- Make a network request — filter from already-loaded data only
- Show results from other years — scoped to the current year context

---

### Freshness Banner (`src/components/FreshnessBanner.tsx`)

A single line displayed below the nav and above page content on `/[year]` and `/[year]/dept/[id]`.

**Content:**
```
Data last updated: 15 March 2025  ·  Source: OpenBudgetsIndia  [↗]
```

- `ingested_at` from the `Years` table for the current year, formatted as `DD Month YYYY`
- Source name: "OpenBudgetsIndia"
- Source link: `source_url` from the first `BudgetAllocations` row for that year
- Link opens in a new tab (`target="_blank" rel="noopener"`)

**Must not appear on:** the landing page `/`

---

### CSV Download

- Endpoint: `GET /api/schemes?year=X&deptId=Y&format=csv`
- Returns `Content-Type: text/csv` with `Content-Disposition: attachment; filename="<dept>-<year>.csv"`
- Columns: `scheme_name, budget_estimate, revised_estimate, actual_spent, utilization_pct, source_url`
- Rendered as a plain `<a>` link on the dept page — no JavaScript required to trigger

---

## Data Requirements

### Years in scope (Phase 1)
- 2022-23
- 2023-24
- 2024-25

### Data fields required per scheme
| Field | Source | Notes |
|-------|--------|-------|
| `dept_name` | OpenBudgetsIndia CSV | Display name |
| `scheme_name` | OpenBudgetsIndia CSV | Display name |
| `budget_estimate` | CSV | BE column (₹ crore) |
| `revised_estimate` | CSV | RE column; may be absent for current year |
| `actual_spent` | CSV | Actuals; 0 if not yet available |
| `source_url` | Ingest script | URL of the source CSV file |
| `ingested_at` | Ingest script | ISO timestamp written at ingest time |

### Data trust rules
- Every number displayed must have a `source_url` linking to the original government document
- `ingested_at` must be visible on every year and department page
- No bank account numbers anywhere in the UI
- Vendor PAN displayed only for public entities (Phase 2+)

---

## Design Language

Inspired by Emil Kowalski's design sensibility: obsessive whitespace, surgical typography, zero decoration, every pixel earns its place. The UI must feel like a premium editorial product — think *ft.com* meets *Linear* — not a government data portal from 2012.

The benchmark: if a designer opened this site and felt the urge to "clean it up", we have failed. The design *is* the content.

---

### Typography

**Typeface:** `Geist` (Vercel's open-source font) with `Inter` as fallback. Variable weight only — no loading multiple weight files.

**Type scale — nothing outside this scale ships:**

| Role | Size | Weight | Color |
|------|------|--------|-------|
| Hero headline (₹ figure) | `clamp(3rem, 7vw, 5.5rem)` | 300 | `#111` |
| Hero subtext | `1.125rem` | 400 | `#666` |
| Page title (dept name) | `2rem` | 400 | `#111` |
| Section label | `0.75rem` | 600 | `#999` |
| Body / table data | `0.9375rem` | 400 | `#111` |
| Secondary / meta | `0.8125rem` | 400 | `#666` |
| Breadcrumb | `0.8125rem` | 400 | `#999` |

**Rules:**
- Numbers always: `font-variant-numeric: tabular-nums` — columns must align
- Section labels always: `text-transform: uppercase`, `letter-spacing: 0.08em` — used sparingly (table headers, category labels)
- No bold above `font-weight: 600` anywhere in the UI
- No decorative fonts, no display fonts, no system serif fallbacks
- Line height: `1.6` for body text, `1.1` for headlines (tight is intentional at large sizes)

---

### Color

One background. One text color. One accent. Semantic color only for data signals. Nothing else.

**Palette:**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#F9F9F8` | Page background — warm off-white, not pure white |
| `--surface` | `#FFFFFF` | Cards, table rows, dropdowns |
| `--border` | `#E8E8E6` | All borders, dividers |
| `--text-primary` | `#111111` | All main content |
| `--text-secondary` | `#666666` | Supporting text, labels |
| `--text-tertiary` | `#999999` | Placeholders, breadcrumbs, timestamps |
| `--accent` | `#0066FF` | Links, focus rings, selected tabs — one blue, nowhere else |
| `--accent-hover` | `#0052CC` | Hover state of accent only |

**Semantic (utilization badges only):**

| Signal | Text color | Background |
|--------|-----------|------------|
| Green (> 80%) | `#1A7F3C` | `#EDFBF0` |
| Amber (50–80%) | `#9A5700` | `#FFF8ED` |
| Red (< 50%) | `#C0392B` | `#FEF0EE` |
| Gray (no data) | `#6B7280` | `#F3F4F6` |

**Hard rules:**
- No gradients, anywhere
- No `box-shadow` with spread > `2px` or blur > `12px`
- The only permitted shadow: `0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)` — used only on dropdowns and floating elements
- No colored section backgrounds — whitespace and borders create structure instead
- Charts: bars use `#111111` at `0.85` opacity; comparison bars use `#0066FF`; no rainbow palettes

---

### Spacing System

Base unit: `4px`. Everything is a multiple of 4.

| Token | Value | Typical use |
|-------|-------|-------------|
| `space-1` | `4px` | Icon gap, badge padding |
| `space-2` | `8px` | Tight inline gaps |
| `space-3` | `12px` | Input padding, small gaps |
| `space-4` | `16px` | Standard component padding |
| `space-6` | `24px` | Card padding, section inner gaps |
| `space-8` | `32px` | Between components on a page |
| `space-12` | `48px` | Between major sections (mobile) |
| `space-16` | `64px` | Between major sections (desktop) |
| `space-20` | `80px` | Page top/bottom padding |

Page container: `max-width: 1100px`, `margin: 0 auto`, `padding: 0 24px`.

---

### Elevation & Borders

There are exactly **two elevation levels:**

1. **Flat** — no shadow, `border: 1px solid var(--border)`. Used for tables, inline components.
2. **Floating** — `box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)`. Used for dropdowns, the search result panel. Nothing else floats.

Border radius: `6px` for inputs and badges, `8px` for cards and dropdowns. Never more.

---

### Motion

Motion communicates state change — nothing else. If an animation does not help the user understand what happened, it does not ship.

| Interaction | Animation | Duration | Easing |
|------------|-----------|----------|--------|
| Page navigation | None — instant | — | — |
| Search dropdown open | `translateY(-6px)→0` + `opacity 0→1` | `150ms` | `ease-out` |
| Search dropdown close | `opacity 1→0` | `100ms` | `ease-in` |
| Treemap cell hover | `opacity 1→0.6` (non-hovered cells) | `120ms` | `ease` |
| Table row hover | `background` color change | `80ms` | `ease` |
| Skeleton shimmer | horizontal gradient sweep | `1.4s` | `linear`, infinite |
| Utilization badge | None — data, not decoration | — | — |
| Bar chart entry | Bars grow from 0 height | `400ms` | `cubic-bezier(0.16,1,0.3,1)` |

No bounce. No spring physics. No `framer-motion` unless it cannot be done with CSS transitions.

---

### Layout

**Landing page:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ← nav (48px, border-bottom)

[80px padding top]

₹3,24,234 crore                       ← clamp(3rem, 7vw, 5.5rem), weight 300
Telangana's 2024-25 State Budget      ← 1.125rem, #666, mt-3

[48px gap]

┌─────────────────────────────────┐
│  Search departments and schemes  │   ← 48px tall, max-width 560px, centered
└─────────────────────────────────┘

[48px gap]

[3-year budget comparison bar chart]   ← full width

[32px gap]

  2022–23    2023–24    2024–25        ← pill tabs, not buttons; active = black bg + white text

[80px padding bottom]
```

**Year overview (`/[year]`):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ← freshness banner (40px, border-bottom)

[48px padding top]

All Departments · 2024-25             ← section label (uppercase, 0.75rem, #999)

[16px gap]

[Department treemap — full width, aspect-ratio 16/7]

                          Show Sankey ↗   ← text link, 0.8125rem, right-aligned

[80px gap]
```

**Department page (`/[year]/dept/[id]`):**
```
Telangana / 2024-25 / Education        ← breadcrumb, 0.8125rem, #999

[32px gap]

Education Department                   ← 2rem, weight 400
₹12,450 crore allocated  ·  [72% utilized]  ← 1rem, #666, badge inline

[48px gap]

SCHEMES                                ← section label
[Full-width schemes table]

[48px gap]

YEAR OVER YEAR                         ← section label
[YoY bar chart — 640px max-width]      Download CSV ↗  ← right-aligned, small

[80px padding bottom]
```

---

### Component Specs

**Nav (global):**
- Height: `48px`, `border-bottom: 1px solid var(--border)`, `background: var(--bg)`
- Left: site wordmark — `font-size: 0.9375rem`, `font-weight: 600`, `letter-spacing: -0.01em`
- Right: nothing in Phase 1 — no hamburger menus, no auth, no clutter
- Sticky on scroll

**Year tabs:**
- Pill style: `border-radius: 100px`, `padding: 6px 16px`
- Inactive: `background: transparent`, `border: 1px solid var(--border)`, `color: #666`
- Active: `background: #111`, `border: 1px solid #111`, `color: #fff`
- Hover (inactive): `border-color: #999`
- Transition: `80ms ease` on background and border-color

**Search bar:**
- Height: `48px`, `border-radius: 6px`
- Border: `1.5px solid var(--border)` default → `1.5px solid var(--accent)` on focus
- No icon in the field — the placeholder carries the meaning
- Focus ring: `box-shadow: 0 0 0 3px rgba(0,102,255,0.12)` — not the browser default
- Dropdown panel: `border: 1px solid var(--border)`, `border-radius: 8px`, floating shadow, `margin-top: 4px`
- Result item: `44px` tall, `padding: 0 16px`, hover: `background: #F5F5F5`
- Keyboard selected item: `background: #F0F6FF`, `color: var(--accent)`

**Schemes table:**
- Header: `font-size: 0.75rem`, `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.08em`, `color: #999`, `height: 40px`
- Row: `height: 52px`, `border-bottom: 1px solid var(--border)`
- Row hover: `background: #F7F7F6`
- Scheme name column: `font-weight: 500`
- Number columns: `font-variant-numeric: tabular-nums`, right-aligned
- Utilization column: right-aligned, `min-width: 120px`
- No vertical lines between columns — ever

**Utilization badge:**
- `border-radius: 100px` (fully rounded pill)
- `padding: 3px 10px`
- `font-size: 0.75rem`, `font-weight: 600`
- `letter-spacing: 0.02em`

**Treemap:**
- Cell gap: `3px`
- Cell border-radius: `4px`
- Label: dept name on first line (`font-size: 0.8125rem`, `font-weight: 500`, white), amount on second (`font-size: 0.75rem`, `rgba(255,255,255,0.75)`)
- Cell color: single color family — dark to light based on budget size (monochromatic, not rainbow)
- Hover: darken cell `10%` + show tooltip with full name + formatted amount

**Freshness banner:**
- Height: `40px`, sticky below nav
- `background: var(--bg)`, `border-bottom: 1px solid var(--border)`
- Text: `font-size: 0.8125rem`, `color: #999`
- Source link: `color: var(--accent)`, underline on hover only

**Skeleton screens (loading states):**
- Match the exact dimensions of the content they replace
- Single shimmer animation — no pulsing opacity, no spinner
- Shimmer: `background: linear-gradient(90deg, #EFEFED 25%, #E5E5E3 50%, #EFEFED 75%)`, `background-size: 200%`, `animation: shimmer 1.4s infinite linear`
- Border-radius matches the component: `4px` for text lines, `8px` for chart blocks

---

### Responsive Behaviour

| Breakpoint | Change |
|------------|--------|
| `< 1024px` | Page padding increases to `32px` |
| `< 768px` | Sankey toggle hidden; treemap becomes horizontal bar chart sorted by size; table RE column hidden |
| `< 640px` | Search bar full-width; hero headline `clamp(2.25rem, 8vw, 3rem)`; section padding halved |
| `< 480px` | Schemes table shows only: name, BE, utilization badge; horizontal scroll disabled |

---

### What Never Ships

These patterns are banned regardless of deadline pressure:

- Gradients on any UI element (data viz excluded)
- Drop shadows with `spread` > 0
- More than one accent color
- `border-radius` > `8px` on any container
- Loading spinners (use skeleton screens)
- Tooltip on hover for mobile-only interactions
- Full-bleed colored hero sections
- Animated number counters ("count up to ₹3,24,234")
- Card grids with equal-sized boxes for unequal data
- Dark mode in Phase 1 — one thing done perfectly beats two things done adequately

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Mobile support | Fully usable on 375px viewport; Sankey hidden on mobile |
| Page load (landing) | < 3s on a 4G connection |
| Sankey correctness | Sum of dept node values must equal `Years.total_budget` |
| Data freshness | `ingested_at` visible on every year/dept page |
| Source citation | Every data point has a clickable source link |
| Accessibility | Search bar keyboard-navigable; color badges have text labels (not color alone) |
| SEO | `<title>` and OG meta tags per page with year and dept name |

---

## Out of Scope (Phase 1)

- Vendor and contract data (Phase 2)
- MGNREGA / beneficiary-level data (Phase 3)
- User accounts, bookmarks, or alerts
- RTI filing
- Authenticated portal scraping
- Historical years before 2022-23

---

## Phased Roadmap

### Phase 1 — MVP (Weeks 1–6): Budget Visualization
Deliverable: Public website showing Telangana budget 2022–2025, clickable hierarchy, utilization signals

### Phase 2 — Vendor & Contract Layer (Weeks 7–12)
Deliverable: Money flow down to company/vendor level via eProcurement scraper

### Phase 3 — Beneficiary & Transaction Level (Weeks 13–20)
Deliverable: MGNREGA district → worker payment data, anomaly detection

### Phase 4 — Multi-State Expansion
Deliverable: Same schema and UI replicated for additional states

---

## Compliance & Data Policy

- Bank account numbers: excluded entirely from UI
- Vendor PAN: display only for public companies/entities
- Source citation link on every data point
- No scraping of authenticated or private portals — public data only
- Site is read-only visualization — no data submission or RTI filing
