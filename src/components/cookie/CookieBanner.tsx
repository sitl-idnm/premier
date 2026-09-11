'use client'

import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import { nbp } from '@/shared/lib/typography'
import { Button } from '@ui/button'

import styles from './cookie.module.scss'

const STORAGE_KEY = 'premier-cookie-accepted'

export const CookieBanner: FC = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    ymGoal(GOALS.cookieAccept)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.root} role="dialog" aria-label="Cookie">
      <p className={styles.text}>
        {nbp(
          'Мы используем файлы cookie, чтобы вам было удобнее пользоваться нашим сайтом. Продолжая просмотр, вы соглашаетесь на их использование. Подробнее — в '
        )}
        <Link href="/privacy">Политике обработки персональных данных</Link>
      </p>
      <Button variant="orange" onClick={accept}>
        Принять
      </Button>
    </div>
  )
}
