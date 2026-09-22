import { FC } from 'react'
import Image from 'next/image'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import styles from './Loyalty.module.scss'

const Loyalty: FC<{ data: SiteContent['loyalty'] }> = ({ data }) => {
  return (
    <section className={styles.root} id="loyalty">
      <div className={styles.wrap}>
        <Image
          src="/images/loyalty-photo.png"
          alt="Постоянные гостьи салона «Премьер»"
          width={1280}
          height={960}
          sizes="(max-width: 900px) 100vw, 552px"
          className={styles.photo}
        />

        <div className={styles.right}>
          <div className={styles.head}>
            <h2 className={styles.title}>{data.title}</h2>
            <p className={styles.subtitle}>{nbp(data.subtitle)}</p>
          </div>

          <ul className={styles.list}>
            {data.items.map((item) => (
              <li key={item} className={styles.item}>
                {nbp(item)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Loyalty
