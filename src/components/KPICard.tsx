'use client'

interface Props {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: string
  icon?: React.ReactNode
}

export default function KPICard({ label, value, sub, trend, trendValue, color = '#2D31A6', icon }: Props) {
  const trendUp = trend === 'up'
  const trendDown = trend === 'down'

  return (
    <div className="card card-hover" style={{
      padding: '22px 22px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Color accent bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${color} 0%, ${color}55 100%)`,
        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
      }} />

      {/* Label + icon */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span className="section-label">{label}</span>
        {icon && (
          <div style={{
            width: 34, height: 34,
            borderRadius: 9,
            background: `${color}12`,
            border: `1px solid ${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <div style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </div>
        {sub && (
          <div style={{
            fontSize: '0.8125rem',
            color: 'var(--text-tertiary)',
            marginTop: 4,
            fontWeight: 400,
          }}>
            {sub}
          </div>
        )}
      </div>

      {/* Trend */}
      {trendValue && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 10px',
          borderRadius: 100,
          background: trendUp ? 'var(--success-bg)' : trendDown ? 'var(--danger-bg)' : 'var(--bg-muted)',
          width: 'fit-content',
        }}>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: trendUp ? 'var(--success)' : trendDown ? 'var(--danger)' : 'var(--text-tertiary)',
          }}>
            {trendUp ? '↑' : trendDown ? '↓' : '→'} {trendValue}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>
            vs prior year
          </span>
        </div>
      )}
    </div>
  )
}
