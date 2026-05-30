import { getDepartments, getYearSummary, getSourceUrl, getFiscalHealth } from '@/lib/budget-queries'
import { getStateInfo } from '@/lib/states'
import FreshnessBanner from '@/components/FreshnessBanner'
import DeptTreemap from '@/components/DeptTreemap'
import SankeyToggle from '@/components/SankeyToggle'
import TopDeptBars from '@/components/TopDeptBars'
import AllocationPie from '@/components/AllocationPie'
import KPICard from '@/components/KPICard'
import DeptTable from '@/components/DeptTable'
import FiscalHealthPanel from '@/components/FiscalHealthPanel'
import type { Metadata } from 'next'

export const revalidate = 21600

interface Props { params: { state: string; year: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const info = getStateInfo(params.state)
  return { title: `${info?.name || params.state} ${params.year} Budget | India Budget Tracker` }
}

function fmtCrore(n: number) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L cr'
  return '₹' + n.toLocaleString('en-IN') + ' cr'
}

export default async function YearPage({ params }: Props) {
  const { state, year } = params
  const stateInfo = getStateInfo(state)

  const [departments, summary, sourceUrl, fiscal] = await Promise.all([
    getDepartments(state, year).catch(() => []),
    getYearSummary(state, year).catch(() => null),
    getSourceUrl(state, year).catch(() => 'https://openbudgetsindia.org'),
    getFiscalHealth(state, year).catch(() => null),
  ])

  const sorted = [...departments].sort((a, b) => b.total_budget - a.total_budget)
  const topDept = sorted[0]
  const avgAlloc = sorted.length > 0
    ? Math.round(sorted.reduce((s, d) => s + d.total_budget, 0) / sorted.length)
    : 0

  return (
    <>
      <FreshnessBanner ingestedAt={summary?.ingested_at ?? new Date().toISOString()} sourceUrl={sourceUrl} />
      <div className="page-wrapper">
        <nav className="breadcrumb">
          <a href="/">India</a><span className="breadcrumb-sep">›</span>
          <a href={`/${state}`}>{stateInfo?.name || state}</a><span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{year}</span>
        </nav>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>Fiscal Year</div>
            <h1 className="text-title" style={{ color: 'var(--text-primary)', marginBottom: 6 }}>{stateInfo?.name || state} · {year} Budget</h1>
            <p className="text-subtitle">{sorted.length} departments tracked</p>
          </div>
          {summary && (
            <div style={{ padding: '12px 20px', background: 'var(--primary-pale)', border: '1px solid rgba(45,49,166,0.15)', borderRadius: 'var(--radius)', textAlign: 'right' }}>
              <div className="section-label" style={{ color: 'var(--primary)', marginBottom: 4 }}>Total Budget</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums' }}>{fmtCrore(summary.total_budget)}</div>
            </div>
          )}
        </div>

        {summary && (
          <div className="grid-kpi stagger animate-fadeup" style={{ marginBottom: 32 }}>
            <KPICard label="Total Budget" value={fmtCrore(summary.total_budget)} sub={year + ' fiscal year'} color="#2D31A6" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>} />
            <KPICard label="Departments" value={sorted.length.toString()} sub="funded departments" color="#0891B2" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>} />
            <KPICard label="Largest Dept" value={topDept ? '₹' + topDept.total_budget.toLocaleString('en-IN') + ' cr' : '—'} sub={topDept?.name.slice(0, 28) ?? ''} color="#D97706" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>} />
            <KPICard label="Avg per Dept" value={'₹' + avgAlloc.toLocaleString('en-IN') + ' cr'} sub="average allocation" color="#059669" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} />
          </div>
        )}

        {/* Fiscal Health */}
        <FiscalHealthPanel fiscal={fiscal} year={year} stateName={stateInfo?.name || state} />

        {sorted.length > 0 && (
          <div className="card-padded" style={{ marginBottom: 28 }}>
            <div className="section-head"><span className="section-label">Visual Overview</span><h2>Budget Treemap — click a tile to explore</h2></div>
            <DeptTreemap departments={sorted} year={year} stateCode={state} />
          </div>
        )}

        {sorted.length > 0 && (
          <div className="grid-2" style={{ marginBottom: 28 }}>
            <div className="card-padded">
              <div className="section-head"><span className="section-label">Top Departments</span><h2>Highest Budget Allocations</h2></div>
              <TopDeptBars departments={sorted} year={year} stateCode={state} topN={10} />
            </div>
            <div className="card-padded">
              <div className="section-head"><span className="section-label">Allocation Breakdown</span><h2>Share of Total Budget</h2></div>
              <AllocationPie departments={sorted} topN={8} />
            </div>
          </div>
        )}

        {sorted.length > 0 && (
          <div className="card-padded" style={{ marginBottom: 28 }}>
            <SankeyToggle departments={sorted} year={year} stateCode={state} />
          </div>
        )}

        {sorted.length > 0 && (
          <div className="card-padded">
            <div className="section-head"><span className="section-label">All Departments</span><h2>{sorted.length} departments · {year}</h2></div>
            <DeptTable departments={sorted} year={year} stateCode={state} />
          </div>
        )}

        {sorted.length === 0 && (
          <div className="card-padded" style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📂</div>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No department data for {year}</p>
          </div>
        )}
      </div>
    </>
  )
}
