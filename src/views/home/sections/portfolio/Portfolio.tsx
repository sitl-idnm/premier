import { FC } from 'react'
import { CtaButton } from '@/components/cta/CtaButton'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import styles from './Portfolio.module.scss'

const Portfolio: FC<{ data: SiteContent['portfolio'] }> = ({ data }) => {
  return (
    <section className={styles.root} id="portfolio">
      <div className={styles.head}>
        <h2 className={styles.title}>{data.title}</h2>
      </div>

      <div className={styles.gallery}>
        <img src="/images/portfolio-1.png" alt="Работа мастера" className={styles.photo} />
        <img src="/images/portfolio-2.png" alt="Работа мастера" className={styles.photo} />

        <div className={styles.cta}>
          <img src="/images/portfolio-cta.png" alt="" className={styles.ctaImg} />
          <p className={styles.ctaText}>{nbp(data.ctaText)}</p>
          <CtaButton modal="booking">{data.ctaBtn}</CtaButton>
        </div>

        <img src="/images/portfolio-3.png" alt="Работа мастера" className={styles.photo} />
      </div>
    </section>
  )
}

export default Portfolio
