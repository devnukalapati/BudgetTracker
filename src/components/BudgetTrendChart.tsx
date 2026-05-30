'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { Year } from '@/types/budget'

interface Props { years: Year[] }

function fmt(n: number) {
  return '₹' + (n / 1000).toFixed(1) + 'K cr'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 8, padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)' }}>
        {fmt(payload[0].value)}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>Total Budget</div>
    </div>
  )
}

export default function BudgetTrendChart({ years }: Props) {
  const data = [...years]
    .sort((a, b) => a.year.localeCompare(b.year))
    .map(y => ({ year: y.year, budget: y.total_budget }))

  const max = Math.max(...data.map(d => d.budget))
  const min = Math.min(...data.map(d => d.budget))
  const avg = data.reduce((s, d) => s + d.budget, 0) / data.length

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="year"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#94A3B8', fontFamily: 'inherit' }}
        />
        <YAxis
          hide
          domain={[min * 0.9, max * 1.05]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <ReferenceLine
          y={avg}
          stroke="#CBD5E1"
          strokeDasharray="4 4"
          label={{ value: 'Avg', position: 'right', fontSize: 11, fill: '#94A3B8' }}
        />
        <Area
          type="monotone"
          dataKey="budget"
          stroke="#4F46E5"
          strokeWidth={2.5}
          fill="url(#budgetGrad)"
          dot={{ fill: '#4F46E5', r: 5, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ fill: '#4F46E5', r: 7, strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
