import { FC } from 'react'
import Image from 'next/image'
import { CtaButton } from '@/components/cta/CtaButton'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import { portfolioPhotos } from './photos.generated'
import styles from './Portfolio.module.scss'

const ROW_COUNT = 3
const rows = Array.from({ length: ROW_COUNT }, (_, r) =>
  portfolioPhotos.filter((_, i) => i % ROW_COUNT === r)
)

const Portfolio: FC<{ data: SiteContent['portfolio'] }> = ({ data }) => {
  return (
    <section className={styles.root} id="portfolio">
      <div className={styles.head}>
        <h2 className={styles.title}>{data.title}</h2>
      </div>

      <div className={styles.marquee}>
        {rows.map((row, ri) => (
          <div key={ri} className={styles.row} data-dir={ri % 2 === 1 ? 'r' : 'l'}>
            <ul className={styles.track}>
              {[...row, ...row].map((p, i) => (
                <li key={i} className={styles.cell}>
                  <Image
                    src={p.src}
                    alt="Работа мастеров салона «Премьер»"
                    width={p.w}
                    height={p.h}
                    sizes="260px"
                    loading="eager"
                    className={styles.photo}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.ctaBand}>
        <Image
          src="/images/portfolio-cta.png"
          alt=""
          width={120}
          height={120}
          className={styles.ctaImg}
        />
        <p className={styles.ctaText}>{nbp(data.ctaText)}</p>
        <CtaButton booking place="portfolio">
          {data.ctaBtn}
        </CtaButton>
      </div>
    </section>
  )
}

export default Portfolio
