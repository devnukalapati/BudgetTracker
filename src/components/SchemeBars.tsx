'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import type { BudgetAllocation } from '@/types/budget'

interface Props { schemes: BudgetAllocation[]; topN?: number }

function fmt(n: number) {
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K'
  return '₹' + n.toFixed(0)
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 8, padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: 260,
    }}>
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>
        {d.payload.schemeName}
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#4F46E5' }}>
        ₹{d.value.toLocaleString('en-IN')} cr
      </div>
    </div>
  )
}

const COLORS = ['#4F46E5','#06B6D4','#10B981','#F59E0B','#EC4899','#8B5CF6','#F97316','#14B8A6']

export default function SchemeBars({ schemes, topN = 8 }: Props) {
  const data = [...schemes]
    .sort((a, b) => b.budget_estimate - a.budget_estimate)
    .slice(0, topN)
    .map((s, i) => ({
      name: s.scheme_name.length > 30 ? s.scheme_name.slice(0, 28) + '…' : s.scheme_name,
      schemeName: s.scheme_name,
      budget: s.budget_estimate,
      colorIdx: i,
    }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 80, left: 8, bottom: 4 }} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'inherit' }} tickFormatter={fmt} />
        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontFamily: 'inherit' }} width={160} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,70,229,0.04)' }} />
        <Bar dataKey="budget" radius={[0, 6, 6, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.colorIdx % COLORS.length]} fillOpacity={0.85} />
          ))}
          <LabelList dataKey="budget" position="right" formatter={fmt} style={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'inherit' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
