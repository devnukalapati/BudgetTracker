'use client'

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { Department } from '@/types/budget'

interface Props { departments: Department[]; topN?: number }

const COLORS = [
  '#4F46E5', '#06B6D4', '#10B981', '#F59E0B',
  '#EC4899', '#8B5CF6', '#F97316', '#14B8A6',
  '#EF4444', '#A855F7',
]

function fmt(n: number) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L cr'
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K cr'
  return '₹' + n.toLocaleString('en-IN') + ' cr'
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 8, padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      maxWidth: 220,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: d.payload.fill, display: 'inline-block', marginRight: 6,
      }} />
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</span>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
        {fmt(d.value)}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
        {d.payload.pct}% of total
      </div>
    </div>
  )
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }: any) => {
  if (pct < 3) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={600} fontFamily="Inter, sans-serif">
      {pct}%
    </text>
  )
}

export default function AllocationPie({ departments, topN = 8 }: Props) {
  const sorted = [...departments].sort((a, b) => b.total_budget - a.total_budget)
  const top = sorted.slice(0, topN)
  const rest = sorted.slice(topN)
  const restTotal = rest.reduce((s, d) => s + d.total_budget, 0)
  const total = sorted.reduce((s, d) => s + d.total_budget, 0)

  const data = [
    ...top.map(d => ({
      name: d.name.length > 28 ? d.name.slice(0, 27) + '…' : d.name,
      value: d.total_budget,
      pct: Math.round((d.total_budget / total) * 100),
    })),
    ...(restTotal > 0 ? [{ name: 'Others', value: restTotal, pct: Math.round((restTotal / total) * 100) }] : []),
  ]

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>
              {value}
            </span>
          )}
          wrapperStyle={{ paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
