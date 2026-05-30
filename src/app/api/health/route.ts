import { NextResponse } from 'next/server'
import { checkDbHealth } from '@/lib/budget-queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dbOk = await checkDbHealth()
  const status = dbOk ? 'ok' : 'degraded'
  return NextResponse.json(
    { status, db: dbOk ? 'ok' : 'unreachable', ts: new Date().toISOString(), version: '2.0.0' },
    { status: dbOk ? 200 : 503 }
  )
}
