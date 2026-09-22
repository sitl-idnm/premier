'use client'

import { useEffect, useMemo, useState } from 'react'
import { Portal } from '@/service/portal'
import { bookingAtom } from '@/shared/atoms/bookingAtom'
import { useScrollLock } from '@/shared/hooks'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import classNames from 'classnames'
import { useAtom } from 'jotai'

import styles from './BookingFlow.module.scss'

const SALONS = [
  { key: 'taganskaya', label: 'Таганская', address: 'Таганская ул., 15 ст2' },
  { key: 'novoslobodskaya', label: 'Новослободская', address: 'ул. Фадеева, 4А' }
]

type Step = 'salon' | 'service' | 'master' | 'calendar' | 'time' | 'details' | 'code' | 'done'
type Svc = { id: number; title: string; category_id: number; price_min: number; price_max: number }
type Cat = { id: number; title: string }
type Staff = { id: number; name: string; specialization: string; avatar: string; rating: number; votes: number }
type Slot = { time: string; datetime: string }

async function call(payload: Record<string, unknown>) {
  const res = await fetch('/api/yclients/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

// Regular-space thousands (avoids nbsp from toLocaleString).
const rub = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`
const priceLabel = (s: Svc) => (s.price_min === s.price_max ? rub(s.price_min) : `от ${rub(s.price_min)}`)
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const WD = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const prettyDate = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

const Stars = ({ rating }: { rating: number }) => (
  <span className={styles.stars} aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} className={i <= Math.round(rating) ? styles.starOn : styles.starOff}>★</span>
    ))}
  </span>
)

const Body = () => {
  const [ctx, setCtx] = useAtom(bookingAtom)
  useScrollLock()

  const [salon, setSalon] = useState<string | undefined>(ctx.salon)
  const [serviceIds, setServiceIds] = useState<number[]>(ctx.serviceId ? [ctx.serviceId] : [])
  const [staffId, setStaffId] = useState<number | undefined>(ctx.staffId)
  const [staffName, setStaffName] = useState(ctx.staffName ?? '')
  const [date, setDate] = useState('')
  const [datetime, setDatetime] = useState('')
  const [timeLabel, setTimeLabel] = useState('')

  const [surname, setSurname] = useState('')
  const [name, setName] = useState('')
  const [patronymic, setPatronymic] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [agree, setAgree] = useState(true)
  const [code, setCode] = useState('')

  const [step, setStep] = useState<Step>(
    !ctx.salon ? 'salon' : !ctx.serviceId ? 'service' : ctx.staffId === undefined ? 'master' : 'calendar'
  )
  const [history, setHistory] = useState<Step[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [cats, setCats] = useState<Cat[]>([])
  const [services, setServices] = useState<Svc[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [dates, setDates] = useState<string[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [query, setQuery] = useState('')

  const [view, setView] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const go = (next: Step) => {
    setHistory((h) => [...h, step])
    setStep(next)
  }
  const back = () =>
    setHistory((h) => {
      if (!h.length) return h
      setStep(h[h.length - 1])
      return h.slice(0, -1)
    })

  const selectedServices = useMemo(
    () => services.filter((s) => serviceIds.includes(s.id)),
    [services, serviceIds]
  )
  const total = useMemo(
    () => selectedServices.reduce((a, s) => a + s.price_min, 0),
    [selectedServices]
  )
  const toggleSvc = (id: number) =>
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const [svcLoading, setSvcLoading] = useState(false)

  // Services for name/price. When a master is chosen, only their services come back.
  useEffect(() => {
    if (!salon) return
    let cancel = false
    setSvcLoading(true)
    call({ action: 'services', salon, staffId: staffId && staffId > 0 ? staffId : undefined })
      .then((d) => {
        if (cancel) return
        setCats(d.categories ?? [])
        setServices(d.services ?? [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancel) setSvcLoading(false)
      })
    return () => { cancel = true }
  }, [salon, staffId])

  // Per-step data.
  useEffect(() => {
    let cancel = false
    const run = async () => {
      setError('')
      try {
        if (step === 'master' && salon) {
          setLoading(true)
          const d = await call({ action: 'staff', salon, serviceIds })
          if (!cancel) setStaff(d.staff ?? [])
        } else if (step === 'calendar' && salon && serviceIds.length) {
          setLoading(true)
          const d = await call({ action: 'dates', salon, serviceIds, staffId: staffId ?? 0 })
          if (!cancel) setDates(d.dates ?? [])
        } else if (step === 'time' && salon && serviceIds.length && date) {
          setLoading(true)
          const d = await call({ action: 'times', salon, staffId: staffId ?? 0, date, serviceIds })
          if (!cancel) setSlots(d.times ?? [])
        }
      } catch {
        if (!cancel) setError('Не удалось загрузить данные. Попробуйте ещё раз.')
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    run()
    return () => { cancel = true }
  }, [step, salon, serviceIds, staffId, date])

  const catName = useMemo(() => new Map(cats.map((c) => [c.id, c.title])), [cats])
  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? services.filter((s) => s.title.toLowerCase().includes(q)) : services
  }, [services, query])

  const dateSet = useMemo(() => new Set(dates), [dates])
  const monthGrid = useMemo(() => {
    const first = new Date(view.y, view.m, 1)
    const startPad = (first.getDay() + 6) % 7
    const days: (Date | null)[] = []
    for (let i = 0; i < startPad; i++) days.push(null)
    const dim = new Date(view.y, view.m + 1, 0).getDate()
    for (let d = 1; d <= dim; d++) days.push(new Date(view.y, view.m, d))
    return days
  }, [view])

  const digits = phone.replace(/\D/g, '')
  const phoneOk = digits.length === 11
  const close = () => setCtx({ open: false })

  const afterService = () => go(staffId === undefined ? 'master' : 'calendar')

  const goNearest = () => {
    if (!dates.length) return
    const d = new Date(dates[0] + 'T00:00:00')
    setView({ y: d.getFullYear(), m: d.getMonth() })
  }

  const submitDetails = async () => {
    if (!name.trim() || !phoneOk) {
      setError('Укажите имя и корректный телефон.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await call({ action: 'code', salon, phone: digits, fullname: `${surname} ${name}`.trim() })
      go('code')
    } catch {
      setError('Не удалось отправить код подтверждения. Проверьте телефон.')
    } finally {
      setLoading(false)
    }
  }

  const submitCode = async () => {
    if (!code.trim()) {
      setError('Введите код из СМС.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await call({
        action: 'record',
        salon,
        phone: digits,
        fullname: [surname, name, patronymic].filter(Boolean).join(' ').trim(),
        email,
        code: code.trim(),
        comment,
        serviceIds,
        staffId: staffId ?? 0,
        datetime
      })
      ymGoal(GOALS.submitBooking, { place: 'flow' })
      setStep('done')
    } catch {
      setError('Неверный код или запись недоступна. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  const salonMeta = SALONS.find((s) => s.key === salon)

  const titleFor: Record<Step, string> = {
    salon: 'Выберите салон',
    service: 'Выберите услуги',
    master: 'Выберите специалиста',
    calendar: 'Выберите дату',
    time: 'Выберите время',
    details: 'Детали записи',
    code: 'Подтверждение',
    done: 'Готово!'
  }

  return (
    <div className={styles.overlay} onClick={close}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Онлайн-запись" onClick={(e) => e.stopPropagation()}>
        {history.length > 0 && step !== 'done' && (
          <button type="button" className={styles.back} aria-label="Назад" onClick={back}>
            <svg width="22" height="22" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
        <button type="button" className={styles.close} aria-label="Закрыть" onClick={close}>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {salonMeta && step !== 'salon' && (
          <div className={styles.branch}>
            <span className={styles.branchName}>Премьер {salonMeta.label}</span>
            <span className={styles.branchAddr}>{salonMeta.address}</span>
          </div>
        )}

        <h2 className={styles.title}>{titleFor[step]}</h2>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.body}>
          {loading && <p className={styles.loading}>Загрузка…</p>}

          {step === 'salon' && !loading && (
            <div className={styles.grid2}>
              {SALONS.map((s) => (
                <button key={s.key} type="button" className={styles.pick} onClick={() => { setSalon(s.key); go(serviceIds.length ? (staffId === undefined ? 'master' : 'calendar') : 'service') }}>
                  <span className={styles.pickName}>{s.label}</span>
                  <span className={styles.pickAddr}>{s.address}</span>
                </button>
              ))}
            </div>
          )}

          {step === 'service' && !loading && (
            <>
              <input className={styles.search} placeholder="Поиск услуги" value={query} onChange={(e) => setQuery(e.target.value)} />
              {svcLoading && <p className={styles.loading}>Загрузка услуг…</p>}
              <ul className={styles.list}>
                {filteredServices.map((s) => {
                  const on = serviceIds.includes(s.id)
                  return (
                    <li key={s.id}>
                      <button type="button" className={styles.svcRow} onClick={() => toggleSvc(s.id)}>
                        <span className={classNames(styles.check, { [styles.checkOn]: on })} aria-hidden="true" />
                        <span className={styles.svcName}>
                          {s.title}
                          <span className={styles.svcCat}>{catName.get(s.category_id)}</span>
                        </span>
                        <span className={styles.svcPrice}>{priceLabel(s)}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {step === 'master' && !loading && (
            <div className={styles.masters}>
              <button type="button" className={styles.masterAny} onClick={() => { setStaffId(0); setStaffName('Любой специалист'); go('calendar') }}>
                Любой специалист
              </button>
              {staff.map((m) => (
                <button key={m.id} type="button" className={styles.masterRow} onClick={() => { setStaffId(m.id); setStaffName(m.name); go('calendar') }}>
                  <span className={styles.masterAv}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote avatar in a modal */}
                    {m.avatar && <img src={m.avatar} alt={m.name} />}
                  </span>
                  <span className={styles.masterInfo}>
                    <span className={styles.masterName}>{m.name}</span>
                    {m.specialization && <span className={styles.masterSpec}>{m.specialization}</span>}
                    {m.votes > 0 && <span className={styles.masterRate}><Stars rating={m.rating} /> {m.votes}</span>}
                    {total > 0 && <span className={styles.masterPrice}>{rub(total)}</span>}
                  </span>
                  <span className={styles.radio} aria-hidden="true" />
                </button>
              ))}
            </div>
          )}

          {step === 'calendar' && !loading && (
            <div className={styles.calWrap}>
              <div className={styles.calHead}>
                <button type="button" className={styles.calNav} aria-label="Предыдущий месяц" onClick={() => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))}>‹</button>
                <span className={styles.calMonth}>{MONTHS[view.m]} {view.y}</span>
                <button type="button" className={styles.calNav} aria-label="Следующий месяц" onClick={() => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))}>›</button>
              </div>
              <div className={styles.calWd}>{WD.map((w) => <span key={w}>{w}</span>)}</div>
              <div className={styles.calGrid}>
                {monthGrid.map((d, i) => {
                  if (!d) return <span key={i} />
                  const key = iso(d)
                  const free = dateSet.has(key)
                  return (
                    <button key={i} type="button" disabled={!free} className={free ? styles.calDayFree : styles.calDay} onClick={() => { setDate(key); go('time') }}>
                      {d.getDate()}
                    </button>
                  )
                })}
              </div>
              {dates.length > 0 && !monthGrid.some((d) => d && dateSet.has(iso(d))) && (
                <div className={styles.calEmpty}>
                  <p>В этом месяце нет свободного времени.</p>
                  <button type="button" className={styles.primary} onClick={goNearest}>Перейти к ближайшей дате</button>
                </div>
              )}
              {dates.length === 0 && <p className={styles.loading}>Нет свободных дат.</p>}
            </div>
          )}

          {step === 'time' && !loading && (
            <div className={styles.chips}>
              {slots.length === 0 && <p className={styles.loading}>На эту дату нет свободного времени.</p>}
              {slots.map((t) => (
                <button key={t.datetime} type="button" className={styles.chip} onClick={() => { setDatetime(t.datetime); setTimeLabel(t.time); go('details') }}>
                  {t.time}
                </button>
              ))}
            </div>
          )}

          {step === 'details' && (
            <div className={styles.details}>
              <div className={styles.summary}>
                {staffName && <div className={styles.sumRow}><span>{staffName}</span></div>}
                {date && <div className={styles.sumRow}><span>{prettyDate(date)}, {timeLabel}</span></div>}
                {selectedServices.map((s) => (
                  <div key={s.id} className={styles.sumRow}>
                    <span>{s.title}</span>
                    <span className={styles.sumPrice}>{priceLabel(s)}</span>
                  </div>
                ))}
                <div className={styles.sumTotal}><span>Итого</span><span>{rub(total)}</span></div>
              </div>

              <div className={styles.form}>
                <input className={styles.input} placeholder="Фамилия" value={surname} onChange={(e) => setSurname(e.target.value)} />
                <input className={styles.input} placeholder="Имя *" value={name} onChange={(e) => setName(e.target.value)} />
                <input className={styles.input} placeholder="Отчество" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} />
                <input className={styles.input} placeholder="+7 — телефон *" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <input className={styles.input} placeholder="E-mail" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <textarea className={styles.textarea} placeholder="Комментарий к записи" value={comment} onChange={(e) => setComment(e.target.value)} />

                <label className={styles.consent}>
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <span>Я даю согласие на обработку персональных данных и принимаю <a href="/privacy" target="_blank">Политику конфиденциальности</a>.</span>
                </label>

                <button type="button" className={styles.primary} disabled={loading || !agree} onClick={submitDetails}>Записаться</button>
              </div>
            </div>
          )}

          {step === 'code' && (
            <div className={styles.form}>
              <p className={styles.hint}>Мы отправили код подтверждения на {phone}.</p>
              <input className={styles.input} placeholder="Код из СМС" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} />
              <button type="button" className={styles.primary} disabled={loading} onClick={submitCode}>Подтвердить запись</button>
            </div>
          )}

          {step === 'done' && (
            <div className={styles.done}>
              <p className={styles.doneText}>Вы записаны! Мы пришлём подтверждение по СМС.</p>
              <button type="button" className={styles.primary} onClick={close}>Отлично</button>
            </div>
          )}
        </div>

        {step === 'service' && (
          <div className={styles.footer}>
            <button type="button" className={styles.primary} disabled={!serviceIds.length} onClick={afterService}>
              {serviceIds.length ? `Продолжить · ${serviceIds.length} усл. · ${rub(total)}` : 'Выберите услуги'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export const BookingFlow = () => {
  const [ctx] = useAtom(bookingAtom)
  if (!ctx.open) return null
  return (
    <Portal selector="#modal-root">
      <Body />
    </Portal>
  )
}
