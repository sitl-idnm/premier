/**
 * UTM attribution. Ad clicks land with `?utm_source=…&utm_medium=…` in the URL,
 * but in-page anchor navigation drops the query string — so on the first render
 * we snapshot any UTM params into a cookie that survives the whole session and
 * gets attached to every lead on submit.
 */

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term'
] as const

export type UtmKey = (typeof UTM_KEYS)[number]
export type Utm = Partial<Record<UtmKey, string>>

const COOKIE = 'premier_utm'
const MAX_AGE_DAYS = 90

/** Pull UTM params out of a query string (no leading `?` required). */
export function parseUtm(search: string): Utm {
  const params = new URLSearchParams(search)
  const utm: Utm = {}
  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) utm[key] = value
  }
  return utm
}

/**
 * Capture UTM params from the current URL into the cookie. Last-touch wins:
 * a fresh ad click with UTM params overwrites an older snapshot; a plain visit
 * (no UTM in URL) leaves any existing snapshot untouched.
 */
export function captureUtm(): void {
  if (typeof window === 'undefined') return
  const utm = parseUtm(window.location.search)
  if (Object.keys(utm).length === 0) return

  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60
  document.cookie = `${COOKIE}=${encodeURIComponent(
    JSON.stringify(utm)
  )}; path=/; max-age=${maxAge}; SameSite=Lax`
}

/** Read the stored UTM snapshot from the cookie (client-side). */
export function readUtm(): Utm {
  if (typeof document === 'undefined') return {}
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${COOKIE}=`))
  if (!match) return {}
  try {
    const parsed = JSON.parse(decodeURIComponent(match.slice(COOKIE.length + 1)))
    const utm: Utm = {}
    for (const key of UTM_KEYS) {
      if (typeof parsed?.[key] === 'string') utm[key] = parsed[key]
    }
    return utm
  } catch {
    return {}
  }
}
