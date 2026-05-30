'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import { useRouter } from 'next/navigation'
import type { Department } from '@/types/budget'

interface Props { departments: Department[]; year: string; topN?: number; stateCode?: string }

const COLORS = [
  '#4F46E5', '#5855E8', '#6362EB', '#6E6FEE',
  '#7A7CF1', '#8589F4', '#9096F7', '#9BA3FA',
  '#A6B0FD', '#B1BDFF',
]

function fmt(n: number) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K'
  return '₹' + n
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 8, padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: 240,
    }}>
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
        {d.payload.fullName}
      </div>
      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)' }}>
        ₹{d.value.toLocaleString('en-IN')} cr
      </div>
    </div>
  )
}

export default function TopDeptBars({ departments, year, topN = 10, stateCode }: Props) {
  const router = useRouter()
  const data = [...departments]
    .sort((a, b) => b.total_budget - a.total_budget)
    .slice(0, topN)
    .map((d, i) => ({
      name: d.name.length > 22 ? d.name.slice(0, 20) + '…' : d.name,
      fullName: d.name,
      budget: d.total_budget,
      dept_id: d.dept_id,
      colorIdx: i,
    }))

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 80, left: 8, bottom: 4 }}
        barSize={22}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'inherit' }}
          tickFormatter={fmt}
        />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#475569', fontFamily: 'inherit' }}
          width={140}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,70,229,0.04)' }} />
        <Bar
          dataKey="budget"
          radius={[0, 6, 6, 0]}
          cursor="pointer"
          onClick={(d) => router.push(`/${stateCode || 'telangana'}/${year}/dept/${d.dept_id}`)}
        >
          {data.map((entry) => (
            <Cell key={entry.dept_id} fill={COLORS[entry.colorIdx % COLORS.length]} />
          ))}
          <LabelList
            dataKey="budget"
            position="right"
            formatter={fmt}
            style={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'inherit' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
