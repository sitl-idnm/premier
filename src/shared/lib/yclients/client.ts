import { YCLIENTS } from './config'

const BASE = 'https://api.yclients.com/api/v1'

type YcOpts = {
  method?: string
  body?: unknown
  /** GET cache lifetime in seconds (Next fetch revalidate); 0 = no cache. */
  revalidate?: number
}

/**
 * Low-level YClients API call. Adds the partner (+ optional user) token and the
 * required Accept header, and unwraps `{ success, data }`. Throws on failure so
 * callers can fall back to static content.
 */
export async function yc<T>(path: string, opts: YcOpts = {}): Promise<T> {
  const auth =
    `Bearer ${YCLIENTS.partnerToken}` +
    (YCLIENTS.userToken ? `, User ${YCLIENTS.userToken}` : '')

  const res = await fetch(BASE + path, {
    method: opts.method ?? 'GET',
    headers: {
      Accept: 'application/vnd.api.v2+json',
      'Content-Type': 'application/json',
      Authorization: auth
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    next: { revalidate: opts.revalidate ?? 0 }
  })

  const json = await res.json().catch(() => null)
  if (!res.ok || !json || json.success === false) {
    const msg = json?.meta?.message || `${res.status}`
    throw new Error(`yclients ${path}: ${msg}`)
  }
  return json.data as T
}
