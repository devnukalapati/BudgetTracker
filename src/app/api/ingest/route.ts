import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json({
    status: 'Data is seeded via scripts/seed-data.js. Live CSV ingest coming in Phase 2.',
    tables: ['TelanganaYears', 'TelanganaDepartments', 'TelanganabudgetAllocations'],
  })
}
