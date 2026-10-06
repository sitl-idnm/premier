'use client'

import { FC, useEffect, useState } from 'react'
import Image from 'next/image'
import { bookingAtom } from '@/shared/atoms/bookingAtom'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import { useSetAtom } from 'jotai'

import styles from './StickyPromo.module.scss'

type StickyPromoProps = {
  badge: string
  title: string
  sub: string
  btn: string
}

const DISMISS_KEY = 'premier-promo-dismissed'

/** «Скидка 20%» promo pinned to the bottom-right of the viewport, following the
 *  scroll (true `position: fixed` — mounted in the layout, outside the page
 *  `template` whose transform would otherwise trap a fixed child). A close button
 *  (top-right) dismisses it for the rest of the browser session. */
export const StickyPromo: FC<StickyPromoProps> = ({ badge, title, sub, btn }) => {
  const [visible, setVisible] = useState(false)
  const openBooking = useSetAtom(bookingAtom)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) !== '1') setVisible(true)
  }, [])

  const onBook = () => {
    ymGoal(GOALS.openBooking, { place: 'sticky-promo' })
    openBooking({ open: true })
  }

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

      <div className={styles.card}>
        <span className={styles.badge}>
          <svg className={styles.flame} viewBox="0 0 12 15" aria-hidden="true">
            <path
              d="M6.5.2c.2 2 .9 3 1.9 4.2 1.1 1.4 2.1 2.8 2.1 5A4.5 4.5 0 0 1 1 9.4c0-1.6.8-3 1.8-4C2.6 6.6 3.4 7.2 4.2 7c-.5-2.2.6-5.3 2.3-6.8Z"
              fill="currentColor"
            />
          </svg>
          {badge}
        </span>

        <Image
          src="/images/hero-discount.png"
          alt=""
          width={1280}
          height={960}
          sizes="160px"
          className={styles.photo}
        />

        <div className={styles.info}>
          <p className={styles.text}>
            <strong>{title}</strong>
            <br />
            {sub}
          </p>
          <button type="button" className={styles.btn} onClick={onBook}>
            {btn}
          </button>
        </div>
      </div>
    </div>
  )
}
