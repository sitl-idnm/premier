/**
 * Google Sheets writer via a Google Apps Script Web App — no GCP project, no
 * service account, no billing. The bound script (see docs) receives a POST of
 * `{ secret, rows }`, dedupes by lead id (column A) and appends.
 *
 * Requires env: SHEETS_WEBAPP_URL (the script's /exec URL), SHEETS_WEBAPP_SECRET.
 */

export function sheetsConfigured(): boolean {
  return Boolean(process.env.SHEETS_WEBAPP_URL)
}

/**
 * Column layout of the leads sheet. MUST stay in sync with `HEADERS` in
 * `scripts/apps-script-sheets.gs`. Columns 6–8 (Качество/Комментарий/Результат)
 * are filled by hand by the manager and are always sent empty on insert.
 * `id` is a dedup helper kept as the LAST column (hide it in the sheet).
 */
export const SHEET_HEADERS = [
  'Дата',
  'Время',
  'Телефон',
  'Имя',
  'Источник',
  'Качество',
  'Комментарий',
  'Результат',
  'E-mail',
  'Тип мероприятия',
  'Тариф',
  'Детей',
  'Время начала',
  'Желаемая дата',
  'Страница',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign',
  'UTM Content',
  'UTM Term',
  'id'
] as const

/** Normalised lead ready to be laid out as a sheet row. */
export type SheetLead = {
  id: string
  createdAt: Date
  phone?: string
  name?: string
  source?: string // Источник
  email?: string
  eventType?: string
  tariff?: string
  kids?: string
  startTime?: string
  wantedDate?: string
  page?: string // Страница
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
}

/** Split a Date into Moscow-time Дата (ДД.ММ.ГГГГ) + Время (ЧЧ:ММ). */
export function mskDateTime(d: Date): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return {
    date: `${get('day')}.${get('month')}.${get('year')}`,
    time: `${get('hour')}:${get('minute')}`
  }
}

/** Lay a normalised lead out in the exact `SHEET_HEADERS` column order. */
export function buildLeadRow(l: SheetLead): string[] {
  const { date, time } = mskDateTime(l.createdAt)
  return [
    date,
    time,
    l.phone ?? '',
    l.name ?? '',
    l.source ?? '',
    '', // Качество — ручное
    '', // Комментарий — ручное
    '', // Результат — ручное
    l.email ?? '',
    l.eventType ?? '',
    l.tariff ?? '',
    l.kids ?? '',
    l.startTime ?? '',
    l.wantedDate ?? '',
    l.page ?? '',
    l.utmSource ?? '',
    l.utmMedium ?? '',
    l.utmCampaign ?? '',
    l.utmContent ?? '',
    l.utmTerm ?? '',
    l.id
  ]
}

/** Append one or more rows. Dedup by lead id happens inside the Apps Script. */
export async function appendLeadRows(rows: string[][]): Promise<void> {
  const url = process.env.SHEETS_WEBAPP_URL
  if (!url) throw new Error('SHEETS_WEBAPP_URL not set')
  if (rows.length === 0) return

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Apps Script /exec answers a 302 → googleusercontent; fetch follows it.
    redirect: 'follow',
    body: JSON.stringify({
      secret: process.env.SHEETS_WEBAPP_SECRET || '',
      rows
    })
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`sheets webapp ${res.status}: ${detail}`)
  }
}

export async function appendLeadRow(row: string[]): Promise<void> {
  return appendLeadRows([row])
}
