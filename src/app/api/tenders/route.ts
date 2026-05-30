import { NextRequest, NextResponse } from 'next/server'
import { getTenders, getTendersByCompany } from '@/lib/budget-queries'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'

const QuerySchema = z.object({
  state: z.string().min(1).max(60).optional(),
  year: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  deptId: z.string().min(1).max(80).optional(),
  company: z.string().min(1).max(200).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
})

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const log = createLogger({ requestId, route: 'GET /api/tenders' })
  const parsed = QuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  const { state, year, deptId, company, cursor, limit } = parsed.data
  try {
    if (company) {
      const result = await getTendersByCompany(company, { limit, cursor })
      return NextResponse.json(result, { headers: { 'X-Request-Id': requestId } })
    }
    if (!state || !year || !deptId) {
      return NextResponse.json({ error: 'state, year and deptId required when not filtering by company' }, { status: 400 })
    }
    const result = await getTenders(state, year, deptId, { limit, cursor })
    return NextResponse.json(result, { headers: { 'Cache-Control': 's-maxage=3600', 'X-Request-Id': requestId } })
  } catch (err) {
    log.error('Failed to fetch tenders', { error: String(err) })
    return NextResponse.json({ error: 'Failed to fetch tenders' }, { status: 500, headers: { 'X-Request-Id': requestId } })
  }
}
