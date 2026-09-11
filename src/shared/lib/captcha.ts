/**
 * Server-side Yandex SmartCaptcha validation.
 * Docs: https://yandex.cloud/docs/smartcaptcha/concepts/validation
 *
 * Returns `true` when the token is valid OR when validation is disabled
 * (no server key configured) — so leads still flow until keys are set.
 */

const VALIDATE_URL = 'https://smartcaptcha.yandexcloud.net/validate'

export async function verifyCaptcha(
  token: string | undefined,
  ip: string | undefined
): Promise<boolean> {
  const secret = process.env.SMARTCAPTCHA_SERVER_KEY
  if (!secret) {
    console.warn(
      '[captcha] SMARTCAPTCHA_SERVER_KEY not set — skipping validation'
    )
    return true
  }

  if (!token) return false

  const params = new URLSearchParams({ secret, token })
  if (ip) params.set('ip', ip)

  try {
    const res = await fetch(VALIDATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
    if (!res.ok) {
      // Fail open on Yandex-side errors so a captcha outage never blocks leads.
      console.error('[captcha] validate HTTP', res.status)
      return true
    }
    const data = (await res.json()) as { status?: string; message?: string }
    if (data.status !== 'ok') {
      console.warn('[captcha] rejected:', data.status, data.message)
    }
    return data.status === 'ok'
  } catch (e) {
    console.error('[captcha] validate failed', e)
    return true
  }
}
