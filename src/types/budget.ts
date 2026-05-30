import { z } from 'zod'

// ── Zod schemas (source of truth) ──────────────────────────────
export const YearSchema = z.object({
  year: z.string().regex(/^\d{4}-\d{2}$/),
  total_budget: z.number().nonnegative(),
  ingested_at: z.string(),
  state_code: z.string().optional(),
})

export const DepartmentSchema = z.object({
  dept_id: z.string(),
  name: z.string(),
  total_budget: z.number().nonnegative(),
  year: z.string(),
  state_code: z.string().optional(),
})

export const BudgetAllocationSchema = z.object({
  dept_id: z.string(),
  dept_name: z.string(),
  scheme_name: z.string(),
  budget_estimate: z.number().nonnegative(),
  revised_estimate: z.number().nonnegative(),
  actual_spent: z.number().nonnegative(),
  source_url: z.string(),
  year: z.string(),
  state_code: z.string().optional(),
})

export const FiscalHealthSchema = z.object({
  state_code: z.string(),
  year: z.string(),
  revenue_receipts: z.number(),
  tax_revenue: z.number(),
  non_tax_revenue: z.number(),
  grants_in_aid: z.number(),
  capital_receipts: z.number(),
  borrowings: z.number(),
  total_expenditure: z.number(),
  fiscal_deficit: z.number(),
  revenue_deficit: z.number(),
  outstanding_debt: z.number(),
  debt_to_gdp_pct: z.number().optional(),
  source_url: z.string().optional(),
})

export const StateIndexSchema = z.object({
  code: z.string(),
  name: z.string(),
  region: z.string(),
  capital: z.string(),
  has_data: z.boolean(),
  latest_year: z.string().optional(),
  total_budget: z.number().optional(),
})

export const TenderSchema = z.object({
  tender_id: z.string(),
  title: z.string(),
  company_name: z.string(),
  company_gstin: z.string().optional(),
  contract_value: z.number(),
  bid_date: z.string(),
  award_date: z.string().optional(),
  status: z.enum(['awarded', 'open', 'cancelled']),
  gem_order_id: z.string().optional(),
  scheme_name_hint: z.string().optional(),
  match_confidence: z.enum(['high', 'medium', 'low']).optional(),
  source: z.enum(['gem', 'cppp', 'state_portal']),
  dept_id: z.string().optional(),
  state_code: z.string().optional(),
  year: z.string().optional(),
})

// ── Derived TypeScript types ───────────────────────────────────
export type Year = z.infer<typeof YearSchema>
export type Department = z.infer<typeof DepartmentSchema>
export type BudgetAllocation = z.infer<typeof BudgetAllocationSchema>
export type FiscalHealth = z.infer<typeof FiscalHealthSchema>
export type StateIndex = z.infer<typeof StateIndexSchema>
export type Tender = z.infer<typeof TenderSchema>
