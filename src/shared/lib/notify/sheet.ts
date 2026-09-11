/** Google Sheets delivery channel for site leads (same sheet as VK leads). */

import { appendLeadRow, buildLeadRow, sheetsConfigured } from '@/shared/lib/sheets'
import { LeadBody, leadSource } from './lead'
import type { DeliveryResult } from './telegram'

/** Row layout matches the shared SHEET_HEADERS (see sheets.ts). */
function leadToRow(b: LeadBody): string[] {
  const id = `site-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return buildLeadRow({
    id,
    createdAt: new Date(),
    phone: b.phone?.trim() ?? '',
    name: b.name?.trim() ?? '',
    source: leadSource(b.form),
    email: b.email?.trim() ?? '',
    eventType: b.eventType?.trim() ?? '',
    tariff: b.tariff?.trim() ?? '',
    kids: b.kids?.trim() ?? '',
    startTime: b.startTime?.trim() ?? '',
    wantedDate: b.date?.trim() ?? '',
    page: b.page?.trim() ?? '',
    utmSource: b.utm_source?.trim() ?? '',
    utmMedium: b.utm_medium?.trim() ?? '',
    utmCampaign: b.utm_campaign?.trim() ?? '',
    utmContent: b.utm_content?.trim() ?? '',
    utmTerm: b.utm_term?.trim() ?? ''
  })
}

export async function sendSheet(b: LeadBody): Promise<DeliveryResult> {
  if (!sheetsConfigured()) {
    console.warn('[lead] Sheets web app not set — skipping Sheets delivery')
    return { ok: false, skipped: true }
  }
  try {
    await appendLeadRow(leadToRow(b))
    return { ok: true }
  } catch (e) {
    console.error('[lead] Sheets append failed', e)
    return { ok: false, error: 'sheets append failed' }
  }
}
