import { getTenders } from '@/lib/budget-queries'
import { getStateInfo } from '@/lib/states'
import TenderTable from '@/components/TenderTable'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props { params: { state: string; year: string; id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Tenders · ${params.id} · ${params.year} | India Budget Tracker` }
}

export default async function TendersPage({ params }: Props) {
  const { state, year, id } = params
  const stateInfo = getStateInfo(state)
  const deptName = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  let tenders: Awaited<ReturnType<typeof getTenders>>['data'] = []
  try {
    const result = await getTenders(state, year, id, { limit: 50 })
    tenders = result.data
  } catch {}

  return (
    <div className="page-wrapper">
      <nav className="breadcrumb">
        <a href="/">India</a><span className="breadcrumb-sep">›</span>
        <a href={`/${state}`}>{stateInfo?.name || state}</a><span className="breadcrumb-sep">›</span>
        <a href={`/${state}/${year}`}>{year}</a><span className="breadcrumb-sep">›</span>
        <a href={`/${state}/${year}/dept/${id}`}>{deptName}</a><span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Tenders</span>
      </nav>

      <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Contracts &amp; Tenders</div>
        <h1 className="text-title" style={{ marginBottom: 6 }}>{deptName}</h1>
        <p className="text-subtitle">{stateInfo?.name} · {year} · Government procurement contracts</p>
      </div>

      {tenders.length === 0 ? (
        <div className="card-padded" style={{ padding: 64, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📋</div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8 }}>No tender data available for this department.</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Tender data is synced from GeM (Government e-Marketplace). Run the sync worker to populate.</p>
          <code style={{ display: 'inline-block', marginTop: 12, padding: '6px 14px', background: 'var(--bg-muted)', borderRadius: 6, fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
            node workers/sync-tenders.js --state={state} --year={year}
          </code>
        </div>
      ) : (
        <div className="card-padded">
          <div className="section-head">
            <span className="section-label">Procurement Data</span>
            <h2>{tenders.length} contracts found · {year}</h2>
          </div>
          <TenderTable tenders={tenders} />
        </div>
      )}
    </div>
  )
}
