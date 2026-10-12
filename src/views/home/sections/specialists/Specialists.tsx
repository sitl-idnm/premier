'use client'

import { FC, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Portal } from '@/service/portal'
import { bookingAtom } from '@/shared/atoms/bookingAtom'
import { useScrollLock } from '@/shared/hooks'
import {
  type SalonStaff,
  type Specialist as Master
} from '@/shared/lib/yclients/catalog'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import classNames from 'classnames'
import { useSetAtom } from 'jotai'

import styles from './Specialists.module.scss'

const MasterModal: FC<{
  master: Master
  onClose: () => void
  onBook: () => void
}> = ({ master, onClose, onBook }) => {
  useScrollLock()
  return (
    <Portal selector="#modal-root">
      <div className={styles.overlay} onClick={onClose}>
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label={master.name}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className={styles.close} aria-label="Закрыть" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className={styles.modalTop}>
            <div className={styles.modalPhoto}>
              {master.avatar && (
                <Image src={master.avatar} alt={master.name} fill sizes="120px" className={styles.photo} />
              )}
            </div>
            <div>
              <p className={styles.modalName}>{master.name}</p>
              {master.specialization && (
                <p className={styles.modalSpec}>{master.specialization}</p>
              )}
            </div>
          </div>

          {master.info && <p className={styles.modalInfo}>{master.info}</p>}

          <button type="button" className={styles.modalBook} onClick={onBook}>
            Записаться к мастеру
          </button>
        </div>
      </div>
    </Portal>
  )
}

/** «Мастера» — live from YClients. Carousel (arrows + drag) + per-master modal. */
const Specialists: FC<{ salons: SalonStaff[] }> = ({ salons }) => {
  const withStaff = salons.filter((s) => s.list.length)
  const [active, setActive] = useState(0)
  const [selected, setSelected] = useState<Master | null>(null)
  const openBooking = useSetAtom(bookingAtom)

  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef({
    down: false,
    startX: 0,
    startLeft: 0,
    moved: false,
    pointerId: -1
  })

  const salon = useMemo(() => withStaff[active] ?? withStaff[0], [withStaff, active])
  if (!salon) return null

  const selectSalon = (i: number) => {
    setActive(i)
    // Новый салон — список показываем с начала.
    trackRef.current?.scrollTo({ left: 0 })
  }

  // Шаг стрелки = одна «страница» целиком видимых карточек (устойчиво к размеру
  // карточки и брейкпоинту), с привязкой к началу карточки через scroll-snap.
  const scrollByDir = (dir: 1 | -1) => {
    const t = trackRef.current
    if (!t) return
    const card = t.firstElementChild as HTMLElement | null
    const gap = parseFloat(getComputedStyle(t).columnGap || '20') || 20
    const step = card ? card.offsetWidth + gap : 260
    const perView = Math.max(1, Math.floor(t.clientWidth / step))
    t.scrollBy({ left: dir * step * perView, behavior: 'smooth' })
  }

  // Drag-to-scroll только мышью; тач/перо используют нативный скролл с инерцией.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const t = trackRef.current
    if (!t) return
    drag.current = {
      down: true,
      startX: e.clientX,
      startLeft: t.scrollLeft,
      moved: false,
      pointerId: e.pointerId
    }
    t.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const t = trackRef.current
    if (!t || !drag.current.down) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 4) drag.current.moved = true
    t.scrollLeft = drag.current.startLeft - dx
  }
  const endDrag = () => {
    if (!drag.current.down) return
    drag.current.down = false
    const t = trackRef.current
    const pid = drag.current.pointerId
    if (t && pid >= 0 && t.hasPointerCapture?.(pid)) {
      t.releasePointerCapture(pid)
    }
  }

  const bookMaster = (m: Master) => {
    ymGoal(GOALS.openBooking, { place: 'master', master: m.name })
    setSelected(null)
    openBooking({ open: true, salon: salon.key, staffId: m.id, staffName: m.name })
  }

  return (
    <section className={styles.root} id="specialists">
      <div className={styles.wrap}>
        <div className={styles.head}>
          <h2 className={styles.title}>Мастера</h2>

          <div className={styles.controls}>
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
                    onClick={() => selectSalon(i)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.arrows}>
              <button type="button" className={styles.arrow} aria-label="Назад" onClick={() => scrollByDir(-1)}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" className={styles.arrow} aria-label="Вперёд" onClick={() => scrollByDir(1)}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div
          ref={trackRef}
          className={styles.track}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {salon.list.map((m) => (
            <button
              key={m.id}
              type="button"
              className={styles.card}
              onClick={() => {
                if (drag.current.moved) return
                setSelected(m)
              }}
            >
              <div className={styles.photoBox}>
                {m.avatar ? (
                  <Image src={m.avatar} alt={m.name} fill sizes="240px" className={styles.photo} draggable={false} />
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

      {selected && (
        <MasterModal
          master={selected}
          onClose={() => setSelected(null)}
          onBook={() => bookMaster(selected)}
        />
      )}
    </section>
  )
}

export default Specialists
