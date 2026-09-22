'use client'

import { FC } from 'react'
import Image from 'next/image'
import { BOOKING_URL } from '@/shared/const/yclients'
import { GOALS, ymGoal } from '@/shared/lib/metrika'

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
        <a
          className={styles.btn}
          href={BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => ymGoal(GOALS.openBooking, { place: 'hero' })}
        >
          {btn}
        </a>
      </div>
    </div>
  )
}
