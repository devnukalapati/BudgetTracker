'use client'

interface Props {
  ingestedAt: string
  sourceUrl?: string
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export default function FreshnessBanner({ ingestedAt, sourceUrl }: Props) {
  return (
    <div style={{
      height: 'var(--banner-height)',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-card)',
      padding: '0 24px',
      position: 'sticky',
      top: 'var(--nav-height)',
      zIndex: 90,
      gap: 0,
    }}>
      <div style={{
        maxWidth: 1240,
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        fontSize: '0.75rem',
        color: 'var(--text-tertiary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: '#22C55E',
            flexShrink: 0,
          }} />
          <span>Data updated {formatDate(ingestedAt)}</span>
        </div>

        <div style={{ width: 1, height: 12, background: 'var(--border-strong)', opacity: 0.5 }} />

        <span>
          Source:{' '}
          <a
            href={sourceUrl || 'https://openbudgetsindia.org'}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
            style={{ fontWeight: 500, fontSize: '0.75rem' }}
          >
            OpenBudgetsIndia ↗
          </a>
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'var(--text-tertiary)' }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize: '0.7rem' }}>Figures in ₹ crore unless noted</span>
        </div>
      </div>
    </div>
  )
}
