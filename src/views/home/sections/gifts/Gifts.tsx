import { FC } from 'react'
import { CtaButton } from '@/components/cta/CtaButton'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import { Envelope } from './Envelope'
import styles from './Gifts.module.scss'

const Gifts: FC<{ data: SiteContent['gifts'] }> = ({ data }) => {
  return (
    <section className={styles.root} id="gifts">
      <div className={styles.wrap}>
        <div className={styles.left}>
          <h2 className={styles.title}>{data.title}</h2>
          <p className={styles.subtitle}>{nbp(data.subtitle)}</p>
          <div className={styles.btn}>
            <CtaButton modal="booking">{data.btnLabel}</CtaButton>
          </div>
        </div>

        <Envelope />
      </div>
    </section>
  )
}

export default Gifts
