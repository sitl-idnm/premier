'use client'

import { useEffect, useMemo, useState } from 'react'
import { bookingAtom } from '@/shared/atoms/bookingAtom'
import { GOALS, ymGoal } from '@/shared/lib/metrika'
import { useAtom } from 'jotai'

import styles from './BookingFlow.module.scss'

const SALONS = [
  { key: 'taganskaya', label: 'Таганская' },
  { key: 'novoslobodskaya', label: 'Новослободская' }
]

type Step = 'salon' | 'service' | 'staff' | 'date' | 'time' | 'contact' | 'code' | 'done'
type Svc = { id: number; title: string; category_id: number }
type Cat = { id: number; title: string }
type Staff = { id: number; name: string; specialization: string; avatar: string }
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

const prettyDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long'
  })

export const BookingFlow = () => {
  const [ctx, setCtx] = useAtom(bookingAtom)

  const [salon, setSalon] = useState<string>()
  const [serviceId, setServiceId] = useState<number>()
  const [serviceName, setServiceName] = useState('')
  const [staffId, setStaffId] = useState<number>()
  const [staffName, setStaffName] = useState('')
  const [date, setDate] = useState('')
  const [datetime, setDatetime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')

  const [step, setStep] = useState<Step>('salon')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [cats, setCats] = useState<Cat[]>([])
  const [services, setServices] = useState<Svc[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [dates, setDates] = useState<string[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [query, setQuery] = useState('')

  // Initialise from the opening context and jump to the first unfilled step.
  useEffect(() => {
    if (!ctx.open) return
    ymGoal(GOALS.openBooking, { place: 'flow' })
    setSalon(ctx.salon)
    setServiceId(ctx.serviceId)
    setServiceName(ctx.serviceName ?? '')
    setStaffId(ctx.staffId)
    setStaffName(ctx.staffName ?? '')
    setDate('')
    setDatetime('')
    setCode('')
    setError('')
    setQuery('')
    if (!ctx.salon) setStep('salon')
    else if (!ctx.serviceId) setStep('service')
    else if (ctx.staffId === undefined) setStep('staff')
    else setStep('date')
  }, [ctx])

  const close = () => setCtx({ open: false })

  // Load the data each step needs.
  useEffect(() => {
    if (!ctx.open) return
    let cancel = false
    const run = async () => {
      setError('')
      try {
        if (step === 'service' && salon) {
          setLoading(true)
          const d = await call({ action: 'services', salon })
          if (!cancel) {
            setCats(d.categories ?? [])
            setServices(d.services ?? [])
          }
        } else if (step === 'staff' && salon) {
          setLoading(true)
          const d = await call({ action: 'staff', salon, serviceId })
          if (!cancel) setStaff(d.staff ?? [])
        } else if (step === 'date' && salon && serviceId != null) {
          setLoading(true)
          const d = await call({ action: 'dates', salon, serviceId, staffId: staffId ?? 0 })
          if (!cancel) setDates(d.dates ?? [])
        } else if (step === 'time' && salon && serviceId != null && date) {
          setLoading(true)
          const d = await call({ action: 'times', salon, staffId: staffId ?? 0, date, serviceId })
          if (!cancel) setSlots(d.times ?? [])
        }
      } catch (e) {
        if (!cancel) setError('Не удалось загрузить данные. Попробуйте ещё раз.')
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    run()
    return () => {
      cancel = true
    }
  }, [step, salon, serviceId, staffId, date, ctx.open])

  const catName = useMemo(
    () => new Map(cats.map((c) => [c.id, c.title])),
    [cats]
  )
  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q
      ? services.filter((s) => s.title.toLowerCase().includes(q))
      : services
  }, [services, query])

  if (!ctx.open) return null

  const digits = phone.replace(/\D/g, '')
  const phoneOk = digits.length === 11

  const submitContact = async () => {
    if (!name.trim() || !phoneOk) {
      setError('Укажите имя и корректный телефон.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await call({ action: 'code', salon, phone: digits, fullname: name.trim() })
      setStep('code')
    } catch {
      setError('Не удалось отправить код. Проверьте телефон.')
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
        fullname: name.trim(),
        code: code.trim(),
        serviceId,
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

  const titleFor: Record<Step, string> = {
    salon: 'Выберите салон',
    service: 'Выберите услугу',
    staff: 'Выберите мастера',
    date: 'Выберите дату',
    time: 'Выберите время',
    contact: 'Ваши данные',
    code: 'Подтверждение',
    done: 'Готово!'
  }

  return (
    <div className={styles.overlay} onClick={close}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Онлайн-запись"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.close} aria-label="Закрыть" onClick={close}>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <h2 className={styles.title}>{titleFor[step]}</h2>

        {(serviceName || staffName) && step !== 'done' && (
          <p className={styles.crumbs}>
            {serviceName}
            {serviceName && staffName ? ' · ' : ''}
            {staffName}
          </p>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.body}>
          {loading && <p className={styles.loading}>Загрузка…</p>}

          {step === 'salon' && !loading && (
            <div className={styles.grid2}>
              {SALONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={styles.pick}
                  onClick={() => {
                    setSalon(s.key)
                    setStep(serviceId ? (staffId === undefined ? 'staff' : 'date') : 'service')
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {step === 'service' && !loading && (
            <>
              <input
                className={styles.search}
                placeholder="Поиск услуги"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <ul className={styles.list}>
                {filteredServices.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={styles.row}
                      onClick={() => {
                        setServiceId(s.id)
                        setServiceName(s.title)
                        setStep(staffId === undefined ? 'staff' : 'date')
                      }}
                    >
                      <span>{s.title}</span>
                      <span className={styles.rowCat}>{catName.get(s.category_id)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 'staff' && !loading && (
            <div className={styles.staffGrid}>
              <button
                type="button"
                className={styles.staffAny}
                onClick={() => {
                  setStaffId(0)
                  setStaffName('Любой мастер')
                  setStep('date')
                }}
              >
                Любой мастер
              </button>
              {staff.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={styles.staffCard}
                  onClick={() => {
                    setStaffId(m.id)
                    setStaffName(m.name)
                    setStep('date')
                  }}
                >
                  {m.avatar && (
                    // eslint-disable-next-line @next/next/no-img-element -- remote avatar in a modal
                    <img src={m.avatar} alt={m.name} className={styles.staffPhoto} />
                  )}
                  <span className={styles.staffName}>{m.name}</span>
                  {m.specialization && (
                    <span className={styles.staffSpec}>{m.specialization}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 'date' && !loading && (
            <div className={styles.chips}>
              {dates.length === 0 && <p className={styles.loading}>Нет свободных дат.</p>}
              {dates.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={styles.chip}
                  onClick={() => {
                    setDate(d)
                    setStep('time')
                  }}
                >
                  {prettyDate(d)}
                </button>
              ))}
            </div>
          )}

          {step === 'time' && !loading && (
            <div className={styles.chips}>
              {slots.length === 0 && <p className={styles.loading}>Нет свободных слотов.</p>}
              {slots.map((t) => (
                <button
                  key={t.datetime}
                  type="button"
                  className={styles.chip}
                  onClick={() => {
                    setDatetime(t.datetime)
                    setStep('contact')
                  }}
                >
                  {t.time}
                </button>
              ))}
            </div>
          )}

          {step === 'contact' && (
            <div className={styles.form}>
              <input
                className={styles.input}
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="+7 (___) ___-__-__"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button
                type="button"
                className={styles.primary}
                disabled={loading}
                onClick={submitContact}
              >
                Получить код
              </button>
            </div>
          )}

          {step === 'code' && (
            <div className={styles.form}>
              <p className={styles.hint}>Мы отправили код на {phone}.</p>
              <input
                className={styles.input}
                placeholder="Код из СМС"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                type="button"
                className={styles.primary}
                disabled={loading}
                onClick={submitCode}
              >
                Записаться
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className={styles.done}>
              <p className={styles.doneText}>
                Вы записаны! Мы пришлём подтверждение по СМС.
              </p>
              <button type="button" className={styles.primary} onClick={close}>
                Отлично
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
