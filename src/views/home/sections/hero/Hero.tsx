import { FC } from 'react'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import { HeroCard } from './HeroCard'
import styles from './Hero.module.scss'

const Hero: FC<{ data: SiteContent['hero'] }> = ({ data }) => {
  return (
    <section className={styles.root} id="hero">
      {/* Desktop / tablet — scaled 1200×508 canvas (matches Figma exactly) */}
      <div className={styles.canvas}>
        <img
          src="/images/hero-ornament.png"
          alt=""
          aria-hidden="true"
          className={styles.ornament}
        />
        <img
          src="/images/hero-main.png"
          alt="Мастер салона «Премьер»"
          className={styles.photoMain}
        />
        <img
          src="/images/hero-small.png"
          alt=""
          aria-hidden="true"
          className={styles.photoSmall}
        />
        <p className={styles.eyebrow}>{nbp(data.eyebrow)}</p>
        <h1 className={styles.title}>{nbp(data.title)}</h1>
        <p className={styles.note}>
          {nbp(data.noteLead)}
          <strong>{data.noteAccent}</strong>
        </p>
        <div className={styles.cardSlot}>
          <HeroCard
            badge={data.cardBadge}
            title={data.cardTitle}
            sub={data.cardSub}
            btn={data.cardBtn}
          />
        </div>
      </div>

      {/* Mobile — vertical stack (Figma mobile frame) */}
      <div className={styles.mobile}>
        <img
          src="/images/hero-main.png"
          alt="Мастер салона «Премьер»"
          className={styles.mPhoto}
        />
        <p className={styles.mEyebrow}>{nbp(data.eyebrow)}</p>
        <h1 className={styles.mTitle}>{nbp(data.title)}</h1>
        <p className={styles.mNote}>
          {nbp(data.noteLead)}
          <strong>{data.noteAccent}</strong>
        </p>
        <div className={styles.mCardSlot}>
          <HeroCard
            badge={data.cardBadge}
            title={data.cardTitle}
            sub={data.cardSub}
            btn={data.cardBtn}
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
