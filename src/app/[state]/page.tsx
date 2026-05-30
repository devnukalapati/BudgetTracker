import { getYears } from '@/lib/budget-queries'
import { getStateInfo } from '@/lib/states'
import type { Metadata } from 'next'

export const revalidate = 21600

interface Props { params: { state: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const info = getStateInfo(params.state)
  return { title: `${info?.name || params.state} Budget | India Budget Tracker` }
}

function fmtCrore(n: number) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L cr'
  return '₹' + (n / 1000).toFixed(1) + 'K cr'
}

export default async function StatePage({ params }: Props) {
  const { state } = params
  const stateInfo = getStateInfo(state)

  let years: Awaited<ReturnType<typeof getYears>> = []
  try { years = await getYears(state) } catch {}

  const sorted = [...years].sort((a, b) => b.year.localeCompare(a.year))
  const latest = sorted[0]
  const prior = sorted[1]
  const growthPct = latest && prior
    ? (((latest.total_budget - prior.total_budget) / prior.total_budget) * 100).toFixed(1)
    : null

  return (
    <div className="page-wrapper">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="/">India</a>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{stateInfo?.name || state}</span>
      </nav>

      {/* Hero */}
      <div className="hero-banner animate-fadeup" style={{ marginBottom: 36 }}>
        <div className="hero-glow-1" /><div className="hero-glow-2" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
            <div className="live-dot" />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{stateInfo?.region || 'State'} · {stateInfo?.capital}</span>
          </div>
          <div className="text-hero" style={{ color: '#fff', marginBottom: 10 }}>
            {stateInfo?.name || state.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </div>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.65)', maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
            State Budget — {sorted.length} fiscal year{sorted.length !== 1 ? 's' : ''} of data. Explore departments, schemes and fiscal health.
          </p>
          {growthPct && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: Number(growthPct) >= 0 ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${Number(growthPct) >= 0 ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 100, fontSize: '0.8125rem', fontWeight: 600, color: Number(growthPct) >= 0 ? '#4ADE80' : '#FCA5A5' }}>
              <span>{Number(growthPct) >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(Number(growthPct))}% YoY · {prior?.year} → {latest?.year}</span>
            </div>
          )}
        </div>
      </div>

      {/* Year cards */}
      {sorted.length > 0 && (
        <>
          <div className="section-head"><span className="section-label">Fiscal Years</span><h2>Select a year to explore</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 40 }}>
            {sorted.map((y, i) => {
              const next = sorted[i + 1]
              const yoy = next ? (((y.total_budget - next.total_budget) / next.total_budget) * 100).toFixed(1) : null
              return (
                <a key={y.year} href={`/${state}/${y.year}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="card card-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    {i === 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #2D31A6, #4F52CC)' }} />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Fiscal Year</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{y.year}</div>
                      </div>
                      {i === 0 && <span className="badge badge-primary">Latest</span>}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums', marginBottom: 8 }}>
                      {fmtCrore(y.total_budget)}
                    </div>
                    {yoy && (
                      <div style={{ fontSize: '0.8125rem', color: Number(yoy) >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {Number(yoy) >= 0 ? '↑' : '↓'} {Math.abs(Number(yoy))}% vs {next?.year}
                      </div>
                    )}
                  </div>
                </a>
              )
            })}
          </div>
        </>
      )}

      {sorted.length === 0 && (
        <div className="card-padded" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No data for {stateInfo?.name || state} yet.</p>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 8, fontSize: '0.875rem' }}>Run: <code>node scripts/seed-v2.js --state={state}</code></p>
        </div>
      )}
    </div>
  )
}
