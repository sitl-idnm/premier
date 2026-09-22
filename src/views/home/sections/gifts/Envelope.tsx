'use client'

import { FC, useEffect, useRef } from 'react'
import { getGsap, prefersReducedMotion } from '@/shared/lib/gsap'

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

    if (prefersReducedMotion()) {
      photo.style.opacity = '1'
      photo.style.transform = 'rotate(9deg)'
      return
    }

    const { gsap } = getGsap()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        photo,
        { y: -130, rotate: 0, autoAlpha: 0 },
        {
          y: 0,
          rotate: 9,
          autoAlpha: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: stage,
            start: 'top 78%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }, stage)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={stageRef} className={styles.stage} aria-hidden="true">
      {/* eslint-disable @next/next/no-img-element -- GSAP-animated layers / vectors need the raw <img> */}
      <img src="/images/envelope-back.svg" alt="" className={styles.back} />
      <img
        ref={photoRef}
        src="/images/gift-photo.png"
        alt=""
        className={styles.photo}
      />
      <img src="/icons/envelope-front.svg" alt="" className={styles.front} />
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  )
}
