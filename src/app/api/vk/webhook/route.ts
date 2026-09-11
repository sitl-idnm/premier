import { NextResponse } from 'next/server'
import { appendLeadRow, sheetsConfigured } from '@/shared/lib/sheets'
import { leadToRow, normalizeVkLead } from '@/shared/lib/vk'

export const runtime = 'nodejs'

/** Accepts the secret via `?secret=` or the `x-webhook-secret` header. */
function authorized(req: Request, url: URL): boolean {
  const expected = process.env.VK_WEBHOOK_SECRET
  if (!expected) return true // unset = open (dev); set it in prod
  const provided =
    url.searchParams.get('secret') || req.headers.get('x-webhook-secret')
  return provided === expected
}

async function parseBody(req: Request): Promise<unknown> {
  const type = req.headers.get('content-type') || ''
  if (type.includes('application/json')) {
    return req.json().catch(() => ({}))
  }
  // Form-encoded (some connectors) — flatten to an object.
  if (type.includes('application/x-www-form-urlencoded')) {
    const text = await req.text().catch(() => '')
    return Object.fromEntries(new URLSearchParams(text))
  }
  return req.json().catch(() => ({}))
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  if (!authorized(req, url)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await parseBody(req)

  // VK community Callback API handshake (harmless for other sources).
  if (
    body &&
    typeof body === 'object' &&
    (body as { type?: string }).type === 'confirmation'
  ) {
    return new Response(process.env.VK_CONFIRMATION_TOKEN || 'ok', {
      status: 200
    })
  }

  if (!sheetsConfigured()) {
    console.warn('[vk-webhook] Google Sheets not configured — lead not stored')
    return new Response('ok', { status: 200 })
  }

  try {
    const lead = normalizeVkLead(body)
    // Dedup by lead id happens inside the Apps Script.
    await appendLeadRow(leadToRow(lead))
  } catch (e) {
    console.error('[vk-webhook] failed to store lead', e)
    // Still 200 so VK/connector doesn't hammer retries; error is logged.
  }

  // VK Callback API expects a literal "ok" response.
  return new Response('ok', { status: 200 })
}
