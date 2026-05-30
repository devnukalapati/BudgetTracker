import { NextRequest, NextResponse } from 'next/server'
import { getSchemes } from '@/lib/budget-queries'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'

const QuerySchema = z.object({
  state: z.string().min(1).max(60).default('telangana'),
  year: z.string().regex(/^\d{4}-\d{2}$/),
  deptId: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  format: z.enum(['json', 'csv']).optional().default('json'),
})

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const log = createLogger({ requestId, route: 'GET /api/schemes' })
  const parsed = QuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) return NextResponse.json({ error: 'year and deptId params required', details: parsed.error.format() }, { status: 400, headers: { 'X-Request-Id': requestId } })
  try {
    const { state, year, deptId, format } = parsed.data
    const schemes = await getSchemes(state, year, deptId)
    if (format === 'csv') {
      const escape = (s: string) => '"' + s.replace(/"/g, '""') + '"'
      const rows = [
        'scheme_name,budget_estimate,revised_estimate,actual_spent,utilization_pct,source_url',
        ...schemes.map(s => {
          const util = s.budget_estimate > 0 && s.actual_spent > 0 ? Math.round((s.actual_spent / s.budget_estimate) * 100) : 0
          return `${escape(s.scheme_name)},${s.budget_estimate},${s.revised_estimate},${s.actual_spent},${util},${escape(s.source_url)}`
        }),
      ].join('\n')
      return new NextResponse(rows, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${deptId}-${year}.csv"`, 'X-Request-Id': requestId } })
    }
    return NextResponse.json(schemes, { headers: { 'Cache-Control': 's-maxage=3600', 'X-Request-Id': requestId } })
  } catch (err) {
    log.error('Failed to fetch schemes', { error: String(err) })
    return NextResponse.json({ error: 'Failed to fetch schemes' }, { status: 500, headers: { 'X-Request-Id': requestId } })
  }
}
