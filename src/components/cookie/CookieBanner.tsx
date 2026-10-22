'use client'

import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import { type Consent, readConsent, saveConsent } from '@/shared/lib/consent'
import { nbp } from '@/shared/lib/typography'
import { Button } from '@ui/button'

import styles from './cookie.module.scss'

export const CookieBanner: FC = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!readConsent()) setVisible(true)
  }, [])

  const choose = (value: Consent) => {
    saveConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.root} role="dialog" aria-label="Cookie">
      <p className={styles.text}>
        {nbp(
          'Мы используем необходимые cookie для работы сайта. С вашего согласия — также Яндекс.Метрику и виджеты Яндекса (карты, отзывы). Подробнее — в '
        )}
        <Link href="/privacy">Политике обработки персональных данных</Link>
      </p>
      <div className={styles.actions}>
        <Button variant="orange" onClick={() => choose('all')}>
          Принять
        </Button>
        <button
          type="button"
          className={styles.necessary}
          onClick={() => choose('necessary')}
        >
          Только необходимые
        </button>
      </div>
    </div>
  )
}
