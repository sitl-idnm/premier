/** Client-side lead submission → POST /api/lead (delivered to Telegram + email). */

import { readUtm } from './utm'

export type LeadForm = 'booking' | 'event' | 'safety'

export type LeadPayload = {
  form: LeadForm
  name: string
  phone: string
  email?: string
  eventType?: string
  kids?: string
  tariff?: string
  startTime?: string
  date?: string
  /** Yandex SmartCaptcha token (empty when captcha is disabled). */
  captchaToken?: string
}

export type LeadResult = { ok: boolean; error?: string }

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        ...readUtm(),
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        referrer: typeof document !== 'undefined' ? document.referrer : ''
      })
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      return { ok: false, error: data?.error ?? `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network' }
  }
}
