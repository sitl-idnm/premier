import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  createSessionToken
} from '@/shared/lib/adminAuth'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: unknown }
  const expected = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SESSION_SECRET

  if (!expected || !secret) {
    return NextResponse.json(
      { error: 'Панель не настроена: задайте ADMIN_PASSWORD и ADMIN_SESSION_SECRET' },
      { status: 500 }
    )
  }

  if (typeof body.password !== 'string' || body.password !== expected) {
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 })
  }

  const token = await createSessionToken(secret)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE
  })
  return res
}
