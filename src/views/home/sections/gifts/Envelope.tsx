'use client'

import { FC, useEffect, useRef } from 'react'
import Image from 'next/image'
import { prefersReducedMotion } from '@/shared/lib/motion'

import styles from './Envelope.module.scss'

/**
 * Three-layer envelope (back body + pearls · photo · front flap). On scroll the photo
 * slides down and settles so its bottom tucks into the flap's V-notch. Reduced-motion safe.
 */
export const Envelope: FC = () => {
  const stageRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    const photo = photoRef.current
    if (!stage || !photo) return

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      photo.classList.add(styles.shown)
      return
    }

    // Как ScrollTrigger `start: 'top 55%'` + toggleActions «play none none reverse»:
    // играем, когда верх блока поднялся выше 55% экрана; откатываем, только если
    // блок снова ушёл вниз под эту линию (при прокрутке дальше вниз фото остаётся).
    photo.classList.add(styles.armed)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          photo.classList.add(styles.shown)
        } else if (entry.boundingClientRect.top > 0) {
          photo.classList.remove(styles.shown)
        }
      },
      { rootMargin: '0px 0px -45% 0px' }
    )
    io.observe(stage)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={stageRef} className={styles.stage} aria-hidden="true">
      <Image
        src="/images/envelope-back.webp"
        alt=""
        width={1000}
        height={789}
        sizes="(max-width: 900px) 480px, 615px"
        className={styles.back}
      />
      {/* eslint-disable @next/next/no-img-element -- scroll-animated photo / vector flap need the raw <img> */}
      <img
        ref={photoRef}
        src="/images/gift-photo.webp"
        alt=""
        loading="lazy"
        className={styles.photo}
      />
      <img
        src="/icons/envelope-front.svg"
        alt=""
        loading="lazy"
        className={styles.front}
      />
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  )
}
