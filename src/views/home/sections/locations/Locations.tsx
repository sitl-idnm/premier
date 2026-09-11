'use client'

import { FC, useState } from 'react'
import classNames from 'classnames'
import { CtaButton } from '@/components/cta/CtaButton'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import styles from './Locations.module.scss'

const Locations: FC<{ data: SiteContent['locations'] }> = ({ data }) => {
  const [active, setActive] = useState(0)

  return (
    <section className={styles.root} id="locations">
      <div className={styles.wrap}>
        <h2 className={styles.title}>{data.title}</h2>
        <p className={styles.subtitle}>{nbp(data.subtitle)}</p>

        {/* Mobile-only salon switch. */}
        <div className={styles.mswitch} role="tablist" aria-label="Выбор салона">
          {data.items.map((item, i) => (
            <button
              key={item.metro}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={classNames(styles.msbtn, {
                [styles.msbtnActive]: i === active
              })}
              onClick={() => setActive(i)}
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
                <img src="/icons/metro.svg" alt="" className={styles.pin} />
                {item.metro}
              </span>

              <p className={styles.address}>{nbp(item.address)}</p>
              <a
                href={`tel:${item.phone.replace(/[^+\d]/g, '')}`}
                className={styles.phone}
              >
                {item.phone}
              </a>
              <p className={styles.hours}>{nbp(item.hours)}</p>

              <div className={styles.btn}>
                <CtaButton modal="booking">{data.btnLabel}</CtaButton>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Locations
