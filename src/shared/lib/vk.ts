/**
 * VK Ads (ads.vk.ru) lead adapter.
 *
 * The public docs don't pin down exact JSON field names, so parsing is
 * defensive: `normalizeVkLead` accepts both webhook payloads and API export
 * rows and maps whatever it recognises. The base URL / endpoint / auth below
 * are centralised and marked `verify against live API` — confirm them against a
 * real cabinet token before relying on the cron poller.
 */

import { buildLeadRow } from './sheets'

// verify against live API — new VK Ads cabinet base + lead export endpoint.
const VK_API_BASE = 'https://ads.vk.com/api/v2'
const VK_LEADS_PATH = '/lead_ads/leads.json'

/** Normalised lead, flattened for a spreadsheet row. */
export type VkLead = {
  id: string
  createdAt: string
  name: string
  phone: string
  email: string
  formName: string
  campaign: string
}

/** Parse VK's `createdAt` (ISO string or unix epoch) into a Date. */
function toDate(v: string): Date {
  if (/^\d+$/.test(v)) {
    const n = Number(v)
    return new Date(n < 1e12 ? n * 1000 : n) // 10-digit = seconds
  }
  const d = new Date(v)
  return isNaN(d.getTime()) ? new Date() : d
}

/** Column order must match the shared SHEET_HEADERS (see sheets.ts). */
export function leadToRow(lead: VkLead): string[] {
  return buildLeadRow({
    id: lead.id,
    createdAt: toDate(lead.createdAt),
    phone: lead.phone,
    name: lead.name,
    source: lead.formName ? `VK · ${lead.formName}` : 'VK',
    email: lead.email,
    page: lead.campaign
  })
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

const str = (v: unknown): string =>
  v === undefined || v === null ? '' : String(v).trim()

/** Field-name synonyms → our normalised keys (checked case-insensitively). */
const FIELD_SYNONYMS: Record<'name' | 'phone' | 'email', string[]> = {
  name: ['name', 'full_name', 'fullname', 'имя', 'фио', 'first_name'],
  phone: ['phone', 'phone_number', 'tel', 'telephone', 'телефон', 'номер'],
  email: ['email', 'e-mail', 'mail', 'почта', 'емейл']
}

function classify(key: string): 'name' | 'phone' | 'email' | null {
  const k = key.toLowerCase().trim()
  for (const target of ['name', 'phone', 'email'] as const) {
    if (FIELD_SYNONYMS[target].some((syn) => k === syn || k.includes(syn))) {
      return target
    }
  }
  return null
}

/**
 * Collect answer pairs from the many shapes VK / connectors use:
 * `answers`/`fields`/`data` arrays of {key,value} | {question,answer}, or a
 * flat object of field→value.
 */
function collectPairs(raw: Record<string, unknown>): Array<[string, string]> {
  const pairs: Array<[string, string]> = []

  const fromArray = (arr: unknown) => {
    if (!Array.isArray(arr)) return
    for (const item of arr) {
      if (!isRecord(item)) continue
      const key = str(item.key ?? item.question ?? item.name ?? item.field)
      const value = str(item.value ?? item.answer ?? item.val)
      if (key) pairs.push([key, value])
    }
  }

  fromArray(raw.answers)
  fromArray(raw.fields)
  fromArray(raw.data)

  // Flat top-level fields (webhook connectors often send these).
  if (pairs.length === 0) {
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === 'string' || typeof v === 'number')
        pairs.push([k, str(v)])
    }
  }
  return pairs
}

export function normalizeVkLead(raw: unknown): VkLead {
  const r = isRecord(raw) ? raw : {}

  const id =
    str(r.id) ||
    str(r.lead_id) ||
    str(r._id) ||
    str(r.uid) ||
    String(Date.now())

  const createdAt =
    str(r.created_time) ||
    str(r.created) ||
    str(r.time) ||
    str(r.date) ||
    new Date().toISOString()

  const out: VkLead = {
    id,
    createdAt,
    name: '',
    phone: '',
    email: '',
    formName: str(r.form_name) || str(r.form) || str(r.ad_plan) || '',
    campaign: str(r.campaign) || str(r.banner) || str(r.ad) || ''
  }

  for (const [key, value] of collectPairs(r)) {
    const kind = classify(key)
    if (kind && !out[kind]) out[kind] = value
  }

  return out
}

export function vkConfigured(): boolean {
  return Boolean(process.env.VK_ADS_ACCESS_TOKEN)
}

/**
 * Poll VK Ads for recent leads. Returns normalised leads (dedup happens against
 * the Sheet by the caller). Returns [] when unconfigured or on error so the cron
 * job degrades gracefully. verify against live API — endpoint + params.
 */
export async function fetchVkLeads(limit = 50): Promise<VkLead[]> {
  const token = process.env.VK_ADS_ACCESS_TOKEN
  if (!token) return []

  const url = `${VK_API_BASE}${VK_LEADS_PATH}?limit=${limit}`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[vk] leads fetch', res.status, detail)
      return []
    }
    const data = (await res.json()) as unknown
    // Common shapes: { items: [...] } | { leads: [...] } | [...]
    const items: unknown[] = Array.isArray(data)
      ? data
      : isRecord(data)
        ? ((data.items ?? data.leads ?? data.results) as unknown[]) ?? []
        : []
    return items.map(normalizeVkLead)
  } catch (e) {
    console.error('[vk] leads request failed', e)
    return []
  }
}
