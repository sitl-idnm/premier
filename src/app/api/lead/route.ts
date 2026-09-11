import { NextResponse } from 'next/server'
import { verifyCaptcha } from '@/shared/lib/captcha'
import { sendEmail } from '@/shared/lib/notify/email'
import type { LeadBody } from '@/shared/lib/notify/lead'
import { sendSheet } from '@/shared/lib/notify/sheet'
import { sendTelegram } from '@/shared/lib/notify/telegram'

export const runtime = 'nodejs'

/** Best-effort client IP for captcha validation (Vercel sets x-forwarded-for). */
function clientIp(req: Request): string | undefined {
  const fwd = req.headers.get('x-forwarded-for')
  return fwd ? fwd.split(',')[0].trim() : undefined
}

export async function POST(req: Request) {
  let body: LeadBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 })
  }

  // Minimal server-side validation.
  const name = (body.name ?? '').trim()
  const phoneDigits = (body.phone ?? '').replace(/\D/g, '')
  if (!name) {
    return NextResponse.json({ error: 'Укажите имя' }, { status: 422 })
  }
  if (phoneDigits.length !== 11) {
    return NextResponse.json({ error: 'Некорректный телефон' }, { status: 422 })
  }

  // Captcha (no-op when SMARTCAPTCHA_SERVER_KEY is unset).
  const captchaOk = await verifyCaptcha(body.captchaToken, clientIp(req))
  if (!captchaOk) {
    return NextResponse.json(
      { error: 'Не удалось подтвердить, что вы не робот' },
      { status: 403 }
    )
  }

  // Deliver to all channels; one failing channel must not fail the others.
  const [tg, email, sheet] = await Promise.all([
    sendTelegram(body),
    sendEmail(body),
    sendSheet(body)
  ])

  const attempted = [tg, email, sheet].filter((r) => !r.skipped)
  const delivered = attempted.some((r) => r.ok)

  if (attempted.length > 0 && !delivered) {
    // Every configured channel failed — surface an error so the UI can retry.
    return NextResponse.json(
      { error: 'Не удалось отправить заявку' },
      { status: 502 }
    )
  }

  // delivered=false here means no channel is configured yet (graceful dev mode).
  return NextResponse.json({ ok: true, delivered })
}
