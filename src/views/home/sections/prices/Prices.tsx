'use client'

import { FC, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { type SiteContent } from '@/shared/content'
import { nbp } from '@/shared/lib/typography'

import styles from './Prices.module.scss'

/**
 * Keep number groups intact (nbsp inside «5 000») but allow a line break right
 * after each «/» or «–» so long multi-price values wrap cleanly on mobile.
 */
const formatPrice = (v: string) =>
  v.replace(/ /g, '\u00A0').replace(/([/\u2013\u2014-])\u00A0/g, '$1 ')

type FlatRow = {
  name: string
  desc?: string
  values: string[]
  cols: string[]
  tabLabel: string
  sectionTitle?: string
}

/**
 * Price list: pick a salon, then a зал (tab). Each зал's tables are collapsible
 * (one open at a time). A search box filters services locally and — for fuzzy /
 * natural-language queries — asks the AI assistant to suggest matches.
 */
const Prices: FC<{ data: SiteContent['prices'] }> = ({ data }) => {
  const [salonKey, setSalonKey] = useState<string>(data.salons[0].key)
  const salon = useMemo(
    () => data.salons.find((s) => s.key === salonKey) ?? data.salons[0],
    [data.salons, salonKey]
  )

  const [tabKey, setTabKey] = useState<string>(salon.tabs[0].key)
  const tab = useMemo(
    () => salon.tabs.find((t) => t.key === tabKey) ?? salon.tabs[0],
    [salon, tabKey]
  )

  const [open, setOpen] = useState<number[]>([0])
  const [query, setQuery] = useState('')
  const [aiNames, setAiNames] = useState<string[]>([])
  const [aiLoading, setAiLoading] = useState(false)

  const q = query.trim().toLowerCase()
  const searching = q.length > 0

  // Flat index of the whole selected salon — for search + AI resolution.
  const flat = useMemo<FlatRow[]>(
    () =>
      salon.tabs.flatMap((t) =>
        t.sections.flatMap((s) =>
          s.rows.map((r) => ({
            name: r.name,
            desc: r.desc,
            values: r.values,
            cols: s.cols,
            tabLabel: t.label,
            sectionTitle: s.title
          }))
        )
      ),
    [salon]
  )

  const localResults = useMemo(
    () => (searching ? flat.filter((r) => r.name.toLowerCase().includes(q)) : []),
    [flat, q, searching]
  )

  // Debounced AI assist for fuzzy / natural-language queries.
  useEffect(() => {
    if (q.length < 3) {
      setAiNames([])
      setAiLoading(false)
      return
    }
    let cancelled = false
    setAiLoading(true)
    const id = setTimeout(async () => {
      try {
        const res = await fetch('/api/price-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, salon: salon.key })
        })
        const json = await res.json()
        if (!cancelled) setAiNames(Array.isArray(json.names) ? json.names : [])
      } catch {
        if (!cancelled) setAiNames([])
      } finally {
        if (!cancelled) setAiLoading(false)
      }
    }, 550)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [query, q, salon.key])

  const localNames = useMemo(
    () => new Set(localResults.map((r) => r.name)),
    [localResults]
  )
  const aiResults = useMemo(
    () =>
      aiNames
        .filter((n) => !localNames.has(n))
        .map((n) => flat.find((r) => r.name === n))
        .filter((r): r is FlatRow => Boolean(r)),
    [aiNames, localNames, flat]
  )

  const selectSalon = (key: string) => {
    const next = data.salons.find((s) => s.key === key)
    setSalonKey(key)
    if (next) setTabKey(next.tabs[0].key)
    setOpen([0])
  }
  const selectTab = (key: string) => {
    setTabKey(key)
    setOpen([0])
  }

  const allOpen = open.length === tab.sections.length
  const toggleAll = () =>
    setOpen(allOpen ? [] : tab.sections.map((_, i) => i))

  const activeSalonIndex = data.salons.findIndex((s) => s.key === salon.key)

  const renderResultRow = (r: FlatRow, i: number) => (
    <div key={`${r.name}-${i}`} className={styles.resultRow}>
      <div className={styles.resultInfo}>
        <span className={styles.name}>{nbp(r.name)}</span>
        <span className={styles.resultCrumb}>
          {r.tabLabel}
          {r.sectionTitle ? ` · ${r.sectionTitle}` : ''}
        </span>
      </div>
      <div className={styles.resultVals}>
        {r.values.map((v, vi) => (
          <span key={vi} className={styles.val}>
            {formatPrice(v)}
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <section className={styles.root} id="prices">
      <div className={styles.wrap}>
        <div className={styles.head}>
          <h2 className={styles.title}>{data.title}</h2>
        </div>

        <div className={styles.salons} role="tablist" aria-label="Выбор салона">
          <span
            className={styles.salonInd}
            style={{ transform: `translateX(${activeSalonIndex * 100}%)` }}
            aria-hidden="true"
          />
          {data.salons.map((s) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={s.key === salon.key}
              className={classNames(styles.salonBtn, {
                [styles.salonBtnActive]: s.key === salon.key
              })}
              onClick={() => selectSalon(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className={styles.search}>
          <span className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Поиск услуги — например, «покрасить корни»"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Поиск услуги"
          />
          {searching && (
            <button
              type="button"
              className={styles.searchClear}
              aria-label="Очистить"
              onClick={() => setQuery('')}
            >
              ×
            </button>
          )}
        </div>

        {searching ? (
          <div className={styles.results}>
            {localResults.length > 0 && (
              <div className={styles.resultGroup}>
                {localResults.map(renderResultRow)}
              </div>
            )}

            {(aiLoading || aiResults.length > 0) && (
              <div className={styles.aiBlock}>
                <span className={styles.aiLabel}>
                  {aiLoading ? 'Подбираем с ИИ…' : 'Возможно, вы искали'}
                </span>
                {aiResults.length > 0 && (
                  <div className={styles.resultGroup}>
                    {aiResults.map(renderResultRow)}
                  </div>
                )}
              </div>
            )}

            {!aiLoading && localResults.length === 0 && aiResults.length === 0 && (
              <p className={styles.empty}>
                Ничего не нашли. Попробуйте другой запрос или уточните у
                администратора.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className={styles.pick}>
              <span className={styles.pickLabel}>{data.chooseLabel}</span>
              <span className={styles.pickHint}>{nbp(data.chooseHint)}</span>
            </div>

            <div className={styles.tabs} role="tablist" aria-label="Категории услуг">
              {salon.tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={t.key === tab.key}
                  className={classNames(styles.tab, {
                    [styles.tabActive]: t.key === tab.key
                  })}
                  onClick={() => selectTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab.sections.length > 1 && (
              <div className={styles.expandBar}>
                <button
                  type="button"
                  className={styles.expandBtn}
                  onClick={toggleAll}
                >
                  {allOpen ? 'Свернуть все' : 'Раскрыть все'}
                </button>
              </div>
            )}

            <div className={styles.content} key={`${salon.key}-${tab.key}`}>
              {tab.sections.map((section, si) => {
                const gridClass = styles[`cols${section.cols.length}`]
                const isOpen = open.includes(si)
                const rowCount = section.rows.length
                return (
                  <div
                    key={si}
                    className={classNames(styles.acc, {
                      [styles.accOpen]: isOpen
                    })}
                  >
                    <button
                      type="button"
                      className={styles.accHead}
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpen((prev) =>
                          prev.includes(si)
                            ? prev.filter((x) => x !== si)
                            : [...prev, si]
                        )
                      }
                    >
                      <span className={styles.accTitle}>
                        {section.title || tab.label}
                      </span>
                      <span className={styles.accMeta}>
                        <span className={styles.accCount}>{rowCount}</span>
                        <span className={styles.chevron} aria-hidden="true" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className={styles.accBody}>
                        <div className={styles.table}>
                          <div className={classNames(styles.headRow, gridClass)}>
                            <span className={styles.colName}>Название услуги</span>
                            {section.cols.map((c, ci) => (
                              <span key={ci} className={styles.colVal}>
                                {c}
                              </span>
                            ))}
                          </div>

                          {section.rows.map((row, ri) => (
                            <div
                              key={ri}
                              className={classNames(styles.row, gridClass)}
                            >
                              <div className={styles.cellName}>
                                <span className={styles.name}>{nbp(row.name)}</span>
                                {row.desc && (
                                  <span className={styles.desc}>
                                    {nbp(row.desc)}
                                  </span>
                                )}
                              </div>
                              {row.values.map((v, vi) => (
                                <span key={vi} className={styles.val}>
                                  {formatPrice(v)}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>

                        {section.note && (
                          <p className={styles.note}>{nbp(section.note)}</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Prices
