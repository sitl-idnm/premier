/**
 * Yandex.Metrika integration — counter id + typed `reachGoal` wrapper.
 * The script itself is injected by `<YandexMetrika/>` (see components/analytics).
 */

export const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID) || 0

/** All conversion goals fired from the UI. Keep in sync with the create-ym-goals
 *  script and the Метрика dashboard. Most opens/submits carry a `place` param. */
export const GOALS = {
  // booking modal
  openBooking: 'open_booking_modal',
  submitBooking: 'submit_booking',
  submitError: 'submit_error',
  // contact clicks
  clickPhone: 'click_phone',
  clickTelegram: 'click_telegram',
  clickVk: 'click_vk',
  // navigation / misc
  navClick: 'nav_click',
  cookieAccept: 'cookie_accept',
  scrollTop: 'scroll_top',
  // prices block
  pricesSearch: 'prices_search',
  pricesAi: 'prices_ai_result',
  pricesSalon: 'prices_salon_switch',
  pricesCategory: 'prices_category',
  pricesExpandAll: 'prices_expand_all',
  // salon switch on reviews / map (mobile)
  salonSwitch: 'salon_switch'
} as const

export type Goal = (typeof GOALS)[keyof typeof GOALS]

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void
  }
}

/** Fire a Метрика goal. No-op on the server or before the counter is ready. */
export function ymGoal(
  target: Goal | string,
  params?: Record<string, unknown>
) {
  if (
    typeof window === 'undefined' ||
    typeof window.ym !== 'function' ||
    !YM_ID
  ) {
    return
  }
  window.ym(YM_ID, 'reachGoal', target, params)
}
