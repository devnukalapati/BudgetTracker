'use client'

import { useState } from 'react'
import type { Tender } from '@/types/budget'

interface Props { tenders: Tender[] }

function fmtCr(n: number) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L cr'
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K cr'
  return '₹' + n.toLocaleString('en-IN') + ' cr'
}

export default function TenderTable({ tenders }: Props) {
  const [sortKey, setSortKey] = useState<'contract_value' | 'bid_date'>('contract_value')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = [...tenders].sort((a, b) => {
    const av = typeof a[sortKey] === 'string' ? String(a[sortKey]) : Number(a[sortKey])
    const bv = typeof b[sortKey] === 'string' ? String(b[sortKey]) : Number(b[sortKey])
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function downloadCSV() {
    const escape = (s: string) => '"' + String(s || '').replace(/"/g, '""') + '"'
    const rows = [
      'company_name,contract_value,scheme,status,bid_date,award_date,source',
      ...sorted.map(t => [escape(t.company_name), t.contract_value, escape(t.scheme_name_hint || ''), t.status, t.bid_date, t.award_date || '', t.source].join(',')),
    ].join('\n')
    const blob = new Blob([rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'tenders.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    awarded: { bg: 'var(--success-bg)', color: 'var(--success)' },
    open: { bg: 'var(--info-bg)', color: 'var(--info)' },
    cancelled: { bg: 'var(--bg-muted)', color: 'var(--text-tertiary)' },
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
          ↓ Export CSV
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th className="right" style={{ cursor: 'pointer' }} onClick={() => toggleSort('contract_value')}>Contract Value {sortKey === 'contract_value' ? (sortDir === 'desc' ? '↓' : '↑') : ''}</th>
              <th>Scheme</th>
              <th>Status</th>
              <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('bid_date')}>Bid Date {sortKey === 'bid_date' ? (sortDir === 'desc' ? '↓' : '↑') : ''}</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => {
              const sc = statusColors[t.status] || statusColors.cancelled
              return (
                <tr key={t.tender_id || i}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.company_name}</div>
                    {t.company_gstin && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'monospace', marginTop: 2 }}>{t.company_gstin}</div>}
                    {t.match_confidence === 'low' && <span className="badge" style={{ background: '#FFFBEB', color: '#B45309', marginTop: 4, fontSize: '0.65rem' }}>Unverified match</span>}
                  </td>
                  <td className="right" style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtCr(t.contract_value)}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: 200 }}>{t.scheme_name_hint || '—'}</td>
                  <td><span className="badge" style={{ background: sc.bg, color: sc.color }}>{t.status}</span></td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{t.bid_date ? t.bid_date.slice(0, 10) : '—'}</td>
                  <td>
                    {t.gem_order_id ? (
                      <a href="https://gem.gov.in/" target="_blank" rel="noopener noreferrer" className="link-accent" style={{ fontSize: '0.75rem' }}>GeM ↗</a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t.source}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
