import { NextResponse } from 'next/server'
import { appendLeadRows, sheetsConfigured } from '@/shared/lib/sheets'
import { fetchVkLeads, leadToRow, vkConfigured } from '@/shared/lib/vk'

export const runtime = 'nodejs'
// Never cache — this pulls fresh leads on every cron tick.
export const dynamic = 'force-dynamic'

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. */
function authorized(req: Request, url: URL): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return true // unset = open (dev); set it in prod
  const header = req.headers.get('authorization')
  if (header === `Bearer ${expected}`) return true
  return url.searchParams.get('secret') === expected
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (!authorized(req, url)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const dry = url.searchParams.get('dry') === '1'

  if (!vkConfigured()) {
    return NextResponse.json({ ok: false, reason: 'vk not configured' })
  }
  if (!sheetsConfigured()) {
    return NextResponse.json({ ok: false, reason: 'sheets not configured' })
  }

  try {
    const leads = await fetchVkLeads()
    const rows = leads.map(leadToRow)

    if (dry) {
      return NextResponse.json({
        ok: true,
        dry: true,
        fetched: leads.length,
        rows
      })
    }

    // Dedup by lead id happens inside the Apps Script.
    await appendLeadRows(rows)

    return NextResponse.json({
      ok: true,
      fetched: leads.length,
      appended: rows.length
    })
  } catch (e) {
    console.error('[vk-sync] failed', e)
    return NextResponse.json(
      { ok: false, error: 'sync failed' },
      { status: 502 }
    )
  }
}
