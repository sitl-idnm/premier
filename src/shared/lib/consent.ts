/**
 * Согласие на cookie. 'all' — аналитика (Яндекс.Метрика) и виджеты Яндекса,
 * 'necessary' — только необходимые. Пока выбора нет, ничего стороннего не грузим.
 */
export type Consent = 'all' | 'necessary'

const STORAGE_KEY = 'premier-cookie-consent'
const EVENT = 'premier:consent'

export function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'all' || v === 'necessary' ? v : null
}

export function saveConsent(value: Consent) {
  localStorage.setItem(STORAGE_KEY, value)
  // Старый флаг баннера-уведомления не считается согласием на аналитику.
  localStorage.removeItem('premier-cookie-accepted')
  window.dispatchEvent(new CustomEvent<Consent>(EVENT, { detail: value }))
}

export function onConsentChange(cb: (value: Consent) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<Consent>).detail)
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
