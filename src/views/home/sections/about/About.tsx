import { FC } from 'react'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import { AboutGallery } from './AboutGallery'
import styles from './About.module.scss'

const About: FC<{ data: SiteContent['about'] }> = ({ data }) => {
  return (
    <section className={styles.root} id="about">
      <div className={styles.wrap}>
        <div className={styles.left}>
          <h2 className={styles.title}>{data.title}</h2>
          <p className={styles.subtitle}>{nbp(data.subtitle)}</p>

          <div className={styles.body}>
            <p className={styles.lead}>{nbp(data.lead)}</p>
            {data.paragraphs.map((p, i) => (
              <p key={i} className={styles.para}>
                {nbp(p)}
              </p>
            ))}
            <p className={styles.para}>
              {nbp(data.outroLead)}{' '}
              <strong>{nbp(data.outroAccent)}</strong>
            </p>
          </div>
        </div>

        <div className={styles.visual}>
          <AboutGallery photos={data.gallery} />
        </div>
      </div>
    </section>
  )
}

export default About
