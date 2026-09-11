'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'

/**
 * Invisible Yandex SmartCaptcha.
 *
 * Renders a hidden widget and exposes an imperative `execute()` that resolves
 * with a validation token (the challenge modal appears only when Yandex deems
 * the request suspicious, so the form layout is never affected).
 *
 * Without `NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY` the component is a no-op and
 * `execute()` resolves with an empty string, so forms keep working in dev / until
 * keys are configured. The server (`/api/lead`) then skips validation to match.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY
const SCRIPT_SRC =
  'https://smartcaptcha.yandexcloud.net/captcha.js?render=onload'

export type SmartCaptchaHandle = {
  /** Runs the captcha and resolves with a token (empty string when disabled). */
  execute: () => Promise<string>
}

type SmartCaptchaApi = {
  render: (
    container: HTMLElement,
    params: {
      sitekey: string
      invisible?: boolean
      hideShield?: boolean
      callback?: (token: string) => void
      'error-callback'?: () => void
    }
  ) => number
  execute: (widgetId: number) => void
  reset: (widgetId: number) => void
}

declare global {
  interface Window {
    smartCaptcha?: SmartCaptchaApi
    __smartCaptchaOnload?: () => void
  }
}

/** Load the SmartCaptcha script once and resolve when window.smartCaptcha is ready. */
function loadScript(): Promise<SmartCaptchaApi> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'))
    if (window.smartCaptcha) return resolve(window.smartCaptcha)

    const finish = () => {
      if (window.smartCaptcha) resolve(window.smartCaptcha)
      else reject(new Error('smartCaptcha unavailable'))
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    )
    if (existing) {
      if (window.smartCaptcha) resolve(window.smartCaptcha)
      else existing.addEventListener('load', finish, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.defer = true
    script.addEventListener('load', finish, { once: true })
    script.addEventListener('error', () => reject(new Error('script error')), {
      once: true
    })
    document.head.appendChild(script)
  })
}

export const SmartCaptcha = forwardRef<SmartCaptchaHandle>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<number | null>(null)
  const apiRef = useRef<SmartCaptchaApi | null>(null)
  const pending = useRef<{
    resolve: (t: string) => void
    reject: (e: Error) => void
  } | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!SITE_KEY) return
    let cancelled = false

    loadScript()
      .then((api) => {
        if (cancelled || !containerRef.current) return
        apiRef.current = api
        widgetId.current = api.render(containerRef.current, {
          sitekey: SITE_KEY,
          invisible: true,
          hideShield: true,
          callback: (token) => {
            pending.current?.resolve(token)
            pending.current = null
            if (widgetId.current !== null) api.reset(widgetId.current)
          },
          'error-callback': () => {
            pending.current?.reject(new Error('captcha error'))
            pending.current = null
            if (widgetId.current !== null) api.reset(widgetId.current)
          }
        })
        setReady(true)
      })
      .catch(() => {
        // Leave `ready` false — execute() falls back to resolving empty.
      })

    return () => {
      cancelled = true
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      execute: () =>
        new Promise<string>((resolve, reject) => {
          // Disabled or failed to load — behave as a no-op so the form submits.
          if (
            !SITE_KEY ||
            !ready ||
            apiRef.current === null ||
            widgetId.current === null
          ) {
            resolve('')
            return
          }
          pending.current = { resolve, reject }
          apiRef.current.execute(widgetId.current)
        })
    }),
    [ready]
  )

  if (!SITE_KEY) return null
  return <div ref={containerRef} aria-hidden />
})

SmartCaptcha.displayName = 'SmartCaptcha'
