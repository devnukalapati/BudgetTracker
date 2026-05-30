'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { Department } from '@/types/budget'

const SankeyChart = dynamic(() => import('./SankeyChart'), { ssr: false })

interface Props { departments: Department[]; year: string; stateCode?: string }

export default function SankeyToggle({ departments, year, stateCode }: Props) {
  const [show, setShow] = useState(false)

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ textAlign: 'right' }}>
        <button
          onClick={() => setShow(s => !s)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.8125rem', color: 'var(--accent)', padding: '4px 0',
          }}
        >
          {show ? 'Hide flow diagram ↑' : 'Show Sankey flow ↓'}
        </button>
      </div>
      {show && (
        <>
          <div style={{ marginTop: '16px' }} className="sankey-wrap">
            <SankeyChart departments={departments} year={year} stateCode={stateCode} />
          </div>
          <style>{`@media (max-width: 767px) { .sankey-wrap { display: none; } }`}</style>
        </>
      )}
    </div>
  )
}
