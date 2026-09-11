/**
 * Minimal signed-session helper for the single-password /admin gate.
 * Token = `<expiry>.<hmac(secret, expiry)>`. Uses Web Crypto so the same code
 * runs in the edge middleware and in Node route handlers.
 */
export const ADMIN_COOKIE = 'premier_admin'
const MAX_AGE_SEC = 60 * 60 * 24 * 30 // 30 days

const enc = new TextEncoder()

function toBase64Url(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes)
  let bin = ''
  for (let i = 0; i < view.length; i++) bin += String.fromCharCode(view[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return toBase64Url(sig)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return out === 0
}

export async function createSessionToken(secret: string): Promise<string> {
  const exp = String(Date.now() + MAX_AGE_SEC * 1000)
  return `${exp}.${await sign(exp, secret)}`
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string | undefined
): Promise<boolean> {
  if (!token || !secret) return false
  const [exp, sig] = token.split('.')
  if (!exp || !sig) return false
  const expMs = Number(exp)
  if (!Number.isFinite(expMs) || expMs < Date.now()) return false
  return timingSafeEqual(sig, await sign(exp, secret))
}

export const ADMIN_COOKIE_MAX_AGE = MAX_AGE_SEC
