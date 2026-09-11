'use client'

import { FC, useState } from 'react'
import classNames from 'classnames'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import styles from './Reviews.module.scss'

const salonName = (label: string) => label.split('·')[0].trim()

const Reviews: FC<{ data: SiteContent['reviews'] }> = ({ data }) => {
  const [active, setActive] = useState(0)

  return (
    <section className={styles.root} id="reviews">
      <div className={styles.wrap}>
        <div className={styles.head}>
          <h2 className={styles.title}>{data.title}</h2>
          <div className={styles.aside}>
            <p className={styles.intro}>{nbp(data.intro)}</p>
            <p className={styles.quote}>{nbp(data.quote)}</p>
          </div>
        </div>

        {/* Mobile-only salon switch — one widget at a time to cut clutter. */}
        <div className={styles.mswitch} role="tablist" aria-label="Выбор салона">
          {data.widgets.map((w, i) => (
            <button
              key={w.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={classNames(styles.msbtn, {
                [styles.msbtnActive]: i === active
              })}
              onClick={() => setActive(i)}
            >
              {salonName(w.label)}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {data.widgets.map((w, i) => (
            <div
              key={w.src}
              className={styles.widget}
              data-active={i === active}
            >
              <span className={styles.label}>{nbp(w.label)}</span>
              <iframe
                src={w.src}
                title={`Отзывы: ${w.label}`}
                className={styles.frame}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Reviews
