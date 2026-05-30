import { NextRequest, NextResponse } from 'next/server'
import { VALID_STATE_CODES } from '@/lib/states'

const STATIC_PREFIXES = ['/api', '/_next', '/favicon', '/about', '/company']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static/api paths
  if (STATIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Root path — always valid
  if (pathname === '/') return NextResponse.next()

  // Check first path segment
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return NextResponse.next()

  const firstSegment = segments[0]

  // If first segment is a valid state code → allow through
  if (VALID_STATE_CODES.has(firstSegment)) {
    return NextResponse.next()
  }

  // Otherwise 404 — prevents ghost routes
  return NextResponse.rewrite(new URL('/not-found', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
