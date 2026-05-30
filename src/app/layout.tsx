import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'India Budget Tracker',
  description: "Track where India's taxpayer money goes — all states, departments, schemes, and vendor level transparency.",
  openGraph: {
    title: 'India Budget Tracker',
    description: 'Civic transparency: explore India government spending across all states 2022–2025.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* ── Nav ── */}
        <header style={{
          height: 'var(--nav-height)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 0 var(--border), 0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}>
            {/* Logo */}
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                width: 38, height: 38,
                background: 'linear-gradient(145deg, #2D31A6 0%, #4F52CC 100%)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(45,49,166,0.3)',
              }}>
                {/* Emblem icon — stylized bar chart */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <rect x="2" y="11" width="3.5" height="5" rx="1" fill="white"/>
                  <rect x="7.25" y="7" width="3.5" height="9" rx="1" fill="white" fillOpacity="0.85"/>
                  <rect x="12.5" y="3" width="3.5" height="13" rx="1" fill="white" fillOpacity="0.65"/>
                </svg>
              </div>
              <div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                }}>
                  India Budget Tracker
                </div>
                <div style={{
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  Fiscal Transparency Portal · All States
                </div>
              </div>
            </a>

            {/* Nav links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <a href="/" className="nav-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                Dashboard
              </a>
              <a
                href="https://openbudgetsindia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                Data Source
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>

              {/* Divider */}
              <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />

              {/* Live badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 12px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 100,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#15803D',
                letterSpacing: '0.02em',
              }}>
                <div className="live-dot" style={{ background: '#22C55E', width: 6, height: 6 }} />
                Live
              </div>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        {/* ── Footer ── */}
        <footer style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)',
          padding: '32px 24px',
          marginTop: 40,
        }}>
          <div style={{
            maxWidth: 1240,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28,
                background: 'linear-gradient(145deg, #2D31A6, #4F52CC)',
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="11" width="3.5" height="5" rx="1" fill="white"/>
                  <rect x="7.25" y="7" width="3.5" height="9" rx="1" fill="white" fillOpacity="0.85"/>
                  <rect x="12.5" y="3" width="3.5" height="13" rx="1" fill="white" fillOpacity="0.65"/>
                </svg>
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                India Budget Tracker · Open data for citizens
              </span>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              <span>Data: <a href="https://openbudgetsindia.org" target="_blank" rel="noopener noreferrer" className="link-accent">OpenBudgetsIndia ↗</a></span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
