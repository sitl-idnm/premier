'use client'

import { FC, useMemo, useState } from 'react'
import classNames from 'classnames'
import { type SalonStaff } from '@/shared/lib/yclients/catalog'

import styles from './Specialists.module.scss'

/** «Мастера» — pulled live from YClients (book_staff). Salon-switchable. */
const Specialists: FC<{ salons: SalonStaff[] }> = ({ salons }) => {
  const withStaff = salons.filter((s) => s.list.length)
  const [active, setActive] = useState(0)

  const salon = useMemo(
    () => withStaff[active] ?? withStaff[0],
    [withStaff, active]
  )

  if (!salon) return null

  return (
    <section className={styles.root} id="specialists">
      <div className={styles.wrap}>
        <div className={styles.head}>
          <h2 className={styles.title}>Мастера</h2>

          {withStaff.length > 1 && (
            <div className={styles.switch} role="tablist" aria-label="Выбор салона">
              <span
                className={styles.ind}
                style={{ transform: `translateX(${active * 100}%)` }}
                aria-hidden="true"
              />
              {withStaff.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  className={classNames(styles.swBtn, {
                    [styles.swBtnActive]: i === active
                  })}
                  onClick={() => setActive(i)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.grid}>
          {salon.list.map((m) => (
            <article key={m.id} className={styles.card}>
              <div className={styles.photoBox}>
                {m.avatar ? (
                  <img src={m.avatar} alt={m.name} className={styles.photo} />
                ) : (
                  <span className={styles.photoStub} aria-hidden="true" />
                )}
              </div>
              <p className={styles.name}>{m.name}</p>
              {m.specialization && (
                <p className={styles.spec}>{m.specialization}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Specialists
