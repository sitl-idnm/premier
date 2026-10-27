'use client'

import { FC, useEffect, useState } from 'react'
import Image from 'next/image'
import classNames from 'classnames'

import styles from './AboutGallery.module.scss'

/** Circular photo gallery inside the scalloped «mirror» frame (was a single
 *  baked image). Auto-advances; dots switch manually. */
export const AboutGallery: FC<{ photos: string[] }> = ({ photos }) => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (photos.length < 2) return
    const id = setInterval(
      () => setActive((v) => (v + 1) % photos.length),
      5000
    )
    return () => clearInterval(id)
  }, [photos.length])

  return (
    <div className={styles.gallery}>
      <Image
        src="/images/about-cloud.webp"
        alt=""
        aria-hidden="true"
        width={1000}
        height={998}
        sizes="(max-width: 560px) 100vw, (max-width: 900px) 560px, 620px"
        className={styles.frame}
      />

      <div className={styles.stage}>
        {photos.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt="Интерьер салона «Премьер»"
            fill
            sizes="(max-width: 900px) 60vw, 340px"
            className={classNames(styles.photo, {
              [styles.active]: i === active
            })}
          />
        ))}
      </div>

      <div className={styles.dots}>
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            className={classNames(styles.dot, {
              [styles.dotActive]: i === active
            })}
            aria-label={`Фото ${i + 1}`}
            aria-current={i === active}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </div>
  )
}
