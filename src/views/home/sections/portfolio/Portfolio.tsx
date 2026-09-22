import { FC } from 'react'
import Image from 'next/image'
import { CtaButton } from '@/components/cta/CtaButton'
import { type SiteContent } from '@/shared/content'
import { BOOKING_URL } from '@/shared/const/yclients'
import { nbp } from '@/shared/lib/typography'

import styles from './Portfolio.module.scss'

const Portfolio: FC<{ data: SiteContent['portfolio'] }> = ({ data }) => {
  return (
    <section className={styles.root} id="portfolio">
      <div className={styles.head}>
        <h2 className={styles.title}>{data.title}</h2>
      </div>

      <div className={styles.gallery}>
        <Image
          src="/images/portfolio-1.png"
          alt="Работа мастера"
          width={1655}
          height={2500}
          sizes="(max-width: 900px) 300px, 25vw"
          className={styles.photo}
        />
        <Image
          src="/images/portfolio-2.png"
          alt="Работа мастера"
          width={1080}
          height={1350}
          sizes="(max-width: 900px) 300px, 25vw"
          className={styles.photo}
        />

        <div className={styles.cta}>
          <Image
            src="/images/portfolio-cta.png"
            alt=""
            width={220}
            height={220}
            className={styles.ctaImg}
          />
          <p className={styles.ctaText}>{nbp(data.ctaText)}</p>
          <CtaButton href={BOOKING_URL} place="portfolio">
            {data.ctaBtn}
          </CtaButton>
        </div>

        <Image
          src="/images/portfolio-3.png"
          alt="Работа мастера"
          width={1080}
          height={1350}
          sizes="(max-width: 900px) 300px, 25vw"
          className={styles.photo}
        />
      </div>
    </section>
  )
}

export default Portfolio
