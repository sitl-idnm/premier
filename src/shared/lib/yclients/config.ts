/**
 * YClients integration config. All secrets come from env (server-only):
 *   YCLIENTS_PARTNER_TOKEN  — partner (Bearer) token issued by YClients
 *   YCLIENTS_USER_TOKEN     — optional user token (private/CRM endpoints)
 *   YCLIENTS_COMPANY_TAGANSKAYA / _NOVOSLOBODSKAYA — company (branch) ids
 *
 * Until the partner token + at least one company id are set, `isConfigured()`
 * is false and the site falls back to the static price list / widget links.
 */
export const YCLIENTS = {
  partnerToken: process.env.YCLIENTS_PARTNER_TOKEN || '',
  userToken: process.env.YCLIENTS_USER_TOKEN || '',
  companies: {
    taganskaya: process.env.YCLIENTS_COMPANY_TAGANSKAYA || '',
    novoslobodskaya: process.env.YCLIENTS_COMPANY_NOVOSLOBODSKAYA || ''
  } as Record<string, string>
}

export const SALON_KEYS = ['taganskaya', 'novoslobodskaya'] as const
export type SalonKey = (typeof SALON_KEYS)[number]

export const SALON_LABELS: Record<string, string> = {
  taganskaya: 'Таганская',
  novoslobodskaya: 'Новослободская'
}

export function companyId(salon: string): string {
  return YCLIENTS.companies[salon] || ''
}

/** True when we can actually talk to YClients (token + ≥1 company). */
export function isYclientsConfigured(): boolean {
  return Boolean(
    YCLIENTS.partnerToken &&
      (YCLIENTS.companies.taganskaya || YCLIENTS.companies.novoslobodskaya)
  )
}
