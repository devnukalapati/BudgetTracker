'use client'

import type { Department } from '@/types/budget'

interface Props { departments: Department[]; year: string; stateCode?: string }

const COLORS = ['#2D31A6','#0891B2','#059669','#D97706','#DB2777','#7C3AED','#EA580C','#0D9488','#DC2626','#9333EA']

export default function DeptTable({ departments, year, stateCode }: Props) {
  const total = departments.reduce((s, d) => s + d.total_budget, 0)

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 48 }}>#</th>
            <th>Department</th>
            <th className="right">Budget (₹ crore)</th>
            <th className="right">Share</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept, i) => {
            const pct = ((dept.total_budget / total) * 100).toFixed(1)
            const barWidth = (dept.total_budget / departments[0].total_budget) * 100
            const color = COLORS[i % COLORS.length]
            return (
              <tr key={dept.dept_id}>
                <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', width: 48 }}>
                  {i + 1}
                </td>
                <td>
                  <a href={`/${stateCode || 'telangana'}/${year}/dept/${dept.dept_id}`} className="link-accent" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {dept.name}
                  </a>
                  <div className="progress-bar" style={{ marginTop: 6, maxWidth: 260 }}>
                    <div className="progress-bar-fill" style={{
                      width: `${barWidth}%`,
                      background: color,
                      opacity: 0.55,
                    }} />
                  </div>
                </td>
                <td className="right" style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {dept.total_budget.toLocaleString('en-IN')}
                </td>
                <td className="right">
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: 100,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: `${color}12`,
                    color,
                  }}>
                    {pct}%
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
