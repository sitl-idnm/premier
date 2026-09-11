'use client'

import { FC, useEffect, useState } from 'react'
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
      <img
        src="/icons/about-cloud.svg"
        alt=""
        aria-hidden="true"
        className={styles.frame}
      />

      <div className={styles.stage}>
        {photos.map((src, i) => (
          <img
            key={src}
            src={src}
            alt="Интерьер салона «Премьер»"
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
            className={classNames(styles.dot, { [styles.dotActive]: i === active })}
            aria-label={`Фото ${i + 1}`}
            aria-current={i === active}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </div>
  )
}
