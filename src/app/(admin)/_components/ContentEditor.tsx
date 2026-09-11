'use client'

import { FC, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type SiteContent } from '@/shared/content/defaults'

import { type GroupId } from '../_lib/groups'
import styles from '../admin.module.scss'
import { IconPlus, IconTrash } from './icons'

const LABELS: Record<string, string> = {
  phoneDisplay: 'Телефон (как показывать)',
  phoneHref: 'Телефон (ссылка tel:)',
  email: 'E-mail',
  vk: 'Ссылка ВКонтакте',
  telegram: 'Ссылка Telegram',
  site: 'Адрес сайта',
  maps: 'Ссылка Яндекс.Карты',
  address: 'Адрес',
  hours: 'Часы работы',
  hoursNote: 'Примечание к часам',
  title: 'Заголовок',
  description: 'Описание',
  keywords: 'Ключевые слова',
  titleTemplate: 'Шаблон title',
  applicationName: 'Название сайта',
  btnBook: 'Кнопка «Забронировать»',
  btnTracks: 'Кнопка «Трассы»',
  tags: 'Плашки',
  label: 'Текст',
  icon: 'Иконка',
  href: 'Ссылка',
  cards: 'Карточки',
  body: 'Текст',
  green: 'Зелёная карточка',
  safetyBtn: 'Кнопка «Безопасность»',
  para1: 'Абзац 1',
  para2: 'Абзац 2',
  freePrefix: 'Текст до выделения',
  freeAccent: 'Выделенное слово',
  freeSuffix: 'Текст после выделения',
  desc: 'Абзацы описания',
  priceHead: 'Шапка таблицы',
  priceRows: 'Строки таблицы цен',
  ctaBook: 'Кнопка брони',
  ctaEvent: 'Кнопка мероприятия',
  trampTitle: 'Батут — заголовок',
  trampPrice: 'Батут — цена',
  trampBody: 'Батут — описание',
  pills: 'Плашки',
  list: 'Список пунктов',
  price: 'Цена',
  cta: 'Кнопка',
  chips: 'Преимущества (бегущая строка)',
  formTitle: 'Заголовок формы',
  successTitle: 'Заголовок «Заявка принята»',
  contactTitle: 'Заголовок контактного блока',
  phoneBtn: 'Кнопка «Позвонить»',
  telegramBtn: 'Кнопка «Телеграм»',
  legalName: 'Юр. лицо',
  legalReq: 'Реквизиты',
  vkPrefix: 'Текст ВК (до выделения)',
  vkAccent: 'Текст ВК (выделение)',
  legalLinks: 'Юридические ссылки',
  routeText: 'Подпись ссылки маршрута',
  nav: 'Пункты меню',
  nameLabel: 'Подпись «Имя»',
  namePlaceholder: 'Плейсхолдер имени',
  phoneLabel: 'Подпись «Телефон»',
  consentPrefix: 'Согласие: текст до ссылки',
  consentLink: 'Согласие: текст ссылки',
  consentSuffix: 'Согласие: текст после ссылки',
  error: 'Текст ошибки',
  sending: 'Кнопка «Отправляем…»',
  submitBooking: 'Кнопка отправки (бронь)',
  submitEvent: 'Кнопка отправки (мероприятие)',
  bookingTitle: 'Заголовок окна брони',
  thanksTitle: 'Заголовок «Спасибо»',
  thanksSubtitle: 'Подзаголовок «Спасибо»',
  eventTitle: 'Заголовок окна мероприятия',
  eventSubtitle: 'Подзаголовок окна мероприятия',
  thanksPrompt: 'Текст перед кнопкой подписки',
  subscribeLabel: 'Кнопка подписки на ВК',
  privacyTitle: 'Заголовок политики',
  privacyBlocks: 'Блоки политики',
  consentTitle: 'Заголовок согласия',
  consentBlocks: 'Блоки согласия',
  src: 'Файл (путь)',
  alt: 'Alt-текст',
  cap: 'Подпись',
  counterId: 'Номер счётчика',
  subtitle: 'Подзаголовок',
  perPerson: 'Подпись «/чел»',
  hoursSuffix: 'Подпись после часов',
  timingLabel: 'Кнопка «Примерный тайминг»',
  name: 'Название тарифа',
  badge: 'Бейдж (например «Всё включено»)',
  highlight: 'Выделенная карточка (зелёная)',
  features: 'Что входит',
  timing: 'Примерный тайминг',
  time: 'Время',
  what: 'Что происходит',
  includedTitle: 'Заголовок «В каждом тарифе»',
  included: 'В каждом тарифе (список)',
  extrasTitle: 'Заголовок «Можно дополнить»',
  extras: 'Допуслуги (чипы)',
  extrasNote: 'Сноска про допуслуги',
  bookingText: 'Текст про предоплату',
  bookingNote: 'Примечание про возврат',
  bookingPhoneDisplay: 'Телефон брони (показ)',
  bookingPhoneHref: 'Телефон брони (ссылка tel:)',
  bookingManager: 'Менеджер и график'
}

const labelFor = (k: string) => LABELS[k] ?? k

/** Build an empty clone of a template value (same shape, blanked strings). */
function blankLike(v: unknown): unknown {
  if (Array.isArray(v)) return v.length ? [blankLike(v[0])] : []
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, val] of Object.entries(v)) out[k] = blankLike(val)
    return out
  }
  if (typeof v === 'number') return 0
  if (typeof v === 'boolean') return false
  return ''
}

type NodeProps = {
  label: string
  value: unknown
  onChange: (v: unknown) => void
}

const FieldNode: FC<NodeProps> = ({ label, value, onChange }) => {
  // Primitive: boolean
  if (typeof value === 'boolean') {
    return (
      <label className={styles.field} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span className={styles.label}>{label}</span>
      </label>
    )
  }

  // Primitive: number
  if (typeof value === 'number') {
    return (
      <div className={styles.field}>
        <span className={styles.label}>{label}</span>
        <input
          className={styles.input}
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    )
  }

  // Primitive: string
  if (typeof value === 'string') {
    const multiline = value.includes('\n') || value.length > 80
    return (
      <div className={styles.field}>
        <span className={styles.label}>{label}</span>
        {multiline ? (
          <textarea
            className={styles.textarea}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            className={styles.input}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    )
  }

  // Array
  if (Array.isArray(value)) {
    const items = value as unknown[]
    const template = items[0]
    const addItem = () =>
      onChange([...items, template !== undefined ? blankLike(template) : ''])

    return (
      <div className={styles.groupBox}>
        <div className={styles.groupHead}>
          <span className={styles.groupTitle}>{label}</span>
          <button type="button" className={styles.smallBtn} onClick={addItem}>
            <IconPlus width={14} height={14} /> Добавить
          </button>
        </div>

        {items.map((item, i) => {
          const setItem = (nv: unknown) => {
            const next = items.slice()
            next[i] = nv
            onChange(next)
          }
          const removeItem = () => onChange(items.filter((_, j) => j !== i))

          return (
            <div key={i} className={styles.groupBox} style={{ background: '#fff' }}>
              <div className={styles.groupHead}>
                <span className={styles.groupTitle}>#{i + 1}</span>
                <button
                  type="button"
                  className={`${styles.smallBtn} ${styles.dangerBtn}`}
                  onClick={removeItem}
                >
                  <IconTrash width={14} height={14} /> Удалить
                </button>
              </div>

              {Array.isArray(item) ? (
                // row of cells (e.g. price table row)
                (item as unknown[]).map((cell, ci) => (
                  <FieldNode
                    key={ci}
                    label={`Ячейка ${ci + 1}`}
                    value={cell}
                    onChange={(nv) => {
                      const row = (item as unknown[]).slice()
                      row[ci] = nv
                      setItem(row)
                    }}
                  />
                ))
              ) : (
                <FieldNode label="" value={item} onChange={setItem} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Object
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    return (
      <div className={label ? styles.groupBox : undefined}>
        {label && <div className={styles.groupTitle} style={{ marginBottom: 12 }}>{label}</div>}
        {Object.entries(obj).map(([k, v]) => (
          <FieldNode
            key={k}
            label={labelFor(k)}
            value={v}
            onChange={(nv) => onChange({ ...obj, [k]: nv })}
          />
        ))}
      </div>
    )
  }

  return null
}

type EditorProps = {
  group: GroupId
  content: SiteContent
}

export const ContentEditor: FC<EditorProps> = ({ group, content }) => {
  const router = useRouter()
  const [draft, setDraft] = useState<SiteContent>(() =>
    structuredClone(content)
  )
  const [state, setState] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const groupValue = draft[group]

  const setGroupValue = (v: unknown) => {
    setDraft((d) => ({ ...d, [group]: v }) as SiteContent)
    setState('idle')
  }

  const save = async () => {
    setState('saving')
    setMessage('')
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Ошибка ${res.status}`)
      }
      setState('ok')
      setMessage('Сохранено. Изменения появятся на сайте в течение минуты.')
      router.refresh()
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'Ошибка сохранения')
    }
  }

  return (
    <>
      <div className={styles.editor}>
        <div className={styles.panel}>
          <FieldNode label="" value={groupValue} onChange={setGroupValue} />
        </div>
      </div>

      <div className={styles.saveBar}>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={save}
          disabled={state === 'saving'}
        >
          {state === 'saving' ? 'Сохраняем…' : 'Сохранить'}
        </button>
        {message && (
          <span
            className={
              state === 'error'
                ? styles.saveErr
                : state === 'ok'
                  ? styles.saveOk
                  : styles.saveNote
            }
          >
            {message}
          </span>
        )}
      </div>
    </>
  )
}
