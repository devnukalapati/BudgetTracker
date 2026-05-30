import { getSchemes, getDeptAllYears, getYearSummary, getSourceUrl } from '@/lib/budget-queries'
import { getStateInfo } from '@/lib/states'
import FreshnessBanner from '@/components/FreshnessBanner'
import UtilizationBadge from '@/components/UtilizationBadge'
import BudgetVsActualChart from '@/components/BudgetVsActualChart'
import SchemeBars from '@/components/SchemeBars'
import KPICard from '@/components/KPICard'
import SchemeTable from '@/components/SchemeTable'
import type { Metadata } from 'next'

export const revalidate = 3600

interface Props { params: { state: string; year: string; id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const info = getStateInfo(params.state)
  return {
    title: `${params.id.replace(/-/g, ' ')} | ${info?.name || params.state} ${params.year} Budget`,
  }
}

function fmtCrore(n: number) {
  return '₹' + n.toLocaleString('en-IN') + ' cr'
}

export default async function DeptPage({ params }: Props) {
  const { state, year, id } = params
  const stateInfo = getStateInfo(state)

  const [schemes, allYears, summary, sourceUrl] = await Promise.all([
    getSchemes(state, year, id).catch(() => []),
    getDeptAllYears(state, id).catch(() => []),
    getYearSummary(state, year).catch(() => null),
    getSourceUrl(state, year).catch(() => 'https://openbudgetsindia.org'),
  ])

  const deptName = schemes[0]?.dept_name ?? id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const totalBE = schemes.reduce((s, x) => s + x.budget_estimate, 0)
  const totalRE = schemes.reduce((s, x) => s + x.revised_estimate, 0)
  const totalSpent = schemes.reduce((s, x) => s + x.actual_spent, 0)
  const utilPct = totalBE > 0 && totalSpent > 0 ? Math.round((totalSpent / totalBE) * 100) : null

  const sortedSchemes = [...schemes].sort((a, b) => b.budget_estimate - a.budget_estimate)

  return (
    <>
      <FreshnessBanner
        ingestedAt={summary?.ingested_at ?? new Date().toISOString()}
        sourceUrl={sourceUrl}
      />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: 32,
        }}>
          <a href="/" style={{ color: 'var(--text-tertiary)' }}>India</a>
          <span>›</span>
          <a href={`/${state}`} style={{ color: 'var(--text-tertiary)' }}>{stateInfo?.name || state}</a>
          <span>›</span>
          <a href={`/${state}/${year}`} style={{ color: 'var(--text-tertiary)' }}>{year}</a>
          <span>›</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{deptName}</span>
        </nav>

        {/* Dept hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)',
          borderRadius: 20,
          padding: '36px 40px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
          <div>
            <div className="section-label" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
              {year} · Department Overview
            </div>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: 16,
            }}>
              {deptName}
            </h1>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                {fmtCrore(totalBE)} allocated
              </span>
              {totalSpent > 0 && (
                <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)' }}>
                  · {fmtCrore(totalSpent)} spent
                </span>
              )}
              <UtilizationBadge budgetEstimate={totalBE} actualSpent={totalSpent} />
            </div>
            <div style={{ marginTop: 16 }}>
              <a href={`/${state}/${year}/dept/${id}/tenders`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, color: '#fff', textDecoration: 'none' }}>
                📋 View Tenders →
              </a>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 36,
        }}>
          <KPICard
            label="Budget Estimate"
            value={fmtCrore(totalBE)}
            sub="approved allocation"
            color="#4F46E5"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              </svg>
            }
          />
          <KPICard
            label="Revised Estimate"
            value={fmtCrore(totalRE)}
            sub="mid-year revision"
            color="#06B6D4"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            }
          />
          {totalSpent > 0 ? (
            <KPICard
              label="Actual Spent"
              value={fmtCrore(totalSpent)}
              sub="expenditure recorded"
              color="#10B981"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              }
            />
          ) : (
            <KPICard
              label="Actual Spent"
              value="—"
              sub="no spend data yet"
              color="#94A3B8"
            />
          )}
          <KPICard
            label="Utilization"
            value={utilPct !== null ? utilPct + '%' : '—'}
            sub={utilPct !== null ? (utilPct >= 80 ? 'on track' : utilPct >= 50 ? 'below target' : 'underutilized') : 'no spend data'}
            color={utilPct !== null ? (utilPct >= 80 ? '#10B981' : utilPct >= 50 ? '#F59E0B' : '#EF4444') : '#94A3B8'}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            }
          />
          <KPICard
            label="Total Schemes"
            value={schemes.length.toString()}
            sub="funded schemes"
            color="#8B5CF6"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            }
          />
        </div>

        {/* Charts row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: allYears.length > 1 ? 'repeat(auto-fit, minmax(340px, 1fr))' : '1fr',
          gap: 24,
          marginBottom: 32,
        }}>
          {sortedSchemes.length > 0 && (
            <div className="card" style={{ padding: '28px 24px' }}>
              <div style={{ marginBottom: 16 }}>
                <div className="section-label" style={{ marginBottom: 4 }}>Top Schemes</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Budget by Scheme
                </div>
              </div>
              <SchemeBars schemes={sortedSchemes} topN={8} />
            </div>
          )}

          {allYears.length > 1 && (
            <div className="card" style={{ padding: '28px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div className="section-label" style={{ marginBottom: 4 }}>Trend Analysis</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Budget vs Actual (Year-over-Year)
                  </div>
                </div>
                <a
                  href={`/api/schemes?state=${state}&year=${year}&deptId=${id}&format=csv`}
                  className="link-accent"
                  style={{ fontSize: '0.8125rem', fontWeight: 600, flexShrink: 0 }}
                >
                  CSV ↗
                </a>
              </div>
              <BudgetVsActualChart allocations={allYears} />
            </div>
          )}
        </div>

        {/* Utilization bar */}
        {utilPct !== null && (
          <div className="card" style={{ padding: '28px 24px', marginBottom: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <div className="section-label" style={{ marginBottom: 4 }}>Budget Utilization</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {utilPct}% of budget utilized
                </div>
                <UtilizationBadge budgetEstimate={totalBE} actualSpent={totalSpent} />
              </div>
            </div>
            <div style={{ height: 20, background: 'var(--bg-muted)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(utilPct, 100)}%`,
                background: utilPct >= 80
                  ? 'linear-gradient(90deg, #059669, #10B981)'
                  : utilPct >= 50
                    ? 'linear-gradient(90deg, #D97706, #F59E0B)'
                    : 'linear-gradient(90deg, #DC2626, #EF4444)',
                borderRadius: 100,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>₹0</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {fmtCrore(totalBE)} target
              </span>
            </div>
          </div>
        )}

        {/* Schemes table */}
        <div className="card" style={{ padding: '28px 24px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 20, flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>All Schemes</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {schemes.length} schemes · {year}
              </div>
            </div>
            {allYears.length > 0 && (
              <a
                href={`/api/schemes?state=${state}&year=${year}&deptId=${id}&format=csv`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--primary)', color: '#fff',
                  borderRadius: 8, padding: '8px 16px',
                  fontSize: '0.8125rem', fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                ↓ Download CSV
              </a>
            )}
          </div>
          {schemes.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '32px 0' }}>
              No scheme data available.
            </p>
          ) : (
            <SchemeTable schemes={sortedSchemes} year={year} deptId={id} />
          )}
        </div>
      </div>
    </>
  )
}
