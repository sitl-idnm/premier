import { ReactNode } from 'react'

import styles from './template.module.scss'

/**
 * App Router `template` перемонтируется при каждой навигации — это даёт
 * плавную анимацию появления страницы (fade + лёгкий сдвиг вверх) поверх
 * клиентских переходов Next. Sticky-хедер и футер лежат в layout, вне шаблона,
 * поэтому не участвуют в анимации.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>
}
