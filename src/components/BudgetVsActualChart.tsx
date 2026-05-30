'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import type { BudgetAllocation } from '@/types/budget'

interface Props { allocations: BudgetAllocation[] }

function fmt(n: number) {
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K cr'
  return '₹' + n.toLocaleString('en-IN') + ' cr'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const be = payload.find((p: any) => p.dataKey === 'be')?.value ?? 0
  const spent = payload.find((p: any) => p.dataKey === 'actuals')?.value ?? 0
  const util = be > 0 ? Math.round((spent / be) * 100) : 0
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 8, padding: '14px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#4F46E5' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Budget Est: </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(be)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#10B981' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Actual Spent: </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(spent)}</span>
        </div>
        {spent > 0 && (
          <div style={{
            marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)',
            fontSize: '0.8125rem', fontWeight: 700,
            color: util >= 80 ? '#059669' : util >= 50 ? '#D97706' : '#DC2626',
          }}>
            {util}% utilized
          </div>
        )}
      </div>
    </div>
  )
}

export default function BudgetVsActualChart({ allocations }: Props) {
  const byYear: Record<string, { be: number; actuals: number }> = {}
  for (const a of allocations) {
    if (!byYear[a.year]) byYear[a.year] = { be: 0, actuals: 0 }
    byYear[a.year].be += a.budget_estimate
    byYear[a.year].actuals += a.actual_spent
  }
  const data = Object.entries(byYear)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, v]) => ({ year, be: v.be, actuals: v.actuals }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={4} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="year"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#94A3B8', fontFamily: 'inherit' }}
        />
        <YAxis
          hide
          domain={[0, (max: number) => max * 1.12]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,70,229,0.04)' }} />
        <Legend
          iconType="square"
          iconSize={10}
          formatter={(val) => (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>
              {val === 'be' ? 'Budget Estimate' : 'Actual Spent'}
            </span>
          )}
          wrapperStyle={{ paddingTop: 8 }}
        />
        <Bar dataKey="be" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={32} fillOpacity={0.85} />
        <Bar dataKey="actuals" fill="#10B981" radius={[4, 4, 0, 0]} barSize={32} fillOpacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  )
}
