'use client'

import { FC, useEffect, useRef, useState } from 'react'

type CountUpProps = {
  value: number
  decimals?: number
  suffix?: string
  /** ms before the count starts (to sync with the card fade-in) */
  delay?: number
  duration?: number
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

const format = (n: number, decimals: number) =>
  n.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

/** Animates a number from 0 to `value` on mount. Respects reduced-motion. */
export const CountUp: FC<CountUpProps> = ({
  value,
  decimals = 0,
  suffix = '',
  delay = 0,
  duration = 1100
}) => {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number>()

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || value === 0) {
      setDisplay(value)
      return
    }

    let start: number | null = null
    const startTimer = window.setTimeout(() => {
      const tick = (ts: number) => {
        if (start === null) start = ts
        const p = Math.min((ts - start) / duration, 1)
        setDisplay(value * easeOut(p))
        if (p < 1) raf.current = requestAnimationFrame(tick)
      }
      raf.current = requestAnimationFrame(tick)
    }, delay)

    return () => {
      window.clearTimeout(startTimer)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [value, delay, duration])

  return (
    <>
      {format(display, decimals)}
      {suffix}
    </>
  )
}
