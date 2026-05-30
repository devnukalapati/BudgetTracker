'use client'

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import { useRouter } from 'next/navigation'
import type { Department } from '@/types/budget'

interface Props { departments: Department[]; year: string; stateCode?: string }

const SHADES = ['#4F46E5','#3730A3','#06B6D4','#0E7490','#10B981','#059669','#F59E0B','#D97706','#EC4899','#BE185D','#8B5CF6','#7C3AED','#F97316','#C2410C','#14B8A6','#0F766E','#EF4444','#B91C1C','#A855F7','#7E22CE']

function CustomContent(props: any) {
  const { x, y, width, height, name, value, index, year, onClick } = props
  if (width < 40 || height < 30) return null
  const bg = SHADES[Math.min(index, SHADES.length - 1)]
  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN') + ' cr'
  return (
    <g onClick={() => onClick(props)} style={{ cursor: 'pointer' }}>
      <rect x={x + 1.5} y={y + 1.5} width={width - 3} height={height - 3}
        fill={bg} rx={4} style={{ transition: 'opacity 120ms ease' }}
        onMouseEnter={e => { (e.target as SVGRectElement).style.opacity = '0.75' }}
        onMouseLeave={e => { (e.target as SVGRectElement).style.opacity = '1' }}
      />
      {height > 50 && (
        <text x={x + 10} y={y + 24} fill="white" fontSize={13} fontWeight={500} fontFamily="inherit">
          {width > 120 ? name : name.split(' ')[0]}
        </text>
      )}
      {height > 70 && width > 80 && (
        <text x={x + 10} y={y + 42} fill="rgba(255,255,255,0.7)" fontSize={12} fontFamily="inherit">
          {fmt(value)}
        </text>
      )}
    </g>
  )
}

export default function DeptTreemap({ departments, year, stateCode }: Props) {
  const router = useRouter()
  const sorted = [...departments].sort((a, b) => b.total_budget - a.total_budget)
  const data = sorted.map(d => ({ name: d.name, value: d.total_budget, dept_id: d.dept_id }))

  function handleClick(cell: any) {
    if (cell?.dept_id) router.push(`/${stateCode || 'telangana'}/${year}/dept/${cell.dept_id}`)
  }

  return (
    <ResponsiveContainer width="100%" aspect={16 / 7}>
      <Treemap
        data={data}
        dataKey="value"
        content={<CustomContent year={year} onClick={handleClick} />}
      />
    </ResponsiveContainer>
  )
}
