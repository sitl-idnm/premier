'use client'

import { FC, useState } from 'react'
import classNames from 'classnames'
import { useConsent } from '@/shared/hooks/useConsent'

import styles from './YandexFrame.module.scss'

/**
 * Виджет Яндекса (карта, отзывы). Ставит cookie Яндекса, поэтому iframe
 * грузится только после согласия на cookie или по клику на заглушку.
 */
export const YandexFrame: FC<{
  src: string
  title: string
  className?: string
  label: string
  allowFullScreen?: boolean
}> = ({ src, title, className, label, allowFullScreen }) => {
  const consent = useConsent()
  const [clicked, setClicked] = useState(false)

  if (consent === 'all' || clicked) {
    return (
      <iframe
        src={src}
        title={title}
        className={className}
        loading="lazy"
        allowFullScreen={allowFullScreen}
      />
    )
  }

  return (
    <button
      type="button"
      className={classNames(className, styles.stub)}
      onClick={() => setClicked(true)}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.note}>Загрузится сервис Яндекса</span>
    </button>
  )
}
