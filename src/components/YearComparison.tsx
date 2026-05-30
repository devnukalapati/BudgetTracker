'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Year } from '@/types/budget'

interface Props { years: Year[] }

function fmt(n: number) {
  return '₹' + (n / 1000).toFixed(1) + 'K cr'
}

export default function YearComparison({ years }: Props) {
  const data = [...years].sort((a, b) => a.year.localeCompare(b.year)).map(y => ({
    year: y.year,
    budget: y.total_budget,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barSize={48} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="year"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: '0.8125rem', fill: '#999', fontFamily: 'inherit' }}
        />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
          contentStyle={{
            border: '1px solid var(--border)', borderRadius: '6px',
            fontSize: '0.8125rem', background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
          }}
          formatter={(v: number) => [fmt(v), 'Total Budget']}
        />
        <Bar dataKey="budget" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === data.length - 1 ? '#111111' : '#CCCCCC'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
