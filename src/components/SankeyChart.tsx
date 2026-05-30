'use client'

import { useEffect, useRef } from 'react'
import type { Department } from '@/types/budget'

interface Props { departments: Department[]; year: string; stateCode?: string }

export default function SankeyChart({ departments, year, stateCode }: Props) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!ref.current) return
    import('d3-sankey').then(({ sankey: sankeyLayout, sankeyLinkHorizontal }) => {
      const top15 = [...departments].sort((a, b) => b.total_budget - a.total_budget).slice(0, 15)
      const nodes = [
        { name: 'Telangana' },
        ...top15.map(d => ({ name: d.name })),
      ]
      const links = top15.map((d, i) => ({ source: 0, target: i + 1, value: d.total_budget }))

      const width = ref.current!.clientWidth || 900
      const height = 420
      const layout = sankeyLayout().nodeWidth(16).nodePadding(10).extent([[1, 1], [width - 1, height - 6]])
      const graph = layout({ nodes: nodes.map(n => ({ ...n })) as any, links: links.map(l => ({ ...l })) as any })

      const svg = ref.current!
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      svg.innerHTML = ''

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svg.appendChild(defs)

      graph.links.forEach(link => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', sankeyLinkHorizontal()(link as any) || '')
        path.setAttribute('stroke', '#E8E8E6')
        path.setAttribute('stroke-width', String(Math.max(1, link.width || 1)))
        path.setAttribute('fill', 'none')
        path.setAttribute('opacity', '0.7')
        svg.appendChild(path)
      })

      graph.nodes.forEach((node: any) => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', String(node.x0))
        rect.setAttribute('y', String(node.y0))
        rect.setAttribute('width', String(node.x1 - node.x0))
        rect.setAttribute('height', String(Math.max(1, node.y1 - node.y0)))
        rect.setAttribute('fill', '#111')
        rect.setAttribute('rx', '2')
        svg.appendChild(rect)

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', String(node.x1 + 6))
        text.setAttribute('y', String((node.y0 + node.y1) / 2 + 4))
        text.setAttribute('font-size', '11')
        text.setAttribute('fill', '#666')
        text.setAttribute('font-family', 'inherit')
        const label = node.name.length > 22 ? node.name.slice(0, 22) + '…' : node.name
        text.textContent = label
        svg.appendChild(text)
      })
    })
  }, [departments, year])

  return (
    <svg
      ref={ref}
      style={{ width: '100%', height: '420px', display: 'block' }}
    />
  )
}
