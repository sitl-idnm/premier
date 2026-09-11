/** Shared lead shape + field extraction used by every delivery channel. */

export type LeadBody = {
  form?: string
  name?: string
  phone?: string
  email?: string
  eventType?: string
  kids?: string
  tariff?: string
  startTime?: string
  date?: string
  page?: string
  referrer?: string
  captchaToken?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

const UTM_FIELDS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term'
] as const

/** Filled UTM fields as [key, value] pairs (for per-line rendering). */
export function utmEntries(b: LeadBody): Array<[string, string]> {
  return UTM_FIELDS.filter((k) => b[k]?.trim()).map((k) => [k, b[k]!.trim()])
}

/** Compact "utm_source=… utm_medium=…" summary of the filled UTM fields. */
export function utmSummary(b: LeadBody): string {
  return utmEntries(b)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ')
}

export const FORM_TITLES: Record<string, string> = {
  booking: '🎟️ Бронирование онлайн',
  event: '🎉 Заявка на мероприятие',
  safety: '📞 Заявка «Запишитесь прямо сейчас»'
}

export function leadTitle(form?: string): string {
  return FORM_TITLES[form ?? ''] ?? '📩 Заявка с сайта'
}

/** Plain form label (no emoji) for the sheet «Источник» column. */
export const FORM_SOURCES: Record<string, string> = {
  booking: 'Бронирование',
  event: 'Мероприятие',
  safety: 'Запишитесь'
}

export function leadSource(form?: string): string {
  return FORM_SOURCES[form ?? ''] ?? 'Сайт'
}

/** Ordered [label, value] pairs for the filled-in fields of a lead. */
export function leadFields(b: LeadBody): Array<[string, string]> {
  const pairs: Array<[string, string]> = []
  const add = (label: string, value?: string) => {
    if (value && value.trim()) pairs.push([label, value.trim()])
  }
  add('Имя', b.name)
  add('Телефон', b.phone)
  add('Почта', b.email)
  add('Тип мероприятия', b.eventType)
  add('Тариф', b.tariff)
  add('Детей', b.kids)
  add('Время начала', b.startTime)
  add('Желаемая дата', b.date)
  add('Страница', b.page)
  add('UTM', utmSummary(b))
  return pairs
}

/** Escape text for HTML contexts (Telegram HTML parse_mode + email body). */
export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
