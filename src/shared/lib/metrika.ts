/**
 * Yandex.Metrika integration — counter id + typed `reachGoal` wrapper.
 * The script itself is injected by `<YandexMetrika/>` (see components/analytics).
 */

export const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID) || 0

/** All conversion goals fired from the UI. Keep in sync with Метрика dashboard. */
export const GOALS = {
  // modal opens
  openBooking: 'open_booking_modal',
  openEvent: 'open_event_modal',
  // successful form submits
  submitBooking: 'submit_booking',
  submitEvent: 'submit_event',
  submitSafety: 'submit_safety',
  // failed submit (network / server)
  submitError: 'submit_error',
  // contact clicks
  clickPhone: 'click_phone',
  clickTelegram: 'click_telegram',
  clickVk: 'click_vk',
  // misc interactions
  cookieAccept: 'cookie_accept'
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
