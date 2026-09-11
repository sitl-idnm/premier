import { FC } from 'react'
import { type MetrikaPoint } from '@/shared/lib/metrikaStat'

import styles from '../admin.module.scss'

/** Minimal dependency-free SVG line chart of daily visits + users. */
export const LineChart: FC<{ series: MetrikaPoint[] }> = ({ series }) => {
  if (!series.length) return null

  const W = 900
  const H = 260
  const P = { top: 16, right: 16, bottom: 28, left: 40 }
  const iw = W - P.left - P.right
  const ih = H - P.top - P.bottom

  const max = Math.max(1, ...series.map((p) => Math.max(p.visits, p.users)))
  const x = (i: number) =>
    P.left + (series.length === 1 ? iw / 2 : (i / (series.length - 1)) * iw)
  const y = (v: number) => P.top + ih - (v / max) * ih

  const path = (key: 'visits' | 'users') =>
    series.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ')

  const ticks = 4
  const gridY = Array.from({ length: ticks + 1 }, (_, i) => {
    const v = Math.round((max / ticks) * i)
    return { v, y: y(v) }
  })

  // show at most ~8 date labels
  const step = Math.ceil(series.length / 8)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Визиты по дням">
      {gridY.map((g, i) => (
        <g key={i}>
          <line
            x1={P.left}
            x2={W - P.right}
            y1={g.y}
            y2={g.y}
            stroke="var(--green-100)"
            strokeWidth="1"
          />
          <text x={P.left - 8} y={g.y + 4} textAnchor="end" fontSize="11" fill="var(--dark-800)">
            {g.v}
          </text>
        </g>
      ))}

      {series.map((p, i) =>
        i % step === 0 ? (
          <text
            key={i}
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize="10"
            fill="var(--dark-800)"
          >
            {p.date.slice(5)}
          </text>
        ) : null
      )}

      <path
        d={path('users')}
        pathLength={1}
        className={styles.chartLine}
        fill="none"
        stroke="var(--green-main)"
        strokeWidth="2"
      />
      <path
        d={path('visits')}
        pathLength={1}
        className={`${styles.chartLine} ${styles.chartLine2}`}
        fill="none"
        stroke="var(--orange-main)"
        strokeWidth="2.5"
      />

      <g fontSize="12">
        <rect x={P.left} y={2} width="10" height="10" rx="2" fill="var(--orange-main)" />
        <text x={P.left + 16} y={11} fill="var(--dark-800)">визиты</text>
        <rect x={P.left + 90} y={2} width="10" height="10" rx="2" fill="var(--green-main)" />
        <text x={P.left + 106} y={11} fill="var(--dark-800)">посетители</text>
      </g>
    </svg>
  )
}
