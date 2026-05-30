import { NextRequest, NextResponse } from 'next/server'
import { getYears } from '@/lib/budget-queries'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'

const QuerySchema = z.object({ state: z.string().min(1).max(60).default('telangana') })

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const log = createLogger({ requestId, route: 'GET /api/budget/years' })
  const parsed = QuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  try {
    const years = await getYears(parsed.data.state)
    return NextResponse.json(years, { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400', 'X-Request-Id': requestId } })
  } catch (err) {
    log.error('Failed to fetch years', { error: String(err) })
    return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500, headers: { 'X-Request-Id': requestId } })
  }
}
