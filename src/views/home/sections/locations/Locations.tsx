'use client'

import { FC, useState } from 'react'
import classNames from 'classnames'
import { CtaButton } from '@/components/cta/CtaButton'
import { type SiteContent } from '@/shared/content'
import { BOOKING_URL } from '@/shared/const/yclients'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import { nbp } from '@/shared/lib/typography'

import styles from './Locations.module.scss'

const Locations: FC<{ data: SiteContent['locations'] }> = ({ data }) => {
  const [active, setActive] = useState(0)

  const switchSalon = (i: number, metro: string) => {
    setActive(i)
    ymGoal(GOALS.salonSwitch, { place: 'map', salon: metro })
  }

  return (
    <section className={styles.root} id="locations">
      <div className={styles.wrap}>
        <h2 className={styles.title}>{data.title}</h2>
        <p className={styles.subtitle}>{nbp(data.subtitle)}</p>

        {/* Mobile-only salon switch. */}
        <div className={styles.mswitch} role="tablist" aria-label="Выбор салона">
          <span
            className={styles.msInd}
            style={{ transform: `translateX(${active * 100}%)` }}
            aria-hidden="true"
          />
          {data.items.map((item, i) => (
            <button
              key={item.metro}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={classNames(styles.msbtn, {
                [styles.msbtnActive]: i === active
              })}
              onClick={() => switchSalon(i, item.metro)}
            >
              {item.metro}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {data.items.map((item, i) => (
            <article
              key={item.metro}
              className={styles.card}
              data-active={i === active}
            >
              <iframe
                src={item.mapSrc}
                title={`Карта: ${item.address}`}
                className={styles.map}
                loading="lazy"
                allowFullScreen
              />

              <span className={styles.badge}>
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative vector */}
                <img src="/icons/metro.svg" alt="" className={styles.pin} />
                {item.metro}
              </span>

              <p className={styles.address}>{nbp(item.address)}</p>
              <a
                href={`tel:${item.phone.replace(/[^+\d]/g, '')}`}
                className={styles.phone}
                onClick={() => ymGoal(GOALS.clickPhone, { salon: item.metro })}
              >
                {item.phone}
              </a>
              <p className={styles.hours}>{nbp(item.hours)}</p>

              <div className={styles.btn}>
                <CtaButton href={BOOKING_URL} place="locations">
                  {data.btnLabel}
                </CtaButton>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Locations
