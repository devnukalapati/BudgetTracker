'use client'

interface Props {
  budgetEstimate: number
  actualSpent: number
}

export default function UtilizationBadge({ budgetEstimate, actualSpent }: Props) {
  if (!actualSpent || actualSpent === 0) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        borderRadius: '100px', padding: '3px 10px',
        fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.02em',
        background: '#F3F4F6', color: '#6B7280',
      }}>
        No spend data
      </span>
    )
  }
  const pct = Math.round((actualSpent / budgetEstimate) * 100)
  let bg = '#EDFBF0', color = '#1A7F3C'
  if (pct < 50) { bg = '#FEF0EE'; color = '#C0392B' }
  else if (pct < 80) { bg = '#FFF8ED'; color = '#9A5700' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      borderRadius: '100px', padding: '3px 10px',
      fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.02em',
      background: bg, color,
    }}>
      {pct}% utilized
    </span>
  )
}
