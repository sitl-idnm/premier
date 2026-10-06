'use client'

import { FC, useEffect, useState } from 'react'

import { HeroCard } from './HeroCard'
import styles from './FloatingPromo.module.scss'

type FloatingPromoProps = {
  badge: string
  title: string
  sub: string
  btn: string
}

const DISMISS_KEY = 'premier-promo-dismissed'

/** «Скидка 20%» promo moved out of the hero into a floating widget pinned to the
 *  bottom-right corner of the viewport. A close button (top-right) dismisses it
 *  for the rest of the browser session. */
export const FloatingPromo: FC<FloatingPromoProps> = ({
  badge,
  title,
  sub,
  btn
}) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) !== '1') setVisible(true)
  }, [])

  const onClose = () => {
    setVisible(false)
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore storage errors (private mode) */
    }
  }

  if (!visible) return null

  return (
    <div className={styles.wrap} role="complementary" aria-label={title}>
      <button
        type="button"
        className={styles.close}
        aria-label="Закрыть"
        onClick={onClose}
      >
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M1 1l12 12M13 1L1 13"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className={styles.slot}>
        <HeroCard badge={badge} title={title} sub={sub} btn={btn} />
      </div>
    </div>
  )
}
