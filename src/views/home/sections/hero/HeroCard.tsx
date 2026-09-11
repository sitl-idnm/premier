'use client'

import { FC } from 'react'
import { modalAtom } from '@/shared/atoms/modalAtom'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import { useSetAtom } from 'jotai'

import styles from './HeroCard.module.scss'

type HeroCardProps = {
  badge: string
  title: string
  sub: string
  btn: string
}

/** Real, interactive «Скидка 20%» card from the hero (was a flat PNG). The
 *  button opens the global booking modal. */
export const HeroCard: FC<HeroCardProps> = ({ badge, title, sub, btn }) => {
  const setModal = useSetAtom(modalAtom)

  const open = () => {
    ymGoal(GOALS.openBooking)
    setModal('booking')
  }

  return (
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

      <img src="/images/hero-discount.png" alt="" className={styles.photo} />

      <div className={styles.info}>
        <p className={styles.text}>
          <strong>{title}</strong>
          <br />
          {sub}
        </p>
        <button type="button" className={styles.btn} onClick={open}>
          {btn}
        </button>
      </div>
    </div>
  )
}
