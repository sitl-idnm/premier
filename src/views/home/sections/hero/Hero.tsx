import { FC } from 'react'
import Image, { getImageProps } from 'next/image'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import styles from './Hero.module.scss'

const SEO_H1 = 'Салон красоты в Москве — Премьер'
const HERO_SRC = '/images/hero-main.webp'
const HERO_ALT = 'Мастер салона «Премьер»'
// Прозрачный 1×1: <source> с ним отключает загрузку фото на «чужом» брейкпоинте
// (десктопный и мобильный hero — разные блоки, скрытый через display:none).
const BLANK =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const MOBILE_MQ = '(max-width: 560px)'
const DESKTOP_MQ = '(min-width: 561px)'

const Hero: FC<{ data: SiteContent['hero'] }> = ({ data }) => {
  const common = {
    src: HERO_SRC,
    alt: HERO_ALT,
    width: 1600,
    height: 1200,
    priority: true
  }
  const { props: desk } = getImageProps({
    ...common,
    sizes: '(max-width: 1200px) 48vw, 570px',
    className: styles.photoMain
  })
  const { props: mob } = getImageProps({
    ...common,
    sizes: '100vw',
    className: styles.mPhoto
  })

  return (
    <section className={styles.root} id="hero">
      {/* Единственный h1 страницы — с ключевыми словами; видимые слоганы ниже — <p>. */}
      <h1 className={styles.srOnly}>{SEO_H1}</h1>
      {/* Desktop / tablet — scaled 1200×508 canvas (matches Figma exactly) */}
      <div className={styles.canvas}>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative ornament, cqw-positioned */}
        <img
          src="/images/hero-ornament.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className={styles.ornament}
        />
        <picture className={styles.pic}>
          <source media={MOBILE_MQ} srcSet={BLANK} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- art direction через <picture>, alt из getImageProps */}
          <img {...desk} />
        </picture>
        <Image
          src="/images/hero-small.webp"
          alt=""
          width={720}
          height={540}
          sizes="180px"
          className={styles.photoSmall}
        />
        <p className={styles.eyebrow}>{nbp(data.eyebrow)}</p>
        <p className={styles.title}>{nbp(data.title)}</p>
        <p className={styles.note}>
          {nbp(data.noteLead)}
          <strong>{data.noteAccent}</strong>
        </p>
      </div>

      {/* Mobile — vertical stack (Figma mobile frame) */}
      <div className={styles.mobile}>
        <picture className={styles.pic}>
          <source media={DESKTOP_MQ} srcSet={BLANK} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- art direction через <picture>, alt из getImageProps */}
          <img {...mob} />
        </picture>
        <p className={styles.mEyebrow}>{nbp(data.eyebrow)}</p>
        <p className={styles.mTitle}>{nbp(data.title)}</p>
        <p className={styles.mNote}>
          {nbp(data.noteLead)}
          <strong>{data.noteAccent}</strong>
        </p>
      </div>
    </section>
  )
}

export default Hero
