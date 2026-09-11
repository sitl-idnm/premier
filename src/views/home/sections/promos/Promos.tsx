import { FC } from 'react'
import Link from 'next/link'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import styles from './Promos.module.scss'

const Promos: FC<{ data: SiteContent['promos'] }> = ({ data }) => {
  return (
    <section className={styles.root} id="promos">
      <img
        src="/images/promos-bg.svg"
        alt=""
        aria-hidden="true"
        className={styles.bg}
      />

      <div className={styles.wrap}>
        <div className={styles.head}>
          <h2 className={styles.title}>{data.title}</h2>
          <p className={styles.subtitle}>{nbp(data.subtitle)}</p>
        </div>

        <div className={styles.grid}>
          {data.items.map((item, i) => (
            <article key={i} className={styles.card}>
              <img
                src={item.photo}
                alt=""
                className={styles.photo}
              />
              <h3 className={styles.cardTitle}>{nbp(item.title)}</h3>
              <p className={styles.cardDesc}>{nbp(item.desc)}</p>
              <button type="button" className={styles.cardBtn}>
                {data.btnLabel}
              </button>
            </article>
          ))}

          <article className={styles.glass}>
            <img
              src="/images/promo-deco.png"
              alt=""
              aria-hidden="true"
              className={styles.deco}
            />
            <Link href={data.allHref} className={styles.allLink}>
              {nbp(data.allLabel)}
            </Link>
          </article>
        </div>
      </div>
    </section>
  )
}

export default Promos
