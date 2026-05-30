'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Department } from '@/types/budget'

interface Props {
  departments: Department[]
  year: string
  stateCode?: string
}

export default function SearchBar({ departments, year, stateCode }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(-1)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const results = query.length > 0
    ? departments.filter(d => d.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : []

  function select(dept: Department) {
    setQuery('')
    setOpen(false)
    router.push(`/${stateCode || 'telangana'}/${year}/dept/${dept.dept_id}`)
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)) }
    if (e.key === 'Enter' && focused >= 0) select(results[focused])
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Search input */}
      <div style={{ position: 'relative' }}>
        {/* Search icon */}
        <div style={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>

        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          type="text"
          placeholder="Search departments and schemes…"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setFocused(-1)
            setOpen(e.target.value.length > 0)
          }}
          onKeyDown={onKey}
          onFocus={e => {
            results.length > 0 && setOpen(true)
            e.currentTarget.style.borderColor = 'var(--primary-light)'
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-glow)'
          }}
          onBlur={e => {
            setTimeout(() => setOpen(false), 160)
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xs)'
          }}
          style={{
            width: '100%',
            height: 50,
            padding: '0 48px 0 46px',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: '0.9375rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            outline: 'none',
            boxShadow: 'var(--shadow-xs)',
            transition: 'border-color 120ms ease, box-shadow 120ms ease',
          }}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }}
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 22, height: 22,
              borderRadius: '50%',
              border: 'none',
              background: 'var(--bg-subtle)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            aria-label="Clear search"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0, right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
            listStyle: 'none',
            zIndex: 200,
            animation: 'dropdownIn 150ms cubic-bezier(0.16,1,0.3,1)',
            overflow: 'hidden',
          }}
        >
          {results.map((dept, i) => (
            <li
              key={dept.dept_id}
              role="option"
              aria-selected={focused === i}
              onMouseDown={() => select(dept)}
              onMouseEnter={() => setFocused(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                height: 46,
                padding: '0 16px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                background: focused === i ? 'var(--primary-pale)' : 'transparent',
                color: focused === i ? 'var(--primary)' : 'var(--text-primary)',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 80ms ease',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, flexShrink: 0 }}>
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              {dept.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
