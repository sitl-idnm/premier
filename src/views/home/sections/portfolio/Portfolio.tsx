'use client'

import { FC, useRef } from 'react'
import Image from 'next/image'
import { CtaButton } from '@/components/cta/CtaButton'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import { portfolioPhotos } from './photos.generated'
import styles from './Portfolio.module.scss'

const Portfolio: FC<{ data: SiteContent['portfolio'] }> = ({ data }) => {
  const trackRef = useRef<HTMLUListElement>(null)
  const drag = useRef({ down: false, startX: 0, startLeft: 0 })

  const scrollByDir = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 560, behavior: 'smooth' })
  }
  const onPointerDown = (e: React.PointerEvent) => {
    const t = trackRef.current
    if (!t) return
    drag.current = { down: true, startX: e.clientX, startLeft: t.scrollLeft }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const t = trackRef.current
    if (!t || !drag.current.down) return
    t.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX)
  }
  const endDrag = () => {
    drag.current.down = false
  }

  return (
    <section className={styles.root} id="portfolio">
      <div className={styles.head}>
        <h2 className={styles.title}>{data.title}</h2>
        <div className={styles.arrows}>
          <button type="button" className={styles.arrow} aria-label="Назад" onClick={() => scrollByDir(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" className={styles.arrow} aria-label="Вперёд" onClick={() => scrollByDir(1)}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      <ul
        ref={trackRef}
        className={styles.strip}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {portfolioPhotos.map((p, i) => (
          <li key={i} className={styles.cell}>
            <Image
              src={p.src}
              alt="Работа мастеров салона «Премьер»"
              width={p.w}
              height={p.h}
              sizes="320px"
              loading="lazy"
              draggable={false}
              className={styles.photo}
            />
          </li>
        ))}
      </ul>

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
