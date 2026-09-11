import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from '@/shared/lib/adminAuth'

/** Gate /admin and /api/admin behind the signed session cookie. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public entry points (the login screen + its API).
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value
  const ok = await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET)
  if (ok) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = req.nextUrl.clone()
  url.pathname = '/admin/login'
  url.searchParams.set('from', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
