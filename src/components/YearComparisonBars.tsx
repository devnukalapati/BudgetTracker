'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import type { Year } from '@/types/budget'

interface Props { years: Year[] }

function fmt(n: number) {
  return '₹' + (n / 1000).toFixed(1) + 'K cr'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const prev = payload[0]?.payload?.prev
  const curr = payload[0]?.value
  const growth = prev ? (((curr - prev) / prev) * 100).toFixed(1) : null
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 8, padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{fmt(curr)}</div>
      {growth !== null && (
        <div style={{
          fontSize: '0.8125rem', fontWeight: 600, marginTop: 4,
          color: Number(growth) >= 0 ? '#059669' : '#DC2626',
        }}>
          {Number(growth) >= 0 ? '↑' : '↓'} {Math.abs(Number(growth))}% from prior year
        </div>
      )}
    </div>
  )
}

export default function YearComparisonBars({ years }: Props) {
  const sorted = [...years].sort((a, b) => a.year.localeCompare(b.year))
  const data = sorted.map((y, i) => ({
    year: y.year,
    budget: y.total_budget,
    prev: i > 0 ? sorted[i - 1].total_budget : null,
    isLatest: i === sorted.length - 1,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barSize={52} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="year"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 13, fill: '#94A3B8', fontFamily: 'inherit' }}
        />
        <YAxis
          hide
          domain={[0, (max: number) => max * 1.12]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,70,229,0.04)' }} />
        <Bar dataKey="budget" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={entry.year}
              fill={entry.isLatest ? '#4F46E5' : `rgba(79,70,229,${0.25 + i * 0.15})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
