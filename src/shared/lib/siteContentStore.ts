import 'server-only'

/**
 * Thin server-only wrapper over Supabase PostgREST for the single
 * `premier_site_content` row. Reads use the anon key (RLS allows public SELECT
 * of site copy); writes use the service-role key (bypasses RLS). No SDK — plain
 * fetch keeps the dependency surface minimal, matching the rest of the project.
 */

const TABLE = 'premier_site_content'

/** Cache tag for the public content read — busted on admin save. */
export const CONTENT_TAG = 'site-content'

function restUrl(): string | null {
  const base = process.env.SUPABASE_URL
  if (!base) return null
  return `${base.replace(/\/$/, '')}/rest/v1/${TABLE}`
}

/** Raw override JSON stored in the DB (partial, deep-merged over defaults). */
export async function readContentOverride(): Promise<Record<string, unknown>> {
  const url = restUrl()
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return {}

  const res = await fetch(`${url}?id=eq.1&select=data`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    // Tagged so the public pages stay static and revalidate on admin save.
    next: { tags: [CONTENT_TAG], revalidate: 60 }
  })
  if (!res.ok) throw new Error(`Supabase read failed: ${res.status}`)

  const rows = (await res.json()) as { data?: Record<string, unknown> }[]
  return rows[0]?.data ?? {}
}

/** Overwrite the override JSON. Requires the service-role key. */
export async function writeContentOverride(
  data: Record<string, unknown>
): Promise<void> {
  const url = restUrl()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('SUPABASE_URL is not set')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

  const res = await fetch(`${url}?id=eq.1`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ data, updated_at: new Date().toISOString() }),
    cache: 'no-store'
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Supabase write failed: ${res.status} ${text}`)
  }
}
