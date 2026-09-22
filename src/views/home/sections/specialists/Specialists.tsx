'use client'

import { FC, useMemo, useState } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
import { bookingAtom } from '@/shared/atoms/bookingAtom'
import {
  type SalonStaff,
  type Specialist as Master
} from '@/shared/lib/yclients/catalog'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import { useSetAtom } from 'jotai'

import styles from './Specialists.module.scss'

/** «Мастера» — live from YClients. Carousel + per-master modal with booking. */
const Specialists: FC<{ salons: SalonStaff[] }> = ({ salons }) => {
  const withStaff = salons.filter((s) => s.list.length)
  const [active, setActive] = useState(0)
  const [selected, setSelected] = useState<Master | null>(null)
  const openBooking = useSetAtom(bookingAtom)

  const salon = useMemo(() => withStaff[active] ?? withStaff[0], [withStaff, active])

  if (!salon) return null

  const bookMaster = (m: Master) => {
    ymGoal(GOALS.openBooking, { place: 'master', master: m.name })
    setSelected(null)
    openBooking({
      open: true,
      salon: salon.key,
      staffId: m.id,
      staffName: m.name
    })
  }

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

        {/* Carousel */}
        <div className={styles.track}>
          {salon.list.map((m) => (
            <button
              key={m.id}
              type="button"
              className={styles.card}
              onClick={() => setSelected(m)}
            >
              <div className={styles.photoBox}>
                {m.avatar ? (
                  <Image
                    src={m.avatar}
                    alt={m.name}
                    fill
                    sizes="240px"
                    className={styles.photo}
                  />
                ) : (
                  <span className={styles.photoStub} aria-hidden="true" />
                )}
              </div>
              <p className={styles.name}>{m.name}</p>
              {m.specialization && <p className={styles.spec}>{m.specialization}</p>}
            </button>
          ))}
        </div>
      </div>

      {/* Master modal */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.close}
              aria-label="Закрыть"
              onClick={() => setSelected(null)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className={styles.modalTop}>
              <div className={styles.modalPhoto}>
                {selected.avatar && (
                  <Image
                    src={selected.avatar}
                    alt={selected.name}
                    fill
                    sizes="120px"
                    className={styles.photo}
                  />
                )}
              </div>
              <div>
                <p className={styles.modalName}>{selected.name}</p>
                {selected.specialization && (
                  <p className={styles.modalSpec}>{selected.specialization}</p>
                )}
              </div>
            </div>

            {selected.info && <p className={styles.modalInfo}>{selected.info}</p>}

            <button
              type="button"
              className={styles.modalBook}
              onClick={() => bookMaster(selected)}
            >
              Записаться к мастеру
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default Specialists
