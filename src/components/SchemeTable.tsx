'use client'

import UtilizationBadge from './UtilizationBadge'
import type { BudgetAllocation } from '@/types/budget'

interface Props { schemes: BudgetAllocation[]; year: string; deptId: string }

export default function SchemeTable({ schemes, year, deptId }: Props) {
  const maxBE = schemes[0]?.budget_estimate ?? 1

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            {[
              { label: 'Scheme', align: 'left' },
              { label: 'Budget Est. (₹ cr)', align: 'right' },
              { label: 'Revised Est. (₹ cr)', align: 'right' },
              { label: 'Actual Spent (₹ cr)', align: 'right' },
              { label: 'Utilization', align: 'center' },
            ].map(h => (
              <th key={h.label} style={{
                textAlign: h.align as any,
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-tertiary)',
                padding: '0 12px 14px',
                height: '40px',
                verticalAlign: 'bottom',
                whiteSpace: 'nowrap',
              }}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schemes.map((s, i) => {
            const barPct = (s.budget_estimate / maxBE) * 100
            return (
              <tr
                key={i}
                style={{ borderBottom: '1px solid var(--border)', transition: 'background 100ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 12px', verticalAlign: 'middle', maxWidth: 300 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>
                    {s.scheme_name}
                    {s.source_url && (
                      <a href={s.source_url} target="_blank" rel="noopener noreferrer"
                        style={{ marginLeft: 6, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>↗</a>
                    )}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${barPct}%`, background: 'var(--primary)', opacity: 0.5 }} />
                  </div>
                </td>
                <td style={{ padding: '14px 12px', verticalAlign: 'middle', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {s.budget_estimate.toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '14px 12px', verticalAlign: 'middle', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {s.revised_estimate.toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '14px 12px', verticalAlign: 'middle', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {s.actual_spent > 0 ? s.actual_spent.toLocaleString('en-IN') : '—'}
                </td>
                <td style={{ padding: '14px 12px', verticalAlign: 'middle', textAlign: 'center', minWidth: 120 }}>
                  <UtilizationBadge budgetEstimate={s.budget_estimate} actualSpent={s.actual_spent} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
