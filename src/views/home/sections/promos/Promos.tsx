import { FC } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BookNow } from '@/components/booking/BookNow'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import styles from './Promos.module.scss'

const Promos: FC<{ data: SiteContent['promos'] }> = ({ data }) => {
  return (
    <section className={styles.root} id="promos">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative vector background */}
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
              <Image
                src={item.photo}
                alt=""
                width={374}
                height={373}
                sizes="(max-width: 900px) 100vw, 380px"
                className={styles.photo}
              />
              <h3 className={styles.cardTitle}>{nbp(item.title)}</h3>
              <p className={styles.cardDesc}>{nbp(item.desc)}</p>
              <BookNow className={styles.cardBtn}>{data.btnLabel}</BookNow>
            </article>
          ))}

          <article className={styles.glass}>
            <Image
              src="/images/promo-deco.png"
              alt=""
              width={164}
              height={164}
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
