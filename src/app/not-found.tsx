import { FC } from 'react'
import Link from 'next/link'
import { Button } from '@ui/button'

import styles from './not-found.module.scss'

const NotFound: FC = () => (
  <main className={styles.root}>
    <div className={styles.inner}>
      <div className={styles.text}>
        <div className={styles.code}>#404</div>
        <p className={styles.subtitle}>Данная страница недоступна.</p>
      </div>
      <Button as={Link} href="/" variant="orange" className={styles.button}>
        Вернуться на главную
      </Button>
    </div>
  </main>
)

export default NotFound
