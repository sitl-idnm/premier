import { FC } from 'react'
import { type MetrikaBar } from '@/shared/lib/metrikaStat'

import styles from '../admin.module.scss'

/** Horizontal bar list (sorted values), used for sources / devices / pages. */
export const BarList: FC<{ items: MetrikaBar[]; empty?: string }> = ({
  items,
  empty = 'Нет данных за период'
}) => {
  if (!items.length) return <p className={styles.saveNote}>{empty}</p>

  const max = Math.max(1, ...items.map((i) => i.value))

  return (
    <div className={styles.barList}>
      {items.map((it, i) => (
        <div key={i} className={styles.barRow}>
          <span className={styles.barLabel} title={it.label}>
            {it.label}
          </span>
          <span className={styles.barTrack}>
            <span
              className={styles.barFill}
              style={{ width: `${(it.value / max) * 100}%` }}
            />
          </span>
          <span className={styles.barValue}>
            {it.value.toLocaleString('ru-RU')}
          </span>
        </div>
      ))}
    </div>
  )
}
