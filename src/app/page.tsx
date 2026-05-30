import { getStates } from '@/lib/budget-queries'
import type { StateIndex } from '@/types/budget'

export const revalidate = 21600

function fmtCrore(n: number) {
  if (!n) return '—'
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Lcr'
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L cr'
  return '₹' + (n / 1000).toFixed(1) + 'K cr'
}

const REGION_COLORS: Record<string, string> = {
  North: '#2D31A6', South: '#059669', East: '#D97706',
  West: '#DB2777', Central: '#7C3AED', Northeast: '#0891B2',
  'Union Territory': '#6B7280',
}

export default async function IndiaOverviewPage() {
  let states: StateIndex[] = []
  try { states = await getStates() } catch {}

  const seededStates = states.filter(s => s.has_data)
  const stateBudgets = seededStates.filter(s => s.code !== 'central')
  const centralBudget = seededStates.find(s => s.code === 'central')

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <div className="hero-banner animate-fadeup" style={{ marginBottom: 40 }}>
        <div className="hero-glow-1" /><div className="hero-glow-2" /><div className="hero-glow-3" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
            <div className="live-dot" />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>India · All States Budget Data</span>
          </div>
          <div className="text-hero" style={{ color: '#fff', marginBottom: 10 }}>
            {centralBudget?.total_budget ? fmtCrore(centralBudget.total_budget) : '₹48.21L cr'}
          </div>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.65)', maxWidth: 560, lineHeight: 1.6, marginBottom: 28 }}>
            India&apos;s Union Budget 2024–25 — explore fiscal data across all states, departments and schemes. Track where public money flows.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: '#fff' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 4 }}>States with Data</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stateBudgets.length}</div>
            </div>
            {centralBudget && (
              <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: '#fff' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 4 }}>Union Budget</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{centralBudget.total_budget ? fmtCrore(centralBudget.total_budget) : '—'}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Union Budget CTA */}
      {centralBudget && (
        <a href="/central" style={{ display: 'block', textDecoration: 'none', marginBottom: 28 }}>
          <div style={{ background: 'linear-gradient(135deg, #1A1D6E 0%, #2D31A6 100%)', borderRadius: 16, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>Union Government</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Union of India · Central Budget</div>
              <div style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>10 ministries · FY 2022–25 · Explore Union Budget →</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{centralBudget.total_budget ? fmtCrore(centralBudget.total_budget) : '—'}</div>
              <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>2024–25 Budget</div>
            </div>
          </div>
        </a>
      )}

      {/* State Cards */}
      {stateBudgets.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>All States</div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                {stateBudgets.length} states with budget data
              </h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
            {stateBudgets
              .sort((a, b) => (b.total_budget || 0) - (a.total_budget || 0))
              .map(state => {
                const regionColor = REGION_COLORS[state.region] || '#6B7280'
                const maxBudget = Math.max(...stateBudgets.map(s => s.total_budget || 0))
                const barWidth = maxBudget > 0 ? Math.round(((state.total_budget || 0) / maxBudget) * 100) : 0
                return (
                  <a key={state.code} href={`/${state.code}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="card card-hover" style={{ padding: '20px 20px 16px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${regionColor}, ${regionColor}55)` }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 4 }}>{state.region}</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{state.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{state.capital}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmtCrore(state.total_budget || 0)}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 2 }}>2024-25</div>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${barWidth}%`, background: regionColor, opacity: 0.65 }} />
                      </div>
                    </div>
                  </a>
                )
              })}
          </div>
        </>
      )}

      {states.length === 0 && (
        <div className="card-padded" style={{ padding: 64, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🇮🇳</div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 12 }}>No state data loaded yet.</p>
          <code style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', background: 'var(--bg-muted)', padding: '6px 14px', borderRadius: 6, display: 'inline-block' }}>
            node scripts/seed-v2.js
          </code>
        </div>
      )}
    </div>
  )
}
