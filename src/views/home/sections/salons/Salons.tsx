import { FC, Fragment } from 'react'
import Link from 'next/link'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import styles from './Salons.module.scss'

const Salons: FC<{ data: SiteContent['salons'] }> = ({ data }) => {
  return (
    <section className={styles.root} id="salons">
      <div className={styles.wrap}>
        <div className={styles.head}>
          <h2 className={styles.title}>{data.title}</h2>
          <p className={styles.subtitle}>{nbp(data.subtitle)}</p>
        </div>

        <div className={styles.grid}>
          {data.items.map((item) => (
            <article key={item.metro} className={styles.card}>
              <div className={styles.body}>
                <span className={styles.badge}>
                  <img src="/icons/metro.svg" alt="" className={styles.pin} />
                  {item.metro}
                </span>
                <h3 className={styles.cardTitle}>
                  {item.title.split('\n').map((line, i) => (
                    <Fragment key={i}>
                      {i > 0 && <br />}
                      {nbp(line)}
                    </Fragment>
                  ))}
                </h3>
                <p className={styles.cardDesc}>{nbp(item.desc)}</p>
                <Link href={item.href} className={styles.cardBtn}>
                  {data.btnLabel}
                </Link>
              </div>
              <img src={item.photo} alt="" className={styles.photo} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Salons
