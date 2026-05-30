'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { BudgetAllocation } from '@/types/budget'

interface Props { allocations: BudgetAllocation[] }

export default function YoYChart({ allocations }: Props) {
  const byYear: Record<string, { be: number; actuals: number }> = {}
  for (const a of allocations) {
    if (!byYear[a.year]) byYear[a.year] = { be: 0, actuals: 0 }
    byYear[a.year].be += a.budget_estimate
    byYear[a.year].actuals += a.actual_spent
  }
  const data = Object.entries(byYear)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, v]) => ({ year, 'Budget Estimate': v.be, 'Actual Spent': v.actuals }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="year" axisLine={false} tickLine={false}
          tick={{ fontSize: '0.8125rem', fill: '#999', fontFamily: 'inherit' }} />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            border: '1px solid var(--border)', borderRadius: '6px',
            fontSize: '0.8125rem', background: '#fff',
          }}
          formatter={(v: number) => ['₹' + v.toLocaleString('en-IN') + ' cr']}
        />
        <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#999', paddingTop: '8px' }} />
        <Bar dataKey="Budget Estimate" fill="rgba(17,17,17,0.75)" radius={[3, 3, 0, 0]} barSize={28} />
        <Bar dataKey="Actual Spent" fill="#0066FF" fillOpacity={0.8} radius={[3, 3, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
