import { NextRequest, NextResponse } from 'next/server'
import { getDepartments } from '@/lib/budget-queries'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'

const QuerySchema = z.object({
  state: z.string().min(1).max(60).default('telangana'),
  year: z.string().regex(/^\d{4}-\d{2}$/),
})

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const log = createLogger({ requestId, route: 'GET /api/departments' })
  const parsed = QuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) return NextResponse.json({ error: 'year param required (format: YYYY-YY)', field: 'year' }, { status: 400 })
  try {
    const depts = await getDepartments(parsed.data.state, parsed.data.year)
    return NextResponse.json(depts, { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400', 'X-Request-Id': requestId } })
  } catch (err) {
    log.error('Failed to fetch departments', { error: String(err) })
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500, headers: { 'X-Request-Id': requestId } })
  }
}
