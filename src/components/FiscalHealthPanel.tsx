import type { FiscalHealth } from '@/types/budget'

interface Props { fiscal: FiscalHealth | null; year: string; stateName: string }

function fmtCr(n: number) {
  if (Math.abs(n) >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L cr'
  return '₹' + Math.abs(n).toLocaleString('en-IN') + ' cr'
}

export default function FiscalHealthPanel({ fiscal, year, stateName }: Props) {
  if (!fiscal) {
    return (
      <div className="card-padded" style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.6 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Fiscal health data for {stateName} {year} is not yet available.</span>
      </div>
    )
  }

  const deficitPct = fiscal.total_expenditure > 0
    ? Math.round((Math.abs(fiscal.fiscal_deficit) / fiscal.total_expenditure) * 100)
    : 0

  const revenueFinancedPct = 100 - deficitPct

  const taxPct = fiscal.revenue_receipts > 0 ? Math.round((fiscal.tax_revenue / fiscal.revenue_receipts) * 100) : 0
  const nonTaxPct = fiscal.revenue_receipts > 0 ? Math.round((fiscal.non_tax_revenue / fiscal.revenue_receipts) * 100) : 0
  const grantsPct = 100 - taxPct - nonTaxPct

  return (
    <div className="card-padded" style={{ marginBottom: 28 }}>
      <div className="section-head">
        <span className="section-label">Fiscal Health</span>
        <h2>Revenue, Deficit &amp; Debt · {year}</h2>
      </div>

      {/* 3-column stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Revenue Receipts', value: fmtCr(fiscal.revenue_receipts), sub: 'Total income', color: '#059669' },
          { label: 'Borrowings', value: fmtCr(fiscal.borrowings), sub: 'New debt this year', color: '#D97706' },
          { label: 'Fiscal Deficit', value: fmtCr(fiscal.fiscal_deficit), sub: 'Expenditure gap', color: '#DC2626' },
          { label: 'Outstanding Debt', value: fmtCr(fiscal.outstanding_debt), sub: 'Cumulative liability', color: '#7C3AED' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ padding: '16px', background: 'var(--bg-muted)', borderRadius: 'var(--radius)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: color, borderRadius: '4px 0 0 4px' }} />
            <div style={{ paddingLeft: 8 }}>
              <div className="section-label" style={{ marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Deficit financing bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Deficit-financed expenditure</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 700 }}>{deficitPct}%</span>
        </div>
        <div style={{ height: 16, borderRadius: 100, overflow: 'hidden', display: 'flex', background: 'var(--bg-subtle)' }}>
          <div style={{ width: `${revenueFinancedPct}%`, background: 'linear-gradient(90deg, #059669, #10B981)', transition: 'width 600ms ease' }} />
          <div style={{ width: `${deficitPct}%`, background: 'linear-gradient(90deg, #DC2626, #EF4444)', transition: 'width 600ms ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#059669', display: 'inline-block' }} /> Revenue-financed ({revenueFinancedPct}%)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#DC2626', display: 'inline-block' }} /> Deficit ({deficitPct}%)</span>
        </div>
      </div>

      {/* Revenue breakdown mini-bars */}
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Revenue composition</div>
        {[
          { label: 'Tax Revenue', pct: taxPct, value: fmtCr(fiscal.tax_revenue), color: '#2D31A6' },
          { label: 'Non-Tax Revenue', pct: nonTaxPct, value: fmtCr(fiscal.non_tax_revenue), color: '#0891B2' },
          { label: 'Grants-in-Aid', pct: grantsPct, value: fmtCr(fiscal.grants_in_aid), color: '#059669' },
        ].map(({ label, pct, value, color }) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({pct}%)</span></span>
            </div>
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} /></div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: '8px 12px', background: 'var(--info-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--info)' }}>
        Source: RBI State Finances: A Study of Budgets · <a href="https://rbi.org.in/Scripts/AnnualPublications.aspx?head=State+Finances" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info)', fontWeight: 600 }}>View report ↗</a>
      </div>
    </div>
  )
}
